import test from "node:test";
import assert from "node:assert/strict";
import { BCT_LANGUAGES,normalizeBctLanguage,languageMeta } from "../../api/agent-bct/_languages.js";

test("Agent BCT reuses exactly the nine active BCT language codes",()=>{
  assert.deepEqual(Object.keys(BCT_LANGUAGES).sort(),["ar","en","es","fr","ht","pt","ru","vi","zh"]);
});
test("unknown language falls back safely to English",()=>{
  assert.equal(normalizeBctLanguage("xx"),"en");
  assert.equal(languageMeta("ar").direction,"rtl");
});
