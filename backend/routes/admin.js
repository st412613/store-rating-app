const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { authenticate, restrictTo } = require("../middleware/auth");
const router = express.Router();

// Admin routes restricted to 'admin' role
router.use(authenticate, restrictTo("admin"));

// Add new user
router.post("/users", async (req, res) => {
  const { name, email, address, password, role } = req.body;
  if (!["admin", "normal", "store_owner"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (name, email, address, password, role) VALUES ($1, $2, $3, $4, $5)",
      [name, email, address, hashedPassword, role]
    );
    res.status(201).json({ message: "User added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding user" });
  }
});

// Add new store
router.post("/stores", async (req, res) => {
  const { name, email, address, owner_id } = req.body;
  try {
    await pool.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4)",
      [name, email, address, owner_id]
    );
    res.status(201).json({ message: "Store added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error adding store" });
  }
});

// Get dashboard data
router.get("/dashboard", async (req, res) => {
  try {
    const users = await pool.query("SELECT COUNT(*) FROM users");
    const stores = await pool.query("SELECT COUNT(*) FROM stores");
    const ratings = await pool.query("SELECT COUNT(*) FROM ratings");
    res.json({
      totalUsers: users.rows[0].count,
      totalStores: stores.rows[0].count,
      totalRatings: ratings.rows[0].count,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching dashboard stats" });
    console.error("Dashboard Error:", error);
  }
});

// Get all users with filters
router.get("/users", async (req, res) => {
  const {
    name,
    email,
    address,
    role,
    sortBy = "name",
    order = "ASC",
  } = req.query;
  let query = "SELECT id, name, email, address, role FROM users WHERE 1=1";
  const params = [];

  if (name) {
    params.push(`%${name}%`);
    query += ` AND name ILIKE $${params.length}`;
  }
  if (email) {
    params.push(`%${email}%`);
    query += ` AND email ILIKE $${params.length}`;
  }
  if (address) {
    params.push(`%${address}%`);
    query += ` AND address ILIKE $${params.length}`;
  }
  if (role) {
    params.push(role);
    query += ` AND role = $${params.length}`;
  }

  query += ` ORDER BY ${sortBy} ${order}`;
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Get all stores with filters
router.get("/stores", async (req, res) => {
  const { name, email, address, sortBy = "name", order = "ASC" } = req.query;
  let query = `
    SELECT s.id, s.name, s.email, s.address, AVG(r.rating) as rating
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE 1=1
  `;
  const params = [];

  if (name) {
    params.push(`%${name}%`);
    query += ` AND s.name ILIKE $${params.length}`;
  }
  if (email) {
    params.push(`%${email}%`);
    query += ` AND s.email ILIKE $${params.length}`;
  }
  if (address) {
    params.push(`%${address}%`);
    query += ` AND s.address ILIKE $${params.length}`;
  }

  query += ` GROUP BY s.id, s.name, s.email, s.address ORDER BY ${sortBy} ${order}`;
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Error fetching stores" });
  }
});

module.exports = router;
