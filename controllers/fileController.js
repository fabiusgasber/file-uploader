const VALID_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const VALID_FILE_NAME_LENGTH = 255;
require("dotenv").config();
const fileDb = require("../db/file.js");
const folderDb = require("../db/folder.js");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: VALID_FILE_SIZE } });
const { body, validationResult } = require("express-validator");
const supabase = require("../config/supabase.js");

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

const validateMulterUpload = async (req, res, next) => {
    const folder = await folderDb.getFolderById(req.params.folderId, req.user);
    if(!req.file) {
        return res.render("pages/fileUpload", { errors: [ { msg: "Please select a file." }], folder });
    }
    if(req.file.size > VALID_FILE_SIZE) {
        return res.render("pages/fileUpload", { folder, errors: [ { msg: "Please select a file that is smaller than 10MB" }]});
    }
    if((req.file.originalname).length > VALID_FILE_NAME_LENGTH){
        return res.render("pages/fileUpload", { folder, errors: [ { msg: `Filename must be shorter than ${VALID_FILE_NAME_LENGTH} characters. Please rename and try again.` }]});
    }
    return next();
};

const handleUploadErrors = async (err, req, res, next) => {
    const folder = await folderDb.getFolderById(req.params.folderId, req.user);
    let errorMessage = "An unknown error occurred. Please try again later.";
    if(err.code === "P2002" || err.__isStorageError && err.message.includes('already exists')){
      errorMessage = `File: ${req.file.originalname} already exists in folder: ${folder.name}. Please rename and try again.`;
    }
    else if(err.code === "P2000"){
      errorMessage = `Filename must be shorter than ${VALID_FILE_NAME_LENGTH} characters. Please rename and try again.`;
    }
    else {
        errorMessage = "Upload failed. Please try again.";
        console.error("Upload failed: ", err);
    };
    return res.render("pages/fileUpload", { folder, errors: [{ msg: errorMessage }]});
};

const uploadFilePost = [
    upload.single("file"),
    validateMulterUpload,
    async (req, res, next) => {
        const folder = await folderDb.getFolderById(req.params.folderId, req.user);
        const parentFolderId = folder.parent && folder.parent.id ? folder.parent.id : "";
        req.file.id = crypto.randomUUID();
        const path = `${req.user.id}/${parentFolderId}/${folder.id}/${req.file.id}`;
        const { data, error } = await supabase.storage.from("files").upload(path, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
        if(error) return next(error);
        req.file.path = data.path;
        await fileDb.uploadFile(req.file, folder, req.user);
        return res.redirect(`/folder/${folder.id}/${folder.name}`);
    },
    handleUploadErrors
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
        await supabase.storage.from("files").remove(file.url);
        await fileDb.deleteFile(file, req.user);
        return res.redirect(`/folder/${folder.id}/${folder.name}`);
    }
];

const downloadFileGet = async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/user/login");
    const file = await fileDb.getFileById(req.params.fileId, req.user);
    if(!file) throw new Error("File not found");
    const { data, error } = await supabase.storage.from("files").createSignedUrl(file.url, 60, { download: file.name });
    if (error) return next(error);
    return res.redirect(data.signedUrl);
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