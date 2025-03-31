const express = require("express");

const router = express.Router();

const editorialController = require("../controllers/editorialesController");

router.get("/editoriales-list", editorialController.GetEditorialesList);
router.get("/create-editoriales", editorialController.GetCreateEditoriales);
router.post("/create-editoriales", editorialController.PostCreateEditoriales);
router.get("/edit-editoriales/:editorialId", editorialController.GetEditEditoriales);
router.post("/edit-editoriales", editorialController.PostEditEditoriales);
router.post("/delete-editoriales", editorialController.PostDeleteEditoriales);

module.exports = router;