const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router.route("/checkout/:code").get(userController.userCheckout);

router
  .route("/:id")
  .get(userController.getOneUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
