const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

router.route("/").post(authController.adminLogin);

router.route("/refresh").get(authController.adminRefresh);

router.route("/logout").post(authController.logout);
module.exports = router;
