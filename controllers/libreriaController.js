const { Op } = require("sequelize");
const autor = require("../models/autor");
const categoria = require("../models/categoria");
const editorial = require("../models/editorial");
const libro = require("../models/libro");

exports.GetLibrosList = (req, res, next) => {
    const searchTerm = req.query.search || "";  

    const searchQuery = searchTerm ? {
        titulo: {
            [Op.like]: `%${searchTerm}%`  
        }
    } : {};

    libro.findAll({
        where: searchQuery,  
        include: [
            { model: autor, as: "autor" },
            { model: categoria, as: "categoria" },
            { model: editorial, as: "editorial" }
        ]
    })
    .then((result) => {
        const libros = result.map((libro) => ({
            id: libro.idLibro,
            titulo: libro.titulo,
            publicacion: libro.publicacion,
            categoria: libro.categoria ? libro.categoria.categoria : "Desconocido",
            autor: libro.autor ? libro.autor.autor : "Desconocido",
            editorial: libro.editorial ? libro.editorial.editorial : "Desconocido",
            portada: libro.portada
        }));

        res.render("libreria/libreria", {
            pageTitle: "Librería",
            homeActive: true,
            libros: libros,
            hasLibros: libros.length > 0,
            searchTerm: searchTerm  
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send("Error al obtener los libros");
    });
};
