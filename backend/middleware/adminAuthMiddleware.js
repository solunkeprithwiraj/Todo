const jwt = require("jsonwebtoken");
const User = require("../models/User");


const protectAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = { protectAdmin };
