const nodemailer = require("nodemailer");
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
          console.log("Datos recibidos:", req.body);
          console.log("Archivo recibido:", req.file);
  
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
  
          const libroPortada = req.file ? `/uploads/${req.file.filename}` : "/uploads/default.png";
  
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
  
          const transporter = nodemailer.createTransport({
              service: 'gmail',
              secure: false,
              port: 587,
              auth: {
                  user: "bookapp968@gmail.com",
                  pass: "dpuuemohukuqtnnk",
              },
          });
  
          const mailOptions = {
              from: "bookapp968@gmail.com", 
              to: autorData.correo, 
              subject: "Nuevo libro publicado",
              html: `
                  <h2>¡Hola ${autorData.autor}!</h2>
                  <p>Se ha publicado tu nuevo libro: <strong>${libroTitulo}</strong>.</p>
                  <p><strong>Fecha de Publicación:</strong> ${libroPublicacion}</p>
                  <p><strong>Categoría:</strong> ${categorias}</p>
                  <p><strong>Editorial:</strong> ${editoriales}</p>
                  <p>Gracias por contribuir con nuestra biblioteca.</p>
                  <br>
                  <p>Atentamente,</p>
                  <p><strong>Tu Biblioteca</strong></p>
              `,
          };
  
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  console.log("Error al enviar el correo:", error);
              } else {
                  console.log("Correo enviado:", info.response);
              }
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
        const libro = librosData ? librosData.dataValues : null;
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
    upload.single('portada')(req, res, function (err) {
        if (err) {
            return res.status(500).send("Error al subir la imagen.");
        }
  
        const libroTitulo = req.body.titulo; 
        const libroPublicacion = req.body.publicacion; 
        const libroCategoria = req.body.libroCategoriaId;  
        const libroAutor = req.body.libroAutorId;
        const libroEditorial = req.body.libroEditorialId;
        const libroId = req.body.libroId;
        
        const libroPortada = req.file ? `/uploads/${req.file.filename}` : "/uploads/default.png";
  
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