-- Canonical V46 safety-training automation migration.
-- Production was applied incrementally on 2026-09-26; this file keeps GitHub main reproducible.
create table if not exists public.bct_safety_training_modules(
 id uuid primary key default gen_random_uuid(), title text not null, description text,
 module_type text not null default 'core' check(module_type in('core','trade')), trade_code text,
 video_url text, quiz_required boolean not null default true,
 passing_score integer not null default 80 check(passing_score between 0 and 100),
 active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.bct_safety_training_settings(
 singleton boolean primary key default true check(singleton), cadence_days integer not null default 30 check(cadence_days between 7 and 365),
 grace_days integer not null default 1 check(grace_days between 0 and 30), reminder_days integer[] not null default array[7,3,1],
 enabled boolean not null default true, updated_by uuid, updated_at timestamptz not null default now()
);
insert into public.bct_safety_training_settings(singleton) values(true) on conflict(singleton) do nothing;
create table if not exists public.bct_safety_training_assignments(
 id uuid primary key default gen_random_uuid(), contractor_id uuid not null references public.bct_contractors(id) on delete cascade,
 module_id uuid not null references public.bct_safety_training_modules(id), cycle_key text not null, assigned_at timestamptz not null default now(),
 due_at timestamptz not null, grace_until timestamptz not null,
 status text not null default 'assigned' check(status in('assigned','in_progress','completed','overdue','exempt')),
 completed_at timestamptz, acknowledged_at timestamptz, quiz_score integer check(quiz_score between 0 and 100),
 completion_verified boolean not null default false, exemption_reason text, created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), unique(contractor_id,module_id,cycle_key)
);
create table if not exists public.bct_contractor_workforce_holds(
 contractor_id uuid primary key references public.bct_contractors(id) on delete cascade,
 safety_restricted boolean not null default false, admin_hold boolean not null default false, admin_hold_reason text,
 safety_restricted_at timestamptz, updated_at timestamptz not null default now()
);
create table if not exists public.bct_safety_training_reminder_log(
 id uuid primary key default gen_random_uuid(), assignment_id uuid not null references public.bct_safety_training_assignments(id) on delete cascade,
 reminder_key text not null, notification_id uuid references public.bct_notifications(id) on delete set null,
 created_at timestamptz not null default now(), unique(assignment_id,reminder_key)
);
create index if not exists idx_safety_assignments_contractor_status_due on public.bct_safety_training_assignments(contractor_id,status,due_at);
create index if not exists idx_safety_assignments_module_id on public.bct_safety_training_assignments(module_id);
create index if not exists idx_safety_modules_trade_active on public.bct_safety_training_modules(module_type,trade_code,active);
create index if not exists idx_safety_reminder_notification_id on public.bct_safety_training_reminder_log(notification_id);

alter table public.bct_safety_training_modules enable row level security;
alter table public.bct_safety_training_settings enable row level security;
alter table public.bct_safety_training_assignments enable row level security;
alter table public.bct_contractor_workforce_holds enable row level security;
alter table public.bct_safety_training_reminder_log enable row level security;

grant select,insert,update,delete on public.bct_safety_training_modules to authenticated;
grant select,insert,update,delete on public.bct_safety_training_settings to authenticated;
grant select,insert,update,delete on public.bct_safety_training_assignments to authenticated;
grant select,insert,update,delete on public.bct_contractor_workforce_holds to authenticated;
grant select,insert on public.bct_safety_training_reminder_log to authenticated;
revoke all on public.bct_safety_training_modules,public.bct_safety_training_settings,public.bct_safety_training_assignments,public.bct_contractor_workforce_holds,public.bct_safety_training_reminder_log from anon;

create or replace function public.bct_contractor_workforce_eligible(p_contractor_id uuid default public.bct_current_contractor_id())
returns boolean language sql stable security invoker set search_path=public as $$
 select exists(select 1 from public.bct_contractors c left join public.bct_contractor_workforce_holds h on h.contractor_id=c.id
 where c.id=p_contractor_id and c.active and not coalesce(h.safety_restricted,false) and not coalesce(h.admin_hold,false))
$$;

create or replace function public.bct_guard_assignment_workforce_eligibility()
returns trigger language plpgsql security invoker set search_path=public as $$
begin
 if new.status not in('completed','cancelled') and not public.bct_contractor_workforce_eligible(new.contractor_id) then
  raise exception 'Contractor is not eligible for new BCT workforce activity';
 end if;
 return new;
end $$;
drop trigger if exists bct_assignment_workforce_eligibility on public.bct_assignments;
create trigger bct_assignment_workforce_eligibility before insert on public.bct_assignments for each row execute function public.bct_guard_assignment_workforce_eligibility();

-- Completion is deliberately SECURITY DEFINER: contractors have no direct UPDATE grant path through RLS,
-- and this RPC validates ownership, acknowledgment and passing score before changing compliance state.
create or replace function public.bct_complete_my_safety_training(p_assignment_id uuid,p_acknowledged boolean,p_quiz_score integer default null)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare v public.bct_safety_training_assignments%rowtype; m public.bct_safety_training_modules%rowtype;
begin
 if not p_acknowledged then raise exception 'Safety acknowledgment is required'; end if;
 select * into v from public.bct_safety_training_assignments where id=p_assignment_id and contractor_id=public.bct_current_contractor_id() for update;
 if not found then raise exception 'Safety training assignment not found'; end if;
 select * into m from public.bct_safety_training_modules where id=v.module_id;
 if m.quiz_required and(p_quiz_score is null or p_quiz_score<m.passing_score) then raise exception 'Passing quiz score required'; end if;
 update public.bct_safety_training_assignments set status='completed',completed_at=now(),acknowledged_at=now(),quiz_score=p_quiz_score,completion_verified=true,updated_at=now() where id=v.id;
 if not exists(select 1 from public.bct_safety_training_assignments a where a.contractor_id=v.contractor_id and a.status not in('completed','exempt') and now()>a.grace_until) then
  insert into public.bct_contractor_workforce_holds(contractor_id,safety_restricted,safety_restricted_at) values(v.contractor_id,false,null)
  on conflict(contractor_id) do update set safety_restricted=false,safety_restricted_at=null,updated_at=now();
 end if;
 insert into public.bct_audit_events(actor_user_id,entity_type,entity_id,action,details) values(auth.uid(),'safety_training_assignment',v.id::text,'completed',jsonb_build_object('quiz_score',p_quiz_score));
 return jsonb_build_object('status','completed','workforce_eligible',public.bct_contractor_workforce_eligible(v.contractor_id));
end $$;
revoke all on function public.bct_complete_my_safety_training(uuid,boolean,integer) from public,anon;
grant execute on function public.bct_complete_my_safety_training(uuid,boolean,integer) to authenticated;
