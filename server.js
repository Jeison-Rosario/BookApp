const config = require('./config');
const connection = require('./context/appContext');
const app = require('./app');
let server;
async function start() {
  // El esquema se prepara explícitamente con npm run db:sync.
  await connection.authenticate();
  server = app.listen(config.port, config.host, () => {
    console.log(`BookApp iniciado en puerto ${config.port}; demo=${config.demoMode}`);
  });
  server.on('error', () => { console.error('No se pudo abrir el puerto HTTP.'); process.exitCode = 1; connection.close(); });
}
async function stop() {
  if (server) await new Promise(resolve => server.close(resolve));
  await connection.close();
}
process.once('SIGTERM', () => stop().catch(() => { process.exitCode = 1; }));
process.once('SIGINT', () => stop().catch(() => { process.exitCode = 1; }));
start().catch(async () => {
  console.error('No se pudo conectar a MySQL. Revisa MYSQLHOST, MYSQLPORT, MYSQLDATABASE, MYSQLUSER y MYSQLPASSWORD.');
  process.exitCode = 1;
  await connection.close();
});
