-- Agent BCT Photo Recommendation System (isolated V46 development migration)
-- This migration is intentionally NOT applied to the live Supabase project.
-- It extends the existing bct_gallery_photos system; it does not create a second photo store.

create table if not exists public.bct_photo_recommendations (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.bct_gallery_photos(id) on delete cascade,
  suggested_category text not null default 'Other',
  category_confidence numeric(5,2) not null default 0 check (category_confidence between 0 and 100),
  photo_quality_score numeric(5,2) not null default 0 check (photo_quality_score between 0 and 100),
  marketing_value text not null default 'low'
    check (marketing_value in ('high','medium','low','not_recommended')),
  before_after_value text not null default 'low'
    check (before_after_value in ('high','medium','low')),
  workmanship_visibility text not null default 'low'
    check (workmanship_visibility in ('high','medium','low')),
  marketing_recommendation text not null default 'review'
    check (marketing_recommendation in ('recommended','possible','not_recommended','review')),
  reason text not null default '',
  model_name text,
  model_version text,
  analysis_mode text not null default 'test'
    check (analysis_mode in ('test','ai')),
  recommendation_status text not null default 'pending'
    check (recommendation_status in ('pending','reviewed')),
  admin_decision text
    check (admin_decision is null or admin_decision in ('use','reject','later')),
  corrected_category text,
  admin_note text,
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  analyzed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(photo_id)
);

create index if not exists bct_photo_recommendations_status_idx
  on public.bct_photo_recommendations(recommendation_status, analyzed_at desc);

create index if not exists bct_photo_recommendations_decision_idx
  on public.bct_photo_recommendations(admin_decision, decided_at desc);

alter table public.bct_photo_recommendations enable row level security;
revoke all on table public.bct_photo_recommendations from anon, authenticated;
grant select, insert, update on table public.bct_photo_recommendations to authenticated;

drop policy if exists "BCT admins manage Agent BCT photo recommendations" on public.bct_photo_recommendations;
create policy "BCT admins manage Agent BCT photo recommendations"
on public.bct_photo_recommendations
for all to authenticated
using ((select public.is_bct_admin()))
with check ((select public.is_bct_admin()));

create or replace function public.bct_photo_recommendation_touch()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  new.updated_at=now();
  if new.admin_decision is distinct from old.admin_decision then
    if new.admin_decision is null then
      new.decided_at=null;
      new.decided_by=null;
    elsif new.decided_at is null then
      new.decided_at=now();
      new.decided_by=auth.uid();
    end if;
  end if;
  if new.admin_decision is not null then
    new.recommendation_status='reviewed';
  end if;
  return new;
end
$$;

revoke execute on function public.bct_photo_recommendation_touch() from public, anon, authenticated;

drop trigger if exists bct_photo_recommendation_touch_trigger on public.bct_photo_recommendations;
create trigger bct_photo_recommendation_touch_trigger
before update on public.bct_photo_recommendations
for each row execute function public.bct_photo_recommendation_touch();

-- Explicit safety contract: an Agent BCT recommendation never changes the existing
-- gallery publication fields. Publication remains controlled by bct_gallery_photos.is_published.
