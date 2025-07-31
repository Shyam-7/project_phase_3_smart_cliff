const pool = require('./db');

(async () => {
  try {
    const [categories] = await pool.query(`
      SELECT category, COUNT(*) as count FROM jobs WHERE category IS NOT NULL AND category != '' GROUP BY category ORDER BY count DESC
    `);
    console.log('Filtered categories:', categories);
  } catch (err) {
    console.error('Error:', err);
  }
  process.exit();
})();
