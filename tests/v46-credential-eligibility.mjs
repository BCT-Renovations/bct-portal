import fs from 'node:fs';
import assert from 'node:assert/strict';

const board=fs.readFileSync('supabase/migrations/20260930224500_contractor_credentials_board.sql','utf8');
const bid=fs.readFileSync('supabase/migrations/20260930225000_contractor_credential_bid_guard.sql','utf8');

const required=board.slice(board.indexOf('create or replace function public.bct_contractor_required_credentials_current'));
assert(required.includes("verification_status='verified'"));
assert(required.includes("x.expires_at is null or x.expires_at>=current_date"));
assert(!required.includes("bct_credential_health(x.expires_at,x.verification_status)='green'"));
for (const type of ['general_liability','bond','license_registration']) assert(required.includes("credential_type='"+type+"'"));
assert(required.includes("credential_type in ('workers_comp','workers_comp_exemption')"));

assert(board.includes("when coalesce(p_verification_status,'pending')<>'verified' then 'red'"));
assert(board.includes("when p_expires_at is not null and p_expires_at<current_date then 'red'"));
assert(board.includes("when p_expires_at is not null and p_expires_at<=current_date+30 then 'yellow'"));
assert(bid.includes('bct_contractor_required_credentials_current(new.contractor_id,v_trade,v_jurisdiction)'));
assert(bid.includes('bct_contractor_required_credentials_current(c.id,j.trade,j.public_location)'));
assert(bid.includes('Bidding paused: required BCT-verified contractor credentials are missing, expired, or not valid'));

console.log('V46 contractor credential eligibility boundary regression: PASS');
