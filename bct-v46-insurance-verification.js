(function(){
"use strict";
const KEY="bct_v46_insurance_verification_preview_v1";
const LANG_KEY="bct_v46_insurance_language_v1";
const LANGS={en:"English",es:"Español",fr:"Français",vi:"Tiếng Việt",zh:"中文",ar:"العربية",ru:"Русский"};
const T={
"Insurance Verification & Authorization":{es:"Verificación y autorización del seguro",fr:"Vérification et autorisation d’assurance",vi:"Xác minh và ủy quyền bảo hiểm",zh:"保险验证与授权",ar:"التحقق من التأمين والتفويض",ru:"Проверка и авторизация страхования"},
"BCT verifies insurance coverage independently of the carrier. Your carrier, broker, or an authorized insurance-data provider may be contacted to confirm current policy status.":{es:"BCT verifica la cobertura de seguro de forma independiente de la aseguradora. Se puede contactar a su aseguradora, corredor o proveedor autorizado de datos de seguros para confirmar el estado actual de la póliza.",fr:"BCT vérifie la couverture d’assurance indépendamment de l’assureur. Votre assureur, courtier ou fournisseur autorisé de données d’assurance peut être contacté pour confirmer le statut actuel de la police.",vi:"BCT xác minh bảo hiểm độc lập với công ty bảo hiểm. BCT có thể liên hệ công ty bảo hiểm, môi giới hoặc nhà cung cấp dữ liệu bảo hiểm được ủy quyền để xác nhận tình trạng hợp đồng hiện tại.",zh:"BCT 独立于保险公司核实保险范围。我们可能联系您的保险公司、经纪人或授权保险数据提供商，以确认保单当前状态。",ar:"تتحقق BCT من التغطية التأمينية بشكل مستقل عن شركة التأمين. قد يتم التواصل مع شركة التأمين أو الوسيط أو مزود بيانات التأمين المعتمد لتأكيد حالة الوثيقة الحالية.",ru:"BCT проверяет страховое покрытие независимо от страховщика. Для подтверждения текущего статуса полиса можно связаться со страховщиком, брокером или уполномоченным поставщиком страховых данных."},
"Policy Type":{es:"Tipo de póliza",fr:"Type de police",vi:"Loại hợp đồng",zh:"保单类型",ar:"نوع الوثيقة",ru:"Тип полиса"},
"Insurance Carrier":{es:"Aseguradora",fr:"Compagnie d’assurance",vi:"Công ty bảo hiểm",zh:"保险公司",ar:"شركة التأمين",ru:"Страховая компания"},
"Policy Number":{es:"Número de póliza",fr:"Numéro de police",vi:"Số hợp đồng",zh:"保单号码",ar:"رقم الوثيقة",ru:"Номер полиса"},
"Coverage Amount":{es:"Monto de cobertura",fr:"Montant de couverture",vi:"Mức bảo hiểm",zh:"保险金额",ar:"مبلغ التغطية",ru:"Размер покрытия"},
"Effective Date":{es:"Fecha de inicio",fr:"Date d’effet",vi:"Ngày hiệu lực",zh:"生效日期",ar:"تاريخ السريان",ru:"Дата начала"},
"Expiration Date":{es:"Fecha de vencimiento",fr:"Date d’expiration",vi:"Ngày hết hạn",zh:"到期日期",ar:"تاريخ الانتهاء",ru:"Дата окончания"},
"Contractor Authorization":{es:"Autorización del contratista",fr:"Autorisation du contractant",vi:"Ủy quyền của nhà thầu",zh:"承包商授权",ar:"تفويض المقاول",ru:"Авторизация подрядчика"},
"I authorize BCT to perform this insurance verification.":{es:"Autorizo a BCT a realizar esta verificación del seguro.",fr:"J’autorise BCT à effectuer cette vérification d’assurance.",vi:"Tôi ủy quyền cho BCT thực hiện xác minh bảo hiểm này.",zh:"我授权 BCT 执行此次保险验证。",ar:"أفوّض BCT بإجراء هذا التحقق من التأمين.",ru:"Я разрешаю BCT выполнить эту проверку страхования."},
"Electronic Signature (type your full legal/business name)":{es:"Firma electrónica (escriba su nombre legal/comercial completo)",fr:"Signature électronique (saisissez votre nom légal/commercial complet)",vi:"Chữ ký điện tử (nhập đầy đủ tên pháp lý/tên doanh nghiệp)",zh:"电子签名（输入您的完整法定/企业名称）",ar:"التوقيع الإلكتروني (اكتب اسمك القانوني/التجاري الكامل)",ru:"Электронная подпись (введите полное юридическое/деловое имя)"},
"Save Insurance + Authorization":{es:"Guardar seguro y autorización",fr:"Enregistrer l’assurance et l’autorisation",vi:"Lưu bảo hiểm và ủy quyền",zh:"保存保险和授权",ar:"حفظ التأمين والتفويض",ru:"Сохранить страхование и авторизацию"},
"Refresh":{es:"Actualizar",fr:"Actualiser",vi:"Làm mới",zh:"刷新",ar:"تحديث",ru:"Обновить"},
"Current BCT Insurance Records":{es:"Registros de seguros BCT actuales",fr:"Dossiers d’assurance BCT actuels",vi:"Hồ sơ bảo hiểm BCT hiện tại",zh:"当前 BCT 保险记录",ar:"سجلات تأمين BCT الحالية",ru:"Текущие страховые записи BCT"},
"Carrier independent:":{es:"Independiente de la aseguradora:",fr:"Indépendant de l’assureur :",vi:"Độc lập với công ty bảo hiểm:",zh:"不限定保险公司：",ar:"مستقل عن شركة التأمين:",ru:"Независимость от страховщика:"},
"Insurance Verification Layer":{es:"Capa de verificación de seguros",fr:"Couche de vérification d’assurance",vi:"Lớp xác minh bảo hiểm",zh:"保险验证层",ar:"طبقة التحقق من التأمين",ru:"Слой проверки страхования"},
"Verification paths":{es:"Métodos de verificación",fr:"Méthodes de vérification",vi:"Phương thức xác minh",zh:"验证方式",ar:"مسارات التحقق",ru:"Способы проверки"},
"Direct carrier / agent verification":{es:"Verificación directa con aseguradora / agente",fr:"Vérification directe auprès de l’assureur / agent",vi:"Xác minh trực tiếp với công ty bảo hiểm / đại lý",zh:"直接向保险公司/代理人验证",ar:"التحقق المباشر من شركة التأمين / الوكيل",ru:"Прямая проверка у страховщика / агента"},
"Carrier-independent verification provider":{es:"Proveedor de verificación independiente",fr:"Fournisseur de vérification indépendant",vi:"Nhà cung cấp xác minh độc lập",zh:"独立保险验证服务商",ar:"مزود تحقق مستقل عن شركة التأمين",ru:"Независимый поставщик проверки"},
"ACORD / COI document verification":{es:"Verificación de documentos ACORD / COI",fr:"Vérification de documents ACORD / COI",vi:"Xác minh tài liệu ACORD / COI",zh:"ACORD / COI 文件验证",ar:"التحقق من مستندات ACORD / COI",ru:"Проверка документов ACORD / COI"},
"Manual BCT verification":{es:"Verificación manual de BCT",fr:"Vérification manuelle BCT",vi:"Xác minh thủ công của BCT",zh:"BCT 手动验证",ar:"التحقق اليدوي من BCT",ru:"Ручная проверка BCT"}
};
function currentLang(){try{return localStorage.getItem(LANG_KEY)||"en"}catch(_){return"en"}}
function tr(s){const l=currentLang();return l==="en"?s:(T[s]?.[l]||s)}
function applyInsuranceTranslation(root){if(!root)return;root.querySelectorAll("[data-bct-ins-text]").forEach(el=>{const k=el.getAttribute("data-bct-ins-text");el.textContent=tr(k)});root.querySelectorAll("[data-bct-ins-placeholder]").forEach(el=>el.placeholder=tr(el.getAttribute("data-bct-ins-placeholder")));root.querySelectorAll("[data-bct-ins-option]").forEach(el=>{el.textContent=tr(el.getAttribute("data-bct-ins-option"))});const dir=currentLang()==="ar"?"rtl":"ltr";root.dir=dir}
function languageControl(){return '<label style="min-width:150px">Language<select id="bctInsLanguage">'+Object.entries(LANGS).map(([k,v])=>'<option value="'+k+'"'+(k===currentLang()?" selected":"")+'>'+esc(v)+'</option>').join("")+'</select></label>'}
const CARRIER_SUGGESTIONS=["The Hartford","Travelers","Nationwide","State Farm","Progressive","Liberty Mutual","CNA","Chubb","Zurich","Erie","Other / Regional Carrier"];
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function supa(){return typeof supabaseClient!=="undefined"&&supabaseClient?supabaseClient:null}
function getPreview(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(_){return {}}}
function setPreview(v){localStorage.setItem(KEY,JSON.stringify(v))}
function carrierOptions(selected){return CARRIER_SUGGESTIONS.map(x=>'<option value="'+esc(x)+'"'+(x===selected?' selected':'')+'>'+esc(x)+'</option>').join("")}
function daysLeft(d){if(!d)return null;const a=new Date();a.setHours(0,0,0,0);const b=new Date(d+"T00:00:00");return Math.ceil((b-a)/86400000)}
function health(policy){
 const d=daysLeft(policy.expires_on); if(policy.status==="rejected"||policy.status==="expired")return "bad";
 if(policy.status==="active"&&d!==null&&d>=0)return d<=30?"warn":"good";
 return "warn";
}
function badge(h){return h==="good"?'🟢 VERIFIED':h==="warn"?'🟡 REVIEW / EXPIRING':'🔴 ACTION REQUIRED'}
async function myPolicies(){
 const s=supa(); if(!s)return [];
 const r=await s.rpc("bct_my_insurance_policies");
 if(r.error)throw r.error; return Array.isArray(r.data)?r.data:[];
}
async function renderContractor(){
 const host=document.getElementById("bctInsuranceVerificationPanel"); if(!host)return;
 const p=getPreview(); let policies=[];
 try{policies=await myPolicies()}catch(_){}
 const rows=policies.map(x=>'<div class="stage"><div class="toolbar"><div><b>'+esc(x.policy_type.replaceAll("_"," "))+'</b><div class="muted">'+esc(x.carrier)+(x.policy_number?' • Policy ending '+esc(String(x.policy_number).slice(-4)):"")+'</div></div><span class="badge '+(health(x)==="good"?"good":health(x)==="warn"?"warn":"bad")+'">'+badge(health(x))+'</span></div><small>Effective '+esc(x.effective_on)+' • Expires '+esc(x.expires_on)+' • BCT status: '+esc(x.status)+'</small></div>').join("");
 host.innerHTML='<div class="toolbar"><div><h3 data-bct-ins-text="Insurance Verification & Authorization">Insurance Verification & Authorization</h3><p class="muted" data-bct-ins-text="BCT verifies insurance coverage independently of the carrier. Your carrier, broker, or an authorized insurance-data provider may be contacted to confirm current policy status.">BCT verifies insurance coverage independently of the carrier. Your carrier, broker, or an authorized insurance-data provider may be contacted to confirm current policy status.</p></div><span class="badge info">V46 Isolated Preview</span></div>'+
 (p.signedAt?'<div class="notice"><b>Authorization captured for this isolated preview.</b><br>Signed '+esc(p.signedAt)+' by '+esc(p.signature||"contractor")+'. This preview does not create a production legal record.</div>':"")+
 '<div class="toolbar section"><div>' + languageControl() + '</div></div><div class="grid grid-2 section"><div><label data-bct-ins-text="Policy Type">Policy Type</label><select id="bctInsType"><option value="general_liability">General Liability</option><option value="workers_comp">Workers’ Compensation</option><option value="commercial_auto">Commercial Auto</option><option value="other">Other Required Coverage</option></select></div><div><label data-bct-ins-text="Insurance Carrier">Insurance Carrier</label><input id="bctInsCarrier" list="bctCarrierList" placeholder="Insurance company name"><datalist id="bctCarrierList">'+CARRIER_SUGGESTIONS.map(x=>'<option value="'+esc(x)+'"></option>').join("")+'</datalist></div><div><label data-bct-ins-text="Policy Number">Policy Number</label><input id="bctInsPolicy"></div><div><label data-bct-ins-text="Coverage Amount">Coverage Amount</label><input id="bctInsAmount" type="number" min="0" step="1" placeholder="e.g. 1000000"></div><div><label data-bct-ins-text="Effective Date">Effective Date</label><input id="bctInsEffective" type="date"></div><div><label data-bct-ins-text="Expiration Date">Expiration Date</label><input id="bctInsExpires" type="date"></div></div>'+
 '<div class="stage section"><b data-bct-ins-text="Contractor Authorization">Contractor Authorization</b><p class="muted">I authorize BCT Renovations, LLC and its authorized verification providers to verify my insurance coverage, including policy status, coverage type, limits, effective date, expiration date, and cancellation or non-renewal status, with my insurer, broker, agent, or authorized insurance-data source. This authorization is for contractor qualification and ongoing compliance.</p>'+
 '<label><input id="bctInsAuth" type="checkbox" style="width:auto"> <span data-bct-ins-text="I authorize BCT to perform this insurance verification.">I authorize BCT to perform this insurance verification.</span></label><label><span data-bct-ins-text="Electronic Signature (type your full legal/business name)">Electronic Signature (type your full legal/business name)</span><input id="bctInsSignature" autocomplete="name" placeholder="Full name"></label></div>'+
 '<div class="admin-project-actions"><button type="button" id="bctInsSave" data-bct-ins-text="Save Insurance + Authorization">Save Insurance + Authorization</button><button type="button" class="secondary" id="bctInsRefresh" data-bct-ins-text="Refresh">Refresh</button></div><div id="bctInsStatus" class="section"></div>'+
 '<div class="section"><h4 data-bct-ins-text="Current BCT Insurance Records">Current BCT Insurance Records</h4>'+(rows||'<div class="muted">No submitted policies yet.</div>')+'</div>'+
 '<div class="privacy-note"><b data-bct-ins-text="Carrier independent:">Carrier independent:</b> BCT does not require a specific insurance company. Verification can use an available direct carrier/agent check, industry verification provider, ACORD/COI review, or documented manual verification.</div>';
 document.getElementById("bctInsSave")?.addEventListener("click",saveContractor);
 document.getElementById("bctInsRefresh")?.addEventListener("click",renderContractor);
}
function bindInsuranceLanguage(){const el=document.getElementById("bctInsLanguage");if(el&&!el.dataset.bound){el.dataset.bound="1";el.addEventListener("change",()=>{localStorage.setItem(LANG_KEY,el.value);renderContractor()})}}\nasync function saveContractor(){
 const status=document.getElementById("bctInsStatus"),s=supa(); const auth=document.getElementById("bctInsAuth")?.checked, sig=document.getElementById("bctInsSignature")?.value.trim();
 const payload={policy_type:document.getElementById("bctInsType")?.value,carrier:document.getElementById("bctInsCarrier")?.value.trim(),policy_number:document.getElementById("bctInsPolicy")?.value.trim(),coverage_amount:Number(document.getElementById("bctInsAmount")?.value||0)||null,effective_on:document.getElementById("bctInsEffective")?.value,expires_on:document.getElementById("bctInsExpires")?.value};
 if(!auth||!sig){status.textContent="Authorization checkbox and electronic signature are required.";return}
 if(!payload.carrier||!payload.effective_on||!payload.expires_on){status.textContent="Carrier and valid policy dates are required.";return}
 try{
   if(!s)throw new Error("BCT authentication is unavailable.");
   const r=await s.rpc("bct_submit_insurance_policy",{p_policy_type:payload.policy_type,p_carrier:payload.carrier,p_policy_number:payload.policy_number,p_coverage_amount:payload.coverage_amount,p_effective_on:payload.effective_on,p_expires_on:payload.expires_on,p_coi_storage_path:null});
   if(r.error)throw r.error;
   setPreview({signedAt:new Date().toISOString(),signature:sig,policyType:payload.policy_type,carrier:payload.carrier,verificationSource:"pending_selection"});
   status.innerHTML='<div class="notice"><b>Insurance record submitted to BCT for review.</b> Authorization was captured in this isolated preview. Production authorization persistence will be wired through the dedicated credential-audit schema before release.</div>';
   await renderContractor();
 }catch(e){status.textContent=e?.message||"Unable to submit insurance record."}
}
async function renderAdmin(){
 const host=document.getElementById("bctInsuranceVerificationAdminPanel");if(!host)return;
 let rows=[];try{const s=supa();if(s){const r=await s.rpc("bct_admin_insurance_policies");if(!r.error)rows=r.data||[]}}catch(_){}
 const preview=getPreview();
 host.innerHTML='' + languageControl() + '<div class="toolbar"><div><h3 data-bct-ins-text="Insurance Verification Layer">Insurance Verification Layer</h3><p class="muted">Extension of the existing Contractor Credentials Board — not a duplicate credential system.</p></div><span class="badge info">Carrier Independent</span></div>'+
 '<div class="grid grid-4 section"><div class="card"><div class="metric">'+rows.filter(x=>x.status==="active").length+'</div><small>Active Policies</small></div><div class="card"><div class="metric">'+rows.filter(x=>x.status==="pending_review").length+'</div><small>Pending BCT Review</small></div><div class="card"><div class="metric">'+rows.filter(x=>x.status==="expired").length+'</div><small>Expired</small></div><div class="card"><div class="metric">'+rows.filter(x=>daysLeft(x.expires_on)!==null&&daysLeft(x.expires_on)<=30&&daysLeft(x.expires_on)>=0).length+'</div><small>Expiring ≤30 Days</small></div></div>'+
 '<div class="stage"><b data-bct-ins-text="Verification paths">Verification paths</b><div class="check-grid section"><div class="check-tile">1. <span data-bct-ins-text="Direct carrier / agent verification">Direct carrier / agent verification</span></div><div class="check-tile">2. <span data-bct-ins-text="Carrier-independent verification provider">Carrier-independent verification provider</span></div><div class="check-tile">3. <span data-bct-ins-text="ACORD / COI document verification">ACORD / COI document verification</span></div><div class="check-tile">4. <span data-bct-ins-text="Manual BCT verification">Manual BCT verification</span></div></div><p class="muted">The contractor authorization is intended to cover all approved verification paths without requiring a particular carrier.</p></div>'+
 (preview.signedAt?'<div class="notice section"><b>Isolated preview authorization test:</b> '+esc(preview.signature)+' • '+esc(preview.signedAt)+'</div>':"")+
 '<div class="section">'+(rows.length?rows.map(x=>'<div class="stage"><div class="toolbar"><div><b>'+esc(x.policy_type.replaceAll("_"," "))+'</b><div class="muted">'+esc(x.carrier)+'</div></div><span class="badge '+(health(x)==="good"?"good":health(x)==="warn"?"warn":"bad")+'">'+badge(health(x))+'</span></div><small>Expires '+esc(x.expires_on)+' • Status '+esc(x.status)+'</small></div>').join(""):'<div class="muted">No insurance policy records returned.</div>')+'</div>';
}
function bindAdminInsuranceLanguage(){const el=document.getElementById("bctInsLanguage");if(el&&!el.dataset.bound){el.dataset.bound="1";el.addEventListener("change",()=>{localStorage.setItem(LANG_KEY,el.value);renderAdmin()})}}\nfunction inject(){
 let changed=false;
 const docs=document.getElementById("bctContractorDocsPanel");
 if(docs&&!document.getElementById("bctInsuranceVerificationPanel")){
  const el=document.createElement("section");el.id="bctInsuranceVerificationPanel";el.className="card section";docs.appendChild(el);changed=true;
 }
 const board=document.getElementById("adminContractorCredentials");
 if(board&&!document.getElementById("bctInsuranceVerificationAdminPanel")){
  const el=document.createElement("section");el.id="bctInsuranceVerificationAdminPanel";el.className="stage section";board.appendChild(el);changed=true;
 }
 if(changed){renderContractor();renderAdmin();}
}
document.addEventListener("click",e=>{if(e.target.closest?.("#bctContractorLoginBtn,#bctContractorLogoutBtn,#refreshContractorCredentialsBtn,[data-view='status']"))setTimeout(inject,500)},true);
document.addEventListener("DOMContentLoaded",()=>setTimeout(inject,700));
const mo=new MutationObserver(()=>{if(document.getElementById("bctContractorDocsPanel")||document.getElementById("adminContractorCredentials"))inject()});
mo.observe(document.documentElement,{childList:true,subtree:true});
})();