-- BCT AI Estimating v1: admin-only draft/review/approval system
create table if not exists public.ai_estimates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid,
  job_id uuid,
  status text not null default 'draft' check (status in ('draft','pending_bct_review','approved','rejected')),
  scope_summary text not null default '',
  assumptions text not null default '',
  internal_notes text not null default '',
  markup_percent numeric(7,2) not null default 0 check (markup_percent >= 0),
  material_subtotal numeric(12,2) not null default 0,
  labor_subtotal numeric(12,2) not null default 0,
  other_subtotal numeric(12,2) not null default 0,
  cost_subtotal numeric(12,2) not null default 0,
  markup_amount numeric(12,2) not null default 0,
  estimate_total numeric(12,2) not null default 0,
  ai_payload jsonb not null default '{}'::jsonb,
  created_by uuid default auth.uid(),
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.ai_estimate_items (
  id uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references public.ai_estimates(id) on delete cascade,
  category text not null check (category in ('material','labor','other')),
  description text not null,
  quantity numeric(12,3) not null default 1 check (quantity >= 0),
  unit text not null default 'ea',
  unit_cost numeric(12,2) not null default 0 check (unit_cost >= 0),
  line_total numeric(12,2) generated always as (round(quantity * unit_cost,2)) stored,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table public.ai_estimates enable row level security;
alter table public.ai_estimate_items enable row level security;
revoke all on public.ai_estimates from anon, authenticated;
revoke all on public.ai_estimate_items from anon, authenticated;
grant select,insert,update,delete on public.ai_estimates to authenticated;
grant select,insert,update,delete on public.ai_estimate_items to authenticated;

create or replace function public.is_bct_admin()
returns boolean language sql stable security definer set search_path=public,auth as $$
  select coalesce((auth.jwt()->'app_metadata'->>'role') in ('admin','bct_admin','owner'),false)
      or lower(coalesce(auth.jwt()->>'email','')) = lower('myproject@bctrenovations.com');
$$;
revoke all on function public.is_bct_admin() from public;
grant execute on function public.is_bct_admin() to authenticated;

drop policy if exists ai_estimates_admin_all on public.ai_estimates;
create policy ai_estimates_admin_all on public.ai_estimates for all to authenticated
using (public.is_bct_admin()) with check (public.is_bct_admin());
drop policy if exists ai_estimate_items_admin_all on public.ai_estimate_items;
create policy ai_estimate_items_admin_all on public.ai_estimate_items for all to authenticated
using (public.is_bct_admin()) with check (public.is_bct_admin());

create or replace function public.recalculate_ai_estimate(p_estimate_id uuid)
returns public.ai_estimates language plpgsql security definer set search_path=public,auth as $$
declare r public.ai_estimates;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin access required'; end if;
 update public.ai_estimates e set
  material_subtotal=coalesce((select sum(line_total) from public.ai_estimate_items where estimate_id=e.id and category='material'),0),
  labor_subtotal=coalesce((select sum(line_total) from public.ai_estimate_items where estimate_id=e.id and category='labor'),0),
  other_subtotal=coalesce((select sum(line_total) from public.ai_estimate_items where estimate_id=e.id and category='other'),0),
  updated_at=now()
 where e.id=p_estimate_id returning * into r;
 update public.ai_estimates e set cost_subtotal=e.material_subtotal+e.labor_subtotal+e.other_subtotal,
  markup_amount=round((e.material_subtotal+e.labor_subtotal+e.other_subtotal)*e.markup_percent/100,2),
  estimate_total=round((e.material_subtotal+e.labor_subtotal+e.other_subtotal)*(1+e.markup_percent/100),2),
  updated_at=now() where e.id=p_estimate_id returning * into r;
 return r;
end $$;
revoke all on function public.recalculate_ai_estimate(uuid) from public;
grant execute on function public.recalculate_ai_estimate(uuid) to authenticated;

create or replace function public.approve_ai_estimate(p_estimate_id uuid)
returns public.ai_estimates language plpgsql security definer set search_path=public,auth as $$
declare r public.ai_estimates;
begin
 if not public.is_bct_admin() then raise exception 'BCT admin access required'; end if;
 perform public.recalculate_ai_estimate(p_estimate_id);
 update public.ai_estimates set status='approved',approved_by=auth.uid(),approved_at=now(),updated_at=now()
 where id=p_estimate_id and status in ('draft','pending_bct_review') returning * into r;
 if r.id is null then raise exception 'Estimate is not awaiting BCT approval'; end if;
 return r;
end $$;
revoke all on function public.approve_ai_estimate(uuid) from public;
grant execute on function public.approve_ai_estimate(uuid) to authenticated;
