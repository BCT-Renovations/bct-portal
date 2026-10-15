// Preserve control identity/action safety across harmless class/attribute ordering changes.
export function controlTag(html,needle){
 const expected=needle.match(/^<(\w+)\b/);if(!expected)throw Error('Invalid control specification');
 const id=needle.match(/\bid="([^"]+)"/),entry=needle.match(/\bdata-entry-native="([^"]+)"/);
 let tag;
 if(id||entry){
  const attr=id?'id':'data-entry-login',value=(id||entry)[1];
  tag=(html.match(/<(?:button|a|input|select|textarea|form)\b[^>]*>/g)||[]).find(t=>t.includes(`${attr}="${value}"`));
 }else tag=html.includes(needle)?needle:null;
 if(!tag)throw Error('Control missing');
 const actual=tag.match(/^<(\w+)\b/)[1],expectedType=needle.match(/\btype="([^"]+)"/);
 if(actual!==(entry?'button':expected[1]))throw Error('Control kind changed');
 if(expectedType&&!tag.includes(`type="${expectedType[1]}"`))throw Error('Control action type changed');
 return tag;
}
export function assertSafeControl(tag){
 const decoded=tag.replace(/&#(?:x([\da-f]+)|(\d+));?/gi,(_m,hex,dec)=>String.fromCodePoint(parseInt(hex||dec,hex?16:10))).replace(/&colon;/gi,':');
 if(/\b(?:href|src|formaction|action)\s*=\s*["']?\s*(?:javascript|vbscript)\s*:/i.test(decoded))throw Error('Unsafe control URL');
}
