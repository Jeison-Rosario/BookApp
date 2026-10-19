const test = require('node:test');
const assert = require('node:assert/strict');
Object.assign(process.env, { MYSQLHOST: 'localhost', MYSQLDATABASE: 'demo', MYSQLUSER: 'demo', DEMO_MODE: 'false', MAIL_ENABLED: 'false' });
const Libro = require('../models/libro');
const controller = require('../controllers/librosController');
test('editing without an upload preserves the existing cover', async () => {
  let payload;
  Libro.findByPk = async () => ({ portada: '/uploads/previous.png' });
  Libro.update = async fields => { payload = fields; return [1]; };
  await new Promise((resolve, reject) => controller.PostEditLibros({ headers: {}, body: {
    libroId: '1', titulo: 'Nuevo título', publicacion: '2024-01-01', libroCategoriaId: '1', libroAutorId: '1', libroEditorialId: '1'
  } }, { redirect: resolve }, reject));
  assert.equal(payload.portada, '/uploads/previous.png');
  assert.equal(payload.titulo, 'Nuevo título');
});
test('editing a missing book returns 404 without updating', async () => {
  Libro.findByPk = async () => null;
  Libro.update = async () => assert.fail('unexpected update');
  await new Promise((resolve, reject) => controller.PostEditLibros({ headers: {}, body: { libroId: '999' } }, {
    status(code) { assert.equal(code, 404); return this; }, send: resolve
  }, reject));
});
