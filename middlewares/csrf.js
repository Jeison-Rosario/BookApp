const { randomBytes, timingSafeEqual } = require('crypto');
const config = require('../config');
const safe = new Set(['GET', 'HEAD', 'OPTIONS']);
function csrfToken(req) {
  if (!req.session.csrf) req.session.csrf = randomBytes(32).toString('hex');
  return req.session.csrf;
}
function csrfProtection(req, res, next) {
  if (!config.admin.enabled || safe.has(req.method)) return next();
  const token = req.body?._csrf;
  const expected = req.session?.csrf;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) || typeof expected !== 'string' || token.length !== expected.length
      || !timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
    return res.status(403).send('El formulario ha caducado o no es válido. Recarga la página y vuelve a intentarlo.');
  }
  next();
}
module.exports = { csrfToken, csrfProtection };
