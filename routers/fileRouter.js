const { Router } = require("express");
const router = new Router();
const fileController = require("../controllers/fileController.js");

router.get("/:folderId/upload", fileController.uploadFileGet);
router.post("/:folderId/upload", fileController.uploadFilePost);

module.exports = router;