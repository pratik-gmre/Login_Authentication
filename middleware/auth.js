const jwt = require("jsonwebtoken");

const Auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = decodedToken; // corrected res to req
    next();
  } catch (error) {
    console.error("Authentication Error:", error); // Log the error
    return res.status(401).json({ error: "Authentication Failed" });
  }
};

const localVariable = async (req, res, next) => {
  req.app.locals = {
    OTP: null,
    resetSession: false,
  };
  next();
};

module.exports = { Auth: Auth, 
  localVariable: localVariable
 };
