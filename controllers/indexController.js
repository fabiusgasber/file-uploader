const folderDb = require("../db/folder");

const indexGet = async (req, res) => {
    if(req.isAuthenticated()){
        const homeFolder = await folderDb.getHome(req.user);
        return res.render("pages/index", { homeFolder });
    } else {
        return res.redirect("/user/register");
    }
};

module.exports = {
    indexGet,
}