const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

router.route("/").post(authController.adminLogin);

router.route("/refresh").get(authController.adminRefresh);

router.route("/logout").post(authController.logout);
router.route("/register").post(userController.register);
router.route("/userlogin").post(authController.userLogin);
module.exports = router;
