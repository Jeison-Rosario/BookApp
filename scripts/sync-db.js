const connection = require('../context/appContext');
require('../models');
(async () => {
  try {
    await connection.sync(); // Sin force ni alter: no borra tablas existentes.
    console.log('Tablas inicializadas. Los cambios futuros requieren migraciones.');
  } catch {
    console.error('No se pudo inicializar la base. Revisa conexión y permisos.');
    process.exitCode = 1;
  } finally { await connection.close(); }
})();
