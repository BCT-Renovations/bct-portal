(function(){
"use strict";
const COPY={
 en:{open:"Agent BCT",title:"Agent BCT",sub:"BCT Renovations’ AI assistant",close:"Close Agent BCT",hello:"How can Agent BCT help?",placeholder:"Ask about BCT, your project, or the process…",send:"Send",general:"BCT general guidance",confirmed:"Confirmed from your BCT project",review:"BCT review required",unavailable:"Live status unavailable",signin:"Please sign in again to use private BCT project information.",offline:"Agent BCT is temporarily unavailable. Your draft is still here.",preview:"Agent BCT is in protected preview. Live AI generation is not enabled on this preview yet."},
 es:{open:"Agent BCT",title:"Agent BCT",sub:"Asistente de IA de BCT Renovations",close:"Cerrar Agent BCT",hello:"¿Cómo puede ayudar Agent BCT?",placeholder:"Pregunte sobre BCT, su proyecto o el proceso…",send:"Enviar",general:"Orientación general de BCT",confirmed:"Confirmado desde su proyecto BCT",review:"Se requiere revisión de BCT",unavailable:"Estado en vivo no disponible",signin:"Vuelva a iniciar sesión para usar información privada de su proyecto BCT.",offline:"Agent BCT no está disponible temporalmente. Su borrador sigue aquí.",preview:"Agent BCT está en vista previa protegida. La generación de IA en vivo aún no está habilitada."},
 fr:{open:"Agent BCT",title:"Agent BCT",sub:"Assistant IA de BCT Renovations",close:"Fermer Agent BCT",hello:"Comment Agent BCT peut-il vous aider ?",placeholder:"Posez une question sur BCT, votre projet ou le processus…",send:"Envoyer",general:"Conseils généraux BCT",confirmed:"Confirmé depuis votre projet BCT",review:"Révision BCT requise",unavailable:"Statut en direct indisponible",signin:"Reconnectez-vous pour utiliser les informations privées de votre projet BCT.",offline:"Agent BCT est temporairement indisponible. Votre brouillon est conservé.",preview:"Agent BCT est en aperçu protégé. La génération IA en direct n’est pas encore activée."},
 ar:{open:"Agent BCT",title:"Agent BCT",sub:"مساعد الذكاء الاصطناعي من BCT Renovations",close:"إغلاق Agent BCT",hello:"كيف يمكن لـ Agent BCT مساعدتك؟",placeholder:"اسأل عن BCT أو مشروعك أو العملية…",send:"إرسال",general:"إرشادات عامة من BCT",confirmed:"مؤكد من مشروع BCT الخاص بك",review:"مراجعة BCT مطلوبة",unavailable:"الحالة المباشرة غير متاحة",signin:"يرجى تسجيل الدخول مرة أخرى لاستخدام معلومات مشروع BCT الخاصة.",offline:"Agent BCT غير متاح مؤقتًا. ما زالت مسودتك هنا.",preview:"Agent BCT في معاينة محمية. إنشاء الذكاء الاصطناعي المباشر غير مفعّل بعد."},
 zh:{open:"Agent BCT",title:"Agent BCT",sub:"BCT Renovations AI 助手",close:"关闭 Agent BCT",hello:"Agent BCT 可以如何帮助您？",placeholder:"询问 BCT、您的项目或流程…",send:"发送",general:"BCT 一般指导",confirmed:"已从您的 BCT 项目确认",review:"需要 BCT 审核",unavailable:"实时状态不可用",signin:"请重新登录以使用您的 BCT 项目私人信息。",offline:"Agent BCT 暂时不可用。您的草稿仍保留。",preview:"Agent BCT 处于受保护预览中。实时 AI 生成功能尚未启用。"},
 ht:{open:"Agent BCT",title:"Agent BCT",sub:"Asistan AI BCT Renovations",close:"Fèmen Agent BCT",hello:"Kijan Agent BCT ka ede w?",placeholder:"Poze kesyon sou BCT, pwojè w, oswa pwosesis la…",send:"Voye",general:"Gid jeneral BCT",confirmed:"Konfime nan pwojè BCT ou",review:"Revizyon BCT obligatwa",unavailable:"Estati an dirèk pa disponib",signin:"Tanpri konekte ankò pou itilize enfòmasyon prive pwojè BCT ou.",offline:"Agent BCT pa disponib pou kounye a. Bouyon ou toujou la.",preview:"Agent BCT nan yon previzyon pwoteje. Jenerasyon AI an dirèk poko aktive."},
 pt:{open:"Agent BCT",title:"Agent BCT",sub:"Assistente de IA da BCT Renovations",close:"Fechar Agent BCT",hello:"Como o Agent BCT pode ajudar?",placeholder:"Pergunte sobre a BCT, seu projeto ou o processo…",send:"Enviar",general:"Orientação geral da BCT",confirmed:"Confirmado no seu projeto BCT",review:"Revisão da BCT necessária",unavailable:"Status ao vivo indisponível",signin:"Entre novamente para usar informações privadas do seu projeto BCT.",offline:"O Agent BCT está temporariamente indisponível. Seu rascunho continua aqui.",preview:"O Agent BCT está em prévia protegida. A geração de IA ao vivo ainda não está ativada."},
 ru:{open:"Agent BCT",title:"Agent BCT",sub:"ИИ-помощник BCT Renovations",close:"Закрыть Agent BCT",hello:"Чем может помочь Agent BCT?",placeholder:"Спросите о BCT, вашем проекте или процессе…",send:"Отправить",general:"Общие рекомендации BCT",confirmed:"Подтверждено из вашего проекта BCT",review:"Требуется проверка BCT",unavailable:"Текущий статус недоступен",signin:"Войдите снова, чтобы использовать закрытую информацию проекта BCT.",offline:"Agent BCT временно недоступен. Ваш черновик сохранён.",preview:"Agent BCT работает в защищённом режиме предварительного просмотра. Реальная генерация ИИ пока не включена."},
 vi:{open:"Agent BCT",title:"Agent BCT",sub:"Trợ lý AI của BCT Renovations",close:"Đóng Agent BCT",hello:"Agent BCT có thể giúp gì cho bạn?",placeholder:"Hỏi về BCT, dự án của bạn hoặc quy trình…",send:"Gửi",general:"Hướng dẫn chung của BCT",confirmed:"Đã xác nhận từ dự án BCT của bạn",review:"Cần BCT xem xét",unavailable:"Trạng thái trực tiếp không khả dụng",signin:"Vui lòng đăng nhập lại để sử dụng thông tin riêng tư của dự án BCT.",offline:"Agent BCT tạm thời không khả dụng. Bản nháp của bạn vẫn còn.",preview:"Agent BCT đang ở bản xem trước được bảo vệ. Tạo AI trực tiếp chưa được bật."}
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
function goHome(){
 const panel=document.getElementById("bctAgentPanel");
 if(panel)panel.hidden=true;
 document.body.classList.remove("bct-agent-open");
 window.scrollTo({top:0,left:0,behavior:"auto"});
 const home=document.getElementById("view-home");
 if(typeof setVisibleView==="function")setVisibleView("home");
 document.querySelectorAll("[id^=\"view-\"]").forEach(v=>{if(v!==home&&v.id!=="view-home")v.classList.add("hidden");});
 home?.classList.remove("hidden","bct-signedout-hidden");
 history.replaceState(null,"",location.pathname+location.search);
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
  else if(res.ok){transcript.push({role:"assistant",text:t().preview,provenance:body.provenance||"general_guidance"});}
  else if((res.status===401||res.status===403)&&/bct-v46-isolated-preview/i.test(location.hostname)){transcript.push({role:"assistant",text:t().preview,provenance:"general_guidance"});}
  else{transcript.push({role:"assistant",text:t().offline,provenance:"unavailable"});}
 }catch(_){
  if(/bct-v46-isolated-preview/i.test(location.hostname))transcript.push({role:"assistant",text:t().preview,provenance:"general_guidance"});
  else transcript.push({role:"assistant",text:t().offline,provenance:"unavailable"});
 }
 finally{clearTimeout(timer);pending=null;button.disabled=false;status.textContent="";renderMessages();input.focus({preventScroll:true});}
}
function mount(){
 const logo=document.querySelector(".brand-logo");
 if(logo){logo.src="/bct-logo-master.png?v=official-bct-logo-v46-comma-20261008";logo.alt="BCT Renovations, LLC";}

 if(document.getElementById("bctAgentOpen"))return;
 const root=document.createElement("div");root.id="bctAgentRoot";root.innerHTML='<button id="bctAgentOpen" type="button" aria-haspopup="dialog">Agent BCT</button><section id="bctAgentPanel" role="dialog" aria-modal="true" aria-labelledby="bctAgentTitle" hidden><header><div><button id="bctAgentHome" type="button" class="bct-agent-home">⌂ Home</button><strong id="bctAgentTitle">Agent BCT</strong><small id="bctAgentSubtitle"></small></div><button id="bctAgentClose" type="button" aria-label="Close Agent BCT">×</button></header><div id="bctAgentMessages" role="log" aria-live="polite"></div><form id="bctAgentForm"><label class="bct-agent-sr" for="bctAgentInput">Message</label><textarea id="bctAgentInput" maxlength="6000" rows="2"></textarea><div><span id="bctAgentStatus" role="status" aria-live="polite"></span><button id="bctAgentSend" type="submit">Send</button></div></form></section>';
 document.body.appendChild(root);
 document.getElementById("bctAgentOpen").addEventListener("click",open);document.getElementById("bctAgentClose").addEventListener("click",close);document.getElementById("bctAgentHome").addEventListener("click",goHome);document.getElementById("bctAgentForm").addEventListener("submit",e=>{e.preventDefault();send()});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!document.getElementById("bctAgentPanel").hidden)close()});
 document.addEventListener("change",e=>{if(e.target?.matches?.("#bctLoginLanguage,#bctLanguage,[data-language-selector]"))requestAnimationFrame(applyCopy)},true);
 if(typeof supabaseClient!=="undefined"&&supabaseClient?.auth?.onAuthStateChange)supabaseClient.auth.onAuthStateChange((event,s)=>{const next=s?.user?.id||"";if(event==="SIGNED_OUT"||(identity&&next&&identity!==next))clearPrivate();identity=next||null;});
 applyCopy();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount);else mount();
})();