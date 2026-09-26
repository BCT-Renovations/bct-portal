-- Preserve the exact safety module requirements attached to each assignment.
alter table public.bct_safety_training_assignments
  add column if not exists module_title_snapshot text,
  add column if not exists module_description_snapshot text,
  add column if not exists module_type_snapshot text,
  add column if not exists trade_code_snapshot text,
  add column if not exists video_url_snapshot text,
  add column if not exists quiz_required_snapshot boolean,
  add column if not exists passing_score_snapshot integer;

update public.bct_safety_training_assignments a set
 module_title_snapshot=coalesce(a.module_title_snapshot,m.title),
 module_description_snapshot=coalesce(a.module_description_snapshot,m.description),
 module_type_snapshot=coalesce(a.module_type_snapshot,m.module_type),
 trade_code_snapshot=coalesce(a.trade_code_snapshot,m.trade_code),
 video_url_snapshot=coalesce(a.video_url_snapshot,m.video_url),
 quiz_required_snapshot=coalesce(a.quiz_required_snapshot,m.quiz_required),
 passing_score_snapshot=coalesce(a.passing_score_snapshot,m.passing_score)
from public.bct_safety_training_modules m where m.id=a.module_id;

create or replace function public.bct_snapshot_safety_training_assignment()
returns trigger language plpgsql set search_path=public as $f$
begin
 select title,description,module_type,trade_code,video_url,quiz_required,passing_score
 into new.module_title_snapshot,new.module_description_snapshot,new.module_type_snapshot,new.trade_code_snapshot,new.video_url_snapshot,new.quiz_required_snapshot,new.passing_score_snapshot
 from public.bct_safety_training_modules where id=new.module_id;
 return new;
end $f$;

drop trigger if exists bct_snapshot_safety_training_assignment on public.bct_safety_training_assignments;
create trigger bct_snapshot_safety_training_assignment before insert on public.bct_safety_training_assignments
for each row execute function public.bct_snapshot_safety_training_assignment();
