const test = require('node:test');
const assert = require('node:assert/strict');
const { readConfig } = require('../config/runtime');
const base = { MYSQLHOST: 'localhost', MYSQLDATABASE: 'demo', MYSQLUSER: 'demo' };
test('public defaults are read-only and cannot send mail', () => {
  const config = readConfig({ ...base, MAIL_ENABLED: 'true' });
  assert.equal(config.demoMode, true);
  assert.equal(config.mailEnabled, false);
});
test('provider IP and PORT override local defaults', () => {
  const config = readConfig({ ...base, IP: '::', HOST: 'localhost', PORT: '8100' });
  assert.equal(config.host, '::'); assert.equal(config.port, 8100);
});
test('invalid ports and boolean typos fail early', () => {
  for (const value of ['0', '65536', 'NaN', '2.5']) assert.throws(() => readConfig({ ...base, PORT: value }), /puerto/);
  assert.throws(() => readConfig({ ...base, DEMO_MODE: 'FALSE' }), /true o false/);
});
test('missing config reports variable names, not supplied secrets', () => {
  assert.throws(() => readConfig({ MYSQLPASSWORD: 'do-not-print' }), err => {
    assert.match(err.message, /MYSQLDATABASE/); assert.doesNotMatch(err.message, /do-not-print/); return true;
  });
});
test('mail requires explicit opt-in and complete credentials outside demo', () => {
  assert.throws(() => readConfig({ ...base, DEMO_MODE: 'false', MAIL_ENABLED: 'true' }), /SMTP_HOST/);
  assert.equal(readConfig({ ...base, DEMO_MODE: 'false' }).mailEnabled, false);
});
