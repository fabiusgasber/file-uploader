const userDb = require("../db/user.js");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("../config/passport.js");

const isUsernameNotInUse = async (value) => {
    const user = await userDb.getUserByUsername(value);
    if(user) throw new Error("Username already in use.");
    return true;
}

const confirmPassword = (value, { req }) => {
    if(value !== req.body.password) throw new Error("Passwords do not match.");
    return true;
}

const validateUser = [

body("username").trim()
.isAlphanumeric().withMessage("Username must only contain letters and/or numbers.")
.isLength({ min: 3, max: 15 }).withMessage("Username must be between 3 and 15 characters.")
.custom(isUsernameNotInUse),

body("password").trim().isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),

body("confirm-password").trim().custom(confirmPassword),

]

const registerGet = (req, res) => {
    return res.render("pages/register");
};

const registerPost = [
    validateUser,
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).render("pages/register", { errors: errors.array() });
        }
        const { username, password } = req.body;
        const hashedPw = await bcrypt.hash(password, 10);
        await userDb.createUser(username, hashedPw);
        res.redirect("/user/login");
    }
];

const loginGet = (req, res) => {
    return res.render("pages/login");
};

const loginPost = (req, res, next) => {
passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/login",
    failureMessage: true
})(req, res, next);
};

const logoutGet = (req, res, next) => {
    req.logout((err) => {
        if(err) next(err);
        res.redirect("/user/login");
    })
}

module.exports = {
    registerGet,
    registerPost,
    loginGet,
    loginPost,
    logoutGet,
};