export const BCT_LANGUAGES=Object.freeze({
  ar:Object.freeze({name:"Arabic",nativeName:"العربية",direction:"rtl"}),
  en:Object.freeze({name:"English",nativeName:"English",direction:"ltr"}),
  es:Object.freeze({name:"Spanish",nativeName:"Español",direction:"ltr"}),
  fr:Object.freeze({name:"French",nativeName:"Français",direction:"ltr"}),
  ht:Object.freeze({name:"Haitian Creole",nativeName:"Kreyòl Ayisyen",direction:"ltr"}),
  pt:Object.freeze({name:"Portuguese",nativeName:"Português",direction:"ltr"}),
  ru:Object.freeze({name:"Russian",nativeName:"Русский",direction:"ltr"}),
  vi:Object.freeze({name:"Vietnamese",nativeName:"Tiếng Việt",direction:"ltr"}),
  zh:Object.freeze({name:"Chinese",nativeName:"中文",direction:"ltr"}),
});
export function normalizeBctLanguage(code){
  const normalized=typeof code==="string"?code.trim().toLowerCase():"en";
  return Object.hasOwn(BCT_LANGUAGES,normalized)?normalized:"en";
}
export function languageMeta(code){
  const normalized=normalizeBctLanguage(code);
  return {code:normalized,...BCT_LANGUAGES[normalized]};
}
