const { notifyNewBook } = require("../services/mailService");
const autor = require("../models/autor");
const categoria = require("../models/categoria");
const editorial = require("../models/editorial");
const libro = require("../models/libro");
const upload = require("../middlewares/upload");

exports.GetLibrosList = (req, res, next) => {

    libro.findAll({
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

        res.render("libros/libros-list", {
            pageTitle: "Libros",
            libroActive: true,
            libros: libros,
            hasLibros: libros.length > 0,
        });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send("Error al obtener los libros"); 
    });
};

exports.GetCreateLibros = (req, res, next) => {
    Promise.all([libro.findAll(), categoria.findAll(), autor.findAll(), editorial.findAll()])
        .then(([librosData, categoriasData, autoresData, editorialesData]) => {
            const libros = librosData.map(libro => libro.dataValues);
            const categorias = categoriasData.map(categoria => categoria.dataValues);
            const autores = autoresData.map(autor => autor.dataValues);
            const editoriales = editorialesData.map(editorial => editorial.dataValues);
  
            res.render("libros/create-libros", {
                pageTitle: "Agregar libros",
                libroActive: true,
                editMode: false,
                libros: libros,
                hasLibros: libros.length > 0,
                categorias: categorias,
                hasCategorias: categorias.length > 0,
                autores: autores,
                hasAutores: autores.length > 0,
                editoriales: editoriales,
                hasEditoriales: editoriales.length > 0,
                libroPortada: libros.portada
            });
        })
        .catch((err) => {
            console.error("Error al obtener los libros:", err);
        });
  };
  
  exports.PostCreateLibros = async (req, res, next) => {
      try {

  
          const libroTitulo = req.body.titulo;
          const libroPublicacion = new Date(req.body.publicacion).toISOString();
          const libroCategoria = req.body.libroCategoriaId;
          const libroAutor = req.body.libroAutorId;
          const libroEditorial = req.body.libroEditorialId;
  
          if (!libroCategoria || !libroAutor || !libroEditorial) {
              return res.status(400).send("Por favor, selecciona una categoría, un autor y una editorial.");
          }

        const categoriaData = await categoria.findByPk(libroCategoria);
        const editorialData = await editorial.findByPk(libroEditorial);

        if (!categoriaData || !editorialData) {
            return res.status(400).send("No se encontró la categoría o la editorial.");
        }

        const categorias = categoriaData.categoria;
        const editoriales = editorialData.editorial;
  
          const libroPortada = req.file ? `/uploads/${req.file.filename}` : "/assets/images/book-placeholder.svg";
  
          const nuevoLibro = await libro.create({
              titulo: libroTitulo,
              publicacion: libroPublicacion,
              categoriaLibroId: libroCategoria,
              autorLibroId: libroAutor,
              editorialLibroId: libroEditorial,
              portada: libroPortada,
          });
  
          const autorData = await autor.findByPk(libroAutor);
          if (!autorData) {
              console.log("Autor no encontrado, no se enviará el correo.");
              return res.redirect("/libros-list");
          }
  
          await notifyNewBook({ to: autorData.correo, author: autorData.autor,
              title: libroTitulo, published: libroPublicacion, category: categorias,
              publisher: editoriales }).catch(() => {
                  console.error("Libro guardado; no se pudo enviar la notificación.");
              });

          res.redirect("/libros-list");
      } catch (err) {
          console.log("Error al crear el libro:", err);
          res.status(500).send("Error al crear el libro");
      }
  };
  

exports.GetEditLibros = (req, res, next) => {
    const libroId = req.params.libroId;
    
    Promise.all([
        libro.findByPk(libroId, {
            include: [
                { model: categoria, as: "categoria" },
                { model: autor, as: "autor" },
                { model: editorial, as: "editorial" }
            ]
        }),
        categoria.findAll(),
        autor.findAll(),
        editorial.findAll()
    ])
    .then(([librosData, categoriasData, autoresData, editorialesData]) => {
        if (!librosData) return res.status(404).send("Libro no encontrado.");
        const libro = { ...librosData.dataValues,
            publicacion: new Date(librosData.publicacion).toISOString().slice(0, 10) };
        const categoria = categoriasData.map((c) => c.dataValues);
        const autor = autoresData.map((a) => a.dataValues);
        const editorial = editorialesData.map((e) => e.dataValues);

        res.render("libros/create-libros", {
            pageTitle: "Editar Libro",
            editMode: true,
            libro: libro,
            categorias: categoria,
            autores: autor,
            editoriales: editorial,
            hasCategorias: categoria.length > 0,
            hasAutores: autor.length > 0,
            hasEditoriales: editorial.length > 0
        });
    })
    .catch((err) => {
        console.error("Error al obtener el libro, categorias o autores:", err);
        res.status(500).send("Error al obtener los datos");
    });
};

exports.PostEditLibros = (req, res, next) => {
    upload.single('portada')(req, res, async function (err) {
        if (err) {
            return next(err);
        }
  
        const libroTitulo = req.body.titulo; 
        const libroPublicacion = req.body.publicacion; 
        const libroCategoria = req.body.libroCategoriaId;  
        const libroAutor = req.body.libroAutorId;
        const libroEditorial = req.body.libroEditorialId;
        const libroId = req.body.libroId;
        
        let existing;
        try { existing = await libro.findByPk(libroId); }
        catch (error) { return next(error); }
        if (!existing) return res.status(404).send("Libro no encontrado.");
        const libroPortada = req.file ? `/uploads/${req.file.filename}` : existing.portada;
  
        libro.update(
          { 
            titulo: libroTitulo,
            publicacion: libroPublicacion,
            categoriaLibroId: libroCategoria,
            autorLibroId: libroAutor,
            editorialLibroId: libroEditorial,
            portada: libroPortada,
          }, 
          { where: { idLibro: libroId } }
        )
        .then(() => res.redirect("/libros-list"))
        .catch(err => {
            console.log(err);
            res.status(500).send("Error al editar el libro");
        });
    });
  };

  exports.PostDeleteLibross = (req, res, next) => {
    const libroId = req.body.libroId;

    libro.destroy({ where: { idLibro: libroId } })
      .then((result) => {
        return res.redirect("/libros-list");
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send("Error al eliminar el libro");
      });
};
