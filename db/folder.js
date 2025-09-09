const prisma = require("../prisma/client");

const FolderDb = (() => {
  const populateFolders = async (user) => {
    await prisma.$transaction(async (tx) => {
      const home = await tx.folder.create({
        data: { name: "home", protected: true, userId: user.id },
      });
      await tx.folder.createMany({
        data: [
          { name: "audios", parentId: home.id, userId: user.id },
          { name: "documents", parentId: home.id, userId: user.id },
          { name: "images", parentId: home.id, userId: user.id },
          { name: "videos", parentId: home.id, userId: user.id },
        ],
      });
    });
  };

  const createFolder = async (name, parent, user) =>
    await prisma.folder.create({
      data: { name, parentId: parent.id, userId: user.id },
    });

  const getHome = async (user) =>
    await prisma.folder.findFirstOrThrow({
      where: { protected: true, userId: user.id },
      include: { subfolders: true, files: true },
    });

  const getFolderById = async (id, user) =>
    await prisma.folder.findFirstOrThrow({
      where: { id, userId: user.id },
      include: { parent: true, subfolders: true, files: true },
    });

  const getFolderByName = async (name, user) =>
    await prisma.folder.findUnique({ where: { name, userId: user.id } });

  const updateFoldername = async (folder, name, user) =>
    await prisma.folder.update({
      where: { id: folder.id, userId: user.id },
      data: { name },
    });

  const deleteFolder = async (id, user) =>
    await prisma.folder.delete({
      where: { id, protected: false, userId: user.id },
    });

  return {
    populateFolders,
    createFolder,
    getFolderById,
    getFolderByName,
    updateFoldername,
    deleteFolder,
    getHome,
  };
})();

module.exports = FolderDb;
