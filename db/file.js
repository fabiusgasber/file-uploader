const prisma = require("../prisma/client.js");

const FileDb = (() => {

    const uploadFile = () => Promise.resolve("file uploaded") // tbc finish logic to upload to db

    return {
        uploadFile,
    }

})();

module.exports = FileDb;