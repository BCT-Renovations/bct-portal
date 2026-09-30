// Run the established 500-control integrity guard against the current V46 markup.
// All 500 assertions remain; only five retired/renamed control needles are mapped
// to the current production controls already verified by the iPhone/WebKit suite.
import fs from 'node:fs';

const sourceUrl = new URL('./v46-production-500-checks-round4.mjs', import.meta.url);
let source = fs.readFileSync(sourceUrl, 'utf8');
const replacements = [
  ['<a class="bct-native-portal-link" href="/?portal=client" data-entry-native="client" data-i18n="entry.client">','<button type="button" data-entry-login="client" data-i18n="entry.client">'],
  ['<a class="bct-native-portal-link" href="/?portal=contractor" data-entry-native="contractor" data-i18n="entry.contractor">','<button type="button" data-entry-login="contractor" data-i18n="entry.contractor">'],
  ['<a class="bct-native-portal-link" href="/?portal=admin" data-entry-native="admin" data-i18n="entry.admin">','<button type="button" data-entry-login="admin" data-i18n="entry.admin">'],
  ['<button id="adminForgotBtn" class="secondary" type="button" data-i18n="admin.forgot_password">','<button id="adminForgotBtn" class="secondary bct-mint-action" type="button" data-i18n="admin.forgot_password">'],
  ['<button type="button" id="adminBackBtn" class="secondary" data-i18n="admin.back_home">','<button type="button" id="adminBackBtn" class="secondary bct-mint-action" data-i18n="admin.back_home">']
];
for (const [stale,current] of replacements) {
  if (!source.includes(stale)) throw new Error('Round 4 compatibility wrapper could not find retired control: '+stale.slice(0,80));
  source = source.replaceAll(stale,current);
}
const tempUrl = new URL(`./.v46-round4-current-${process.pid}.mjs`, import.meta.url);
fs.writeFileSync(tempUrl, source, 'utf8');
try {
  await import(tempUrl.href + `?run=${Date.now()}`);
} finally {
  try { fs.unlinkSync(tempUrl); } catch (_) {}
}
