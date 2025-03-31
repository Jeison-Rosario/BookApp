const sequelize = require("sequelize");

const categoria = require("../models/categoria");
const libro = require("../models/libro");

exports.GetCategoriasList = (req, res, next) => {
    categoria.findAll({
        include: [
            {
                model: libro,
                as: "libros",
                attributes: [], 
            }
                    ],
                    attributes: [
                        "idCategoria",
                        "categoria",
                        "descripcion",
                        [sequelize.fn("COUNT", sequelize.col("libros.idLibro")), "cantidadLibros"] 
                    ],
                    group: ["categoria.idCategoria"]
                })
      .then((result) => {
        const categorias = result.map((c) => c.dataValues);  
  
        res.render("categorias/categorias-list", {
          pageTitle: "Categorias",
          categoriaActive: true,
          categorias: categorias,  
          hasCategorias: categorias.length > 0,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al obtener las categorias"); 
      });
};

exports.GetCreateCategorias = (req, res, next) => {
    categoria.findAll()
        .then((result) => {
            const categorias = result.map((c) => c.dataValues);

            res.render("categorias/create-categorias", {
                pageTitle: "Agregar categorias",
                categoriaActive: true,
                editMode: false,
                categorias: categorias, 
                hasCategorias: categorias.length > 0,
            });
        })
        .catch((err) => {
            console.error("Error al obtener categorias:", err);
        });
};

exports.PostCreateCategorias = (req, res, next) => {
    const categorias = req.body.Name;
    const descripcion = req.body.Descripcion; 
  
    categoria.create({ categoria: categorias, descripcion: descripcion }) 
      .then((result) => {
        res.redirect("/categorias-list");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al crear la categoria");
      });
};

exports.GetEditCategorias = (req, res, next) => {
    const edit = req.query.edit;
    const categoriaId = req.params.categoriaId;  
  
    if (!edit) {
      return res.redirect("/categorias-list");
    }
  
    categoria.findOne({ where: { idCategoria: categoriaId } })  
      .then((result) => {

        if (!result) {
          return res.redirect("/categorias");
        }
  
        res.render("categorias/create-categorias", {
          pageTitle: "Editar Categoria",
          categoriaActive: true,
          editMode: edit,
          categoria: result.dataValues,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al obtener la categoria para editar");
      });
};

exports.PostEditCategorias = (req, res, next) => {
    const categorias = req.body.Name; 
    const descripcion = req.body.Descripcion; 
    const categoriaId = req.body.categoriaId;  
  
    categoria.update({ categoria: categorias, descripcion: descripcion  }, { where: { idCategoria: categoriaId } })
      .then((result) => {
        res.redirect("/categorias-list");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al editar la categoria");
      });
};

exports.PostDeleteCategorias = (req, res, next) => {
    const categoriaId = req.body.categoriaId;
  
    if (!categoriaId) {
        return res.status(400).send("ID de categoria no proporcionado");
    }

    categoria.destroy({ where: { idCategoria: categoriaId } })
      .then((result) => {
        return res.redirect("/categorias-list");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al eliminar la categoria");
      });
};