const { randomBytes, scrypt, timingSafeEqual } = require('crypto');
const { promisify } = require('util');
const derive = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt, 64);
  return `scrypt$${salt}$${key.toString('hex')}`;
}
async function verifyPassword(password, hash) {
  if (typeof password !== 'string' || password.length > 256 || !/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(hash || '')) return false;
  const [, salt, key] = hash.split('$');
  const derived = await derive(password, salt, 64);
  return timingSafeEqual(derived, Buffer.from(key, 'hex'));
}
module.exports = { hashPassword, verifyPassword };
