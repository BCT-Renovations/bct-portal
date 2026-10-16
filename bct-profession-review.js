/* Read-only, preview-only review. No forms, accounts, authentication or network. */
(function(){
'use strict';
const ui={
en:['Application Question Review','Preview only. Read the questions without creating an account. Nothing is submitted or saved. Real applicants must still complete the required signup details.','Language','Profession','← Back','Review profession questions — no account needed','This review page is available only in the isolated preview.'],
es:['Revisión de preguntas de solicitud','Solo vista previa. Lea las preguntas sin crear una cuenta. No se envía ni se guarda nada. Los solicitantes reales deben completar los datos de registro requeridos.','Idioma','Profesión','← Atrás','Revisar preguntas por profesión — sin cuenta','Esta página de revisión solo está disponible en la vista previa aislada.'],
fr:['Consultation des questions de candidature','Aperçu uniquement. Lisez les questions sans créer de compte. Rien n’est envoyé ni enregistré. Les vrais candidats doivent remplir les informations d’inscription requises.','Langue','Métier','← Retour','Consulter les questions par métier — sans compte','Cette page est disponible uniquement dans l’aperçu isolé.'],
ht:['Revizyon kesyon aplikasyon','Aperçu sèlman. Li kesyon yo san kreye yon kont. Pa gen anyen ki soumèt oswa sove. Vrè aplikan yo dwe ranpli detay enskripsyon obligatwa yo.','Lang','Metye','← Retounen','Revize kesyon metye yo — pa bezwen kont','Paj revizyon sa a disponib sèlman nan aperçu izole a.'],
pt:['Revisão das perguntas de candidatura','Apenas prévia. Leia as perguntas sem criar uma conta. Nada é enviado ou salvo. Os candidatos reais devem preencher os dados obrigatórios de cadastro.','Idioma','Profissão','← Voltar','Revisar perguntas por profissão — sem conta','Esta página está disponível apenas na prévia isolada.'],
vi:['Xem câu hỏi ứng tuyển','Chỉ để xem trước. Đọc câu hỏi mà không tạo tài khoản. Không gửi hoặc lưu dữ liệu. Người ứng tuyển thật vẫn phải điền thông tin đăng ký bắt buộc.','Ngôn ngữ','Nghề nghiệp','← Quay lại','Xem câu hỏi theo nghề — không cần tài khoản','Trang này chỉ có trong bản xem trước riêng biệt.'],
zh:['申请问题预览','仅供预览。无需创建账户即可阅读问题。不会提交或保存任何信息。正式申请人仍须填写必需的注册资料。','语言','专业','← 返回','查看专业问题 — 无需账户','此页面仅在独立预览中可用。'],
ar:['مراجعة أسئلة التقديم','للمعاينة فقط. اقرأ الأسئلة دون إنشاء حساب. لا يتم إرسال أي بيانات أو حفظها. يجب على المتقدمين الفعليين إكمال بيانات التسجيل المطلوبة.','اللغة','المهنة','رجوع ←','مراجعة أسئلة المهنة — دون حساب','تتوفر هذه الصفحة في المعاينة المعزولة فقط.'],
ru:['Просмотр вопросов заявки','Только предварительный просмотр. Читайте вопросы без создания учетной записи. Ничего не отправляется и не сохраняется. Настоящие заявители должны заполнить обязательные регистрационные данные.','Язык','Специальность','← Назад','Посмотреть вопросы по специальности — без учетной записи','Эта страница доступна только в изолированном предварительном просмотре.']
};
const allowed=location.hostname==='localhost'||location.hostname==='127.0.0.1'||/^bct-v46-isolated-preview(?:-[a-z0-9-]+)?\.vercel\.app$/.test(location.hostname);
function lang(){return document.documentElement.lang||'en';}
function review(){const select=document.getElementById('reviewLanguage'),profession=document.getElementById('reviewProfession');const language=select.value,labels=ui[language]||ui.en;document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
 ['reviewTitle','reviewNotice','reviewLanguageLabel','reviewProfessionLabel','reviewBack'].forEach((id,i)=>document.getElementById(id).textContent=labels[i]);
 const previous=profession.value,catalog=window.BCTProfessionQuestions.review(language);profession.replaceChildren(...catalog.map(item=>new Option(item.title,item.id)));if(catalog.some(item=>item.id===previous))profession.value=previous;
 const item=catalog.find(item=>item.id===profession.value);document.getElementById('reviewHeading').textContent=item.title;const list=document.getElementById('reviewQuestions');list.replaceChildren(...item.questions.map(q=>{const li=document.createElement('li');li.textContent=q.text;return li;}));
}
if(document.getElementById('reviewControls')){
 if(!allowed){const msg=document.getElementById('reviewUnavailable');msg.textContent=ui.en[6];msg.hidden=false;return;}
 document.getElementById('reviewControls').hidden=false;document.getElementById('reviewLanguage').addEventListener('change',review);document.getElementById('reviewProfession').addEventListener('change',review);review();return;
}
// This link is installed only on the isolated preview, never on Live.
if(!allowed)return;
function link(){const router=document.getElementById('bctContractorRoleRouter');if(!router)return;let a=document.getElementById('bctProfessionReviewLink');if(!a){a=document.createElement('a');a.id='bctProfessionReviewLink';a.href='/profession-review.html';a.className='bct-review-link';a.setAttribute('data-bct-profession-questions','');router.append(a);}const label=(ui[lang()]||ui.en)[5];if(a.textContent!==label)a.textContent=label;}
link();document.addEventListener('DOMContentLoaded',link);new MutationObserver(link).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
