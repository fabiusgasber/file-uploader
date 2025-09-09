const { Router } = require("express");
const router = new Router();
const folderController = require("../controllers/folderController.js");

router.get("/:folderId/:folderName/create", folderController.folderCreateGet);
router.post("/:folderId/:folderName/create", folderController.folderCreatePost);
router.get("/:folderId/:folderName/edit", folderController.folderEditGet);
router.post("/:folderId/:folderName/edit", folderController.folderEditPost);
router.get("/:folderId/:folderName/delete", folderController.folderDeleteGet);
router.post("/:folderId/:folderName/delete", folderController.folderDeletePost);
router.get("/:folderId/:folderName", folderController.folderGet);
router.get("/home", folderController.homeFolderGet);

module.exports = router;
