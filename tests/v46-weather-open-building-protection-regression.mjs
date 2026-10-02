import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002146000_v46_weather_open_building_protection.sql','utf8');
for(const x of ['bct_admin_set_weather_protection','bct_refresh_weather_protection_attention','open_building_exposure','protection_required','protection_confirmed_at','weather_open_building_protection','bct_weather_checks','bct_action_inbox'])assert.ok(sql.includes(x),'weather protection coverage missing '+x);
assert.ok(sql.includes('public.is_bct_admin()'),'weather protection Admin guard missing');
assert.ok(sql.includes('security definer set search_path=public,auth,pg_temp'),'weather protection hardened search path missing');
assert.ok(sql.toLowerCase().includes("protection-required weather check must identify open-building exposure"),'weather exposure consistency guard missing');
console.log('V46 weather/open-building protection regression checks passed');