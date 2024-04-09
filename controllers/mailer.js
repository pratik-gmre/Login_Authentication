const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

// Configuration for nodemailer
let nodeConfig = {
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
};

let transporter = nodemailer.createTransport(nodeConfig);

let Mailgenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js",
  },
});

const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  // Body of the email
  var email = {
    body: {
      name: username,
      intro: text || "Welcome to our platform!",
      outro: "Thank you for registering with us.",
    },
  };

  // Generate email body
  var emailBody = Mailgenerator.generate(email);

  let message = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: subject || "Signup Successful",
    html: emailBody,
  };

  // Send email
  await transporter.sendMail(message);
  try {
    return res.status(200).send({ msg: "You should receive an email from us" });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).send({ error: "Failed to send email" });
  }
};

module.exports = registerMail;
