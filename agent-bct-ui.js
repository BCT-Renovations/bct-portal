(function(){
"use strict";
const COPY={
 en:{open:"Agent BCT",title:"Agent BCT",sub:"BCT Renovations’ AI assistant",close:"Close Agent BCT",hello:"How can Agent BCT help?",placeholder:"Ask about BCT, your project, or the process…",send:"Send",general:"BCT general guidance",confirmed:"Confirmed from your BCT project",review:"BCT review required",unavailable:"Live status unavailable",signin:"Please sign in again to use private BCT project information.",offline:"Agent BCT is temporarily unavailable. Your draft is still here.",preview:"Agent BCT is in protected preview. Live AI generation is not enabled on this preview yet."},
 es:{open:"Agent BCT",title:"Agent BCT",sub:"Asistente de IA de BCT Renovations",close:"Cerrar Agent BCT",hello:"¿Cómo puede ayudar Agent BCT?",placeholder:"Pregunte sobre BCT, su proyecto o el proceso…",send:"Enviar",general:"Orientación general de BCT",confirmed:"Confirmado desde su proyecto BCT",review:"Se requiere revisión de BCT",unavailable:"Estado en vivo no disponible",signin:"Vuelva a iniciar sesión para usar información privada de su proyecto BCT.",offline:"Agent BCT no está disponible temporalmente. Su borrador sigue aquí.",preview:"Agent BCT está en vista previa protegida. La generación de IA en vivo aún no está habilitada."},
 fr:{open:"Agent BCT",title:"Agent BCT",sub:"Assistant IA de BCT Renovations",close:"Fermer Agent BCT",hello:"Comment Agent BCT peut-il vous aider ?",placeholder:"Posez une question sur BCT, votre projet ou le processus…",send:"Envoyer",general:"Conseils généraux BCT",confirmed:"Confirmé depuis votre projet BCT",review:"Révision BCT requise",unavailable:"Statut en direct indisponible",signin:"Reconnectez-vous pour utiliser les informations privées de votre projet BCT.",offline:"Agent BCT est temporairement indisponible. Votre brouillon est conservé.",preview:"Agent BCT est en aperçu protégé. La génération IA en direct n’est pas encore activée."}
};
const RTL=new Set(["ar"]);
let transcript=[],pending=null,identity=null,lastFocus=null,scrollY=0;
function language(){return String(localStorage.getItem("bctPreferredLanguage")||document.getElementById("bctLoginLanguage")?.value||document.documentElement.lang||"en").toLowerCase().split("-")[0]}
function t(){return COPY[language()]||COPY.en}
function escapeHtml(v){return String(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function provenance(p){const x=t();return p==="confirmed_live"?x.confirmed:p==="human_review_required"?x.review:p==="unavailable"?x.unavailable:x.general}
function clearPrivate(){transcript=[];identity=null;if(pending){pending.abort();pending=null}renderMessages()}
async function session(){
 if(typeof supabaseClient==="undefined"||!supabaseClient)return {token:"",userId:""};
 try{const r=await supabaseClient.auth.getSession(),s=r?.data?.session;return {token:s?.access_token||"",userId:s?.user?.id||""}}catch(_){return {token:"",userId:""}}
}
function renderMessages(){
 const host=document.getElementById("bctAgentMessages");if(!host)return;
 const x=t();host.innerHTML=transcript.length?transcript.map(m=>'<div class="bct-agent-msg '+m.role+'"><div>'+escapeHtml(m.text)+'</div>'+(m.provenance?'<small>'+escapeHtml(provenance(m.provenance))+'</small>':'')+'</div>').join(""):'<div class="bct-agent-empty">'+escapeHtml(x.hello)+'</div>';
 host.scrollTop=host.scrollHeight;
}
function applyCopy(){
 const x=t(),panel=document.getElementById("bctAgentPanel");if(panel)panel.dir=RTL.has(language())?"rtl":"ltr";
 [["bctAgentOpen","open"],["bctAgentTitle","title"],["bctAgentSubtitle","sub"],["bctAgentSend","send"]].forEach(([id,k])=>{const e=document.getElementById(id);if(e)e.textContent=x[k]});
 const c=document.getElementById("bctAgentClose");if(c)c.setAttribute("aria-label",x.close);
 const input=document.getElementById("bctAgentInput");if(input)input.placeholder=x.placeholder;
 renderMessages();
}
function open(){
 const panel=document.getElementById("bctAgentPanel");if(!panel)return;
 lastFocus=document.activeElement;scrollY=window.scrollY;panel.hidden=false;document.body.classList.add("bct-agent-open");applyCopy();setTimeout(()=>document.getElementById("bctAgentInput")?.focus({preventScroll:true}),0);
}
function close(){
 const panel=document.getElementById("bctAgentPanel");if(!panel)return;
 panel.hidden=true;document.body.classList.remove("bct-agent-open");window.scrollTo({top:scrollY,left:0,behavior:"auto"});lastFocus?.focus?.({preventScroll:true});
}
async function send(){
 const input=document.getElementById("bctAgentInput"),status=document.getElementById("bctAgentStatus"),button=document.getElementById("bctAgentSend");if(!input||pending)return;
 const message=input.value.trim();if(!message)return;
 const s=await session();
 if(identity&&s.userId&&identity!==s.userId)clearPrivate();
 identity=s.userId||"public";
 transcript.push({role:"user",text:message});input.value="";renderMessages();
 pending=new AbortController();button.disabled=true;status.textContent="…";
 const timer=setTimeout(()=>pending?.abort(),26000);
 try{
  const headers={"content-type":"application/json"};if(s.token)headers.authorization="Bearer "+s.token;
  const res=await fetch("/api/agent-bct/chat",{method:"POST",headers,cache:"no-store",credentials:"same-origin",signal:pending.signal,body:JSON.stringify({message,languageCode:language(),history:transcript.slice(-12,-1).map(x=>({role:x.role,content:x.text}))})});
  const body=await res.json().catch(()=>({}));
  if(res.status===401){clearPrivate();transcript.push({role:"assistant",text:t().signin,provenance:"unavailable"});}
  else if(res.ok&&body.answer){transcript.push({role:"assistant",text:body.answer,provenance:body.provenance});}
  else if(res.ok&&body.generationEnabled===false){transcript.push({role:"assistant",text:t().preview,provenance:body.provenance||"general_guidance"});}
  else{transcript.push({role:"assistant",text:t().offline,provenance:"unavailable"});}
 }catch(_){transcript.push({role:"assistant",text:t().offline,provenance:"unavailable"});}
 finally{clearTimeout(timer);pending=null;button.disabled=false;status.textContent="";renderMessages();input.focus({preventScroll:true});}
}
function mount(){
 if(document.getElementById("bctAgentOpen"))return;
 const root=document.createElement("div");root.id="bctAgentRoot";root.innerHTML='<button id="bctAgentOpen" type="button" aria-haspopup="dialog">Agent BCT</button><section id="bctAgentPanel" role="dialog" aria-modal="true" aria-labelledby="bctAgentTitle" hidden><header><div><strong id="bctAgentTitle">Agent BCT</strong><small id="bctAgentSubtitle"></small></div><button id="bctAgentClose" type="button" aria-label="Close Agent BCT">×</button></header><div id="bctAgentMessages" role="log" aria-live="polite"></div><form id="bctAgentForm"><label class="bct-agent-sr" for="bctAgentInput">Message</label><textarea id="bctAgentInput" maxlength="6000" rows="2"></textarea><div><span id="bctAgentStatus" role="status" aria-live="polite"></span><button id="bctAgentSend" type="submit">Send</button></div></form></section>';
 document.body.appendChild(root);
 document.getElementById("bctAgentOpen").addEventListener("click",open);document.getElementById("bctAgentClose").addEventListener("click",close);document.getElementById("bctAgentForm").addEventListener("submit",e=>{e.preventDefault();send()});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!document.getElementById("bctAgentPanel").hidden)close()});
 document.addEventListener("change",e=>{if(e.target?.matches?.("#bctLoginLanguage,#bctLanguage,[data-language-selector]"))requestAnimationFrame(applyCopy)},true);
 if(typeof supabaseClient!=="undefined"&&supabaseClient?.auth?.onAuthStateChange)supabaseClient.auth.onAuthStateChange((event,s)=>{const next=s?.user?.id||"";if(event==="SIGNED_OUT"||(identity&&next&&identity!==next))clearPrivate();identity=next||null;});
 applyCopy();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
})();