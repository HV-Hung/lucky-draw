const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router.route("/checkin/:id").post(userController.userCheckIn);
router.route("/delete").post(userController.deleteUser);
router
  .route("/import")
  .post(upload.single("csvFile"), userController.importUser);

router
  .route("/:id")
  .get(userController.getOneUser)
  .patch(userController.updateUser);

module.exports = router;
