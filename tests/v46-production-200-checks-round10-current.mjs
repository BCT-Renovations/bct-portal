// Run the established Round 10 translation/privacy guard against current V46.
// The original 200 contracts are preserved; only four retired implementation
// needles are mapped to the current signed-out/application routing.
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('./v46-production-200-checks-round10.mjs', import.meta.url), 'utf8');
const startToken = 'const specs=';
const endToken = ';\nlet passed=';
const start = source.indexOf(startToken);
const end = source.indexOf(endToken, start);
if (start < 0 || end < 0) throw new Error('Round 10 current guard could not parse the original 200 contracts.');
const specsText = source.slice(start + startToken.length, end);
const specs = Function('"use strict";return (' + specsText + ')')();

const currentNeedles = new Map([
  ['contract-10-120','admin-login):not(#view-password-request):not(#view-password-reset):not(#view-customer):not(#view-status):not(#view-apply){display:none!important}'],
  ['contract-10-141','data-entry-login="client" data-i18n="entry.client">Client / Homeowner</button>'],
  ['contract-10-142','data-entry-login="contractor" data-i18n="entry.contractor">Contractor</button>'],
  ['contract-10-143','data-entry-login="admin" data-i18n="entry.admin">Admin</button>']
]);
let remapped=0;
for (const spec of specs) {
  if (currentNeedles.has(spec.name)) { spec.needle=currentNeedles.get(spec.name); remapped++; }
}
if (remapped !== currentNeedles.size) throw new Error(`Round 10 current guard remapped ${remapped}/${currentNeedles.size} current contracts.`);

let passed=0;const failures=[];
for(const s of specs){try{if(!html.includes(s.needle))throw new Error('translation/privacy workflow contract missing or unexpectedly changed');passed++;}catch(e){failures.push(s.name+': '+e.message);}}
const total=passed+failures.length;
if(total!==200){console.error('Suite definition error: '+total);process.exit(2);}
if(failures.length){console.error('V46 current Round 10 guard failed ('+failures.length+'/200):\n- '+failures.join('\n- '));process.exit(1);}
console.log('BCT V46 current Round 10 guard: '+passed+'/200 translation/privacy safeguards passed.');
