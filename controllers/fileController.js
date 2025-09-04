const VALID_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const VALID_FILE_NAME_LENGTH = 255;
const fileDb = require("../db/file.js");
const multer = require("multer");
const folderDb = require("../db/folder.js");
const upload = multer({ dest: "uploads/", limits: { fileSize: VALID_FILE_SIZE } });
const { body, validationResult } = require("express-validator");

const validateEditFile = [
    body("updatedFilename").trim().isLength({ min: 1, max: 50 }).withMessage("New file name must be between 1 and 50 characters.")
];

const validateDeleteFile = [
    body("deleteMsg").trim().notEmpty().withMessage("Delete message is required.")
];

const detailsFileGet = async (req, res) => {
    if(!req.isAuthenticated()) return res.redirect("/user/login");
    const file = await fileDb.getFileById(req.params.fileId, req.user);
    const folder = await folderDb.getFolderById(file.folderId, req.user);
    return res.render("pages/fileDetails", { file, folder });
};

const uploadFileGet = async (req, res) => {
    if(!req.isAuthenticated()) return res.redirect("/user/login");
    const folder = await folderDb.getFolderById(req.params.folderId, req.user);
    return res.render("pages/fileUpload", { folder });
};

const uploadFilePost = [
    upload.single("file"),
    async (req, res, next) => {
        const folder = await folderDb.getFolderById(req.params.folderId, req.user);
        if(!req.file) {
            await fileDb.deleteLocalFile(req.file);
            return res.render("pages/fileUpload", { errors: [ { msg: "Please select a file." }], folder });
        }
        if(req.file.size > VALID_FILE_SIZE) {
            await fileDb.deleteLocalFile(req.file);
            return res.render("pages/fileUpload", { folder, errors: [ { msg: "Please select a file that is smaller than 10MB" }]});
        }
        if((req.file.originalname).length > VALID_FILE_NAME_LENGTH){
            await fileDb.deleteLocalFile(req.file);
            return res.render("pages/fileUpload", { folder, errors: [ { msg: `Filename must be shorter than ${VALID_FILE_NAME_LENGTH} characters. Please rename and try again.` }]});
        }
        try {
            await fileDb.uploadFile(req.file, folder, req.user);
            return res.redirect(`/folder/${folder.id}/${folder.name}`);
        } catch (err) {
            console.error(err);
            await fileDb.deleteLocalFile(req.file);
            if(err.code === "P2002"){
                return res.render("pages/fileUpload", { folder, errors: [{ msg: `File: ${req.file.originalname} already exists in folder: ${folder.name}. Please rename and try again.` }] });
            }
            else if(err.code === "P2000"){
                return res.render("pages/fileUpload", { folder, errors: [{ msg: `Filename must be shorter than ${VALID_FILE_NAME_LENGTH} characters. Please rename and try again.` }] });
            }
            else {
                return next(err);
            }
        }
    }
];

editFileGet = async (req, res) => {
    if(!req.isAuthenticated()) return res.redirect("/user/login");
    const file = await fileDb.getFileById(req.params.fileId, req.user);
    const folder = await folderDb.getFolderById(file.folderId, req.user);
    return res.render("pages/fileEdit", { file, folder });
};

editFilePost = [
    validateEditFile,
    async(req, res, next) => {
        const errors = validationResult(req);
        const file = await fileDb.getFileById(req.params.fileId, req.user);
        const folder = await folderDb.getFolderById(file.folderId, req.user);
        if(!errors.isEmpty()) return res.status(400).render("pages/fileEdit", { file, errors: errors.array() });
        try {
            await fileDb.updateFilename(file, req.body.updatedFilename, req.user);
            return res.redirect(`/folder/${folder.id}/${folder.name}`);
        } catch (err) {
            console.error(err);
            if(err.code === "P2002"){
                return res.render("pages/fileEdit", { file, errors: [{ msg: `File: ${req.body.updatedFilename} already exists in folder: ${folder.name}.` }] });
            }
            else {
                return next(err);
            }
        }
    }
];

const deleteFileGet = async (req, res) => {
    if(!req.isAuthenticated()) return res.redirect("/user/login");
    const file = await fileDb.getFileById(req.params.fileId, req.user);
    const folder = await folderDb.getFolderById(file.folderId, req.user);
    return res.render("pages/fileDelete", { file, folder });
};

const deleteFilePost = [
    validateDeleteFile,
    async (req, res) => {
        const errors = validationResult(req);
        const file = await fileDb.getFileById(req.params.fileId, req.user);
        const folder = await folderDb.getFolderById(file.folderId, req.user);
        if(!errors.isEmpty()) return res.render("pages/fileDelete", { file, folder, errors: errors.array() });
        if(String(req.body.deleteMsg) !== "delete file") return res.render("pages/fileDelete", { file, folder, errors: [{ msg: "Incorrect delete message."}] });
        await fileDb.deleteLocalFile(file);
        await fileDb.deleteFile(file, req.user);
        return res.redirect(`/folder/${folder.id}/${folder.name}`);
    }
];

const downloadFileGet = async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/user/login");
    const file = await fileDb.getFileById(req.params.fileId, req.user);
    return res.download(file.url, file.name, (err) => {
        if(err) console.log(err);
    });
};

module.exports = {
    uploadFileGet,
    uploadFilePost,
    detailsFileGet,
    editFileGet,
    editFilePost,
    deleteFileGet,
    deleteFilePost,
    downloadFileGet,
};