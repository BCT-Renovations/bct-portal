-- The status guard and admin RPC both support Scheduled; the table constraint must as well.
alter table public.bct_jobs drop constraint if exists bct_jobs_status_check;
alter table public.bct_jobs add constraint bct_jobs_status_check check (
  status = any (array[
    'draft'::text,
    'open_for_bids'::text,
    'bid_review'::text,
    'awarded'::text,
    'scheduled'::text,
    'in_progress'::text,
    'completed'::text,
    'on_hold'::text,
    'closed'::text
  ])
);
