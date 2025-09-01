const { Router } = require("express");
const router = new Router();
const fileController = require("../controllers/fileController.js");

router.get("/upload", fileController.uploadFileGet);
router.post("/upload", fileController.uploadFilePost);

module.exports = router;