-- V46 isolated Handyman credential/document foundation. Do not apply to production from this branch.
create table if not exists public.bct_handyman_credentials (
 id uuid primary key default gen_random_uuid(), handyman_application_id uuid not null references public.bct_handyman_applications(id) on delete cascade,
 credential_type text not null, status text not null default 'pending' check(status in ('pending','verified','expiring','expired','rejected')),
 document_path text, expires_at date, verified_at timestamptz, verified_by uuid, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists bct_handyman_credentials_app_idx on public.bct_handyman_credentials(handyman_application_id);
alter table public.bct_handyman_credentials enable row level security;
revoke all on public.bct_handyman_credentials from anon,authenticated;
