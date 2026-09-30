// Run the established 500-control integrity guard against the current V46 markup.
// The original 500 test definitions are parsed directly; only the 10 assertions
// tied to five retired/renamed controls are pointed at their current equivalents.
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('./v46-production-500-checks-round4.mjs', import.meta.url), 'utf8');
const match = source.match(/const specs=(\[[\s\S]*?\]);\nlet passed=/);
if (!match) throw new Error('Round 4 current guard could not parse the original 500-control specification.');
const specs = Function('"use strict";return ('+match[1]+')')();

const currentNeedles = new Map([
  ['interactive-8-wellformed','<button type="button" data-entry-login="client" data-i18n="entry.client">'],
  ['interactive-8-no-javascript-url','<button type="button" data-entry-login="client" data-i18n="entry.client">'],
  ['interactive-9-wellformed','<button type="button" data-entry-login="contractor" data-i18n="entry.contractor">'],
  ['interactive-9-no-javascript-url','<button type="button" data-entry-login="contractor" data-i18n="entry.contractor">'],
  ['interactive-10-wellformed','<button type="button" data-entry-login="admin" data-i18n="entry.admin">'],
  ['interactive-10-no-javascript-url','<button type="button" data-entry-login="admin" data-i18n="entry.admin">'],
  ['interactive-149-wellformed','<button id="adminForgotBtn" class="secondary bct-mint-action" type="button" data-i18n="admin.forgot_password">'],
  ['interactive-149-no-javascript-url','<button id="adminForgotBtn" class="secondary bct-mint-action" type="button" data-i18n="admin.forgot_password">'],
  ['interactive-150-wellformed','<button type="button" id="adminBackBtn" class="secondary bct-mint-action" data-i18n="admin.back_home">'],
  ['interactive-150-no-javascript-url','<button type="button" id="adminBackBtn" class="secondary bct-mint-action" data-i18n="admin.back_home">']
]);
let remapped = 0;
for (const spec of specs) {
  if (currentNeedles.has(spec.name)) {
    spec.needle = currentNeedles.get(spec.name);
    remapped++;
  }
}
if (remapped !== currentNeedles.size) throw new Error(`Round 4 current guard remapped ${remapped}/${currentNeedles.size} current-control assertions.`);

let passed=0;const failures=[];
for(const s of specs){try{const count=html.split(s.needle).length-1;if(count<1)throw new Error('production control missing');if(s.kind==='nojs'&&/javascript:/i.test(s.needle))throw new Error('unsafe javascript URL');passed++;}catch(e){failures.push(s.name+': '+e.message);}}
const total=passed+failures.length;
if(total!==500){console.error('Suite definition error: '+total);process.exit(2);}
if(failures.length){console.error('BCT V46 fourth current guard failed ('+failures.length+'/500):\n- '+failures.join('\n- '));process.exit(1);}
console.log('BCT V46 fourth current guard: '+passed+'/500 interactive safeguards passed.');
