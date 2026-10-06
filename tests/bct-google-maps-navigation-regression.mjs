import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(html,/function bctGoogleMapsAddress\(/);
assert.match(html,/function bctGoogleMapsUrl\(/);
assert.match(html,/https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/);
assert.match(html,/class="btn secondary bct-google-directions"/);
assert.match(html,/assigned_locations/);
assert.match(html,/bctGoogleMapsAddress\(c\)/);
assert.match(html,/Assigned BCT Jobs/);
assert.doesNotMatch(html,/window\.location\s*=\s*bctGoogleMapsUrl/);
assert.doesNotMatch(html,/bctGoogleMapsAddress\s*=\s*['"]/);
assert.doesNotMatch(html,/availableHtml=[\s\S]*bct-google-directions/);
assert.doesNotMatch(html,/availableHtml=[\s\S]*Get Directions/);
assert.match(html,/const renderAssigned=c=>\{const address=bctGoogleMapsAddress\(c\),mapsButton=address\?/);
assert.match(html,/const assigned=Array\.isArray\(contractorState\?\.assigned_locations\)/);

console.log('BCT Google Maps contractor navigation regression checks passed');
