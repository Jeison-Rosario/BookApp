const connection = require('../context/appContext');
const { Autor, Categoria, Editorial, Libro } = require('../models');
async function seed() {
  try {
    await connection.transaction(async transaction => {
      const count = await Libro.count({ transaction }) + await Autor.count({ transaction })
        + await Categoria.count({ transaction }) + await Editorial.count({ transaction });
      if (count) throw new Error('NONEMPTY');
      const author = await Autor.create({ autor: 'Clara Ejemplo', correo: 'clara@example.invalid' }, { transaction });
      const category = await Categoria.create({ categoria: 'Aprendizaje', descripcion: 'Catálogo ficticio de demostración.' }, { transaction });
      const publisher = await Editorial.create({ editorial: 'Editorial Demo', telefono: 0, pais: 'República Dominicana' }, { transaction });
      await Libro.bulkCreate([
        { titulo: 'Un primer paso en programación', publicacion: '2024-01-15', portada: '/assets/images/book-placeholder.svg' },
        { titulo: 'Historias de una biblioteca', publicacion: '2024-06-10', portada: '/assets/images/book-placeholder.svg' },
        { titulo: 'Datos que cuentan historias', publicacion: '2025-02-20', portada: '/assets/images/book-placeholder.svg' }
      ].map(book => ({ ...book, autorLibroId: author.idAutor, categoriaLibroId: category.idCategoria,
        editorialLibroId: publisher.idEditorial })), { transaction });
    });
    console.log('Demo preparada con tres libros ficticios. No se enviaron correos.');
  } catch (err) {
    console.error(err.message === 'NONEMPTY' ? 'Seed cancelado: utiliza una base vacía. No se modificaron los datos existentes.' : 'No se pudo cargar la demo. Ejecuta db:sync y revisa la conexión.');
    process.exitCode = 1;
  } finally { await connection.close(); }
}
seed();
