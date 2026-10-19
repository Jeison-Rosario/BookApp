# Administrador de BookApp

El catálogo sigue siendo público y de solo lectura para visitantes. Una sesión privada permite gestionar libros, autores, categorías y editoriales, y cargar portadas. El correo permanece desactivado. No se necesita crear tablas de usuarios ni contratar otro servicio.

## Activar en alwaysdata

Después de integrar este cambio en `main`, desde la terminal SSH:

```sh
cd ~/apps/bookapp
git status --short
```

Si hay modificaciones locales, revisarlas antes de continuar. No descartar ni sobrescribir el `.env` existente.

```sh
git switch main
git pull --ff-only origin main
npm ci --omit=dev
npm run admin:setup
```

La instalación añade dependencias de sesión: ejecutar una vez y no lanzar en paralelo otras instalaciones o pruebas, para reducir picos de recursos de la cuenta gratuita.

El asistente pide un nombre de usuario y una contraseña nueva de 12 a 256 caracteres, dos veces. La contraseña no se muestra en pantalla. No es la contraseña MySQL ni la de tu cuenta alwaysdata. No la compartas en el chat.

El comando conserva los valores MySQL y añade o actualiza únicamente:

```dotenv
ADMIN_ENABLED=true
ADMIN_USERNAME=EL_USUARIO_ELEGIDO
ADMIN_PASSWORD_HASH=GENERADO_POR_EL_ASISTENTE
SESSION_SECRET=GENERADO_POR_EL_ASISTENTE
TRUST_PROXY=true
COOKIE_SECURE=true
DEMO_MODE=true
MAIL_ENABLED=false
```

Los marcadores anteriores son ilustrativos: no copiarlos sobre los valores reales generados. El hash y el secreto se guardan en `.env`, con permisos 600 y fuera de Git. Si ya hay variables ADMIN_* o SESSION_SECRET definidas en el panel, retirarlas allí o actualizarlas de manera coherente: las variables del proceso tienen prioridad sobre `.env`.

El usuario MySQL debe tener SELECT, INSERT, UPDATE y DELETE en la base de BookApp. Si anteriormente lo limitaste a SELECT, añade los permisos de escritura desde el panel, exclusivamente para esa base.

Reiniciar el sitio en **Web > Sites** y abrir:

https://bookapp.alwaysdata.net/admin/login

## Comprobar

1. Iniciar sesión: aparecen el aviso de administrador, Cerrar sesión y los botones para crear, editar y eliminar.
2. Crear una categoría, autor y editorial de prueba. Utilizar datos ficticios.
3. Crear un libro y subir una portada PNG o JPEG de hasta 2 MB.
4. Editarlo sin elegir otra imagen: la portada se conserva. Probar también reemplazarla.
5. Eliminar primero el libro de prueba y después sus registros auxiliares. Las relaciones actuales conservan borrado en cascada: eliminar un autor, categoría o editorial puede eliminar sus libros. No usar datos importantes.
6. Cerrar sesión y abrir una pestaña privada: el catálogo y la búsqueda funcionan y no aparecen controles de edición. Las operaciones de escritura sin sesión se rechazan también en el servidor.

No volver a ejecutar `db:sync` ni `seed:demo` para esta actualización. No modificar el puerto o la dirección de escucha.

## Sesiones y formularios

- Cookies HttpOnly y SameSite=Strict, con Secure activado en alwaysdata. El login requiere HTTPS.
- Sesiones de hasta una hora en memoria acotada a 100 entradas, con limpieza periódica. Al reiniciar se cierran todas las sesiones. Este almacenamiento está pensado para una única instancia y un administrador, no para escalar a varios procesos.
- El identificador de sesión cambia al autenticar y queda invalidado al cerrar sesión.
- Todos los formularios de escritura requieren un token CSRF. Tras reiniciar o caducar la sesión, recargar el formulario e iniciar sesión de nuevo.
- Cinco intentos por IP en 15 minutos y un límite global de intentos para limitar el coste del hash. Un exceso devuelve 429. El contador se conserva en memoria y se reinicia con el proceso.
- Las portadas se leen en memoria con límite de 2 MB, se comprueba el token antes de guardarlas y se verifica la firma PNG/JPEG. No se aceptan SVG ni HTML subidos.

## Cambiar la contraseña o desactivar el acceso

Para cambiar la contraseña, ejecutar de nuevo `npm run admin:setup` y reiniciar. Se genera también un secreto de sesión nuevo. Para desactivar el acceso, poner `ADMIN_ENABLED=false` y mantener `DEMO_MODE=true`, y reiniciar.

## Problemas frecuentes

- **404 en /admin/login:** el acceso sigue desactivado o el servidor usa código anterior. Comprobar actualización y reinicio, sin publicar `.env`.
- **Mensaje de HTTPS o el login no conserva la sesión:** abrir HTTPS y comprobar TRUST_PROXY=true y COOKIE_SECURE=true; el proxy debe transmitir X-Forwarded-Proto. No resolverlo desactivando Secure en el sitio público.
- **403 al enviar:** sesión o token caducado. Recargar y volver a iniciar sesión.
- **Error al guardar en MySQL:** comprobar permisos de escritura en la base de BookApp.
- **429:** esperar 15 minutos; no repetir solicitudes de acceso continuamente.

## Validación de esta propuesta

Las pruebas HTTP locales verifican login válido e inválido, cookies, rotación e invalidación de sesión, CSRF, bloqueo de todas las rutas de escritura anónimas, CRUD con datos simulados, portadas válidas y falsas, rechazo sin CSRF sin escribir archivos, limitación de intentos y HTTPS detrás de proxy. No representan una prueba del CRUD contra la base real de alwaysdata. La prueba opcional de MySQL del workflow sigue siendo independiente.
