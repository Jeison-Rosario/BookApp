const express = require("express");

const router = express.Router();

const librosController = require("../controllers/librosController");
const upload = require("../middlewares/upload");

router.get("/libros-list", librosController.GetLibrosList);
router.get("/create-libros", librosController.GetCreateLibros);
router.post("/create-libros", upload.single('portada'), librosController.PostCreateLibros);
router.get("/edit-libros/:libroId", librosController.GetEditLibros);
router.post("/edit-libros", librosController.PostEditLibros);
router.post("/delete-libros", librosController.PostDeleteLibross);

module.exports = router;