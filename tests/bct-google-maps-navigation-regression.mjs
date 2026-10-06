import assert from 'node:assert/strict';
import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

assert.match(html,/function bctGoogleMapsAddress\(/);
assert.match(html,/function bctIsAssignedContractorJob\(/);
assert.match(html,/function bctGoogleMapsUrl\(/);
assert.match(html,/https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/);
assert.match(html,/class="btn secondary bct-google-directions"/);
assert.match(html,/bctIsAssignedContractorJob\(j\)/);\nassert.match(html,/assigned_locations/);\nassert.match(html,/bctGoogleMapsAddress\(c\)/);\nassert.match(html,/Assigned BCT Jobs/);
assert.match(html,/assigned&&mapsAddress/);
assert.doesNotMatch(html,/window\.location\s*=\s*bctGoogleMapsUrl/);
assert.doesNotMatch(html,/bctGoogleMapsAddress\s*=\s*['"]/);

console.log('BCT Google Maps contractor navigation regression checks passed');
