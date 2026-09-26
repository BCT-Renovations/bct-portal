const CACHE_NAME='bct-portal-shell-v3-admin-login-hotfix';
const APP_SHELL=['/','/index.html','/manifest.webmanifest'];
const ADMIN_LOGIN_HOTFIX=`
<script id="bct-admin-login-hotfix">
(()=>{
  const SUPABASE_URL='https://onpqykpikxbbypfvmtin.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JToQ3bPaJql-xHq-iyM0bg_Fweenyfh';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const status=(html,kind='notice')=>{const el=$('adminAuthStatus');if(el)el.innerHTML='<div class="'+kind+'">'+html+'</div>';};
  const friendly=e=>{const msg=String(e?.message||e||'Unknown authentication error');if(/invalid login credentials/i.test(msg))return 'The email or password did not match a BCT admin account.';if(/email not confirmed/i.test(msg))return 'This email is not confirmed yet. Use Forgot Password or resend confirmation, then check inbox and spam.';if(/failed to fetch|network|load failed/i.test(msg))return 'The browser could not reach the BCT login server. Check connection and try again.';return msg;};
  const showView=id=>{document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));$(id)?.classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});};
  const getClient=()=>{
    if(window.supabaseClient)return window.supabaseClient;
    if(window.supabase?.createClient)return window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY);
    throw new Error('BCT login library did not load. Refresh the page and try again.');
  };
  async function hotfixAdminLogin(ev){
    const btn=ev?.target?.closest?.('#adminLoginBtn');
    if(!btn)return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    const old=btn.textContent;
    try{
      btn.disabled=true;btn.textContent='Signing in...';
      const email=$('adminEmail')?.value?.trim()||'';
      const password=$('adminPassword')?.value||'';
      if(!email||!password)throw new Error('Enter your BCT admin email and password.');
      status('<b>Checking BCT admin login...</b>','notice backend-live');
      const client=getClient();
      const {data,error}=await client.auth.signInWithPassword({email,password});
      if(error)throw error;
      const user=data?.user||(await client.auth.getUser()).data?.user;
      const role=user?.app_metadata?.role||user?.user_metadata?.role||user?.role||'';
      if(role!=='admin'){
        await client.auth.signOut({scope:'local'}).catch(()=>{});
        throw new Error('This account signed in, but it is not marked as a BCT admin yet. Add the admin role in Supabase, then try again.');
      }
      if($('adminSessionEmail'))$('adminSessionEmail').textContent=email;
      status('<b>✓ BCT Admin authenticated.</b> Opening the dashboard...','notice backend-live');
      showView('view-admin');
      if(typeof window.loadAdminState==='function')await window.loadAdminState();
    }catch(e){
      status('<b>Sign-in failed:</b> '+esc(friendly(e)));
    }finally{
      btn.disabled=false;btn.textContent=old||'Sign In to BCT Admin';
    }
  }
  document.addEventListener('click',hotfixAdminLogin,true);
  document.addEventListener('DOMContentLoaded',()=>{
    const pwd=$('adminPassword');
    if(pwd&&!pwd.dataset.bctEnterHotfix){pwd.dataset.bctEnterHotfix='true';pwd.addEventListener('keydown',e=>{if(e.key==='Enter'){$('adminLoginBtn')?.click();}})}
    const show=$('adminShowPassword');
    if(show&&!show.dataset.bctShowHotfix){show.dataset.bctShowHotfix='true';show.addEventListener('change',()=>{const p=$('adminPassword');if(p)p.type=show.checked?'text':'password';});}
    const forgot=$('adminForgotBtn');
    if(forgot&&!forgot.dataset.bctForgotHotfix){forgot.dataset.bctForgotHotfix='true';forgot.addEventListener('click',()=>{if(typeof requestPasswordReset==='function')requestPasswordReset();else showView('view-password-request');});}
  });
})();
</script>`;
function injectAdminLoginHotfix(html){
  if(typeof html!=='string'||html.includes('bct-admin-login-hotfix'))return html;
  return html.replace('</body>',ADMIN_LOGIN_HOTFIX+'\n</body>');
}
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('bct-portal-shell-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))),
  self.clients.claim()
])));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  if(!APP_SHELL.includes(url.pathname)||url.search)return;
  event.respondWith(fetch(event.request).then(async response=>{
    if(!response.ok||response.type!=='basic')return response;
    const contentType=response.headers.get('content-type')||'';
    if(contentType.includes('text/html')){
      const html=injectAdminLoginHotfix(await response.text());
      const patched=new Response(html,{status:response.status,statusText:response.statusText,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
      const cacheCopy=patched.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(event.request,cacheCopy)));
      return patched;
    }
    const copy=response.clone();
    event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy)));
    return response;
  }).catch(()=>caches.match(event.request).then(async cached=>{
    if(!cached)return cached;
    const contentType=cached.headers.get('content-type')||'';
    if(contentType.includes('text/html'))return new Response(injectAdminLoginHotfix(await cached.text()),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
    return cached;
  })));
});
