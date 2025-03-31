const sequelize = require("sequelize");

const autor = require("../models/autor");
const libro = require("../models/libro");

exports.GetAutoresList = (req, res, next) => {
    autor.findAll({
        include: [
            {
                model: libro,
                as: "libros",
                attributes: [], 
            }
                    ],
                    attributes: [
                        "idAutor",
                        "autor",
                        "correo",
                        [sequelize.fn("COUNT", sequelize.col("libros.idLibro")), "cantidadLibros"] 
                    ],
                    group: ["autor.idAutor"]
                })
      .then((result) => {
        const autores = result.map((a) => a.dataValues);  
  
        res.render("autores/autores-list", {
          pageTitle: "Autores",
          autorActive: true,
          autores: autores,  
          hasAutores: autores.length > 0,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al obtener los autores"); 
      });
};

exports.GetCreateAutores = (req, res, next) => {
    autor.findAll()
        .then((result) => {
            const autores = result.map((a) => a.dataValues);

            res.render("autores/create-autores", {
                pageTitle: "Agregar autores",
                tipoActive: true,
                editMode: false,
                autores: autores, 
                hasAutores: autores.length > 0,
            });
        })
        .catch((err) => {
            console.error("Error al obtener los autores:", err);
        });
};

exports.PostCreateAutores = (req, res, next) => {
    const autores = req.body.Name;
    const correo = req.body.Correo; 
  
    autor.create({ autor: autores, correo: correo }) 
      .then((result) => {
        res.redirect("/autores-list");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al crear el autor");
      });
};

exports.GetEditAutores = (req, res, next) => {
    const edit = req.query.edit;
    const autorId = req.params.autorId;  

    if (!edit) {
        return res.redirect("/autores-list");
    }

    autor.findOne({ where: { idAutor: autorId } })
        .then((result) => {
            if (!result) { 
                return res.redirect("/autores-list");
            }

            res.render("autores/create-autores", {
                pageTitle: "Editar Autor",
                autorActive: true,
                editMode: edit,
                autor: result.dataValues,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error al obtener el autor para editar");
        });
};

exports.PostEditAutores = (req, res, next) => {
    const autores = req.body.Name;
    const correo = req.body.Correo; 
    const autorId = req.body.autorId;  

    autor.update({ autor: autores, correo: correo }, { where: { idAutor: autorId } })  
        .then((result) => {
            res.redirect("/autores-list");
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error al editar el autor");
        });
};

exports.PostDeleteAutores = (req, res, next) => {
    const autorId = req.body.autorId;

    if (!autorId) {
        return res.status(400).send("ID de autor no proporcionado");  
    }

    autor.destroy({ where: { idAutor: autorId } })
        .then((result) => {
            return res.redirect("/autores-list");
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error al eliminar el autor");
        });
};