const { Router } = require("express");
const router = new Router();

const userController = require("../controllers/userController.js");

router.get("/register", userController.registerGet);
router.post("/register", userController.registerPost);
router.get("/login", userController.loginGet);
router.post("/login", userController.loginPost);
router.get("/logout", userController.logoutGet);

module.exports = router;