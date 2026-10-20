# BookApp · Catálogo y gestión de libros

Aplicación académica con Node.js, Express, Handlebars, Sequelize y MySQL para gestionar libros, autores, categorías y editoriales. Incluye búsqueda por título, portadas y notificación opcional al autor.

El catálogo público es una **demo de solo lectura** con correo desactivado. El acceso opcional de administrador permite gestionar registros y portadas mediante una sesión privada.

[Probar demo](https://bookapp.alwaysdata.net/) · [Configurar administrador](docs/ADMIN.md)

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

Para probar el CRUD desde alwaysdata, seguir [la guía de administrador](docs/ADMIN.md) y mantener `DEMO_MODE=true`. La escritura sin autenticación con `DEMO_MODE=false` queda restringida a entornos locales no productivos. El servidor escucha por defecto en `127.0.0.1`; en alojamiento respeta `IP`/`HOST` y `PORT`. `npm run dev` inicia nodemon para desarrollo.

## Despliegue gratuito

Seguir [la guía paso a paso para alwaysdata](docs/ALWAYSDATA.md). Incluye cuenta, base de datos, configuración, comandos, comprobaciones y conexión final al portafolio. No se necesita contratar un dominio.

## Variables

| Variable | Uso |
| --- | --- |
| `MYSQLHOST`, `MYSQLPORT` | Dirección y puerto de MySQL/MariaDB |
| `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD` | Base y acceso local o del alojamiento |
| `IP` / `HOST`, `PORT` | Dirección y puerto HTTP; usar los asignados por alwaysdata |
| `DEMO_MODE` | `true` por defecto: visitantes sin sesión solo pueden consultar; un administrador autenticado puede gestionar |
| `MAIL_ENABLED` | `false` por defecto; demo siempre desactiva el correo |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | Solo necesarias para activar correo fuera de demo |

No se requiere una cuenta SMTP para publicar el catálogo. El envío utiliza texto plano y límites de tiempo; si falla, el libro ya guardado se conserva. La configuración valida nombres de variables y valores de puertos sin imprimir contraseñas.

## Administrador

`npm run admin:setup` configura el usuario, hash de contraseña y secreto de sesión de forma privada en el servidor. Reiniciar y acceder por HTTPS a `/admin/login`. No crea usuarios de MySQL ni cambia los permisos de la base. Consultar [ADMIN.md](docs/ADMIN.md) para activación, pruebas y límites.

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

Las pruebas cubren configuración, renderizado y búsquedas HTTP con datos simulados, archivos estáticos, bloqueo de escrituras, correo desactivado y conservación de portada al editar. Las pruebas normales no se conectan a una base ni envían correos. El workflow de GitHub Actions prepara una base MySQL 8 de prueba y activa una comprobación adicional con `RUN_MYSQL_TESTS=true`, incluyendo el rechazo de un segundo seed. No activar esa opción contra una base que no sea de pruebas. La conexión y creación del esquema deben verificarse con la base real durante el despliegue. El propietario validó la demo y su adaptación móvil en alwaysdata. El propietario también confirmó las operaciones de administrador y las restricciones para visitantes en el servidor. Esta ampliación documental no repite esas pruebas.

## Pendientes

- Revocar credenciales históricamente expuestas; retirar `.env` de esta rama no invalida sus versiones anteriores.
- Para múltiples administradores o procesos, reemplazar el acceso configurado por entorno y las sesiones en memoria por usuarios y sesiones persistentes.
- Mejorar validaciones del CRUD y revisar borrados en cascada de autores, categorías y editoriales.
- Añadir migraciones, ampliar las pruebas con MySQL/MariaDB real y gestionar la limpieza de portadas antiguas. Las cargas están reservadas al administrador.

## Recorrido de uso

Un visitante puede consultar el catálogo y buscar por título. Para administrar, iniciar sesión, crear primero autor, categoría y editorial y después registrar el libro con su portada. Al editar sin subir otra imagen, se conserva la anterior. Cerrar sesión al terminar.

Para eliminar datos de prueba, borrar primero el libro. El modelo declara relaciones de borrado en cascada desde autor, categoría y editorial hacia libros; revisar las restricciones instaladas antes de eliminar registros relacionados.

## Modelo y rutas principales

Cada libro contiene título, fecha de publicación y ruta de portada. Sus relaciones con autor, categoría y editorial están definidas en `models/index.js`. Cada entidad relacionada puede tener varios libros.

| Ruta | Uso |
| --- | --- |
| `/` | Catálogo público |
| `/?search=texto` | Búsqueda parcial por título |
| `/libros-list` | Listado de libros |
| `/autores-list`, `/categorias-list`, `/editoriales-list` | Catálogos relacionados |
| `/admin/login` | Inicio de sesión privado opcional |
| `/healthz` | Estado HTTP del proceso |

Las escrituras utilizan formularios y rutas POST. No se ofrece una API REST documentada. `/healthz` responde desde Express y no consulta MySQL; no sustituye una comprobación del catálogo y de su base de datos.

## Sesiones, actualización y respaldo

La cookie `bookapp.sid` utiliza HttpOnly y SameSite; su transporte seguro depende de la configuración. Las sesiones viven en memoria: reiniciar el proceso las cierra, pero conserva los registros de MySQL. La solución actual está pensada para un administrador y una instancia.

Para actualizar, revisar cambios locales, integrar la rama principal y ejecutar `npm ci --omit=dev` si cambian dependencias; luego reiniciar el sitio. No sobrescribir el `.env` ni volver a ejecutar el seed como parte de una actualización rutinaria. Respaldar la base y `uploads/` de forma coherente: MySQL almacena la ruta de las portadas, no su contenido.

## Solución de problemas

| Situación | Qué revisar |
| --- | --- |
| No inicia por variables faltantes | Configuración `MYSQL*` y, si se activa, administrador |
| No conecta a MySQL | Host, puerto, nombre de base y permisos del usuario |
| El catálogo está vacío | Datos existentes; seed solo para tablas vacías |
| El seed se cancela | Protección para no reemplazar datos existentes |
| No permite escribir | Sesión de administrador y modo de demo |
| No mantiene sesión local HTTP | Configuración local de cookies en [ADMIN.md](docs/ADMIN.md) |
| Rechaza una portada | PNG/JPEG válido de hasta 2 MB |
| No envía correo en demo | Comportamiento previsto; SMTP solo fuera de demo |

Esta revisión amplía el README a partir del código y las guías existentes; no vuelve a ejecutar la aplicación ni cambia su configuración.

## Autor

[Jeison Rosario](https://github.com/Jeison-Rosario)
