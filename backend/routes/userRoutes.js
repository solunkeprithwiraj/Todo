const express = require("express");
const { registerUser,loginUser, verifyEmail } = require("../controllers/userController");


const router = express.Router();

// Signup Route
router.post("/signup", registerUser);
router.post("/login", loginUser);

router.get("/verify-email", verifyEmail);



module.exports = router;
