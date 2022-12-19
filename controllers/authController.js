const Admin = require("../models/Admin");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email, password are required!" });
  }
  const foundAdmin = await Admin.findOne({ email }).exec();
  if (!foundAdmin) return res.status(401).json({ message: "Unauthorized" });

  const match = await bcrypt.compare(password, foundAdmin.password);

  if (!match) return res.status(401).json({ message: "Unauthorized" });

  // const accessToken = jwt.sign(
  //   {
  //     Info: {
  //       email: foundAdmin.email,
  //     },
  //   },
  //   process.env.ACCESS_TOKEN_SECRET
  // );

  const accessToken = jwt.sign(
    {
      info: {
        email: foundAdmin.email,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("jwt", accessToken, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ accessToken, foundAdmin });
});

const adminRefresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });

      const foundAdmin = await Admin.findOne({
        email: decoded.AdminInfo.email,
      });

      if (!foundAdmin) return res.status(401).json({ message: "Unauthorized" });

      const accessToken = jwt.sign(
        {
          AdminInfo: {
            email: foundAdmin.email,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      res.json({ accessToken, foundAdmin });
    })
  );
};

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email, password are required!" });
  }
  const foundUser = await User.findOne({ email }).populate("tickets");
  if (!foundUser || !foundUser.active)
    return res.status(401).json({ message: "Unauthorized" });

  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return res.status(401).json({ message: "Unauthorized" });

  const accessToken = jwt.sign(
    {
      Info: {
        email: foundUser.email,
      },
    },
    process.env.ACCESS_TOKEN_SECRET
  );

  const refreshToken = jwt.sign(
    {
      Info: {
        email: foundUser.email,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    sameSite: "none",
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ accessToken, foundUser });
});

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(204);

  res.clearCookie("jwt", { httpOnly: true, sameSite: "None" });
  res.json({ message: "Cookie cleared" });
};

module.exports = { adminLogin, adminRefresh, logout, userLogin };
