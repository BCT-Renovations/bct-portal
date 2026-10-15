// Explicit offline suite: never discovers/runs hosted or production browser tests.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const env={...process.env,PLAYWRIGHT_MODULE:process.env.PLAYWRIGHT_MODULE||path.join(root,'tests/offline/node_modules/playwright'),PGLITE_MODULE:process.env.PGLITE_MODULE||path.join(root,'tests/offline/node_modules/@electric-sql/pglite/dist/index.js')};
const staticFiles=[
  "scripts/agent-bct-mobile-smoke.mjs",
  "scripts/agent-bct-positions-smoke.mjs",
  "scripts/bct-ai-estimating-smoke.mjs",
  "scripts/bct-automation-health-smoke.mjs",
  "scripts/bct-contractor-onboarding-smoke.mjs",
  "scripts/bct-contractor-safety-ui-smoke.mjs",
  "scripts/bct-handyman-application-depth-smoke.mjs",
  "scripts/bct-launch-dry-run-smoke.mjs",
  "scripts/bct-launch-smoke-current.mjs",
  "scripts/bct-launch-smoke.mjs",
  "scripts/bct-phase1-privacy-communications-smoke.mjs",
  "scripts/bct-phase1-workflow-boundary-smoke.mjs",
  "scripts/bct-role-visibility-smoke.mjs",
  "scripts/bct-safety-training-smoke.mjs",
  "scripts/bct-source-integrity-smoke-current.mjs",
  "scripts/bct-source-integrity-smoke.mjs",
  "scripts/bct-submission-lock-smoke.mjs",
  "tests/agent-bct-photo-recommendations.mjs",
  "tests/bct-insurance-regression-boundaries.mjs",
  "tests/bct-photo-build.mjs",
  "tests/takai-insurance-isolation-gate.mjs",
  "tests/takai-insurance-preview-project-boundaries.mjs",
  "tests/takai-insurance-staged-migrations-gate.mjs",
  "tests/v46-admin-job-pages.mjs",
  "tests/v46-admin-section-navigation.mjs",
  "tests/v46-credential-eligibility.mjs",
  "tests/v46-estimator-system.mjs",
  "tests/v46-gallery-image-text-translation.mjs",
  "tests/v46-home-gallery.mjs",
  "tests/v46-live-project-verification.mjs",
  "tests/v46-production-200-checks-round10-current.mjs",
  "tests/v46-production-200-checks-round10.mjs",
  "tests/v46-production-200-checks-round11.mjs",
  "tests/v46-production-200-checks-round12-current.mjs",
  "tests/v46-production-200-checks-round12.mjs",
  "tests/v46-production-200-checks-round13-current.mjs",
  "tests/v46-production-200-checks-round13.mjs",
  "tests/v46-production-200-checks-round2-current.mjs",
  "tests/v46-production-200-checks-round2.mjs",
  "tests/v46-production-200-checks-round3.mjs",
  "tests/v46-production-200-checks-round5.mjs",
  "tests/v46-production-200-checks-round6.mjs",
  "tests/v46-production-200-checks-round7.mjs",
  "tests/v46-production-200-checks-round8.mjs",
  "tests/v46-production-200-checks-round9.mjs",
  "tests/v46-production-200-checks.mjs",
  "tests/v46-production-500-checks-round4-current.mjs",
  "tests/v46-production-500-checks-round4.mjs",
  "tests/v46-pwa-cold-launch-source.mjs"
];
const unitFiles=fs.readdirSync(path.join(root,'tests/agent-bct')).filter(f=>f.endsWith('.test.js')).map(f=>'tests/agent-bct/'+f);
const commands=[['--test',...unitFiles,'tests/offline/photo-security.test.mjs','tests/offline/control-integrity.test.mjs','tests/offline/live-baseline.test.mjs'],...staticFiles.map(f=>[f]),['scripts/agent-bct-capability-report.mjs','--check'],['tests/takai-insurance-database.mjs'],['tests/takai-insurance-browser.mjs'],...['estimator','agent','gallery','contractor','admin','photo-simulation','handyman-admin','live-verification','live-verification-saved','handyman-operations','password'].map(f=>['tests/offline/'+f+'-browser.mjs'])];
const failures=[];
for(const args of commands){
 const result=spawnSync(process.execPath,args,{cwd:root,env,encoding:'utf8',timeout:120000,maxBuffer:4*1024*1024});
 const label=args[0]==='--test'?'Agent/photo security unit suite':args[0];
 if(result.status!==0){failures.push(label);console.error('RED '+label+'\n'+(result.error?.message||'')+'\n'+result.stdout+'\n'+result.stderr);}
 else console.log('GREEN '+label+'\n'+result.stdout.trim());
}
console.log(`${commands.length-failures.length}/${commands.length} offline commands passed. Hosted/provider/device checks are excluded and pending.`);
if(failures.length)process.exitCode=1;
