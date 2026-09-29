import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const securitySql = fs.readFileSync(new URL('./bct-supabase-security-smoke.sql', import.meta.url), 'utf8');
const operationalReadinessSql = fs.readFileSync(new URL('../supabase/migrations/20260925212000_align_operational_readiness_with_live_schema.sql', import.meta.url), 'utf8');
const weatherReadiness = fs.readFileSync(new URL('../WEATHER_PROVIDER_READINESS.md', import.meta.url), 'utf8');
const backupPlan = fs.readFileSync(new URL('../PRE_PRO_BACKUP_EXPORT_PLAN.md', import.meta.url), 'utf8');
const auditReadiness = fs.readFileSync(new URL('../AUDIT_NOTIFICATION_READINESS.md', import.meta.url), 'utf8');
const contractorOnboardingSmoke = fs.readFileSync(new URL('./bct-contractor-onboarding-smoke.mjs', import.meta.url), 'utf8');
const serviceWorker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function count(pattern) {
  return [...html.matchAll(pattern)].length;
}

const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
scripts.forEach((script, index) => {
  try {
    new Function(script);
  } catch (error) {
    throw new Error(`Inline script ${index + 1} failed to parse: ${error.message}`);
  }
});
const homeSection = html.match(/<section id="view-home"[\s\S]*?<\/section>/i)?.[0] || '';

const requiredMarkers = [
  ['homeowner portal sign in', 'bctHomeLoginBtn'],
  ['contractor portal sign in', 'bctContractorLoginBtn'],
  ['contractor screening test', 'contractorScreeningTest'],
  ['contractor screening pass score', 'BCT_SCREENING_PASS_SCORE'],
  ['contractor screening lockout', 'locked for 14 days'],
  ['contractor launch rules acknowledgment', 'contractorRulesAck'],
  ['contractor reference #5 field', 'Professional Reference #5'],
  ['contractor reference #5 contact field', 'Reference #5 Contact'],
  ['contractor access lock message', 'Contractor access locked'],
  ['admin screening controls', 'bctAdminScreeningAction'],
  ['admin protected dashboard', 'BCT Admin Dashboard'],
  ['official BCT logo in app shell', 'class="brand-logo" src="/bct-logo-master.png?v=official-bct-logo-v46-green-band-20260929a"'],
  ['full-width signed-out green logo band', 'body:not(.bct-authenticated) header .wrap{width:100%!important;max-width:none!important;margin:0!important;padding:16px 0 18px!important;background:#e1f9e6!important}'],
  ['larger signed-out logo sizing', 'width:clamp(330px,92vw,680px)!important;height:auto!important'],
  ['bolder general contractor slogan', 'body:not(.bct-authenticated) .bct-dynamic-slogan{font-weight:900!important'],
  ['capitalized about close line', 'Your Home, Your Project, Your Contractor.'],
  ['final visible iphone override', 'BCT V46 CANONICAL PUBLIC + SHARED LANDING DESIGN'],
  ['iphone startup cache reset script', 'BCT V46 iPhone startup cache reset'],
  ['native iPhone portal boot', 'bct-native-portal-boot-20260929'],
  ['locked BCT teal brand token', '--bct-teal:#0f5f63'],
  ['locked BCT light app background', '--bg:#f5f7f7'],
  ['locked BCT secondary blue token', '--bct-blue:#2563a6'],
  ['homeowner portal tabs', 'data-customer-page="overview"'],
  ['homeowner portal tab translation key', 'data-i18n="homeowner.tab_details"'],
  ['homeowner page translation bundle', 'BCT_HOMEOWNER_PAGE_TRANSLATION_PATCHES'],
  ['Spanish homeowner details translation', 'Detalles del proyecto'],
  ['dynamic homeowner translation helper', 'bctText'],
  ['homeowner estimate page', 'Estimate & Contract'],
  ['homeowner final walkthrough page', 'Final Walkthrough / Completion'],
  ['homeowner tab controller', 'showCustomerPage'],
  ['contractor portal page tabs', 'data-contractor-view="status"'],
  ['contractor portal jobs page', 'data-contractor-view="jobs"'],
  ['contractor page translation bundle', 'BCT_PAGE_TRANSLATION_PATCHES'],
  ['contractor portal badge translation key', 'data-i18n="contractor.portal_badge"'],
  ['contractor status tab translation key', 'data-i18n="contractor.tab_status"'],
  ['Spanish contractor portal translation', 'Portal de contratistas BCT'],
  ['home translation override guard', 'BCT_HOME_TRANSLATION_OVERRIDES'],
  ['Spanish home translation refresh', 'Iniciar o revisar un proyecto'],
  ['Spanish home license badge translation', 'Con licencia • Fianza • Asegurado'],
  ['non-blocking celebration layer', 'bct-celebration'],
  ['homeowner general contractor celebration', 'official general contractor for your home improvement'],
  ['contractor verified celebration', 'officially a verified BCT contractor'],
  ['admin command center', 'bctCommandCenter'],
  ['admin command search', 'bctCommandSearch'],
  ['admin command no-match state', 'bctCommandEmpty'],
  ['command dropdown hidden state', 'command-results[hidden]'],
  ['command jump highlight', 'bct-jump-highlight'],
  ['admin command navigation', 'data-admin-jump="adminHomeownerProjects"'],
  ['narrow mobile portal tab stacking', '@media(max-width:460px)'],
  ['admin dashboard page tabs', 'data-admin-page-tab="projects"'],
  ['admin projects page translation key', 'data-i18n="admin.page_projects"'],
  ['Spanish admin projects page translation', 'Proyectos y estimados'],
  ['admin page panel controller', 'showAdminPage'],
  ['admin job progress page panel', 'data-admin-page-panel="jobs"'],
  ['forgot-password request form', 'passwordRequestForm'],
  ['two-box password reset form', 'passwordResetNew'],
  ['two-box password reset confirmation', 'passwordResetConfirm'],
  ['password recovery event handler', 'PASSWORD_RECOVERY'],
  ['expired reset link landing guard', 'Checking your secure reset link'],
  ['duplicate submit lock helper', 'clearAndLockSubmission'],
  ['homeowner duplicate submit guard', "f.dataset.submitted==='true'||f.dataset.pending==='true'"],
  ['contractor duplicate submit guard', "f.dataset.submitted==='true'||f.dataset.pending==='true'"],
  ['homeowner private uploads', 'bctUploadHomeFiles'],
  ['contractor private uploads', 'bctContractorUploadDocs'],
  ['upload limit constants', 'BCT_UPLOAD_LIMITS'],
  ['upload validation helper', 'validateUploadFiles'],
  ['upload blocked wording', 'Upload blocked:'],
  ['upload size/count wording', 'Up to 10 files, 25 MB each'],
  ['inline contractor bid form', 'bctSubmitRealBid'],
  ['admin action status banner', 'adminActionStatus'],
  ['admin in-page confirmation helper', 'adminConfirmRun'],
  ['admin activity audit panel', 'adminActivityAuditPanel'],
  ['admin activity audit logger', 'adminAuditEvent'],
  ['admin activity clear control', 'clearAdminActivityAuditBtn'],
  ['admin bid award executor', 'executeAdminBidAward'],
  ['job health dashboard', 'jobHealthDashboard'],
  ['manual weather tracking label', 'Manual Weather Log'],
  ['automatic weather provider caveat', 'Automatic weather-provider pulls are not enabled yet'],
  ['launch owner action checklist', 'Owner Action Checklist'],
  ['weather API owner action', 'Weather API provider/key'],
  ['e-sign provider owner action', 'E-sign provider'],
  ['job financing workflow', 'jobFinanceForm'],
  ['job escrow workflow', 'jobEscrowForm'],
  ['change order workflow', 'jobChangeOrderForm'],
  ['service call workflow', 'serviceCallForm'],
  ['launch control center', 'bctLaunchControlCenter'],
  ['operational readiness center', 'bctOperationalReadinessCenter'],
  ['operational readiness RPC loader', 'bct_admin_operational_readiness'],
  ['operational readiness renderer', 'renderOperationalReadiness'],
  ['translation bootstrap', 'BCT_STATIC_FORMS'],
  ['public bootstrap RPC', 'bct_frontend_public_bootstrap'],
  ['admin state RPC', 'bct_frontend_admin_state'],
  ['balanced intake paging', 'BCT V46 BALANCED INTAKE'],
  ['balanced homeowner intake state', 'bct-home-balanced-v46'],
  ['balanced pre-application state', 'bct-preapp-balanced-v46'],
  ['compact intake navigation label', "progress.textContent='Step '"]
];

for (const [label, marker] of requiredMarkers) {
  assert(html.includes(marker), `Missing ${label}: ${marker}`);
}


assert(!html.includes('bct-preapp-step-v46'), 'Legacy 22-page pre-application paging key must be removed.');
assert(!html.includes('bct-home-project-step-v46b'), 'Legacy micro-page homeowner paging key must be removed.');
assert(html.includes("questions.slice(i,i+4)"), 'Contractor screening should be grouped into compact sets instead of one question per page.');
assert(html.includes("fields<=7"), 'Homeowner intake should preserve reasonably grouped short sections.');

assert(count(/type="file"[^>]*multiple|multiple[^>]*type="file"/gi) >= 5, 'Expected at least five multi-file upload inputs.');
assert(count(/class="file-upload-ui"/g) >= 5, 'Expected custom file upload UI wrappers for phone-friendly uploads.');
assert(count(/Choose Files|Choose Documents|Choose Photos/gi) >= 4, 'Expected clean file chooser labels.');
assert(count(/data-contractor-view="/g) >= 9, 'Contractor portal must expose Application, Status/Documents, and Authorized Jobs tabs on each contractor page.');
for (const page of ['launch', 'contractors', 'projects', 'bids', 'jobs', 'service', 'post']) {
  assert(html.includes(`data-admin-page-tab="${page}"`), `Admin dashboard must include ${page} page tab.`);
  assert(html.includes(`data-admin-page-panel="${page}"`), `Admin dashboard must include ${page} page panel.`);
}
assert(count(/data-admin-page="/g) >= 8, 'Admin command center buttons must carry page targets for click-through navigation.');
assert(!html.includes('bctPublicCommandCenter'), 'Signed-out V46 must not show the larger public command center.');
assert(!html.includes('data-public-action='), 'Signed-out V46 must not show public workflow cards before login.');
assert(html.includes('const match=!!q&&hay.includes(q)'), 'Admin command search must hide static results until the user types.');
assert(html.includes('results.hidden=!q'), 'Admin command search must hide the dropdown when empty.');
assert(html.includes('[data-admin-page-panel]{display:none}'), 'Admin page panels must be hidden until their page is selected.');
assert(html.includes("maxFiles:10"), 'Uploads must enforce a 10-file limit.');
assert(html.includes("maxFileSizeBytes:25*1024*1024"), 'Uploads must enforce a 25 MB per-file limit.');
assert(html.includes("projectAllowedExtensions:['jpg','jpeg','png','webp','heic','heif','pdf','mov','mp4']"), 'Project uploads must enforce launch-approved file types.');
assert(!/service_role|SUPABASE_SERVICE_ROLE|sb_secret_/i.test(html), 'Public HTML must not expose Supabase service-role or secret keys.');
assert(/sb_publishable_/.test(html), 'Frontend should use a Supabase publishable key.');
assert(!html.includes('logo-placeholder'), 'Temporary text placeholder branding must not remain in the V46 shell.');
assert(!html.includes('bct-icon.svg'), 'Generic SVG logo must not be referenced by the V46 shell.');
assert(serviceWorker.includes("'/bct-logo-master.png'"), 'Service worker must cache the master BCT logo.');
assert(serviceWorker.includes("bct-portal-shell-v27-app-icon-cache-reset"), 'Service worker cache version must stay on the current V46 iPhone/PWA cache generation.');
assert(serviceWorker.includes("const STATIC_ASSETS=['/bct-logo-master.png','/bct-app-icon-v46.png']"), 'Service worker static cache must stay limited to safe branded non-HTML assets.');
assert(!/APP_SHELL\s*=\s*\[[^\]]*['"]\/['"]/s.test(serviceWorker), 'Service worker must not cache the root HTML startup path.');
assert(!/APP_SHELL\s*=\s*\[[^\]]*['"]\/index\.html['"]/s.test(serviceWorker), 'Service worker must not cache index.html.');
assert(serviceWorker.includes("cache:'no-store'"), 'Service worker must fetch startup HTML with no-store.');
assert(!serviceWorker.includes("'/bct-homeowner-pages.js'"), 'Service worker must not cache the retired standalone homeowner controller.');
assert(!html.includes('id="m-apps"'), 'Public Home must not expose admin-style application metrics.');
assert(!homeSection.includes('Admin Authentication Upgrade'), 'Public Home must not expose admin-only launch/authentication messaging.');
assert(!/Enter your subcontractor bid amount/i.test(html), 'Contractor bidding must not use the old prompt-based bid entry.');
assert(html.includes('screening_result:screeningResult'), 'Contractor application payload must include screening results.');
assert(html.includes('contractor_rules_acknowledged'), 'Contractor application payload must include rules acknowledgment.');
assert(html.includes("refs.length!==5"), 'Contractor application payload must require exactly five professional references.');
assert(html.includes('contractorAccessMessage(app)'), 'Contractor jobs and bids must be gated by screening/admin approval.');
assert(securitySql.includes('no_public_execute_on_admin_rpcs'), 'Supabase security smoke SQL must check public admin RPC execution.');
assert(securitySql.includes('unexpected_security_definer_count_zero'), 'Supabase security smoke SQL must check unexpected SECURITY DEFINER functions.');
assert(operationalReadinessSql.includes('bct_admin_operational_readiness'), 'Operational readiness migration must create the admin readiness RPC.');
assert(operationalReadinessSql.includes('bct_completion_certificates'), 'Operational readiness must track completion sign-off coverage.');
assert(operationalReadinessSql.includes('bct_cases'), 'Operational readiness must track dispute-management coverage.');
assert(operationalReadinessSql.includes('requires_dashboard_verification'), 'Operational readiness must expose backup/security external verification gates.');
assert(weatherReadiness.includes('BCT_WEATHER_PROVIDER'), 'Weather readiness must document provider configuration.');
assert(weatherReadiness.includes('Automatic weather-provider pulls are not enabled yet'), 'Weather readiness must avoid mislabeling manual weather as automatic.');
assert(backupPlan.includes('Supabase Pro backups and PITR are not claimed active'), 'Pre-Pro backup plan must avoid claiming Pro backups are active.');
assert(auditReadiness.includes('Contractor approval/screening'), 'Audit readiness must cover contractor approval.');
assert(auditReadiness.includes('Notifications'), 'Audit readiness must cover notification readiness.');
assert(contractorOnboardingSmoke.includes('exact five-reference UI'), 'Dedicated contractor onboarding smoke must cover exact five-reference enforcement.');


assert(html.includes("supabaseClient?.auth?.getSession?.()"), 'V46 auth shell uses live Supabase client.');
assert(html.includes("supabaseClient?.auth?.onAuthStateChange?.("), 'V46 auth shell listens to live auth changes.');
assert(!html.includes("window.bctSupabase?.auth"), 'V46 auth shell must not reference nonexistent bctSupabase global.');
assert(html.includes('body:not(.bct-authenticated) header .wrap>div:has(#bctLanguage){display:none!important}'), 'Signed-out V46 must hide the duplicate header language selector because the login-first language selector is shown.');
assert(html.includes('id="bctLoginLanguage"'), 'Signed-out V46 must expose the login-first language selector.');
assert(html.includes('data-bct-slogan'), 'Signed-out V46 must expose the live language-aware BCT slogan.');
assert(html.includes('BCT_BRAND_SLOGANS'), 'V46 must include localized BCT brand slogans.');
assert(html.includes('syncBrandSlogan'), 'V46 must synchronize the BCT slogan when language changes.');
assert(html.includes('BCT V46 CANONICAL PUBLIC + SHARED LANDING DESIGN'), 'V46 must keep the canonical signed-out/shared logo and landing lock.');
assert(html.includes('.bct-logo-crop::after') && html.includes('.bct-dynamic-slogan'), 'V46 must mask the baked logo slogan and show the translated live slogan.');
assert(html.includes("'about.p1':'En BCT Renovations, LLC, los propietarios merecen"), 'Spanish About BCT body copy must be translated, not only the heading.');
assert(html.includes("'about.p3':'BCT no simplemente hace la conexión y se va"), 'Spanish About BCT coordination copy must be translated.');
assert(html.includes("'about.promise4':'Le damos una sola compañía a la cual acudir de principio a fin."), 'Spanish About BCT promise copy must be translated.');
assert(html.includes("applyBctLanguage(language);"), 'V46 must re-apply the selected language after registering the About BCT translation bundle.');
for (const key of ['about.p1','about.difference','about.p2','about.p3','about.p4','about.battle','about.promise1','about.promise2','about.promise3','about.promise4','about.close','about.licensed']) {
  assert(html.includes(`'${key}'`), `About BCT translation bundle must include ${key}.`);
}
for (const language of ['en','es','fr','ht','pt','vi','zh','ar','ru']) {
  assert(new RegExp('\\b'+language+':').test(html) || html.includes("'"+language+"':") || html.includes('"'+language+'":'), 'V46 language data must include '+language+'.');
}
for (const slogan of ['We Are Your General Contractor','Somos su contratista general','Nous sommes votre entrepreneur général','Nou se kontraktè jeneral ou','Somos o seu empreiteiro geral','Chúng tôi là tổng thầu của bạn','我们是您的总承包商','نحن المقاول العام الخاص بك','Мы — ваш генеральный подрядчик']) {
  assert(html.includes(slogan), 'V46 must keep every approved translated brand slogan.');
}
assert(html.includes("document.documentElement.dir=language==='ar'?'rtl':'ltr'"), 'Arabic must switch the document to RTL.');
assert(html.includes("requestId!==BCT_LANGUAGE_REQUEST_ID"), 'Language switching must guard against stale async translation responses.');
assert(!/\b(?:alert|confirm|prompt)\s*\(/.test(html), 'Production V46 must not use native browser alert/confirm/prompt dialogs.');
assert(html.includes('function bctDialogShell(') && html.includes("dialog.addEventListener('cancel'"), 'V46 must provide an accessible in-app confirmation/input dialog with Escape cancellation.');
assert(html.includes('bctDialogPending=false') && html.includes('previous?.focus'), 'V46 in-app dialogs must guard concurrent prompts and restore focus.');

assert(html.includes('.bct-dynamic-slogan') && html.includes('background:transparent'), 'Translated slogan must remain visually integrated without its own box.');
assert(html.includes('BCT V46 MASTER SIGN-IN LOCK') && html.includes('header nav,') && html.includes('display:none!important'), 'Signed-out V46 must preserve the approved clean sign-in layout without the authenticated navigation grid.');
assert(html.includes('.bct-logo-crop::after') && html.includes('height:25%') && html.includes('background:#e8f5ec'), 'Master-reference slogan cover must fully hide the baked slogan without creating a separate strip.');


assert(html.includes("body:not(.bct-authenticated) header nav{display:none!important}"), 'Signed-out V46 must hide all portal navigation.');
assert(html.includes("body:not(.bct-authenticated) header small.muted{display:none!important}"), 'Signed-out V46 must hide Launch Cutover label.');
assert(html.includes("body:not(.bct-authenticated) #view-home .home-panel>h2"), 'Signed-out V46 must hide project marketing heading.');
assert(html.includes('href="/?portal=client" data-entry-native="client"')&&html.includes('href="/?portal=contractor" data-entry-native="contractor"')&&html.includes('href="/?portal=admin" data-entry-native="admin"'), 'Signed-out V46 must expose exactly the three native role entry actions.');


const signedOutHome=(html.match(/<section id="view-home"[\s\S]*?<section id="view-customer"/)||[''])[0];
assert(signedOutHome.includes('data-entry-native="client"')&&signedOutHome.includes('data-entry-native="contractor"')&&signedOutHome.includes('data-entry-native="admin"'), 'Signed-out entry has all three native role links.');
assert(signedOutHome.includes('>Client / Homeowner</a>')&&signedOutHome.includes('>Contractor</a>')&&signedOutHome.includes('>Admin</a>'), 'Signed-out entry must label the three current V46 native role actions.');
assert((signedOutHome.match(/data-entry-native="/g)||[]).length === 3, 'Signed-out V46 must expose only the three native role links in the signed-out entry.');
assert(!signedOutHome.includes('home-action-card'), 'Signed-out entry must not contain extra workflow cards.');
assert(!signedOutHome.includes('home-quick-grid'), 'Old signed-out quick dashboard must not exist in entry DOM.');
assert(!signedOutHome.includes('bctFinancingCard'), 'Financing card must not exist on signed-out entry DOM.');
assert(!signedOutHome.includes('home.hero_title')&&!signedOutHome.includes('home.hero_description'), 'Signed-out entry must not contain project marketing content.');

console.log(`BCT launch smoke passed: ${scripts.length} inline scripts parsed and ${requiredMarkers.length} launch markers verified.`);
