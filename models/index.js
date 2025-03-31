const Libro = require("./libro");
const Autor = require("./autor");
const Categoria = require("./categoria");
const Editorial = require("./editorial");

Autor.hasMany(Libro, { foreignKey: "autorLibroId", onDelete: "CASCADE", as: "libros" });
Libro.belongsTo(Autor, { foreignKey: "autorLibroId", as: "autor" });

Categoria.hasMany(Libro, { foreignKey: "categoriaLibroId", onDelete: "CASCADE", as: "libros" });
Libro.belongsTo(Categoria, { foreignKey: "categoriaLibroId", as: "categoria" });

Editorial.hasMany(Libro, { foreignKey: "editorialLibroId", onDelete: "CASCADE", as: "libros" });
Libro.belongsTo(Editorial, { foreignKey: "editorialLibroId", as: "editorial" });

module.exports = { Libro, Autor, Categoria, Editorial };