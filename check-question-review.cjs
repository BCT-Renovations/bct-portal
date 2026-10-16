const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/question-review.html','utf8'),index=fs.readFileSync(__dirname+'/index.html','utf8');
let checks=0;for(const text of [html,index])for(const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(!/\bsrc=/.test(match[1])){new vm.Script(match[2]);checks++;}}
class Element{constructor(){this.children=[];this.textContent='';this.value='';this.listeners={};}add(e){this.children.push(e);}append(e){this.children.push(e);}replaceChildren(){this.children=[];}addEventListener(n,f){this.listeners[n]=f;}}
function run(hostname){const els={};for(const id of ['back','title','notice','languageLabel','professionLabel','language','profession','heading','questions','section'])els[id]=new Element();const doc={documentElement:{},getElementById:id=>els[id],createElement:()=>new Element(),querySelector:()=>els.section};const ctx={document:doc,location:{hostname,search:''},URLSearchParams,Option:function(text,value){this.text=text;this.value=value;}};vm.createContext(ctx);vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],ctx);return {ctx,els,doc};}
const {ctx,els,doc}=run('bct-v46-isolated-preview-test-typerry1972-1855.vercel.app');
for(const lang of ['en','es','fr','ht','pt','vi','zh','ar','ru'])for(const role of ['electrical','plumbing','general_contractor','hvac','roofing','drywall','concrete_masonry','flooring','handyman_services','specialty_trade']){
 vm.runInContext(`lang=${JSON.stringify(lang)};role=${JSON.stringify(role)};render();`,ctx);
 assert.equal(doc.documentElement.lang,lang);assert.equal(doc.documentElement.dir,lang==='ar'?'rtl':'ltr');assert.equal(els.profession.children.length,10);assert.equal(els.questions.children.length,['electrical','plumbing'].includes(role)?7:2);assert.ok(els.questions.children.every(x=>x.textContent?.trim()));checks+=5;
}
assert.equal(run('bct-portal.vercel.app').els.questions.children.length,0);checks++;
assert.ok(html.includes("connect-src 'none'; form-action 'none'"));assert.ok(!/<form|<input|fetch\(|XMLHttpRequest|supabase|localStorage|sessionStorage/i.test(html));checks+=2;
// Delayed session checks must not delay the public contractor shell.
const start=index.indexOf(' function showContractorEntry(){'),end=index.indexOf('\n window.bctOpenEntry=openEntry;',start);
const shell={classList:{add(){},remove(){},contains(){return false;}}};
let shown='',resolved=0;
const view={setAttribute(){},children:[],classList:{add(){},remove(){}},querySelectorAll:()=>[],style:{setProperty(){}}};
const nav={entryTransition:0,entryIntent:null,sessionNow:()=>new Promise(()=>{}),setTimeout:()=>{},setAuthShell:()=>resolved++,setVisibleView:n=>shown=n,document:{body:shell,getElementById:()=>view,querySelector:()=>null},location:{hash:'#status'},history:{pushState(){}},window:{scrollTo(){}},requestAnimationFrame:f=>f(),Promise};
vm.createContext(nav);vm.runInContext(index.slice(start,end)+';openEntry("contractor");',nav);assert.equal(shown,'status');assert.equal(resolved,0);checks+=2;
assert.ok(index.includes("id='bctContractorApplicationBack'"));assert.ok(index.includes('transition!==entryTransition'));checks+=2;
console.log('PASS '+checks+' source and offline behavior checks. Hosted browser/iPhone regression remains pending.');
