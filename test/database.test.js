const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
// Run only against a dedicated empty test database initialized by CI.
test('MySQL seed is complete and refuses to overwrite existing records', { skip: process.env.RUN_MYSQL_TESTS !== 'true' }, async t => {
  const connection = require('../context/appContext');
  const { Libro, Autor, Categoria, Editorial } = require('../models');
  t.after(() => connection.close());
  await connection.authenticate();
  const records = await Libro.findAll({ include: [
    { model: Autor, as: 'autor' }, { model: Categoria, as: 'categoria' }, { model: Editorial, as: 'editorial' }
  ] });
  assert.equal(records.length, 3);
  assert.equal(records[0].autor.correo, 'clara@example.invalid');
  assert.equal(records[0].portada, '/assets/images/book-placeholder.svg');
  const result = spawnSync(process.execPath, ['scripts/seed-demo.js'], { encoding: 'utf8', env: process.env, timeout: 15000 });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /base vacía/);
  assert.equal(await Libro.count(), 3);
});
