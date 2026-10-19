const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const fs = require('node:fs/promises');
const path = require('node:path');
const { hashPassword, verifyPassword } = require('../services/passwordService');
const { readConfig } = require('../config/runtime');
const password = 'test-only-password-42';
const cookieFrom = response => response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
const tokenFrom = html => { const match = html.match(/name="_csrf" value="([a-f0-9]{64})"/); assert.ok(match, 'CSRF token in form'); return match[1]; };
test('admin authentication, authorization, CSRF and uploads', async t => {
  const hash = await hashPassword(password);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword('wrong', hash), false);
  Object.assign(process.env, { MYSQLHOST: 'localhost', MYSQLDATABASE: 'demo', MYSQLUSER: 'demo',
    DEMO_MODE: 'true', MAIL_ENABLED: 'false', ADMIN_ENABLED: 'true', ADMIN_USERNAME: 'tester',
    ADMIN_PASSWORD_HASH: hash, SESSION_SECRET: 'test-only-session-secret-that-is-long-enough',
    TRUST_PROXY: 'false', COOKIE_SECURE: 'false', NODE_ENV: 'test' });
  const { Libro, Autor, Categoria, Editorial } = require('../models');
  const writes = [];
  const book = { idLibro: 1, titulo: 'Libro prueba', publicacion: new Date('2024-01-01'), portada: '/assets/images/book-placeholder.svg',
    autor: { autor: 'Demo' }, categoria: { categoria: 'Demo' }, editorial: { editorial: 'Demo' } };
  book.dataValues = { ...book };
  Libro.findAll = async () => [book]; Libro.findByPk = async () => book;
  for (const [Model, data] of [[Autor, { idAutor: 1, autor: 'Autor', correo: 'autor@example.invalid', cantidadLibros: 1 }],
    [Categoria, { idCategoria: 1, categoria: 'Demo', descripcion: 'Demo', cantidadLibros: 1 }],
    [Editorial, { idEditorial: 1, editorial: 'Demo', telefono: 0, pais: 'Demo', cantidadLibros: 1 }]]) {
    const record = { ...data, dataValues: data, toJSON: () => data };
    Model.findAll = async () => [record]; Model.findByPk = async () => record; Model.findOne = async () => record;
  }
  for (const Model of [Libro, Autor, Categoria, Editorial]) {
    Model.create = async value => { writes.push({ operation: 'create', value }); return value; };
    Model.update = async value => { writes.push({ operation: 'update', value }); return [1]; };
    Model.destroy = async () => { writes.push({ operation: 'delete' }); return 1; };
  }
  const app = require('../app');
  const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { app.locals.sessionStore.stopInterval(); await new Promise(resolve => server.close(resolve)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (url, cookie, fields) => fetch(base + url, { method: 'POST', redirect: 'manual',
    headers: { cookie, 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fields) });
  let response = await fetch(base + '/');
  let html = await response.text();
  assert.doesNotMatch(html, /href="\/edit-libros/);
  assert.doesNotMatch(html, /action="\/delete-libros/);
  for (const model of ['libros', 'autores', 'categorias', 'editoriales']) {
    for (const action of ['create', 'edit', 'delete']) {
      assert.equal((await post(`/${action}-${model}`, '', {})).status, 403);
    }
  }
  assert.equal(writes.length, 0);
  assert.equal((await fetch(base + '/create-libros', { redirect: 'manual' })).headers.get('location'), '/admin/login');
  response = await fetch(base + '/admin/login');
  const anonymousCookie = cookieFrom(response); const anonymousToken = tokenFrom(await response.text());
  assert.match(response.headers.get('set-cookie'), /HttpOnly/); assert.match(response.headers.get('set-cookie'), /SameSite=Strict/);
  assert.equal((await post('/admin/login', anonymousCookie, { username: 'tester', password })).status, 403);
  assert.equal((await post('/admin/login', anonymousCookie, { _csrf: 'é'.repeat(64), username: 'tester', password })).status, 403);
  assert.equal((await post('/admin/login', anonymousCookie, { _csrf: anonymousToken, username: 'tester', password: 'wrong' })).status, 401);
  response = await post('/admin/login', anonymousCookie, { _csrf: anonymousToken, username: 'tester', password });
  assert.equal(response.status, 302);
  const adminCookie = cookieFrom(response); assert.notEqual(adminCookie, anonymousCookie, 'rotate session ID');
  assert.equal((await post('/delete-libros', anonymousCookie, { _csrf: anonymousToken, libroId: '1' })).status, 403);
  for (const url of ['/libros-list', '/autores-list', '/categorias-list', '/editoriales-list', '/create-libros', '/create-autores', '/create-categorias', '/create-editoriales', '/edit-libros/1?edit=true']) {
    response = await fetch(base + url, { headers: { cookie: adminCookie } });
    assert.equal(response.status, 200, url); html = await response.text(); tokenFrom(html);
  }
  const adminToken = tokenFrom(html);
  assert.equal((await post('/delete-libros', adminCookie, { libroId: '1' })).status, 403);
  assert.equal((await post('/delete-libros', adminCookie, { _csrf: anonymousToken, libroId: '1' })).status, 403);
  assert.equal(writes.length, 0);
  for (const entity of ['autores', 'categorias', 'editoriales']) {
    for (const action of ['create', 'edit', 'delete']) {
      response = await post(`/${action}-${entity}`, adminCookie, { _csrf: adminToken, Name: 'Demo', Correo: 'test@example.invalid',
        Descripcion: 'Demo', Phone: '123', Country: 'Demo', autorId: '1', categoriaId: '1', editorialId: '1' });
      assert.equal(response.status, 302, `${action}-${entity}`);
    }
  }
  const uploadDirectory = path.join(__dirname, '..', 'uploads');
  const before = await fs.readdir(uploadDirectory);
  const cover = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==', 'base64');
  const form = token => {
    const data = new FormData();
    data.set('titulo', 'Libro con imagen'); data.set('publicacion', '2024-01-01');
    data.set('libroCategoriaId', '1'); data.set('libroAutorId', '1'); data.set('libroEditorialId', '1');
    if (token) data.set('_csrf', token);
    data.set('portada', new Blob([cover], { type: 'image/png' }), 'demo.png');
    return data;
  };
  response = await fetch(base + '/create-libros', { method: 'POST', headers: { cookie: adminCookie }, body: form(), redirect: 'manual' });
  assert.equal(response.status, 403); assert.deepEqual(await fs.readdir(uploadDirectory), before, 'CSRF rejection writes no files');
  const forged = form(adminToken); forged.set('portada', new Blob(['not an image'], { type: 'image/png' }), 'fake.png');
  response = await fetch(base + '/create-libros', { method: 'POST', headers: { cookie: adminCookie }, body: forged, redirect: 'manual' });
  assert.equal(response.status, 400); assert.deepEqual(await fs.readdir(uploadDirectory), before);
  response = await fetch(base + '/create-libros', { method: 'POST', headers: { cookie: adminCookie }, body: form(adminToken), redirect: 'manual' });
  assert.equal(response.status, 302);
  const filename = writes.at(-1).value.portada.split('/').at(-1);
  t.after(() => fs.unlink(path.join(uploadDirectory, filename)).catch(() => {}));
  assert.match(filename, /\.png$/); assert.deepEqual(await fs.readFile(path.join(uploadDirectory, filename)), cover);
  response = await post('/edit-libros', adminCookie, { _csrf: adminToken, libroId: '1', titulo: 'Editado', publicacion: '2024-01-01', libroCategoriaId: '1', libroAutorId: '1', libroEditorialId: '1' });
  assert.equal(response.status, 302); assert.equal(writes.at(-1).value.portada, book.portada);
  assert.equal((await post('/delete-libros', adminCookie, { _csrf: adminToken, libroId: '1' })).status, 302);
  assert.equal((await post('/admin/logout', adminCookie, {})).status, 403);
  assert.equal((await post('/admin/logout', adminCookie, { _csrf: adminToken })).status, 302);
  assert.equal((await post('/delete-libros', adminCookie, { _csrf: adminToken, libroId: '1' })).status, 403);
  response = await fetch(base + '/admin/login');
  const cookie = cookieFrom(response); const token = tokenFrom(await response.text());
  for (let i = 0; i < 3; i++) assert.equal((await post('/admin/login', cookie, { _csrf: token, username: 'tester', password: 'wrong' })).status, 401);
  assert.equal((await post('/admin/login', cookie, { _csrf: token, username: 'tester', password: 'wrong' })).status, 429);
  // Verify TLS/proxy settings with the same application code, using another isolated server.
  const config = require('../config'); config.admin.cookieSecure = true; config.trustProxy = true;
  delete require.cache[require.resolve('../app')]; const secureApp = require('../app');
  const secureServer = secureApp.listen(0, '127.0.0.1'); await once(secureServer, 'listening');
  t.after(async () => { secureApp.locals.sessionStore.stopInterval(); await new Promise(resolve => secureServer.close(resolve)); });
  const secureBase = `http://127.0.0.1:${secureServer.address().port}`;
  assert.equal((await fetch(secureBase + '/admin/login')).status, 400);
  response = await fetch(secureBase + '/admin/login', { headers: { 'x-forwarded-proto': 'https' } });
  assert.equal(response.status, 200); assert.match(response.headers.get('set-cookie'), /; Secure/);
});
test('production config refuses anonymous writes and incomplete admin credentials', () => {
  const base = { MYSQLHOST: 'localhost', MYSQLDATABASE: 'demo', MYSQLUSER: 'demo' };
  assert.throws(() => readConfig({ ...base, ADMIN_ENABLED: 'true' }), /ADMIN_USERNAME/);
  assert.throws(() => readConfig({ ...base, NODE_ENV: 'production', DEMO_MODE: 'false' }), /ADMIN_ENABLED/);
});
