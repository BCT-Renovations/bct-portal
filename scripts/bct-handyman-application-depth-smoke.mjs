import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../bct-handyman-portal.js', import.meta.url), 'utf8');

[
  'name="government_id_ready"',
  'name="work_eligibility"',
  'name="screening_provider_acknowledged"',
  'name="tax_payment_acknowledged"',
  'name="primary_trade"',
  'name="transportation"',
  'name="tools_available"',
  'name="insurance_status"',
  'name="license_status"',
  'name="w9_ready"',
  'name="work_history"',
  'name="job_limits"',
  'name="reference_1_name"',
  'name="reference_2_phone"'
].forEach(needle => assert(source.includes(needle), `Missing handyman intake field: ${needle}`));

assert(source.includes('will not collect my Social Security number in this form'), 'Application must not collect SSN directly.');
assert(source.includes('secure background-screening provider'), 'Application must route SSN/DOB to screening provider.');
assert(source.includes('secure tax/payment provider'), 'Application must route tax/payment details to provider.');
assert(source.includes('Applicant Review Profile'), 'Submission must preserve expanded applicant review profile.');
assert(!source.includes('name="ssn"'), 'Handyman public application must not include an SSN field.');
assert(!source.includes('social_security'), 'Handyman public application must not store a social_security field.');

console.log('BCT handyman application depth smoke passed: identity, screening, tax/payment, credentials, references, and SSN safety verified.');
