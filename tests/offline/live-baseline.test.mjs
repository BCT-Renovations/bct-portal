// Pinned read-only Live evidence: 6c90eb9a50b2eb1e0199683e07dc5ca1fb4667f1.
// Future authorized changes to this shared file must explicitly update the narrow reconciliation below.
import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';
test('all current Live homepage content survives the documented isolated additions',()=>{
 let html=fs.readFileSync('index.html','utf8');
 for(const line of ['      <button type="button" id="bctInsurancePreviewEntry" aria-label="Insurance and Claims Partner portal preview">Insurance / Claims Partner</button>\n','<script src="/bct-insurance-preview-shell.js?v=20261014-1" defer></script>\n']){assert.equal(html.split(line).length-1,1);html=html.replace(line,'');}
 for(const state of ['loading','ready','error']){const call="$('view-admin')?.setAttribute('data-bct-admin-data-state','"+state+"')";assert.equal(html.split(call).length-1,1);if(state==='loading')html=html.replace('    '+call+';\n','');else if(state==='ready')html=html.replace(';'+call,'');else html=html.replace(call+';','');}
 const repaired='if(/^Stage 1\\s*[-—]|Handyman Pre-Application|Contractor Network Pre-Application|Contractor Application/i.test(heading.textContent))',previous='if(/Handyman Pre-Application|Contractor Network Pre-Application|Contractor Application/i.test(heading.textContent))';
 assert.equal(html.split(repaired).length-1,1);html=html.replace(repaired,previous);
 const bytes=Buffer.from(html),sha=createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
 assert.equal(sha,'a57ac3ea2dcf18b0950e0b1d6058f594b80fc547','Git blob must match the verified current Live index after only the documented development changes');
});
test('approved Live gallery branding and translated fallback wording survive performance fixes',()=>{
 const source=fs.readFileSync('bct-home-gallery.js','utf8'),start=source.indexOf('  const FALLBACK_PROJECTS=['),end=source.indexOf('  let PROJECTS=[]');assert(start>=0&&end>start);
 const sha=createHash('sha256').update(source.slice(start,end).trim()).digest('hex');assert.equal(sha,'db78cbb5f5f550a87e3fba444bb0172fe8c5cb572321e42595816ef371242fde');
 assert.match(source,/PROJECTS=FALLBACK_PROJECTS\.slice\(\)/);
});
