const User = require("../models/User");
const asyncHandler = require("express-async-handler");
const short = require("short-uuid");
const { json } = require("express");

const createUser = asyncHandler(async (req, res) => {
  const { email, name, company_id } = req.body;
  if (!email || !name || !company_id)
    return res.status(400).json("email, name, company_id are required!");

  const foundUser = await User.findOne({ email: email });
  if (foundUser) return res.status(400).json({ message: "email is existed" });

  const user = await User.create({
    email: email,
    name: name,
    company_id: "company_id",
    code: short.generate(),
  });

  if (user) {
    res.status(201).json({ message: `${email} register successfully` });
  } else {
    res.status(400);
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  if (!users) return res.status(400).json({ message: "No users found" });

  res.json(users);
});
const getOneUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) return res.status(400).json({ message: "No users found" });
  res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { email, name, company_id } = req.body;
  if (!email || !name || !company_id)
    return res.status(400).json("email, name, company_id are required!");

  const user = await User.findById(id);
  if (!user) return res.status(400).json({ message: "user not found" });
  user.name = name;
  user.email = email;
  user.company_id = company_id;
  await user.save();
  res.json({ message: `${name} updated` });
});

const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) return res.status(400).json("User id is required!");
  const user = await User.findById(id).exec();
  if (!user) return res.status(400).json({ message: "User not found" });
  user.active = false;
  user.save();

  res.json(`${result.name} is deleted!`);
});
const userCheckout = asyncHandler(async (req, res) => {
  const code = req.params.code;
  const maxNumberOfUsers = 1000;

  const user = await User.findOne({ code: code });
  if (!user) return res.status(400).json({ message: "user not found" });

  const usersHaveLuckyNumbers = await User.find({
    lucky_number: { $exists: true },
  });
  if (usersHaveLuckyNumbers.length > maxNumberOfUsers)
    return res.json("No lucky number");

  let luckyNumber = Math.floor(Math.random() * maxNumberOfUsers);
  if (!user.lucky_number) {
    let users = await User.find({ lucky_number: luckyNumber });
    while (users.length > 0) {
      luckyNumber = Math.floor(Math.random() * maxNumberOfUsers);
      users = await User.find({ lucky_number: luckyNumber });
    }
    user.lucky_number = luckyNumber;
  }

  user.last_checkout = Date.now();
  const newUser = await user.save();
  res.json(newUser);
});
const drawLuckyNumber = asyncHandler(async (req, res) => {
  const users = await User.find({ lucky_number: { $exists: true } });
  if (!users) return res.status(400).json({ message: "user not found" });
  const luckyUser = users[Math.floor(Math.random() * users.length)];
  res.json(luckyUser);
});

module.exports = {
  createUser,
  getAllUsers,
  getOneUser,
  updateUser,
  deleteUser,
  userCheckout,
  drawLuckyNumber,
};
