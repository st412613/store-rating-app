const express = require('express');
const pool = require('../config/db');
const { authenticate, restrictTo } = require('../middleware/auth');
const router = express.Router();

router.use(authenticate, restrictTo('normal'));

// Get all stores with search
router.get('/stores', async (req, res) => {
  const { name, address, sortBy = 'name', order = 'ASC' } = req.query;
  let query = `
    SELECT s.id, s.name, s.address, AVG(r.rating) as overall_rating,
           (SELECT rating FROM ratings WHERE store_id = s.id AND user_id = $1) as user_rating
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE 1=1
  `;
  const params = [req.user.id];

  if (name) {
    params.push(`%${name}%`);
    query += ` AND s.name ILIKE $${params.length}`;
  }
  if (address) {
    params.push(`%${address}%`);
    query += ` AND s.address ILIKE $${params.length}`;
  }

  query += ` GROUP BY s.id, s.name, s.address ORDER BY ${sortBy} ${order}`;
  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stores' });
  }
});

// Submit or update rating
router.post('/stores/:storeId/rating', async (req, res) => {
  const { rating } = req.body;
  const { storeId } = req.params;

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const existingRating = await pool.query(
      'SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2',
      [req.user.id, storeId]
    );

    if (existingRating.rows.length > 0) {
      await pool.query(
        'UPDATE ratings SET rating = $1 WHERE user_id = $2 AND store_id = $3',
        [rating, req.user.id, storeId]
      );
    } else {
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
        [req.user.id, storeId, rating]
      );
    }
    res.json({ message: 'Rating submitted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error submitting rating' });
  }
});

module.exports = router;