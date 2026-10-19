# Publicar la demo de BookApp en alwaysdata

Esta guía corresponde a la rama `feat/alwaysdata-demo-20261019`. La demo pública permite explorar y buscar datos ficticios; no permite modificar registros, subir imágenes ni enviar correos.

## 1. Antes de desplegar

- Revocar la contraseña de aplicación de Gmail que estaba en el controlador y reemplazar las credenciales de base de datos expuestas que todavía sean válidas. No hace falta configurar una contraseña SMTP nueva para esta demo.
- El `.env` se elimina de esta rama y se ignora en Git. Las versiones históricas siguen existiendo: esa eliminación no sustituye la revocación. Esta propuesta no reescribe el historial ni modifica otras ramas.
- No reutilizar una base con datos personales o una instalación existente. Crear una base nueva exclusivamente para la demo.
- Revisar el pull request. Puede probarse esta rama antes de integrarla; después de integrarla se puede desplegar `main`.

## 2. Crear la cuenta y la base

1. Crear una cuenta en https://www.alwaysdata.com/ y seleccionar el plan gratuito si sigue disponible. Consultar los límites mostrados al registrarse; no contratar un plan de pago para seguir esta guía.
2. En la administración, crear una base MariaDB/MySQL vacía y un usuario con acceso a esa base. Usar los nombres completos que devuelve el panel, incluidos los prefijos de cuenta.
3. Guardar el host de MySQL, puerto, nombre de base, usuario y contraseña. No publicarlos en GitHub ni enviarlos en capturas o mensajes.
4. Permitir creación de tablas para la inicialización y escritura para el seed. Después, para la demo, puede usarse un usuario con permiso de lectura únicamente; el servidor ya no sincroniza el esquema al arrancar.

## 3. Subir el código e instalar

Desde la terminal SSH de tu cuenta (reemplazar `CUENTA` por el identificador real):

```sh
mkdir -p /home/CUENTA/apps
cd /home/CUENTA/apps
git clone --branch feat/alwaysdata-demo-20261019 https://github.com/Jeison-Rosario/BookApp.git bookapp
cd bookapp
node --version
npm ci --omit=dev
```

Seleccionar Node.js 22 o 24 en la configuración del entorno. Para desarrollo local, `npm ci` instala también nodemon. No subir `node_modules` desde tu equipo.

## 4. Configurar las variables

En el servidor, desde la raíz del proyecto:

```sh
cp .env.example .env
chmod 600 .env
nano .env
```

Completar `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER` y `MYSQLPASSWORD` con los valores reales del panel. Mantener:

```dotenv
NODE_ENV=production
DEMO_MODE=true
MAIL_ENABLED=false
```

Eliminar las líneas `HOST` y `PORT` de la copia del servidor: alwaysdata proporciona la dirección y el puerto del sitio. El código toma `IP` y `PORT` del proceso; no hay que usar un puerto fijo. No copiar las contraseñas en comandos de terminal, archivos de documentación ni commits. El archivo `.env.example` solo contiene marcadores.

Las variables también pueden configurarse en el panel del sitio, pero los comandos de inicialización ejecutados por SSH necesitan recibir las mismas variables: un `.env` local evita esa diferencia. dotenv no sobrescribe variables ya asignadas por el alojamiento.

## 5. Inicializar y comprobar

```sh
npm run db:sync
npm run seed:demo
npm test
```

`db:sync` usa `sync()` sin `force` ni `alter`; sirve para crear las tablas de esta base vacía. No sustituye migraciones de esquema para futuras versiones. `seed:demo` inserta tres libros ficticios dentro de una transacción; si cualquiera de las cuatro tablas ya tiene filas, se cancela sin borrar ni reemplazar registros. No volver a ejecutarlo para reiniciar una demo existente.

`npm test` comprueba configuración, renderizado HTTP con datos simulados, bloqueo de escrituras, archivos estáticos, correo desactivado y edición sin reemplazo de portada. No valida la conexión real: `db:sync` y `seed:demo` sí necesitan la base configurada.

## 6. Crear el sitio web

En **Web > Sites**, crear un sitio de tipo **Node.js**:

| Campo | Valor |
| --- | --- |
| Dirección | La dirección gratuita de tu cuenta `alwaysdata.net` |
| Directorio de trabajo | `/home/CUENTA/apps/bookapp` |
| Comando | `node /home/CUENTA/apps/bookapp/server.js` |
| Versión Node | 22 o 24 |

El comando absoluto funciona aunque no se muestre un campo de directorio de trabajo: vistas, imágenes y `.env` se resuelven desde la carpeta del proyecto.

Activar HTTPS según las opciones del panel y reiniciar el sitio cuando se cambien sus variables o código. No iniciar un segundo proceso manual con `npm start` en paralelo al gestionado por el panel.

## 7. Revisar la demo publicada

- `/healthz` responde con `{"status":"ok","demo":true}`. Es una prueba del proceso HTTP; no comprueba MySQL en cada petición.
- `/` muestra tres libros con sus portadas de demostración.
- Buscar parte de un título filtra el catálogo.
- El menú móvil se abre y las páginas de listados cargan.
- Una operación de crear, editar o eliminar devuelve 403. El bloqueo se aplica antes de procesar archivos y formularios.
- No se envía correo, incluso si por error se configura `MAIL_ENABLED=true`, mientras `DEMO_MODE=true`.
- Si aparece un error, revisar los logs del sitio ocultando credenciales antes de compartirlos. Comprobar primero versión de Node, variables y permisos de la base.

## 8. Enlazar al portafolio

Cuando estos puntos pasen, añadir la URL HTTPS real como “Probar demo” en la tarjeta de BookApp. Conservar “Ver código”. No anunciar el enlace antes de verificarlo. El portafolio permanece en GitHub Pages.

## Límites

La demo no es una administración pública autenticada. No desactivar `DEMO_MODE` en un sitio abierto a visitantes: las rutas de administración todavía necesitan autenticación, autorización y protección CSRF. Para practicar el CRUD completo, usar una instancia local privada y `DEMO_MODE=false`.

Las imágenes subidas en modo privado se almacenan en `uploads/`, fuera de Git, con límite de 2 MB y filtro de MIME PNG/JPEG. El MIME declarado no verifica por sí solo el contenido del archivo; antes de habilitar cargas públicas se requiere validación adicional. Las portadas del seed están en `public/` y no necesitan almacenamiento de cargas.

## Fuentes oficiales consultadas

- https://help.alwaysdata.com/en/docs/web-hosting/languages/nodejs/configuration/
- https://help.alwaysdata.com/en/docs/web-hosting/databases/mariadb/
- https://help.alwaysdata.com/en/docs/admin-billing/billing/public-cloud-prices/
