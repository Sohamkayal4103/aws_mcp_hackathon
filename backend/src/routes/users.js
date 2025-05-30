const express = require("express");
// const checkJwt = require("../middleware/auth");
const { getAllUsers, createUser, checkUser } = require("../controllers/users");

const router = express.Router();

// List all users (protected)
router.get("/", getAllUsers);

// Create a user (protected)
router.post("/", createUser);

router.post("/check", checkUser);

module.exports = router;
