const express = require('express');
const config = require('../config');
const { verifyPassword } = require('../services/passwordService');
const { csrfToken, csrfProtection } = require('../middlewares/csrf');
const router = express.Router();
// Cotas pequeñas para una demo de un solo administrador: memoria y coste de hash acotados.
const attempts = new Map();
let activeHashes = 0;
let windowStart = Date.now();
let globalAttempts = 0;
function limitLogin(req, res, next) {
  const now = Date.now();
  if (now - windowStart > 60000) { windowStart = now; globalAttempts = 0; }
  for (const [ip, value] of attempts) if (value.until <= now) attempts.delete(ip);
  const ip = req.ip;
  const value = attempts.get(ip) || { count: 0, until: now + 15 * 60000 };
  if (value.count >= 5 || globalAttempts >= 10 || activeHashes >= 1) {
    res.set('Retry-After', '900');
    return res.status(429).send('Demasiados intentos. Espera 15 minutos antes de volver a intentar.');
  }
  if (!attempts.has(ip) && attempts.size >= 500) attempts.delete(attempts.keys().next().value);
  value.count++; globalAttempts++; attempts.set(ip, value);
  next();
}
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!config.admin.enabled) return res.status(404).send('Acceso de administrador desactivado.');
  if (config.admin.cookieSecure && !req.secure) return res.status(400).send('Abre el acceso de administrador mediante HTTPS.');
  next();
});
router.get('/login', (req, res) => {
  if (req.session.isAdmin) return res.redirect('/');
  res.render('admin/login', { pageTitle: 'Acceso de administrador', csrfToken: csrfToken(req), adminEnabled: true });
});
router.post('/login', csrfProtection, limitLogin, async (req, res, next) => {
  try {
    activeHashes++;
    const validPassword = await verifyPassword(req.body.password, config.admin.passwordHash);
    if (req.body.username !== config.admin.username || !validPassword) {
      return res.status(401).render('admin/login', { pageTitle: 'Acceso de administrador',
        csrfToken: csrfToken(req), adminEnabled: true, error: 'Usuario o contraseña incorrectos.' });
    }
    req.session.regenerate(err => {
      if (err) return next(err);
      req.session.isAdmin = true;
      req.session.csrf = require('crypto').randomBytes(32).toString('hex');
      req.session.save(error => error ? next(error) : res.redirect('/'));
    });
  } catch (error) { next(error); }
  finally { activeHashes--; }
});
router.post('/logout', csrfProtection, (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie('bookapp.sid', { path: '/', httpOnly: true, sameSite: 'strict', secure: config.admin.cookieSecure });
    res.redirect('/');
  });
});
module.exports = router;
