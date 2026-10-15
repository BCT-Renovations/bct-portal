import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const between=(a,b)=>{const start=html.indexOf(a);assert.ok(start>=0,'missing '+a);const end=html.indexOf(b,start+a.length);assert.ok(end>start,'missing '+b);return html.slice(start,end);};
const staticPass=between('function applyStaticLanguage(language){','const BCT_FILE_UI=');
const commonPass=between('function applyCommonPortalLanguage(language){','let BCT_LANGUAGE_REQUEST_ID=0;');
const languagePass=between('async function applyBctLanguage(languageCode){','function bctText(key){');
const checks=[
 ['Takai uses one persistent language key',html.includes("const BCT_LANGUAGE_KEY='bctPreferredLanguage'")],
 ['Static translation uses shared dictionaries',staticPass.includes('BCT_COMMON_UI_TRANSLATIONS[language]') && staticPass.includes('BCT_EXTENDED_UI_TRANSLATIONS[language]')],
 ['Static translation excludes translated descendants',staticPass.includes("parent.closest('[data-i18n],script,style,template,option")],
 ['Static translation skips scripts and styles',staticPass.includes("parent.closest('[data-i18n],script,style,template,option")],
 ['Common translation avoids nested controls',commonPass.includes('if(el.children.length')],
 ['Common translation avoids translated descendants',commonPass.includes("el.closest('[data-i18n]')")],
 ['Common translation does not rewrite all portal buttons',!commonPass.includes("document.querySelectorAll('button,label,h2")],
 ['Language switching guards against stale async updates',languagePass.includes('requestId!==BCT_LANGUAGE_REQUEST_ID')],
 ['Language switching covers placeholders',languagePass.includes("data-i18n-placeholder")],
 ['Language switching handles Arabic direction',languagePass.includes("language==='ar'?'rtl':'ltr'")],
 ['Language switching includes static translation',languagePass.includes('applyStaticLanguage(language)')],
 ['Language switching includes common controls',languagePass.includes('applyCommonPortalLanguage(language)')],
 ['Original text nodes retained for language switching',staticPass.includes('BCT_ORIGINAL_TEXT_NODE.get(t)')],
 ['Dropdown options translated without changing values',staticPass.includes("main select option") && !staticPass.includes('option.value=')],
 ['Dynamic controls observed',languagePass.includes('MutationObserver(records=>')],
 ['Dynamic translations do not repeat remote fetches',!between('function scheduleBctDynamicTranslation(){','function installBctDynamicTranslationObserver(){').includes('fetchBctTranslation(')],
 ['Dynamic placeholders translated',languagePass.includes("document.querySelectorAll('[data-i18n-placeholder]').forEach")],
 ['Unchanged option labels are not rewritten',staticPass.includes('if(option.textContent!==translated)')],
 ['Unchanged placeholder attributes are not rewritten',staticPass.includes("if(el.getAttribute('placeholder')!==translated)")],
 ['Unchanged portal text nodes are not rewritten',staticPass.includes('if(t.nodeValue!==nextValue)')],
 ['Dynamic translation requires a mounted document body',languagePass.includes('if(!document.body) return;')],
];
for(const [name,ok] of checks){console.log((ok?'PASS':'FAIL')+' '+name);}
assert.ok(checks.every(([,ok])=>ok),'Translation source regression failed');
console.log(checks.length+' source-level checks passed. Browser behavior and language completeness require separate tests.');
