const express = require("express");

const router = express.Router();

const autorController = require("../controllers/autoresController");

router.get("/autores-list", autorController.GetAutoresList);
router.get("/create-autores", autorController.GetCreateAutores);
router.post("/create-autores", autorController.PostCreateAutores);
router.get("/edit-autores/:autorId", autorController.GetEditAutores);
router.post("/edit-autores", autorController.PostEditAutores);
router.post("/delete-autores", autorController.PostDeleteAutores);

module.exports = router;