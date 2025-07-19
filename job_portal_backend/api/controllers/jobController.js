const pool = require('../../db');

// Get all active jobs
exports.getAllJobs = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE status = "active" ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs.', error });
  }
};

// Get a single job by its ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM jobs WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching job details.', error });
  }
};