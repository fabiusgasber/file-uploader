const { Router } = require("express");
const router = new Router();
const indexController = require("../controllers/indexController.js");

router.get("/", indexController.indexGet);

module.exports = router;