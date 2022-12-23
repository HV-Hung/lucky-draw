const express = require("express");
const userController = require("../controllers/userController");
require("dotenv").config();
const configPassport = require("../config/passport-config");
const db = require("../config/database");

const router = express.Router();

router.get("/", configPassport.checkAuthenticated, (req, res) => {
  res.render("luckydraw/index");
});
router.get("/user", configPassport.checkAuthenticated, (req, res) => {
  var sql = "select * from user";
  var params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.render("user/user", { users: rows });
  });
});
router.get("/login", configPassport.checkNotAuthenticated, (req, res) => {
  res.render("auth/login");
});
router.get("/luckynumber", userController.drawLuckyNumber);

module.exports = router;
