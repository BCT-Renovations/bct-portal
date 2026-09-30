/* BCT V46 admin mobile controls + Spanish admin translation stability patch. */
(function(){
  'use strict';
  const VERSION='V46-2026.09.30-admin-mobile-1';
  const ROOT_ID='view-admin';
  const ORIGINAL_TEXT=new WeakMap();
  const ORIGINAL_PLACEHOLDER=new WeakMap();
  let translating=false;
  window.BCT_ADMIN_MOBILE_FIX_VERSION=VERSION;

  const ES={
    '✓ BCT Admin Authenticated':'✓ Administrador de BCT autenticado',
    'Sign Out':'Cerrar sesión',
    'BCT Admin Dashboard':'Panel de administración de BCT',
    'Protected by Supabase Authentication and the BCT admin role.':'Protegido por la autenticación de Supabase y el rol de administrador de BCT.',
    'Command Center':'Centro de control',
    'Search or jump to the BCT Admin area you need without scrolling through the full production dashboard.':'Busque o vaya directamente al área de administración de BCT que necesita sin recorrer todo el panel de producción.',
    'Launch':'Lanzamiento',
    'Applicants':'Solicitantes',
    'Projects':'Proyectos',
    'AI Estimates':'Estimados con IA',
    'Bids':'Ofertas',
    'Job Health':'Estado de los trabajos',
    'Service Calls':'Llamadas de servicio',
    'Post Job':'Publicar trabajo',
    'Contractors':'Contratistas',
    'Projects & Estimates':'Proyectos y estimados',
    'Jobs & Progress':'Trabajos y progreso',
    'Applications':'Solicitudes',
    'Pending Review':'Pendientes de revisión',
    'Background Stage':'Etapa de verificación',
    'Approved':'Aprobados',
    'Launch Control Center':'Centro de control de lanzamiento',
    'Live readiness, security, notification delivery, policy status, and work that still needs BCT attention. Customer pilot remains closed until these checks are complete.':'Estado de preparación, seguridad, entrega de notificaciones, políticas y trabajo que aún requiere atención de BCT. El piloto para clientes permanece cerrado hasta completar estas verificaciones.',
    'Refresh Controls':'Actualizar controles',
    'Frontend Readiness':'Preparación del sistema',
    'Open Action Items':'Acciones pendientes',
    'Email Failures':'Fallos de correo',
    'Critical Compliance':'Cumplimiento crítico',
    'Operational Readiness':'Preparación operativa',
    'Admin-only coverage check for final pilot workflows: completion sign-off, documents, expiration alerts, ratings, disputes, reporting, messaging, notifications, audit, backup and security gates.':'Verificación exclusiva de administración para los flujos finales del piloto: cierre, documentos, alertas de vencimiento, calificaciones, disputas, reportes, mensajes, notificaciones, auditoría, copias de seguridad y controles de seguridad.',
    'Refresh Readiness':'Actualizar preparación',
    'Required Capabilities':'Capacidades requeridas',
    'Covered':'Cubiertas',
    'Gaps':'Pendientes',
    'External Checks':'Verificaciones externas',
    'Admin Activity Audit':'Auditoría de actividad administrativa',
    'Local session audit for operator traceability while testing. Supabase remains the durable system of record for approval, job, financing, escrow, and correction actions.':'Auditoría de la sesión local para mantener trazabilidad durante las pruebas. Supabase sigue siendo el registro permanente para aprobaciones, trabajos, financiamiento, depósito en garantía y correcciones.',
    'Clear Local Trail':'Borrar registro local',
    'Applicant Pipeline':'Proceso de solicitantes',
    'ID':'ID',
    'Applicant':'Solicitante',
    'Trade':'Oficio',
    'Status':'Estado',
    'Actions':'Acciones',
    'Contractor Safety Compliance':'Cumplimiento de seguridad de contratistas',
    'Training compliance controls eligibility for new BCT work. Separate Admin holds remain under BCT control.':'El cumplimiento de capacitación controla la elegibilidad para nuevos trabajos de BCT. Las retenciones administrativas separadas permanecen bajo control de BCT.',
    'Refresh Safety':'Actualizar seguridad',
    'Run Safety Cycle':'Ejecutar ciclo de seguridad',
    'Training Program Settings':'Configuración del programa de capacitación',
    'BCT controls recurrence, grace period and reminder timing.':'BCT controla la frecuencia, el período de gracia y el momento de los recordatorios.',
    'Cadence (days)':'Frecuencia (días)',
    'Grace (days)':'Gracia (días)',
    'Reminder days':'Días de recordatorio',
    'Program':'Programa',
    'Enabled':'Activado',
    'Paused':'Pausado',
    'Save Safety Settings':'Guardar configuración de seguridad',
    'Create Training Module':'Crear módulo de capacitación',
    'Title':'Título',
    'Module Type':'Tipo de módulo',
    'Core':'Principal',
    'Trade-specific':'Específico del oficio',
    'Trade Code':'Código de oficio',
    'Training URL':'URL de capacitación',
    'Passing Score':'Puntuación mínima',
    'Quiz required':'Cuestionario requerido',
    'Description':'Descripción',
    'Create Module':'Crear módulo',
    'Permanent Training Records':'Registros permanentes de capacitación',
    'BCT-only transcript showing assigned, due, grace, completion, acknowledgment, quiz, pass/exemption and hold evidence.':'Registro exclusivo de BCT con asignación, vencimiento, gracia, finalización, reconocimiento, cuestionario, aprobación/exención y evidencia de retenciones.',
    'Homeowner Project Review':'Revisión de proyectos de propietarios',
    'Customer information is BCT-only. Contractors receive a separate sanitized scope when BCT publishes the project for bidding.':'La información del cliente es exclusiva de BCT. Los contratistas reciben un alcance separado y depurado cuando BCT publica el proyecto para ofertas.',
    'AI Estimating':'Estimación con IA',
    'BCT Admin-only estimating workspace with draft generation, internal costs, editable materials/labor, recalculation and manual customer approval.':'Espacio de estimación exclusivo de BCT Admin con generación de borradores, costos internos, materiales y mano de obra editables, recálculo y aprobación manual del cliente.',
    'Open AI Estimating':'Abrir estimación con IA',
    'AI never approves estimates.':'La IA nunca aprueba estimados.',
    'Every AI-generated estimate stays internal until BCT Admin completes review and manually releases it.':'Cada estimado generado por IA permanece interno hasta que BCT Admin complete la revisión y lo libere manualmente.',
    'BCT Bid Review':'Revisión de ofertas de BCT',
    'Review subcontractor bids and award or reject each submission.':'Revise las ofertas de subcontratistas y adjudique o rechace cada propuesta.',
    'Job':'Trabajo',
    'Subcontractor':'Subcontratista',
    'Subcontractor Bid':'Oferta del subcontratista',
    'BCT Target':'Objetivo de BCT',
    'Submitted':'Enviado',
    'Job Health Dashboard':'Panel de estado de trabajos',
    'Every active BCT job: customer, contractor, job number, schedule, completion, manual weather impact, materials, approvals, financing, escrow, messages, and items that need attention. Weather remains manually recorded until a live provider is enabled.':'Cada trabajo activo de BCT: cliente, contratista, número de trabajo, calendario, avance, impacto meteorológico manual, materiales, aprobaciones, financiamiento, depósito en garantía, mensajes y asuntos que requieren atención. El clima seguirá registrándose manualmente hasta habilitar un proveedor en vivo.',
    'Refresh Job Health':'Actualizar estado de trabajos',
    'Active Jobs':'Trabajos activos',
    'On Track':'En curso',
    'Needs Attention':'Requiere atención',
    'Delayed / Critical':'Retrasado / Crítico',
    'Manage BCT Job':'Administrar trabajo de BCT',
    'Close':'Cerrar',
    'Job Status':'Estado del trabajo',
    'Draft':'Borrador',
    'Open for bids':'Abierto a ofertas',
    'Bid review':'Revisión de ofertas',
    'Awarded':'Adjudicado',
    'Scheduled':'Programado',
    'In progress':'En progreso',
    'On hold':'En espera',
    'Completed':'Completado',
    'Closed':'Cerrado',
    'Save Status':'Guardar estado',
    'Schedule':'Calendario',
    'Event Type':'Tipo de evento',
    'Site Visit':'Visita al sitio',
    'Start':'Inicio',
    'Work Day':'Día de trabajo',
    'Inspection':'Inspección',
    'Customer Meeting':'Reunión con el cliente',
    'Starts':'Comienza',
    'Ends':'Termina',
    'Notes':'Notas',
    'Add Schedule Event':'Agregar evento al calendario',
    'Weather':'Clima',
    'Materials':'Materiales',
    'Change Order Review':'Revisión de orden de cambio',
    'Draft, send for homeowner review, then record BCT approval.':'Prepare el borrador, envíelo al propietario para revisión y luego registre la aprobación de BCT.',
    'Approval Requests':'Solicitudes de aprobación',
    'Track and close outstanding job decisions from one place.':'Controle y cierre las decisiones pendientes del trabajo desde un solo lugar.',
    'Choose a job to view its change orders.':'Elija un trabajo para ver sus órdenes de cambio.',
    'Choose a job to view its approvals.':'Elija un trabajo para ver sus aprobaciones.',
    'BCT Service Calls':'Llamadas de servicio de BCT',
    'Create a service call tied to an original BCT job for warranty, workmanship, or post-completion concerns. BCT service team inspects first; responsibility is determined after review.':'Cree una llamada de servicio vinculada a un trabajo original de BCT por garantía, mano de obra o problemas posteriores a la finalización. El equipo de servicio de BCT inspecciona primero y la responsabilidad se determina después de la revisión.',
    'Original Job Number':'Número del trabajo original',
    'Service Call Type':'Tipo de llamada de servicio',
    'Warranty / Workmanship Review':'Revisión de garantía / mano de obra',
    'Customer Concern':'Problema del cliente',
    'Material Issue':'Problema de material',
    'Other':'Otro',
    'Issue Reported':'Problema reportado',
    'Create BCT Service Call':'Crear llamada de servicio BCT',
    'Post BCT Job':'Publicar trabajo de BCT',
    'BCT Project':'Proyecto BCT',
    'Choose a verified project':'Elija un proyecto verificado',
    'Job Title':'Título del trabajo',
    'No matching section found.':'No se encontró una sección coincidente.',
    'Loading':'Cargando',
    'No service calls yet.':'Aún no hay llamadas de servicio.',
    'No training modules created yet.':'Aún no se han creado módulos de capacitación.',
    'No active contractor safety records yet.':'Aún no hay registros activos de seguridad de contratistas.',
    'No permanent training records yet.':'Aún no hay registros permanentes de capacitación.',
    'Refreshing launch controls...':'Actualizando controles de lanzamiento...',
    'Launch controls refreshed.':'Controles de lanzamiento actualizados.',
    'Refreshing operational readiness...':'Actualizando preparación operativa...',
    'Operational readiness refreshed.':'Preparación operativa actualizada.',
    'Local admin activity trail cleared.':'Registro local de actividad administrativa borrado.'
  };

  const ES_PLACEHOLDERS={
    'Search: applicants, homeowner projects, bids, job health, service calls, launch, safety, AI, post job':'Buscar: solicitantes, proyectos de propietarios, ofertas, estado de trabajos, llamadas de servicio, lanzamiento, seguridad, IA, publicar trabajo',
    'Required for trade-specific':'Requerido para un oficio específico'
  };

  function language(){
    try{return (localStorage.getItem('bctPreferredLanguage')||document.documentElement.lang||'en').toLowerCase().split('-')[0]}catch(_){return (document.documentElement.lang||'en').toLowerCase().split('-')[0]}
  }
  function adminRoot(){return document.getElementById(ROOT_ID)}
  function isAdminVisible(){const root=adminRoot();return !!root&&!root.classList.contains('hidden')}
  function showPage(page){
    const root=adminRoot(); if(!root||!page)return;
    root.querySelectorAll('[data-admin-page-tab]').forEach(btn=>btn.classList.toggle('active',btn.dataset.adminPageTab===page));
    root.querySelectorAll('[data-admin-page-panel]').forEach(panel=>panel.classList.toggle('active',panel.dataset.adminPagePanel===page));
  }
  function jumpTo(id){
    const root=adminRoot(); if(!root)return;
    const target=document.getElementById(id); if(!target||!root.contains(target))return;
    const page=target.dataset.adminPagePanel||target.closest('[data-admin-page-panel]')?.dataset.adminPagePanel;
    if(page)showPage(page);
    requestAnimationFrame(()=>{
      target.scrollIntoView({behavior:'smooth',block:'start'});
      target.classList.add('bct-jump-highlight');
      setTimeout(()=>target.classList.remove('bct-jump-highlight'),1800);
    });
  }
  function filterCommands(){
    const root=adminRoot(); if(!root)return;
    const input=root.querySelector('#bctCommandSearch');
    const results=root.querySelector('#bctCommandResults');
    const empty=root.querySelector('#bctCommandEmpty');
    if(!input||!results)return;
    const q=String(input.value||'').trim().toLowerCase();
    let matches=0;
    results.querySelectorAll('[data-admin-jump]').forEach(btn=>{
      const hay=((btn.dataset.commandLabel||'')+' '+(btn.textContent||'')).toLowerCase();
      const on=!q||hay.includes(q);
      btn.hidden=!on;
      if(on)matches++;
    });
    results.hidden=false;
    if(empty)empty.hidden=!q||matches>0;
  }
  function stabilizeTouchSurface(){
    const root=adminRoot(); if(!root)return;
    if(isAdminVisible()){
      root.removeAttribute('inert');
      root.removeAttribute('aria-hidden');
      root.style.pointerEvents='auto';
      ['view-home','view-admin-login'].forEach(id=>{const el=document.getElementById(id);if(el&&el.classList.contains('hidden'))el.style.pointerEvents='none'});
    }
    root.querySelectorAll('button,a,input,select,textarea,[role="button"]').forEach(el=>{
      if(el.disabled||el.getAttribute('aria-disabled')==='true')return;
      el.style.pointerEvents='auto';
      el.style.touchAction='manipulation';
    });
  }
  function translateNode(el){
    if(!el||!ES)return;
    const tag=el.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'){
      const ph=el.getAttribute('placeholder');
      if(ph&&ES_PLACEHOLDERS[ph]){
        if(!ORIGINAL_PLACEHOLDER.has(el))ORIGINAL_PLACEHOLDER.set(el,ph);
        el.setAttribute('placeholder',ES_PLACEHOLDERS[ph]);
      }
      return;
    }
    if(!['H2','H3','H4','P','SMALL','LABEL','BUTTON','TH','OPTION','B','SPAN','A','DIV'].includes(tag))return;
    if(tag==='DIV'&&!el.matches('.notice,.command-empty'))return;
    if(el.children.length&& !el.matches('button,a,.notice'))return;
    const text=(el.textContent||'').trim();
    if(!text)return;
    if(!ORIGINAL_TEXT.has(el))ORIGINAL_TEXT.set(el,text);
    const source=ORIGINAL_TEXT.get(el);
    if(ES[source])el.textContent=ES[source];
    else if(source.startsWith('BCT Admin backend load failed:'))el.textContent='Falló la carga del backend de administración de BCT:'+source.slice('BCT Admin backend load failed:'.length);
    else if(source.startsWith('Launch controls refresh failed:'))el.textContent='Falló la actualización de los controles de lanzamiento:'+source.slice('Launch controls refresh failed:'.length);
    else if(source.startsWith('Operational readiness refresh failed:'))el.textContent='Falló la actualización de la preparación operativa:'+source.slice('Operational readiness refresh failed:'.length);
  }
  function applySpanish(){
    if(translating||language()!=='es')return;
    const root=adminRoot(); if(!root)return;
    translating=true;
    try{
      root.querySelectorAll('h2,h3,h4,p,small,label,button,th,option,b,span,a,.notice,.command-empty,input,textarea').forEach(translateNode);
      const tabs=root.querySelector('.portal-tabs'); if(tabs)tabs.setAttribute('aria-label','Páginas del panel de administración de BCT');
      filterCommands();
    }finally{translating=false}
  }
  function refresh(){stabilizeTouchSurface();applySpanish()}

  document.addEventListener('click',function(event){
    const root=adminRoot(); if(!root||!isAdminVisible())return;
    const tab=event.target?.closest?.('[data-admin-page-tab]');
    if(tab&&root.contains(tab)){
      event.preventDefault();
      showPage(tab.dataset.adminPageTab);
      requestAnimationFrame(refresh);
      return;
    }
    const jump=event.target?.closest?.('[data-admin-jump]');
    if(jump&&root.contains(jump)){
      event.preventDefault();
      jumpTo(jump.dataset.adminJump);
      requestAnimationFrame(refresh);
      return;
    }
    const close=event.target?.closest?.('#closeJobManagementBtn');
    if(close&&root.contains(close)){
      const panel=document.getElementById('jobManagementPanel');
      if(panel){event.preventDefault();panel.classList.add('hidden');panel.classList.remove('active')}
    }
  },true);
  document.addEventListener('input',function(event){if(event.target?.id==='bctCommandSearch')filterCommands()},true);
  document.addEventListener('change',function(event){
    if(event.target&&['bctLoginLanguage','bctLanguage'].includes(event.target.id))setTimeout(refresh,0);
  },true);
  window.addEventListener('pageshow',refresh);
  window.addEventListener('hashchange',refresh);
  new MutationObserver(()=>requestAnimationFrame(refresh)).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','lang','aria-hidden','inert']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
})();
