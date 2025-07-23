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
      SELECT u.id, u.name, u.email, u.role, u.status, u.created_at,
             p.phone_number, p.bio, p.skills
      FROM users u
      LEFT JOIN job_seeker_profiles p ON u.id = p.user_id
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

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id; // Admin user ID from JWT
    
    console.log('Deleting user:', id, 'by admin:', adminId);

    // Check if user exists
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent admin from deleting themselves
    if (id === adminId) {
      return res.status(400).json({ message: 'Admin cannot delete their own account.' });
    }

    // Prevent deleting other admin users
    if (existingUser[0].role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users.' });
    }

    // Check if user has applications
    const [applications] = await pool.query(
      'SELECT COUNT(*) as count FROM applications WHERE user_id = ?',
      [id]
    );

    const applicationCount = applications[0].count;

    // Delete related records first (due to foreign key constraints)
    if (applicationCount > 0) {
      await pool.query('DELETE FROM applications WHERE user_id = ?', [id]);
    }

    // Delete job seeker profile if exists
    await pool.query('DELETE FROM job_seeker_profiles WHERE user_id = ?', [id]);

    // Delete the user
    await pool.query('DELETE FROM users WHERE id = ?', [id]);

    console.log('User deleted successfully:', id);
    res.json({ 
      message: 'User deleted successfully!',
      deleted: true,
      applicationCount 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user.', error });
  }
};

// Update user status (Admin only)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user.id;

    console.log('Updating user status:', id, 'to:', status, 'by admin:', adminId);

    // Check if user exists
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent admin from updating their own status
    if (id === adminId) {
      return res.status(400).json({ message: 'Admin cannot update their own status.' });
    }

    // Prevent updating other admin users
    if (existingUser[0].role === 'admin') {
      return res.status(400).json({ message: 'Cannot update admin user status.' });
    }

    // Update user status
    await pool.query(
      'UPDATE users SET status = ? WHERE id = ?',
      [status, id]
    );

    console.log('User status updated successfully:', id);
    res.json({ 
      message: 'User status updated successfully!',
      status: status
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error while updating user status.', error });
  }
};