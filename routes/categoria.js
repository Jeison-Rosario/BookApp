const express = require("express");

const router = express.Router();

const categoriaController = require("../controllers/categoriasController");

router.get("/categorias-list", categoriaController.GetCategoriasList);
router.get("/create-categorias", categoriaController.GetCreateCategorias);
router.post("/create-categorias", categoriaController.PostCreateCategorias);
router.get("/edit-categorias/:categoriaId", categoriaController.GetEditCategorias);
router.post("/edit-categorias", categoriaController.PostEditCategorias);
router.post("/delete-categorias", categoriaController.PostDeleteCategorias);

module.exports = router;