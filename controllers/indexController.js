const indexGet = (req, res) => {
    return req.isAuthenticated() ? res.render("pages/index") : res.redirect("/user/register");
};

module.exports = {
    indexGet,
}