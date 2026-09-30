/* BCT V46 Client Portal Spanish translation completeness patch. */
(function(){
  'use strict';
  const VERSION='V46-2026.09.30-client-es-1';
  const ROOT_ID='view-customer';
  window.BCT_CLIENT_TRANSLATION_FIX_VERSION=VERSION;

  const KEY_EN={
    'portal.client_title':'CLIENT PORTAL',
    'homeowner.back_home':'← Back to Home',
    'homeowner.signup_title':'New Client — Sign Up',
    'homeowner.signup_description':'New to BCT? Create your private client account and start your project.',
    'homeowner.signup_button':'Sign Up / Start as a New Client',
    'homeowner.returning_title':'Returning Client — Sign In',
    'homeowner.email':'Email',
    'homeowner.password':'Password',
    'homeowner.signin_button':'Sign In',
    'homeowner.forgot_password':'Forgot Password?',
    'homeowner.signout_button':'Sign Out',
    'homeowner.resend_confirmation':'Resend Confirmation Email',
    'homeowner.portal_badge':'BCT Client Portal',
    'homeowner.tell_title':'Tell BCT About Your Project',
    'homeowner.step_dashboard':'Dashboard',
    'homeowner.step_details':'Details',
    'homeowner.step_files':'Files',
    'homeowner.step_estimate':'Estimate',
    'homeowner.step_payments':'Payments',
    'homeowner.step_progress':'Progress',
    'homeowner.step_completion':'Completion',
    'homeowner.already_submitted':'Already submitted?',
    'homeowner.project_number':'Project Number',
    'homeowner.check_project':'Check Project',
    'homeowner.tab_overview':'Project Overview',
    'homeowner.tab_details':'Project Details',
    'homeowner.tab_files':'Photos & Files',
    'homeowner.tab_estimate':'Estimate & Contract',
    'homeowner.tab_payments':'Financing & Payments',
    'homeowner.tab_progress':'Schedule & Progress',
    'homeowner.tab_messages':'Messages',
    'homeowner.tab_completion':'Final Walkthrough',
    'homeowner.estimate_title':'Estimate & Contract',
    'homeowner.payments_title':'Financing & Payments',
    'homeowner.progress_title':'Schedule & Progress',
    'homeowner.messages_title':'Messages',
    'homeowner.completion_title':'Final Walkthrough / Completion',
    'homeowner.about_button':'About',
    'homeowner.about_close':'Close About'
  };

  const KEY_ES={
    'portal.client_title':'PORTAL DEL CLIENTE',
    'homeowner.back_home':'← Volver al inicio',
    'homeowner.signup_title':'Nuevo cliente — Registrarse',
    'homeowner.signup_description':'¿Es nuevo en BCT? Cree su cuenta privada de cliente y comience su proyecto.',
    'homeowner.signup_button':'Registrarse / Comenzar como nuevo cliente',
    'homeowner.returning_title':'Cliente existente — Iniciar sesión',
    'homeowner.email':'Correo electrónico',
    'homeowner.password':'Contraseña',
    'homeowner.signin_button':'Iniciar sesión',
    'homeowner.forgot_password':'¿Olvidó su contraseña?',
    'homeowner.signout_button':'Cerrar sesión',
    'homeowner.resend_confirmation':'Reenviar correo de confirmación',
    'homeowner.portal_badge':'Portal del cliente BCT',
    'homeowner.tell_title':'Cuéntele a BCT sobre su proyecto',
    'homeowner.step_dashboard':'Panel',
    'homeowner.step_details':'Detalles',
    'homeowner.step_files':'Archivos',
    'homeowner.step_estimate':'Estimado',
    'homeowner.step_payments':'Pagos',
    'homeowner.step_progress':'Progreso',
    'homeowner.step_completion':'Finalización',
    'homeowner.already_submitted':'¿Ya lo envió?',
    'homeowner.project_number':'Número de proyecto',
    'homeowner.check_project':'Verificar proyecto',
    'homeowner.tab_overview':'Resumen del proyecto',
    'homeowner.tab_details':'Detalles del proyecto',
    'homeowner.tab_files':'Fotos y archivos',
    'homeowner.tab_estimate':'Estimado y contrato',
    'homeowner.tab_payments':'Financiamiento y pagos',
    'homeowner.tab_progress':'Calendario y progreso',
    'homeowner.tab_messages':'Mensajes',
    'homeowner.tab_completion':'Recorrido final',
    'homeowner.estimate_title':'Estimado y contrato',
    'homeowner.payments_title':'Financiamiento y pagos',
    'homeowner.progress_title':'Calendario y progreso',
    'homeowner.messages_title':'Mensajes',
    'homeowner.completion_title':'Recorrido final / Finalización',
    'homeowner.about_button':'Acerca de BCT',
    'homeowner.about_close':'Cerrar información'
  };

  const ES={
    'CLIENT PORTAL':'PORTAL DEL CLIENTE',
    'Back to Home':'Volver al inicio',
    '← Back to Home':'← Volver al inicio',
    'New Client — Sign Up':'Nuevo cliente — Registrarse',
    'Returning Client — Sign In':'Cliente existente — Iniciar sesión',
    'Email':'Correo electrónico',
    'Password':'Contraseña',
    'Sign In':'Iniciar sesión',
    'Forgot Password?':'¿Olvidó su contraseña?',
    'Sign Out':'Cerrar sesión',
    'Resend Confirmation Email':'Reenviar correo de confirmación',
    'Next step':'Siguiente paso',
    'Next Step':'Siguiente paso',
    'BCT Client Portal':'Portal del cliente BCT',
    'Tell BCT About Your Project':'Cuéntele a BCT sobre su proyecto',
    'Dashboard':'Panel',
    'Details':'Detalles',
    'Files':'Archivos',
    'Estimate':'Estimado',
    'Payments':'Pagos',
    'Progress':'Progreso',
    'Completion':'Finalización',
    'Already submitted?':'¿Ya lo envió?',
    'Use your project number to check the current BCT status.':'Use su número de proyecto para verificar el estado actual en BCT.',
    'Project Number':'Número de proyecto',
    'Check Project':'Verificar proyecto',
    'Project Overview':'Resumen del proyecto',
    'Project Details':'Detalles del proyecto',
    'Photos & Files':'Fotos y archivos',
    'Estimate & Contract':'Estimado y contrato',
    'Financing & Payments':'Financiamiento y pagos',
    'Schedule & Progress':'Calendario y progreso',
    'Messages':'Mensajes',
    'Final Walkthrough':'Recorrido final',
    'Final Walkthrough / Completion':'Recorrido final / Finalización',
    'About':'Acerca de BCT',
    'Close About':'Cerrar información',
    'New to BCT? Create your private client account and start your project.':'¿Es nuevo en BCT? Cree su cuenta privada de cliente y comience su proyecto.',
    'Sign Up / Start as a New Client':'Registrarse / Comenzar como nuevo cliente',
    '1 Account':'1 Cuenta',
    '2 Property':'2 Propiedad',
    '3 Work':'3 Trabajo',
    '4 Photos':'4 Fotos',
    '5 Budget':'5 Presupuesto',
    '6 Timeline':'6 Cronograma',
    '7 Review':'7 Revisión',
    '1 — Create Your Private Customer Account':'1 — Cree su cuenta privada de cliente',
    'Your private customer account and project are securely created through BCT’s Supabase authentication and database.':'Su cuenta privada de cliente y su proyecto se crean de forma segura mediante la autenticación de Supabase y la base de datos protegida de BCT.',
    'First Name':'Nombre',
    'Last Name':'Apellido',
    'Mobile Phone':'Teléfono móvil',
    'Create Password':'Crear contraseña',
    'Confirm Password':'Confirmar contraseña',
    '2 — Property Information':'2 — Información de la propiedad',
    'Street Address':'Dirección',
    'City':'Ciudad',
    'State':'Estado',
    'Select state':'Seleccione un estado',
    'ZIP Code':'Código postal',
    'Property Type':'Tipo de propiedad',
    'Single-family home':'Casa unifamiliar',
    'Condo / Townhome':'Condominio / Casa adosada',
    'Rental property':'Propiedad de alquiler',
    'Multi-family':'Multifamiliar',
    'Commercial':'Comercial',
    'Other':'Otro',
    'Are you the property owner?':'¿Es usted el propietario?',
    'Yes':'Sí',
    'No - authorized representative':'No - representante autorizado',
    'Property / Complex Name (multi-family or commercial)':'Nombre de la propiedad / complejo (multifamiliar o comercial)',
    'Property / Complex Name':'Nombre de la propiedad / complejo',
    'Building Number':'Número de edificio',
    'Unit / Suite Number':'Número de unidad / suite',
    'Unit Status':'Estado de la unidad',
    'Not applicable':'No aplica',
    'Vacant':'Vacante',
    'Occupied':'Ocupada',
    'Resident Name (BCT private)':'Nombre del residente (privado para BCT)',
    'Resident Name':'Nombre del residente',
    'Resident Phone (BCT private)':'Teléfono del residente (privado para BCT)',
    'Resident Phone':'Teléfono del residente',
    '3 — What Work Do You Need?':'3 — ¿Qué trabajo necesita?',
    'Select every service that may apply.':'Seleccione todos los servicios que correspondan.',
    'Gutters & Drainage':'Canaletas y drenaje',
    'Roofing':'Techos',
    'Siding':'Revestimiento',
    'Windows & Doors':'Ventanas y puertas',
    'Drywall':'Paneles de yeso',
    'Painting':'Pintura',
    'Flooring':'Pisos',
    'Kitchen Remodeling':'Remodelación de cocina',
    'Bathroom Remodeling':'Remodelación de baño',
    'Decks & Porches':'Terrazas y porches',
    'Electrical':'Electricidad',
    'Plumbing':'Plomería',
    'Carpentry':'Carpintería',
    'Water / Flood Damage':'Daños por agua / inundación',
    'Full Renovation':'Renovación completa',
    'Handyman Services':'Servicios de mantenimiento',
    'What best describes the project?':'¿Qué describe mejor el proyecto?',
    'Repair':'Reparar',
    'Replace':'Reemplazar',
    'Install new':'Instalar nuevo',
    'Remodel':'Remodelar',
    'Emergency':'Emergencia',
    "Not sure - I need BCT's recommendation":'No estoy seguro - necesito la recomendación de BCT',
    'Describe what you would like done':'Describa lo que desea realizar',
    '4 — Photos, Video & Documents':'4 — Fotos, video y documentos',
    'Upload Project Files':'Subir archivos del proyecto',
    'Choose Files':'Elegir archivos',
    'Choose files':'Elegir archivos',
    'No files selected':'No hay archivos seleccionados',
    'No file selected':'No hay archivo seleccionado',
    'Project files are stored in BCT’s private cloud storage after you confirm your account and sign in.':'Los archivos de su proyecto se almacenan de forma privada en la nube de BCT después de confirmar su cuenta e iniciar sesión.',
    '5 — Budget':'5 — Presupuesto',
    'Do you have a project budget?':'¿Tiene un presupuesto para el proyecto?',
    'Not sure':'No estoy seguro',
    'I need BCT to help determine project cost':'Necesito que BCT ayude a determinar el costo del proyecto',
    'Estimated Budget Range':'Rango de presupuesto estimado',
    'Under $1,000':'Menos de $1,000',
    '6 — Timeline':'6 — Cronograma',
    'When would you like work started?':'¿Cuándo desea que comience el trabajo?',
    'As soon as possible':'Lo antes posible',
    'Within 1 week':'Dentro de 1 semana',
    'Within 30 days':'Dentro de 30 días',
    'Within 1-3 months':'Dentro de 1-3 meses',
    "I'm flexible":'Soy flexible',
    'Specific date':'Fecha específica',
    'Specific Start Date (optional)':'Fecha específica de inicio (opcional)',
    'Must be completed by a certain date?':'¿Debe completarse antes de una fecha determinada?',
    'No':'No',
    'Completion Deadline (optional)':'Fecha límite de finalización (opcional)',
    '7 — Submit to BCT':'7 — Enviar a BCT',
    'I certify the project information I provided is accurate to the best of my knowledge.':'Certifico que la información del proyecto que proporcioné es correcta según mi leal saber y entender.',
    'Submit Project Privately to BCT':'Enviar proyecto de forma privada a BCT',
    'Continue':'Continuar',
    'Back':'Atrás',
    'Previous':'Anterior',
    'Review & Submit':'Revisar y enviar',
    'Submitted Projects':'Proyectos enviados',
    'Submitted projects':'Proyectos enviados',
    'No projects found for this account.':'No se encontraron proyectos para esta cuenta.',
    'No homeowner projects found for this account.':'No se encontraron proyectos de propietario para esta cuenta.',
    'Verification':'Verificación',
    'Project':'Proyecto',
    'Add Private Project Files':'Agregar archivos privados del proyecto',
    'Upload Files':'Subir archivos',
    'Check if you qualify':'Verificar si califica',
    'Check If You Qualify':'Verificar si califica'
  };

  const ES_PLACEHOLDERS={
    'Example: BCT-2026-123456':'Ejemplo: BCT-2026-123456',
    'Email':'Correo electrónico',
    'Password':'Contraseña'
  };
  const REVERSE_ES=Object.fromEntries(Object.entries(ES).map(([en,es])=>[es,en]));
  const textOriginal=new WeakMap();
  const placeholderOriginal=new WeakMap();
  let scheduled=false;

  function language(){
    try{return (localStorage.getItem('bctPreferredLanguage')||document.documentElement.lang||'en').toLowerCase().split('-')[0]}catch(_){return (document.documentElement.lang||'en').toLowerCase().split('-')[0]}
  }
  function root(){return document.getElementById(ROOT_ID)}
  function setText(el,value){if(el&&typeof value==='string'&&el.textContent!==value)el.textContent=value}
  function translateDataKeys(r,lang){
    r.querySelectorAll('[data-i18n]').forEach(el=>{
      const key=el.dataset.i18n;
      const value=lang==='es'?KEY_ES[key]:KEY_EN[key];
      if(value)setText(el,value);
      else if(lang==='es'&&el.textContent.trim()===key){
        const fallback=KEY_ES[key]||ES[KEY_EN[key]||''];
        if(fallback)setText(el,fallback);
      }
    });
    const about=document.getElementById('bctClientAboutBtn');
    if(about)setText(about,lang==='es'?'Acerca de BCT':'About');
    const aboutClose=document.getElementById('bctClientAboutClose');
    if(aboutClose)setText(aboutClose,lang==='es'?'Cerrar información':'Close About');
  }
  function translateTextNodes(r,lang){
    const walker=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);
    const nodes=[]; let n;
    while((n=walker.nextNode()))nodes.push(n);
    nodes.forEach(node=>{
      const parent=node.parentElement;
      if(!parent||['SCRIPT','STYLE','TEXTAREA'].includes(parent.tagName)||parent.closest('[contenteditable="true"]'))return;
      const raw=node.nodeValue||''; const trimmed=raw.trim(); if(!trimmed)return;
      if(!textOriginal.has(node)){
        const english=REVERSE_ES[trimmed]||trimmed;
        textOriginal.set(node,english);
      }
      const source=textOriginal.get(node);
      const wanted=lang==='es'?(ES[source]||source):source;
      if(trimmed!==wanted){
        const left=raw.match(/^\s*/)?.[0]||'',right=raw.match(/\s*$/)?.[0]||'';
        node.nodeValue=left+wanted+right;
      }
    });
  }
  function translatePlaceholders(r,lang){
    r.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{
      const current=el.getAttribute('placeholder')||'';
      if(!placeholderOriginal.has(el))placeholderOriginal.set(el,REVERSE_ES[current]||current);
      const source=placeholderOriginal.get(el);
      const wanted=lang==='es'?(ES_PLACEHOLDERS[source]||ES[source]||source):source;
      if(current!==wanted)el.setAttribute('placeholder',wanted);
    });
  }
  function sync(){
    scheduled=false;
    const r=root(); if(!r)return;
    const lang=language()==='es'?'es':'en';
    translateDataKeys(r,lang);
    translateTextNodes(r,lang);
    translatePlaceholders(r,lang);
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sync)}

  document.addEventListener('change',event=>{
    if(event.target&&['bctLanguage','bctLoginLanguage'].includes(event.target.id))setTimeout(schedule,0);
  },true);
  document.addEventListener('click',()=>setTimeout(schedule,0),true);
  window.addEventListener('pageshow',schedule);
  window.addEventListener('hashchange',schedule);
  new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','lang']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{schedule();setTimeout(schedule,500);setTimeout(schedule,1500)});
  else{schedule();setTimeout(schedule,500);setTimeout(schedule,1500)}
})();
