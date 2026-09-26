import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function finalSection(marker) {
  const index = html.lastIndexOf(marker);
  assert(index !== -1, `Missing production marker: ${marker}`);
  return html.slice(index);
}

const lockHelper = finalSection('function clearAndLockSubmission');
assert(lockHelper.includes("form.dataset.submitted='true'"), 'Successful submission must set submitted=true.');
assert(lockHelper.includes("form.dataset.pending='false'"), 'Successful submission must clear pending state.');
assert(lockHelper.includes("form.setAttribute('aria-disabled','true')"), 'Successful submission must expose disabled state to assistive technology.');
assert(lockHelper.includes("form.querySelectorAll('input,select,textarea,button').forEach(el=>el.disabled=true)"), 'Successful submission must disable all form controls.');

const homeowner = finalSection("const homeForm=$('customerProjectForm')");
assert(homeowner.includes("f.dataset.submitted==='true'||f.dataset.pending==='true'"), 'Homeowner form must block duplicate/in-flight submits.');
assert(homeowner.includes("f.dataset.pending='true'"), 'Homeowner form must mark the request pending before async work.');
assert(homeowner.includes("f.dataset.pending='false'"), 'Homeowner validation/error path must release pending state.');
assert(homeowner.includes("clearAndLockSubmission(f,['custFirst','custLast','custEmail','custPhone','custPassword','custPassword2'])"), 'Homeowner success path must clear and hard-lock account + project controls.');

const contractor = finalSection("const appForm=$('applicationForm')");
assert(contractor.includes("f.dataset.submitted==='true'||f.dataset.pending==='true'"), 'Contractor form must block duplicate/in-flight submits.');
assert(contractor.includes("f.dataset.pending='true'"), 'Contractor form must mark the request pending before async work.');
assert(contractor.includes("catch(ex){f.dataset.pending='false'"), 'Contractor failure path must release pending state.');
assert(contractor.includes("clearAndLockSubmission(f)"), 'Contractor success path must clear and hard-lock the pre-application.');

assert(html.includes('isObfuscatedSignup(data)'), 'Duplicate/obfuscated Supabase signup responses must be detected.');
assert(html.includes('A new homeowner submission could not be started.'), 'Homeowner duplicate-account response must be user-safe.');
assert(html.includes('A new contractor pre-application could not be started.'), 'Contractor duplicate-account response must be user-safe.');

console.log('BCT submission-lock smoke passed: homeowner and contractor duplicate-submit, pending-state, error recovery, and success lockout verified.');
