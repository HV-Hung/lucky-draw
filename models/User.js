const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    require: true,
  },

  email: {
    type: String,
    require: true,
  },

  name: {
    type: String,
    require: true,
  },
  code: {
    type: String,
    require: true,
  },
  luckyNumber: {
    type: Number,
  },

  lastCheckout: {
    type: Date,
  },
});

module.exports = mongoose.model("User", UserSchema);
