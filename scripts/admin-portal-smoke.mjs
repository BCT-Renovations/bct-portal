import fs from 'node:fs';

const index=fs.readFileSync('index.html','utf8');
const adminBoard=fs.readFileSync('bct-admin-control-board.js','utf8');
const adminMobile=fs.readFileSync('bct-admin-mobile-fix.js','utf8');

const checks=[
  ['Admin board is loaded', index.includes('/bct-admin-control-board.js?v=20260930-2')],
  ['Admin mobile fix is loaded', index.includes('/bct-admin-mobile-fix.js?v=20260930-4')],
  ['Admin board provides selected-panel navigation', /function openPanel\(panel,push=true\)/.test(adminBoard)],
  ['Admin board provides back navigation', /function goBack\(\)/.test(adminBoard)],
  ['Admin board provides return-to-board navigation', /function showBoard\(\)/.test(adminBoard)],
  ['Admin board avoids forced lifecycle/hash refresh loops', /avoid lifecycle\/hash refresh loops/.test(adminBoard)],
  ['Admin mobile layer avoids MutationObserver refresh loops', /Deliberately avoid pageshow\/hashchange\/MutationObserver/.test(adminMobile)],
  ['Admin mobile layer preserves touch interaction', /touchAction='manipulation'/.test(adminMobile)],
  ['Admin login has forgot-password action', /id="adminForgotBtn"/.test(index)],
  ['Password reset requires two fields', /id="passwordResetNew"/.test(index) && /id="passwordResetConfirm"/.test(index)],
  ['Password reset save starts disabled', /id="passwordResetSaveBtn" type="submit" disabled/.test(index)],
  ['Password reset enforces recent-password validation', /bct_validate_password_not_recent/.test(index)],
  ['Password reset records password history', /bct_record_password_history/.test(index)],
  ['Homeowner submission locks after success', /clearAndLockSubmission\(f,\['custFirst','custLast','custEmail','custPhone','custPassword','custPassword2'\]\)/.test(index)],
  ['Contractor pre-application locks after success', /clearAndLockSubmission\(f\)/.test(index)],
  ['Contractor password pair is validated', /setupPasswordPair\('contractorPassword','contractorPassword2','contractorPasswordCheck'\)/.test(index)],
  ['Admin activity trail can be cleared', /clearAdminActivityAuditBtn/.test(index)]
];

const failed=checks.filter(([,ok])=>!ok);
for (const [name,ok] of checks) console.log((ok?'PASS':'FAIL')+' — '+name);
if (failed.length) {
  console.error(`Admin portal smoke failed: ${failed.length}/${checks.length} checks failed.`);
  process.exit(1);
}
console.log(`Admin portal smoke passed: ${checks.length}/${checks.length} checks.`);
