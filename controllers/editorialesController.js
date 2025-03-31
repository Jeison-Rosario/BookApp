const sequelize = require("sequelize");

const editorial = require("../models/editorial");
const libro = require("../models/libro");

exports.GetEditorialesList = (req, res, next) => {
    editorial.findAll({
        include: [
            {
                model: libro,
                as: "libros",
                attributes: [], 
            }
        ],
        attributes: [
            "idEditorial",
            "editorial",
            "telefono",
            "pais",
            [sequelize.fn("COUNT", sequelize.col("libros.idLibro")), "cantidadLibros"] 
        ],
        group: ["editorial.idEditorial"]
    })
    .then((result) => {
        const editoriales = result.map((e) => e.toJSON());

        res.render("editoriales/editoriales-list", {
            pageTitle: "Editoriales",
            editorialActive: true,
            editoriales: editoriales,
            hasEditoriales: editoriales.length > 0,
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send("Error al obtener las editoriales"); 
    });
};

exports.GetCreateEditoriales = (req, res, next) => {
    editorial.findAll()
        .then((result) => {
            const editoriales = result.map((e) => e.dataValues);

            res.render("editoriales/create-editoriales", {
                pageTitle: "Agregar editoriales",
                tipoActive: true,
                editMode: false,
                editoriales: editoriales, 
                hasEditoriales: editoriales.length > 0,
            });
        })
        .catch((err) => {
            console.error("Error al obtener los editoriales:", err);
        });
};

exports.PostCreateEditoriales = (req, res, next) => {
    const editoriales = req.body.Name; 
    const telefono = req.body.Phone; 
    const pais = req.body.Country; 
  
    editorial.create({ editorial: editoriales, telefono: telefono, pais: pais }) 
      .then((result) => {
        res.redirect("/editoriales-list");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al crear la editorial");
      });
};

exports.GetEditEditoriales = (req, res, next) => {
    const edit = req.query.edit;
    const editorialId = req.params.editorialId;  

    if (!edit) {
        return res.redirect("/editoriales-list");
    }

    editorial.findOne({ where: { idEditorial: editorialId } })
        .then((result) => {
            if (!result) { 
                return res.redirect("/editoriales-list");
            }

            res.render("editoriales/create-editoriales", {
                pageTitle: "Editar Editorial",
                editorialActive: true,
                editMode: edit,
                editorial: result.dataValues,
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error al obtener la editorial para editar");
        });
};

exports.PostEditEditoriales = (req, res, next) => {
    const editoriales = req.body.Name; 
    const telefono = req.body.Phone; 
    const pais = req.body.Country;
    const editorialId = req.body.editorialId;  

    editorial.update({ editorial: editoriales, telefono: telefono, pais: pais }, { where: { idEditorial: editorialId } })  
        .then((result) => {
            res.redirect("/editoriales-list");
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error al editar la editorial");
        });
};

exports.PostDeleteEditoriales = (req, res, next) => {
    const editorialId = req.body.editorialId;

    if (!editorialId) {
        return res.status(400).send("ID de editorial no proporcionado");  
    }

    editorial.destroy({ where: { idEditorial: editorialId } })
        .then((result) => {
            return res.redirect("/editoriales-list");
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Error al eliminar el editorial");
        });
};