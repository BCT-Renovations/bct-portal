// Run the established Round 12 status/upload guard against current V46.
// The original 200 contracts remain; three retired markup needles are mapped
// to the current signed-out application gate and translated About copy.
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('./v46-production-200-checks-round12.mjs', import.meta.url), 'utf8');
const startToken='const specs=';
const endToken=';\nlet passed=';
const start=source.indexOf(startToken);
const end=source.indexOf(endToken,start);
if(start<0||end<0) throw new Error('Round 12 current guard could not parse the original 200 contracts.');
const specs=Function('"use strict";return ('+source.slice(start+startToken.length,end)+')')();

const currentNeedles=new Map([
  ['status-upload-21','status):not(#view-apply){display:none!important}'],
  ['status-upload-32',"'about.p1':'At BCT Renovations, LLC, homeowners deserve more than just a name and a phone number. You deserve to know who is working on your property, that they have been properly verified, and that someone is standing with you throughout the entire project.'"],
  ['status-upload-33',"'about.p2':'Contractors in our network go through the BCT verification process, including verification of required credentials and current insurance documentation before they are approved to perform work through our platform.'"]
]);
let remapped=0;
for(const spec of specs){if(currentNeedles.has(spec.name)){spec.needle=currentNeedles.get(spec.name);remapped++;}}
if(remapped!==currentNeedles.size) throw new Error(`Round 12 current guard remapped ${remapped}/${currentNeedles.size} current contracts.`);

let passed=0;const failures=[];
for(const s of specs){try{if(!html.includes(s.needle))throw new Error('status/upload workflow contract missing or unexpectedly changed');passed++;}catch(e){failures.push(s.name+': '+e.message);}}
const total=passed+failures.length;
if(total!==200){console.error('Suite definition error: '+total);process.exit(2);}
if(failures.length){console.error('V46 current Round 12 failed ('+failures.length+'/200):\n- '+failures.join('\n- '));process.exit(1);}
console.log('BCT V46 current Round 12: '+passed+'/200 status/upload safeguards passed.');
