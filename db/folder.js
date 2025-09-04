const prisma = require("../prisma/client");

const FolderDb = (() => {

    const populateFolders = async () => {
        const home = await prisma.folder.create({ data: { name: "home", protected: true }});
        await prisma.folder.createMany({
            data: [
                { name: "audios", parentId: home.id },
                { name: "documents", parentId: home.id },
                { name: "images", parentId: home.id },
                { name: "videos", parentId: home.id },
            ]
        })
    };

    const createFolder = async (name, parent) => await prisma.folder.create({ data: { name, parentId: parent.id }});

    const getHome = async () => await prisma.folder.findFirstOrThrow({ where: { protected: true }, include: { subfolders: true, files: true }});

    const getFolderById = async (id) => await prisma.folder.findFirstOrThrow({ where: { id }, include: { parent: true, subfolders: true, files: true }});

    const getFolderByName = async (name) => await prisma.folder.findUnique({ where: { name }});

    const updateFoldername = async (folder, name) => await prisma.folder.update({ where: { id: folder.id }, data: { name }})

    const deleteFolder = async (id) => await prisma.folder.delete({ where: { id, protected: false }});

    return {
        populateFolders,
        createFolder,
        getFolderById,
        getFolderByName,
        updateFoldername,
        deleteFolder,
        getHome
    }
})();

module.exports = FolderDb;