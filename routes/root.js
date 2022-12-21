const express = require("express");
const userController = require("../controllers/userController");
const Admin = require("../models/Admin");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

const router = express.Router();

router.get("/", (req, res) => {
  res.render("luckydraw/index");
  // const cookies = req.cookies;

  // if (!cookies?.jwt) return res.render("auth/login");

  // const accessToken = cookies.jwt;

  // jwt.verify(
  //   accessToken,
  //   process.env.REFRESH_TOKEN_SECRET,
  //   asyncHandler(async (err, decoded) => {
  //     if (err) return res.status(403).json({ message: "Forbidden" });

  //     const foundAdmin = await Admin.findOne({
  //       email: decoded.info.email,
  //     });

  //     if (!foundAdmin) return res.render("auth/login");

  //   })
  // );
});
router.get("/user", async (req, res) => {
  const users = await User.find();
  res.render("user/user", { users: users });
});
router.get("/login", (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.render("auth/login");

  const accessToken = cookies.jwt;

  jwt.verify(
    accessToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const foundAdmin = await Admin.findOne({
        email: decoded.info.email,
      });

      if (!foundAdmin) return res.render("auth/login");

      res.render("luckydraw/index");
    })
  );
});
router.get("/luckynumber", userController.drawLuckyNumber);

module.exports = router;
