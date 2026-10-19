const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
Object.assign(process.env, { MYSQLHOST: 'localhost', MYSQLDATABASE: 'demo', MYSQLUSER: 'demo', DEMO_MODE: 'true', MAIL_ENABLED: 'false' });
const { Libro } = require('../models');
let filters;
// HTTP integration with an isolated data stub; no external DB or SMTP is used.
Libro.findAll = async options => {
  filters = options.where;
  return [{ idLibro: 1, titulo: 'Libro de prueba', publicacion: new Date('2024-01-01'),
    portada: '/assets/images/book-placeholder.svg', autor: { autor: 'Autor Demo' },
    categoria: { categoria: 'Demo' }, editorial: { editorial: 'Editorial Demo' } }];
};
const app = require('../app');
test('catalog, search, local assets and read-only routes over HTTP', async t => {
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  let response = await fetch(base + '/');
  assert.equal(response.status, 200);
  let html = await response.text();
  assert.match(html, /Libro de prueba/); assert.match(html, /Demo de solo lectura/);
  response = await fetch(base + '/?search=prueba'); assert.equal(response.status, 200);
  assert.equal(Reflect.ownKeys(filters.titulo).length, 1);
  assert.equal(filters.titulo[Reflect.ownKeys(filters.titulo)[0]], '%prueba%');
  for (const path of ['/assets/images/book-placeholder.svg', '/assets/css/bootstrap/bootstrap.min.css', '/assets/js/bootstrap/bootstrap.bundle.min.js']) {
    assert.equal((await fetch(base + path)).status, 200, path);
  }
  for (const route of ['create-libros','edit-libros','delete-libros','create-autores','delete-categorias','create-editoriales']) {
    response = await fetch(base + '/' + route, { method: 'POST', body: 'titulo=NoGuardar', headers: { 'content-type': 'application/x-www-form-urlencoded' } });
    assert.equal(response.status, 403, route);
  }
  response = await fetch(base + '/healthz'); assert.deepEqual(await response.json(), { status: 'ok', demo: true });
  assert.equal((await fetch(base + '/does-not-exist')).status, 404);
});
test('disabled mail never attempts delivery', async () => {
  const { notifyNewBook } = require('../services/mailService');
  assert.deepEqual(await notifyNewBook({ to: 'nobody@example.invalid' }), { skipped: true });
});
