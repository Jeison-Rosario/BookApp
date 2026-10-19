const fs = require('fs/promises');
const path = require('path');
const readline = require('readline');
const { Writable } = require('stream');
const { randomBytes } = require('crypto');
const { hashPassword } = require('../services/passwordService');
async function main() {
  if (!process.stdin.isTTY) throw new Error('Ejecuta este comando desde una terminal SSH interactiva.');
  let muted = false;
  const output = new Writable({ write(chunk, encoding, callback) { if (!muted) process.stdout.write(chunk); callback(); } });
  const rl = readline.createInterface({ input: process.stdin, output, terminal: true });
  const ask = question => new Promise(resolve => rl.question(question, resolve));
  let username, password, confirmation;
  try {
    username = (await ask('Usuario administrador: ')).trim();
    if (!/^[a-zA-Z0-9_.-]{3,60}$/.test(username)) throw new Error('Usa de 3 a 60 letras, números, puntos, guiones o guiones bajos.');
    process.stdout.write('Contraseña (mínimo 12 caracteres, no se mostrará): '); muted = true;
    password = await ask('');
    muted = false; process.stdout.write('\nRepite la contraseña: '); muted = true;
    confirmation = await ask(''); muted = false; process.stdout.write('\n');
  } finally { muted = false; rl.close(); }
  if (password.length < 12 || password.length > 256 || password !== confirmation) throw new Error('Las contraseñas deben coincidir y tener entre 12 y 256 caracteres.');
  const file = path.join(__dirname, '..', '.env');
  let content = '';
  try { content = await fs.readFile(file, 'utf8'); } catch (err) { if (err.code !== 'ENOENT') throw err; }
  const values = { ADMIN_ENABLED: 'true', ADMIN_USERNAME: username,
    ADMIN_PASSWORD_HASH: await hashPassword(password), SESSION_SECRET: randomBytes(48).toString('hex'),
    TRUST_PROXY: 'true', COOKIE_SECURE: 'true', DEMO_MODE: 'true', MAIL_ENABLED: 'false' };
  content = content.split('\n').filter(line => !Object.keys(values).some(key => new RegExp(`^\\s*${key}\\s*=`).test(line))).join('\n').trimEnd();
  content += '\n' + Object.entries(values).map(([key, value]) => `${key}=${value}`).join('\n') + '\n';
  const temporary = `${file}.admin-setup-${process.pid}.tmp`;
  try {
    await fs.writeFile(temporary, content, { mode: 0o600, flag: 'wx' });
    await fs.rename(temporary, file);
  } finally { await fs.unlink(temporary).catch(() => {}); }
  console.log('Administrador configurado en .env. Reinicia el sitio y entra por HTTPS a /admin/login.');
  console.log('Se conservó la configuración MySQL. El correo permanece desactivado.');
}
main().catch(() => { console.error('No se pudo configurar el administrador. Comprueba usuario, contraseñas y permisos del archivo .env.'); process.exitCode = 1; });
