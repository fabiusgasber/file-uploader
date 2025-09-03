const VALID_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const fileDb = require("../db/file.js");
const multer = require("multer");
const folderDb = require("../db/folder.js");
const upload = multer({ dest: "uploads/", limits: { fileSize: VALID_FILE_SIZE } });

const uploadFileGet = async (req, res) => {
    if(req.isAuthenticated()){
        const folder = await folderDb.getFolderById(req.params.folderId);
        return res.render("pages/file_upload", { folder });
    } else {
        return res.redirect("/user/login");
    }
};

const uploadFilePost = [
    upload.single("file"),
    async (req, res, next) => {
        const folder = await folderDb.getFolderById(req.params.folderId);
        if(!req.file) return res.render("pages/file_upload", { errors: [ { msg: "Please select a file." }], folder });
        if(!req.file.size > VALID_FILE_SIZE) return res.render("pages/file_upload", { errors: [ { msg: "Please select a file that is smaller than 10MB." }], folder});
        return next();
    },
    async (req, res, next) => {
        const folder = await folderDb.getFolderById(req.params.folderId);
        await fileDb.uploadFile(req.file, folder);
        return res.redirect("/");
    }
];

module.exports = {
    uploadFileGet,
    uploadFilePost,
};