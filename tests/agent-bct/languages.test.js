import test from "node:test";
import assert from "node:assert/strict";
import { BCT_LANGUAGES,normalizeBctLanguage,languageMeta,supportedBctLanguageCodes,isBctLanguageSupported } from "../../api/agent-bct/_languages.js";

test("Agent BCT reuses exactly the nine active BCT language codes",()=>{
  assert.deepEqual(Object.keys(BCT_LANGUAGES).sort(),["ar","en","es","fr","ht","pt","ru","vi","zh"]);
});
test("unknown language falls back safely to English",()=>{
  assert.equal(normalizeBctLanguage("xx"),"en");
  assert.equal(languageMeta("ar").direction,"rtl");
});

test("canonical language helpers stay aligned with BCT language map",()=>{
  assert.deepEqual(supportedBctLanguageCodes().sort(),Object.keys(BCT_LANGUAGES).sort());
  assert.equal(isBctLanguageSupported(" ES "),true);
  assert.equal(isBctLanguageSupported("en-US"),false);
  assert.equal(isBctLanguageSupported(null),false);
});
test("Arabic is RTL while other active BCT languages are LTR",()=>{
  for(const [code,meta] of Object.entries(BCT_LANGUAGES))assert.equal(meta.direction,code==="ar"?"rtl":"ltr");
});
