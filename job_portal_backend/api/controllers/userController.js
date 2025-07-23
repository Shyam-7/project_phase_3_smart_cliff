const pool = require('../../db');

// Get user profile by user ID
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    
    // Get user basic info
    const [userRows] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', 
      [userId]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Get user profile info
    const [profileRows] = await pool.query(
      'SELECT * FROM job_seeker_profiles WHERE user_id = ?', 
      [userId]
    );
    
    const user = userRows[0];
    const profile = profileRows[0] || {};
    
    // Combine user and profile data to match Angular app expectations
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      headline: profile.headline || '',
      phone: profile.phone_number || '',
      location: profile.location || '',
      about: profile.bio || '',
      experience: profile.experience || '',
      education: profile.education || '',
      skills: profile.skills || '',
      coverLetter: profile.cover_letter || '',
      resume: profile.resume_url ? { 
        name: 'resume.pdf', 
        url: profile.resume_url 
      } : null,
      jobPreferences: {
        title: '',
        salary: '',
        workType: '',
        availability: 'Immediately'
      }
    };
    
    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile.', error });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('Updating profile for user:', userId);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      name,
      headline,
      phone,
      location,
      about,
      experience,
      education,
      skills,
      coverLetter,
      resume,
      jobPreferences
    } = req.body;
    
    console.log('Extracted cover letter:', coverLetter);
    
    // Update users table
    await pool.query(
      'UPDATE users SET name = ? WHERE id = ?',
      [name, userId]
    );
    
    console.log('Updated users table with name:', name);
    
    // Check if profile exists
    const [existingProfile] = await pool.query(
      'SELECT id FROM job_seeker_profiles WHERE user_id = ?',
      [userId]
    );
    
    console.log('Existing profile found:', existingProfile.length > 0);
    
    if (existingProfile.length > 0) {
      // Update existing profile
      console.log('Updating existing profile with cover letter:', coverLetter);
      await pool.query(
        `UPDATE job_seeker_profiles SET 
         bio = ?, 
         phone_number = ?, 
         experience = ?, 
         education = ?, 
         skills = ?,
         cover_letter = ?,
         resume_url = ?,
         location = ?,
         headline = ?,
         updated_at = NOW()
         WHERE user_id = ?`,
        [about, phone, experience, education, skills, coverLetter, resume?.url || null, location, headline, userId]
      );
      console.log('Profile updated successfully');
    } else {
      // Create new profile
      console.log('Creating new profile with cover letter:', coverLetter);
      await pool.query(
        `INSERT INTO job_seeker_profiles 
         (user_id, bio, phone_number, experience, education, skills, cover_letter, resume_url, location, headline) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, about, phone, experience, education, skills, coverLetter, resume?.url || null, location, headline]
      );
      console.log('Profile created successfully');
    }
    
    console.log('Profile update completed successfully');
    res.json({ message: 'Profile updated successfully!' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile.', error });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, u.address,
             p.phone_number, p.bio, p.skills,
             COUNT(a.id) as application_count
      FROM users u
      LEFT JOIN job_seeker_profiles p ON u.id = p.user_id
      LEFT JOIN applications a ON u.id = a.user_id AND a.status != 'Withdrawn'
      GROUP BY u.id, u.name, u.email, u.role, u.status, u.created_at, u.address, p.phone_number, p.bio, p.skills
      ORDER BY u.created_at DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users.', error });
  }
};

// Get user by ID (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [userRows] = await pool.query(
      'SELECT id, name, email, role, status, created_at FROM users WHERE id = ?',
      [id]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    const [profileRows] = await pool.query(
      'SELECT * FROM job_seeker_profiles WHERE user_id = ?',
      [id]
    );
    
    const user = userRows[0];
    const profile = profileRows[0] || {};
    
    res.json({
      ...user,
      profile: profile
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user.', error });
  }
};

// Update user status (Admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!['Active', 'Suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Active or Suspended.' });
    }
    
    // Check if user exists
    const [userExists] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (userExists.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Update user status
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    
    res.json({ message: `User status updated to ${status} successfully.` });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status.', error });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [userExists] = await pool.query('SELECT id, role FROM users WHERE id = ?', [id]);
    if (userExists.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Prevent deletion of admin users
    if (userExists[0].role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users.' });
    }
    
    // Start transaction to delete user and related data
    await pool.query('START TRANSACTION');
    
    try {
      // Delete related profile data
      await pool.query('DELETE FROM job_seeker_profiles WHERE user_id = ?', [id]);
      
      // Update applications to mark as deleted user (optional - maintain data integrity)
      await pool.query('UPDATE applications SET status = ? WHERE user_id = ?', ['User Deleted', id]);
      
      // Delete the user
      await pool.query('DELETE FROM users WHERE id = ?', [id]);
      
      await pool.query('COMMIT');
      
      res.json({ message: 'User deleted successfully.' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user.', error });
  }
};