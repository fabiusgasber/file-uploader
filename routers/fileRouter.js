const { Router } = require("express");
const router = new Router();
const fileController = require("../controllers/fileController.js");

router.get("/:fileId/edit", fileController.editFileGet);
router.post("/:fileId/edit", fileController.editFilePost);
router.get("/:fileId/delete", fileController.deleteFileGet);
router.post("/:fileId/delete", fileController.deleteFilePost);
router.get("/:folderId/upload", fileController.uploadFileGet);
router.post("/:folderId/upload", fileController.uploadFilePost);
router.get("/:fileId/download", fileController.downloadFileGet);
router.get("/:fileId", fileController.detailsFileGet);

module.exports = router;
