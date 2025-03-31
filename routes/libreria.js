const express = require("express");

const router = express.Router();

const libreriaController = require("../controllers/libreriaController");

router.get("/", libreriaController.GetLibrosList);

module.exports = router;