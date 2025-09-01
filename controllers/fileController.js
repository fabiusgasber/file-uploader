const VALID_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const fileDb = require("../db/file.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/", limits: { fileSize: VALID_FILE_SIZE } });

const uploadFileGet = (req, res) => req.isAuthenticated() ? res.render("pages/file_upload") : res.redirect("/user/login");

const uploadFilePost = [
    upload.single("file"),
    (req, res, next) => {
        if(!req.file) return res.render("pages/file_upload", { errors: [ { msg: "Please select a file." }]});
        if(!req.file.size > VALID_FILE_SIZE) return res.render("pages/file_upload", { errors: [ { msg: "Please select a file that is smaller than 10MB." }]});
        next();
    },
    async (req, res, next) => {
        await fileDb.uploadFile(req.file);
        return res.redirect("/");
    }
];

module.exports = {
    uploadFileGet,
    uploadFilePost,
};