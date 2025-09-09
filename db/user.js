const prisma = require("../prisma/client.js");
const bcrypt = require("bcryptjs");

const UserDb = (() => {
  const getUsers = async () => await prisma.user.findMany();
  const getUserById = async (id) =>
    await prisma.user.findUnique({ where: { id } });
  const getUserByUsername = async (username) =>
    await prisma.user.findUnique({ where: { username } });
  const createUser = async (username, password) =>
    await prisma.user.create({ data: { username, password } });
  const validatePassword = async (user, password) =>
    await bcrypt.compare(password, user.password);

  return {
    getUsers,
    getUserById,
    getUserByUsername,
    createUser,
    validatePassword,
  };
})();

module.exports = UserDb;
