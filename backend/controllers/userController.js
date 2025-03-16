const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendVerificationEmail = require("../utils/sendMail");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generateToken");

// @desc    Register a new user
// @route   POST /signup
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    
    const token = req.headers.authorization?.split(" ")[1]; 

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
          return res.status(401).json({ error: "User not found" });
        }
      } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
      }
    }

    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = await bcrypt.hash(verificationToken, 10);
    

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
      verificationToken: hashedVerificationToken,
      verificationTokenExpires: Date.now() + 3600000,
    });
if (Date.now() > existingUser.verificationTokenExpires) {
  
  return res.status(400).send("Token has expired");
    }
    existingUser.verificationToken = null; 
    await newUser.save();

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: "User created successfully   check email for verification",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).send("Invalid or expired token.");
    }

    if (user.verificationTokenExpires < Date.now()) {
      return res
        .status(400)
        .send("Verification token expired. Please sign up again.");
    }

    
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

   

    res.send("Email verified successfully. You can now log in.");
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).send("Server error.");
  }
};

// @desc    Authenticate user
// @route   POST /login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExist = await User.findOne({ email: email });
    console.log("userExist", userExist);
    if (!userExist) {
      return res.status(400).json({ error: "User does not exist" });
    }

    console.log("email: ", email);
    console.log("pass: ", password);

    if (!userExist.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    const isMatch =  userExist.isValidPassword(password);

    if (!isMatch) {
      return res.status(403).json({error: "Invalid Password"})
    }
    const token = generateToken(userExist.id);

    res.json({
      message: "User authenticated successfully",
      user: {
        id: userExist._id,
        name: userExist.name,
        email: userExist.email,
        isAdmin: userExist.isAdmin,
        token,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports = { registerUser, loginUser, verifyEmail };
