const { query } = require("../db");

/**
 * GET /api/users
 * Returns all users.
 */
async function getAllUsers(_req, res, next) {
  try {
    const users = await query("SELECT * FROM users ORDER BY created_at DESC");
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/users
 * Body: { email, name, organization?, profile_pic_url? }
 * Creates a new user.
 */
async function createUser(req, res, next) {
  const { email, name, organization, profile_pic_url } = req.body;
  if (!email || !name) {
    return res.status(400).json({ message: "email and name are required" });
  }

  try {
    const rows = await query(
      `INSERT INTO users (email, name, organization, profile_pic_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [email, name, organization || null, profile_pic_url || null]
    );
    res.status(201).json({ user: rows[0] });
  } catch (err) {
    // handle unique violation
    if (err.code === "23505") {
      return res
        .status(409)
        .json({ message: "User with that email already exists" });
    }
    next(err);
  }
}

async function checkUser(req, res, next) {
  const { email } = req.body;
  console.log("Checking user with email:", email);
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }
  try {
    const rows = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (rows.length) {
      return res.json({ exists: true, user: rows[0] });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllUsers, createUser, checkUser };
