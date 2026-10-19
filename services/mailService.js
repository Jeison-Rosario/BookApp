const nodemailer = require('nodemailer');
const config = require('../config');
let transport;
async function notifyNewBook({ to, author, title, published, category, publisher }) {
  if (!config.mailEnabled) return { skipped: true };
  if (!transport) transport = nodemailer.createTransport({
    host: config.smtp.host, port: config.smtp.port, secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.password },
    connectionTimeout: 5000, greetingTimeout: 5000, socketTimeout: 10000
  });
  await transport.sendMail({
    from: config.smtp.from, to, subject: 'Nuevo libro publicado',
    text: `Hola ${author}:\nSe ha registrado: ${title}.\nPublicación: ${published}\nCategoría: ${category}\nEditorial: ${publisher}`
  });
  return { skipped: false };
}
module.exports = { notifyNewBook };
