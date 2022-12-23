const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
  },

  name: {
    type: String,
    require: true,
  },
  company_id: {
    type: String,
    require: true,
  },
  code: {
    type: String,
    require: true,
  },
  lucky_number: {
    type: Number,
  },

  qr_code: {
    type: String,
    require: true,
  },
  last_check_in: {
    type: Date,
  },
});

module.exports = mongoose.model("User", UserSchema);
