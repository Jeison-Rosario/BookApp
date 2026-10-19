# BookApp · Catálogo y gestión de libros

Aplicación académica con Node.js, Express, Handlebars, Sequelize y MySQL para gestionar libros, autores, categorías y editoriales. Incluye búsqueda por título, portadas y notificación opcional al autor.

La configuración predeterminada es una **demo de solo lectura** con correo desactivado. El catálogo se puede explorar desde el navegador; las escrituras y cargas se bloquean en el servidor antes de procesar formularios. No hay una URL de demo confirmada todavía.

## Ejecutar localmente

Requiere Node.js 22 o 24 y MySQL/MariaDB. Crear una base vacía y un usuario local para pruebas.

```sh
npm ci
cp .env.example .env
```

En Windows puede copiarse el archivo desde el explorador o con `Copy-Item .env.example .env`. Completar las variables `MYSQL*` en `.env`; nunca versionar credenciales.

```sh
npm run db:sync
npm run seed:demo
npm start
```

Abrir http://127.0.0.1:3000. `seed:demo` es opcional, añade tres libros ficticios y se cancela si las tablas ya contienen datos. Los comandos no borran ni reinician bases existentes. `db:sync` crea tablas iniciales sin `force` ni `alter`; futuros cambios de esquema deben gestionarse con migraciones.

Para practicar el CRUD completo, usar `DEMO_MODE=false` solo en una instancia local privada y reiniciar. El servidor escucha por defecto en `127.0.0.1`; en alojamiento respeta `IP`/`HOST` y `PORT`. `npm run dev` inicia nodemon para desarrollo.

## Despliegue gratuito

Seguir [la guía paso a paso para alwaysdata](docs/ALWAYSDATA.md). Incluye cuenta, base de datos, configuración, comandos, comprobaciones y conexión final al portafolio. No se necesita contratar un dominio.

## Variables

| Variable | Uso |
| --- | --- |
| `MYSQLHOST`, `MYSQLPORT` | Dirección y puerto de MySQL/MariaDB |
| `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD` | Base y acceso local o del alojamiento |
| `IP` / `HOST`, `PORT` | Dirección y puerto HTTP; usar los asignados por alwaysdata |
| `DEMO_MODE` | `true` por defecto: bloquea operaciones distintas de GET, HEAD y OPTIONS |
| `MAIL_ENABLED` | `false` por defecto; demo siempre desactiva el correo |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | Solo necesarias para activar correo fuera de demo |

No se requiere una cuenta SMTP para publicar el catálogo. El envío utiliza texto plano y límites de tiempo; si falla, el libro ya guardado se conserva. La configuración valida nombres de variables y valores de puertos sin imprimir contraseñas.

## Organización

- `server.js`: conexión inicial, arranque y apagado del servidor.
- `app.js`: Express, rutas, vistas y manejo de errores.
- `config/`: variables y validación de configuración.
- `context/`: conexión Sequelize.
- `models/`, `controllers/`, `routes/`: entidades y operaciones.
- `services/mailService.js`: correo opcional sin credenciales incrustadas.
- `middlewares/`: bloqueo de escrituras en demo y carga de imágenes.
- `views/`, `public/`: interfaz y recursos locales.
- `scripts/`: inicialización de tablas y datos ficticios.
- `test/`: pruebas con el ejecutor integrado de Node.

## Validación realizada

```sh
npm ci --omit=dev
npm test
```

Las pruebas cubren configuración, renderizado y búsquedas HTTP con datos simulados, archivos estáticos, bloqueo de escrituras, correo desactivado y conservación de portada al editar. Las pruebas normales no se conectan a una base ni envían correos. El workflow de GitHub Actions prepara una base MySQL 8 de prueba y activa una comprobación adicional con `RUN_MYSQL_TESTS=true`, incluyendo el rechazo de un segundo seed. No activar esa opción contra una base que no sea de pruebas. La conexión y creación del esquema deben verificarse con la base real durante el despliegue. No se ha comprobado visualmente la interfaz ni publicado el sitio en alwaysdata en esta preparación.

## Pendientes

- Revocar credenciales históricamente expuestas; retirar `.env` de esta rama no invalida sus versiones anteriores.
- Incorporar autenticación, autorización y protección CSRF antes de exponer administración con escritura.
- Mejorar validaciones del CRUD y revisar borrados en cascada de autores, categorías y editoriales.
- Añadir migraciones, pruebas con MySQL/MariaDB real y validación del contenido de imágenes antes de habilitar cargas públicas.

## Autor

[Jeison Rosario](https://github.com/Jeison-Rosario)
