const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const { registerUser, loginUser, changePassword } = require("../controllers/auth-controller")

// all routes are related to authentication & authorization

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", authMiddleware, changePassword);

module.exports = router;
