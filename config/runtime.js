function readConfig(env = process.env) {
  const bool = (key, fallback) => {
    if (env[key] === undefined || env[key] === '') return fallback;
    if (!['true', 'false'].includes(env[key])) throw new Error(`${key} debe ser true o false`);
    return env[key] === 'true';
  };
  const integer = (key, fallback) => {
    const value = Number(env[key] || fallback);
    if (!Number.isInteger(value) || value < 1 || value > 65535) throw new Error(`${key} debe ser un puerto válido`);
    return value;
  };
  const demoMode = bool('DEMO_MODE', true);
  const mailEnabled = bool('MAIL_ENABLED', false) && !demoMode;
  const adminEnabled = bool('ADMIN_ENABLED', false);
  const required = ['MYSQLDATABASE', 'MYSQLUSER', 'MYSQLHOST'];
  if (mailEnabled) required.push('SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'MAIL_FROM');
  if (adminEnabled) required.push('ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH', 'SESSION_SECRET');
  const missing = required.filter(key => !env[key]?.trim());
  if (missing.length) throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
  if (adminEnabled && !/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(env.ADMIN_PASSWORD_HASH)) throw new Error('ADMIN_PASSWORD_HASH no tiene un formato válido');
  if (adminEnabled && env.SESSION_SECRET.length < 32) throw new Error('SESSION_SECRET requiere al menos 32 caracteres');
  if (!demoMode && !adminEnabled && env.NODE_ENV === 'production') throw new Error('La escritura pública requiere ADMIN_ENABLED=true');
  return {
    admin: { enabled: adminEnabled, username: env.ADMIN_USERNAME, passwordHash: env.ADMIN_PASSWORD_HASH,
      secret: env.SESSION_SECRET, cookieSecure: bool('COOKIE_SECURE', env.NODE_ENV === 'production') },
    trustProxy: bool('TRUST_PROXY', false),
    demoMode, mailEnabled,
    host: env.IP || env.HOST || '127.0.0.1',
    port: integer('PORT', 3000),
    db: { database: env.MYSQLDATABASE, username: env.MYSQLUSER,
      password: env.MYSQLPASSWORD || '', host: env.MYSQLHOST, port: integer('MYSQLPORT', 3306) },
    smtp: { host: env.SMTP_HOST, port: integer('SMTP_PORT', 587),
      secure: bool('SMTP_SECURE', false), user: env.SMTP_USER,
      password: env.SMTP_PASSWORD, from: env.MAIL_FROM }
  };
}
module.exports = { readConfig };
