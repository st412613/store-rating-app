const express = require("express");
const pool = require("../config/db");
const { authenticate, restrictTo } = require("../middleware/auth");
const router = express.Router();

router.use(authenticate, restrictTo("store_owner"));

// Get store ratings
router.get("/ratings", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT u.name, r.rating
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = $1
      `,
      [req.user.id]
    );

    const avgRating = await pool.query(
      `
      SELECT AVG(r.rating) as average_rating
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE s.owner_id = $1
      `,
      [req.user.id]
    );

    res.json({
      ratings: result.rows,
      averageRating: avgRating.rows[0].average_rating,
    });
  } catch (error) {
    res.status(500).json({ error: "Error fetching ratings" });
  }
});

module.exports = router;
