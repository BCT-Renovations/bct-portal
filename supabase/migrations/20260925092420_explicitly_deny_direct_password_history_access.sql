-- Password history is reachable only through the self-scoped SECURITY DEFINER functions.
-- This explicit deny policy documents that direct table access is intentionally prohibited.
drop policy if exists "Deny direct password history access" on public.bct_password_history;

create policy "Deny direct password history access"
on public.bct_password_history
for all
to anon, authenticated
using (false)
with check (false);
