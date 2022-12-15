const Admin = require("../models/Admin");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const createNewAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "email, password are required!" });

  const foundAdmin = await Admin.findOne({ email: email });
  if (foundAdmin) return res.status(400).json({ message: "email is existed" });

  const hashPassword = await bcrypt.hash(password, 10);
  const admin = await Admin.create({
    email: email,
    password: hashPassword,
  });

  if (admin) {
    res.status(201).json({ message: `${email} created` });
  } else {
    res.status(400);
  }
});

module.exports = {
  createNewAdmin,
};
