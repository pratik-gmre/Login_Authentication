const UserModel = require("../model/Usermodel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpgenerator = require("otp-generator");

const verifyUser = async (req, res, next) => {
  try {
    const { username } = req.method == "GET" ? req.query : req.body;

    let exist = await UserModel.findOne({ username });
    if (!exist) return res.status(404).send({ error: "Cannot find user" });
    next();
  } catch (error) {
    return res.status(404).send({ error: "Authentication Error" });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password, profile } = req.body;

    const Userexist = await UserModel.findOne({ username });
    if (Userexist) {
      return res.status(400).json({
        error: "Username already exists. Please choose a different one.",
      });
    }
    const emailExists = await UserModel.findOne({ email });
    if (emailExists) {
      return res
        .status(400)
        .json({ error: "Email already exists. Please use a different one." });
    }

    const newUser = new UserModel({ username, email, password });
    await newUser.save();
    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Specify the expiration time in hours
    );

    // Send successful login response with token
    res.status(200).json({
      msg: "Login successful",
      username: user.username,
      token: token,
    });
  } catch (error) {
    // Handle any unexpected errors
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUser = async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).send({ error: "Invalid username" });
  }

  try {
    // Use await to wait for the UserModel.findOne() promise to resolve
    const user = await UserModel.findOne({ username });

    if (!user) {
      // Handle case when user is not found
      return res.status(404).send({ error: "User not found" });
    }

    // Return user data if found
    return res.status(200).send(user);
  } catch (error) {
    // Handle any errors that occur during the database query
    return res.status(500).send({ error: "Internal Server Error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.user; // Corrected destructuring
    console.log("Authenticated User:", req.user);

    // Check if userId exists and is valid
    if (!userId) { // Changed id to userId
      return res.status(400).send({ error: "User ID is required" });
    }

    const body = req.body;

    // Update the user data
    const user = await UserModel.findByIdAndUpdate(userId, body, { // Changed { _id: userId } to userId
      new: true,
    });

    // Check if user exists and was updated
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Return success response
    return res.status(200).send({ msg: "Record updated successfully", user });
  } catch (error) {
    // Handle errors
    console.error("Error updating user:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
};


const generateOTP = async (req, res) => {
  req.app.locals.OTP = otpgenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
  res.status(201).send({ code: req.app.locals.OTP });
};

const verifyOTP = async (req, res) => {
  const { code } = req.query;
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null; //reset OTP value
    req.app.locals.resetSession = true; //start session for reset password
    return res.status(200).json({ msg: "verify success" });
  }
  return res.status(400).json({ error: "invalid otp" });
};

const createResetSession = async (req, res) => {
  if (req.app.locals.resetSession) {
    res.app.locals.resetSession = false;
    return res.status(201).send({ msg: "access granted" });
  }
  return res.status(440).send({ error: "Session expired" });
};

const resetPassword = async (req, res) => {
  try {
    // Check if the reset session is valid
    if (!req.app.locals.resetSession) {
      return res.status(440).send({ error: "Session expired" });
    }

    const { username, password } = req.body;

    // Attempt to find the user by username
    const user = await UserModel.findOne({ username });

    // If user is not found, return 404 error
    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    // Hash the new password
    const hashPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    try {
      await UserModel.updateOne(
        { username: user.username },
        { password: hashPassword }
      );
      return res.status(201).send({ msg: "Password updated successfully" });
    } catch (error) {
      return res.status(500).send({ msg: "Unable to update password" });
    }
  } catch (error) {
    return res.status(500).send({ msg: "Internal server error" });
  }
};

module.exports = {
  register: register,
  login: login,
  getUser: getUser,
  updateUser: updateUser,
  verifyUser: verifyUser,
  generateOTP: generateOTP,
  verifyOTP: verifyOTP,
  resetPassword: resetPassword,
};
