const prisma = require("../prisma/client.js");
const fs = require("fs/promises");

const FileDb = (() => {

    const getFileById = async (id, user) => {
        if(!id || !user) throw new Error("Please provide a file id and valid user");
        return await prisma.file.findUniqueOrThrow({ where: { id, userId: user.id }});
    };

    const uploadFile = async (file, folder, user) => {
        if(!file || !folder || !user) throw new Error("Please provide a file, folder and valid user to upload file");
        return await prisma.file.create({ data: { userId: user.id, name: file.originalname, size: file.size, extension: file.mimetype, url: file.path, folderId: folder.id }});
    };

    const updateFilename = async (file, name, user) => {
        if(!file || !name || !user) throw new Error("Please provide a file, name and valid user to update file name");
        return await prisma.file.update({ where: { id: file.id, userId: user.id }, data: { name }});
    };

    const deleteLocalFile = async (file) => {
        if(!file) throw new Error("Please provide a file to delete file");
        await fs.unlink(file.url || file.path);
    };

    const deleteFile = async (file, user) => {
        if(!file || !user) throw new Error("Please provide a file and valid user to delete file");
        await prisma.file.delete({ where: { id: file.id, userId: user.id }});
    };


    return {
        uploadFile,
        getFileById,
        updateFilename,
        deleteFile,
        deleteLocalFile
    };

})();

module.exports = FileDb;