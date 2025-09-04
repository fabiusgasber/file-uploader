const prisma = require("../prisma/client.js");
const fs = require("fs/promises");

const FileDb = (() => {

    const getFileById = async (id) => {
        if(!id) throw new Error("Please provide a file id");
        return await prisma.file.findUniqueOrThrow({ where: { id }});
    };

    const uploadFile = async (file, folder) => {
        if(!file || !folder) throw new Error("Please provide a file and folder");
        return await prisma.file.create({ data: { name: file.originalname, size: file.size, extension: file.mimetype, url: file.path, folderId: folder.id }});
    };

    const updateFilename = async (file, name) => {
        if(!file || !name) throw new Error("Please provide a file and name");
        return await prisma.file.update({ where: { id: file.id }, data: { name }});
    };

    const deleteLocalFile = async (file) => {
        if(!file) throw new Error("Please provide a file to delete");
        await fs.unlink(file.url || file.path);
    };

    const deleteFile = async (file) => {
        if(!file) throw new Error("Please provide a file to delete");
        await prisma.file.delete({ where: { id: file.id }});
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