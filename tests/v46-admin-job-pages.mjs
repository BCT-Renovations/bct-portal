import fs from 'node:fs';
import assert from 'node:assert/strict';

const pages=fs.readFileSync('bct-admin-job-pages.js','utf8');
const admin=fs.readFileSync('bct-admin-sections.js','utf8');

assert.ok(admin.includes('/bct-admin-job-pages.js?v=20260930-1'),'Admin job-page loader missing');
assert.ok(pages.includes('bctJobPageSelect'),'job-management selector missing');
assert.ok(pages.includes('bctJobPagePrev'),'Previous control missing');
assert.ok(pages.includes('bctJobPageNext'),'Next control missing');
assert.ok(pages.includes('bct-job-page-hidden'),'single-section visibility class missing');
assert.ok(pages.includes("jobStatusForm:'Job Status'"),'Job Status page missing');
assert.ok(pages.includes("jobScheduleForm:'Schedule'"),'Schedule page missing');
assert.ok(pages.includes("bctLiveVerificationForm:'Live Project Verification'"),'Live Verification page missing');
assert.ok(pages.includes("jobFinanceForm:'Financing'"),'Financing page missing');
assert.ok(pages.includes("jobEscrowForm:'Escrow'"),'Escrow page missing');
assert.ok(pages.includes('background:#2563a6'),'blue page-navigation controls missing');
assert.ok(pages.includes('min-height:46px'),'iPhone touch target protection missing');

console.log('V46 Admin job page-flip smoke checks passed.');
