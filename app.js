const express = require("express");
const fs = require('fs');
const path = require("path");
const { engine } = require("express-handlebars");
const connection = require("./context/appContext");

const { Libro, Autor, Categoria, Editorial } = require("./models/index");

const libreriaRouter = require("./routes/libreria");
const libroRouter = require("./routes/libro");
const categoriaRouter = require("./routes/categoria");
const autorRouter = require("./routes/autor");
const editorialRouter = require("./routes/editorial");
const errorController = require("./controllers/errorController");

const app = express();

const compareHelpers = require("./util/helpers/hbs/compare");

app.engine(
    "hbs",
    engine({
        layoutsDir: "views/layouts/",
        defaultLayout: "mainLayout",
        extname: "hbs",
        helpers: {
            equalValue: compareHelpers.EqualValue,
        },
    })
);

app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(libreriaRouter);
app.use(libroRouter);
app.use(categoriaRouter);
app.use(autorRouter);
app.use(editorialRouter);
app.use(errorController.Get404);

connection
    .sync()
    .then(() => {
        app.listen(3000);
    })
    .catch((err) => {
        console.error("Error al sincronizar la base de datos:", err);
    });