const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide unique Usename"],
    unique: [true, "Username exist"],
  },
  password: {
    type: String,
    required: [true, "Please provide unique Password"],
    unique: false,
  },
  email: {
    type: String,
    required: [true, "Please provide unique Email"],
    unique: [true, "Email exist"],
  },
  firstName: { type: String },
  lastName: { type: String },
  mobile: { type: Number },
  address: { type: String },
  profile: { type: String },
});

//bcrypt password
UserSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    next();
  }
  try {
    const saltround = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(user.password, saltround);
    user.password = hashPassword;
  } catch (error) {
    next(error);
  }
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
