const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { authenticate } = require("../middleware/auth");
const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  const { name, email, address, password, role } = req.body;

  try {
    if (!name || !email || !address || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (name.length < 20 || name.length > 60) {
      return res
        .status(400)
        .json({ error: "Name must be between 20 and 60 characters" });
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (address.length > 400) {
      return res
        .status(400)
        .json({ error: "Address must be under 400 characters" });
    }
    if (
      !/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(password)
    ) {
      return res
        .status(400)
        .json({
          error:
            "Password must be 8-16 characters with at least one uppercase and one special character",
        });
    }

    // Role validation
    const allowedRoles = ["normal", "store_owner", "admin"];
    const userRole = allowedRoles.includes(role) ? role : "normal";

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (name, email, address, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, address, hashedPassword, userRole]
    );
    res
      .status(201)
      .json({ message: "User registered successfully", role: userRole });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    if (error.code === "23514") {
      return res
        .status(400)
        .json({ error: "Database validation failed: " + error.message });
    }
    res.status(500).json({ error: "Server error: " + error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Error logging in: " + error.message });
  }
});

// Update Password
router.put("/update-password", authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const result = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, result.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid old password" });
    }

    if (
      !/^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/.test(newPassword)
    ) {
      return res
        .status(400)
        .json({ error: "New password must meet requirements" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      req.user.id,
    ]);

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res
      .status(500)
      .json({ error: "Error updating password: " + error.message });
  }
});

module.exports = router;
