const folderDb = require("../db/folder.js");
const { body, validationResult } = require("express-validator");

const folderController = (() => {

const validateFolderCreate = [
    body("folderName").trim().notEmpty().withMessage("Folder name is required.")
];

const validateFolderDelete = [
    body("deleteMsg").trim().notEmpty().withMessage("Delete message is required.")
];

const validateFolderEdit = [
    body("updatedFoldername").trim().isLength({ min: 1, max: 15 }).withMessage("New folder name must be between 1 and 15 characters.")
];

const folderGet = async (req, res) => {
    if(!req.isAuthenticated()) return res.redirect("/user/login");
    const folder = await folderDb.getFolderById(req.params.folderId);
    return res.render("pages/folder", { folder });
};

const homeFolderGet = async (req, res) => {
    if(!req.isAuthenticated()) return res.redirect("/user/login");
    const home = await folderDb.getHome(req.user);
    return res.render("pages/folder", { folder: home });
};

const folderCreateGet = async (req, res) => {
    if(!req.isAuthenticated()) return res.redirect("/user/login");
    const parentFolder = await folderDb.getFolderById(req.params.folderId);
    return res.render("pages/folderCreate", { parentFolder });
};

const folderCreatePost = [
    validateFolderCreate,
    async (req, res, next) => {
        const errors = validationResult(req);
        const parentFolder = await folderDb.getFolderById(req.params.folderId);
        try {
            if(!errors.isEmpty()) return res.render("pages/folderCreate", { parentFolder, errors: errors.array() });
            const createdFolder = await folderDb.createFolder(req.body.folderName, parentFolder);
            return res.redirect(`/folder/${createdFolder.id}/${createdFolder.name}`);
        } catch (err) {
            console.error(err);
            if(err.code === "P2002"){
                return res.render("pages/folderCreate", { parentFolder, errors: [{ msg: `Folder ${req.body.folderName} already exists.` }] });
            }
            else {
                return next(err);
            }
        }
    }
];

const folderEditGet = async (req, res) => {
    if(!req.isAuthenticated()) return res.redirect("/user/login");
    const folder = await folderDb.getFolderById(req.params.folderId);
    return res.render("pages/folderEdit", { folder });
};

const folderEditPost = [
    validateFolderEdit,
    async (req, res, next) => {
        const errors = validationResult(req);
        const folder = await folderDb.getFolderById(req.params.folderId);
    try {
        if(!errors.isEmpty()) return res.render("pages/folderEdit", { folder, errors: errors.array() });
        const updatedFolder = await folderDb.updateFoldername(folder, req.body.updatedFoldername);
        return res.redirect(`/folder/${updatedFolder.id}/${updatedFolder.name}`);
    } catch (err) {
            console.error(err);
            if(err.code === "P2002"){
                return res.render("pages/folderEdit", { folder, errors: [{ msg: `Folder ${req.body.updatedFoldername} already exists.` }] });
            }
            else {
                next(err);
            }
        }
    }
];

const folderDeleteGet = async (req, res) => {
    if(!req.isAuthenticated()) return res.redirect("/user/login");
    const homeFolder = await folderDb.getHome();
    const folder = await folderDb.getFolderById(req.params.folderId);
    return String(folder.id) === String(homeFolder.id) ? 
    res.redirect(`/folder/${folder.id}/${folder.name}`) : 
    res.render("pages/folderDelete", { folder });
};

const folderDeletePost = [
    validateFolderDelete,
    async (req, res) => {
        const folder = await folderDb.getFolderById(req.params.folderId);
        const homeFolder = await folderDb.getHome();
        const errors = validationResult(req);
        if(!errors.isEmpty()) return res.render("pages/folderDelete", { folder, errors: errors.array() });
        if(String(homeFolder.id) === String(folder.id)) return res.render("pages/folderDelete", { folder, errors: [{ msg: "Not allowed to delete home folder."}] });
        if(String(req.body.deleteMsg) !== "delete folder") return res.render("pages/folderDelete", { folder, errors: [{ msg: "Incorrect delete message."}] });
        await folderDb.deleteFolder(folder.id, req.user);
        return res.redirect(`/folder/${homeFolder.id}/${homeFolder.name}`)
    }
];

return { 
    folderGet, 
    homeFolderGet,
    folderEditGet,
    folderEditPost,
    folderCreateGet,
    folderCreatePost,
    folderDeleteGet,
    folderDeletePost
}

})();

module.exports = folderController;