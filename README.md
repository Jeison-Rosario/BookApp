# BookApp · Catálogo y gestión de libros

Aplicación web para administrar libros, autores, categorías y editoriales, consultar un catálogo y buscar libros por título. Proyecto académico con Node.js, Express, Handlebars, Sequelize y MySQL.

## Funcionalidades implementadas

- Listado, creación, edición y eliminación de libros.
- Gestión de autores, categorías y editoriales mediante controladores y vistas propios.
- Relaciones entre cada libro y su autor, categoría y editorial.
- Carga de portadas con Multer.
- Búsqueda por título en el catálogo.
- Envío de una notificación al correo del autor al crear un libro.

## Estructura

- `app.js`: servidor, vistas, rutas y sincronización de modelos.
- `context/appContext.js`: conexión MySQL mediante variables de entorno.
- `models/`: entidades y asociaciones Sequelize.
- `controllers/` y `routes/`: operaciones y navegación.
- `views/`: interfaz Handlebars.
- `middlewares/upload.js`: almacenamiento de portadas.

## Preparación local

Requiere Node.js, npm y una instancia MySQL. La versión de Node no está fijada en el repositorio; verificar los requisitos de las dependencias antes de instalar.

1. Clonar el repositorio e ingresar a su carpeta.
2. Ejecutar `npm ci`, incluyendo las dependencias de desarrollo: actualmente varias librerías necesarias para ejecutar la aplicación están en esa sección.
3. Crear una base MySQL vacía para pruebas.
4. Configurar un archivo `.env` local con valores propios:

```dotenv
MYSQLDATABASE=bookapp_local
MYSQLUSER=usuario_local
MYSQLPASSWORD=CAMBIAR_LOCALMENTE
MYSQLHOST=localhost
MYSQLPORT=3306
```

5. Ejecutar `node app.js` desde la raíz.
6. Abrir http://localhost:3000.

El arranque llama a `connection.sync()`; la base debe existir y el usuario necesita permisos para crear las tablas. El script actual `npm start` apunta a `/app.js`; usar el comando anterior hasta corregirlo.

## Comprobación manual sugerida

Crear primero un autor, una categoría y una editorial. Registrar un libro, buscarlo por título, editarlo y comprobar su portada. Hacer las pruebas de correo únicamente después de configurar credenciales propias y un destinatario de prueba.

## Limitaciones y siguientes mejoras

- Hay credenciales SMTP incrustadas en `controllers/librosController.js` y un `.env` versionado. Revocar las credenciales expuestas, sustituirlas por variables locales y limpiar el historial cuando corresponda. Borrar un archivo del último commit no revoca un secreto.
- No ejecutar el envío con la configuración publicada. La configuración SMTP todavía no lee variables de entorno.
- Agregar autenticación, autorización y protección CSRF antes de exponer operaciones de administración.
- Limitar tamaño y tipos permitidos en las cargas de archivos.
- Al editar sin nueva portada, el controlador asigna la imagen por defecto: conservar la anterior.
- Revisar los borrados en cascada de autores, categorías y editoriales, porque pueden eliminar libros asociados.
- Separar el envío de correo del guardado mediante una cola o mecanismo de reintento.
- Corregir scripts, distribuir correctamente dependencies/devDependencies y agregar migraciones y pruebas.

## Estado de validación

Documentación preparada mediante revisión estática del código. No se ejecutaron la aplicación, MySQL ni envíos de correo. `npm test` es actualmente un marcador que termina con error; no representa una suite de pruebas.

## Autor

[Jeison Rosario](https://github.com/Jeison-Rosario)
