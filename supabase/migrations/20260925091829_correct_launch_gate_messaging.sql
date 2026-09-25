-- Keeps the production launch dashboard truthful while launch verification is underway.
update public.bct_launch_controls
set
  notes = case control_key
    when 'auth_email_confirmation_verified' then
      'Fresh production email-confirmation testing is still required with a valid test mailbox and the current production app URL. Keep this gate incomplete until the confirmation link and first authenticated portal session both succeed.'
    when 'browser_e2e_complete' then
      'Interactive browser E2E is in progress on the current V46 production build. Admin authentication and the job-health entry point are verified. Homeowner confirmation/login/project upload, contractor confirmation/login/application/docs, admin job publishing and operations, estimate decision, contract/signature, weather/QR/barcode, and notifications remain before completion.'
    when 'customer_pilot_enabled' then
      'Keep the customer pilot disabled until fresh production email confirmation, full browser E2E, policy review/publication, notification-worker verification, and backup/PITR verification are complete.'
    when 'outbound_email_provider_configured' then
      'Supabase Auth SMTP and the Resend domain are configured. The BCT notification-dispatch worker still requires a verified live delivery test before this gate can be completed.'
    when 'source_cutover_complete' then
      'The current production source of record is the V46 BCT portal deployment. Additional launch-critical verification and fixes are still in progress; do not mark this gate complete or enable the customer pilot yet.'
    else notes
  end,
  updated_at = now()
where control_key in (
  'auth_email_confirmation_verified',
  'browser_e2e_complete',
  'customer_pilot_enabled',
  'outbound_email_provider_configured',
  'source_cutover_complete'
);
