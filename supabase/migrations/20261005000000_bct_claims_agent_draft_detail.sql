-- BCT V46 claims Agent draft detail RPC.
-- Additive only; keeps all claim/project separation and Admin approval gates.
create or replace function public.bct_admin_insurance_claim_drafts(p_claim_id uuid)
returns table(
  id uuid,
  claim_id uuid,
  draft_type text,
  language_code text,
  source_summary text,
  recommended_next_steps jsonb,
  draft_body text,
  risk_flags jsonb,
  status text,
  created_by uuid,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz
)
language sql stable security definer set search_path=public,auth as $$
  select d.id,d.claim_id,d.draft_type,d.language_code,d.source_summary,
         d.recommended_next_steps,d.draft_body,d.risk_flags,d.status,
         d.created_by,d.reviewed_by,d.reviewed_at,d.created_at
  from public.bct_insurance_claim_agent_drafts d
  where public.is_bct_admin()
    and d.claim_id=p_claim_id
  order by d.created_at desc;
$$;
revoke all on function public.bct_admin_insurance_claim_drafts(uuid) from public,anon;
grant execute on function public.bct_admin_insurance_claim_drafts(uuid) to authenticated;
