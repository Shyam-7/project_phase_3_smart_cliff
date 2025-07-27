const pool = require('../../db');

// Get all content items
const getAllContent = async (req, res) => {
  try {
    const [content] = await pool.query(`
      SELECT * FROM site_content 
      ORDER BY section_type, sort_order, section
    `);

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
};

// Get content by section
const getContentBySection = async (req, res) => {
  try {
    const { section } = req.params;
    
    const [content] = await pool.query(`
      SELECT * FROM site_content 
      WHERE section = ? AND is_active = 1
      ORDER BY sort_order
    `, [section]);

    if (content.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: content[0]
    });
  } catch (error) {
    console.error('Error fetching content by section:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
};

// Get content by section type (hero, welcome, etc.)
const getContentBySectionType = async (req, res) => {
  try {
    const { sectionType } = req.params;
    
    const [content] = await pool.query(`
      SELECT * FROM site_content 
      WHERE section_type = ? AND is_active = 1
      ORDER BY sort_order, section
    `, [sectionType]);

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching content by section type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message
    });
  }
};

// Create new content item
const createContent = async (req, res) => {
  try {
    const {
      section,
      section_type = 'hero',
      title,
      content,
      image_url,
      image_alt,
      additional_data,
      sort_order = 0,
      is_active = 1
    } = req.body;

    if (!section || !title) {
      return res.status(400).json({
        success: false,
        message: 'Section and title are required'
      });
    }

    // Check if section already exists
    const [existing] = await pool.query(
      'SELECT id FROM site_content WHERE section = ?',
      [section]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Content section already exists'
      });
    }

    const [result] = await pool.query(`
      INSERT INTO site_content 
      (section, section_type, title, content, image_url, image_alt, additional_data, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      section,
      section_type,
      title,
      content,
      image_url,
      image_alt,
      additional_data ? JSON.stringify(additional_data) : null,
      sort_order,
      is_active
    ]);

    // Get the created content
    const [newContent] = await pool.query(
      'SELECT * FROM site_content WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: newContent[0]
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating content',
      error: error.message
    });
  }
};

// Update content item
const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      section,
      section_type,
      title,
      content,
      image_url,
      image_alt,
      additional_data,
      sort_order,
      is_active
    } = req.body;

    // Check if content exists
    const [existing] = await pool.query(
      'SELECT id FROM site_content WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];

    if (section !== undefined) {
      updateFields.push('section = ?');
      updateValues.push(section);
    }
    if (section_type !== undefined) {
      updateFields.push('section_type = ?');
      updateValues.push(section_type);
    }
    if (title !== undefined) {
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    if (content !== undefined) {
      updateFields.push('content = ?');
      updateValues.push(content);
    }
    if (image_url !== undefined) {
      updateFields.push('image_url = ?');
      updateValues.push(image_url);
    }
    if (image_alt !== undefined) {
      updateFields.push('image_alt = ?');
      updateValues.push(image_alt);
    }
    if (additional_data !== undefined) {
      updateFields.push('additional_data = ?');
      updateValues.push(additional_data ? JSON.stringify(additional_data) : null);
    }
    if (sort_order !== undefined) {
      updateFields.push('sort_order = ?');
      updateValues.push(sort_order);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id);

    await pool.query(`
      UPDATE site_content 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, updateValues);

    // Get the updated content
    const [updatedContent] = await pool.query(
      'SELECT * FROM site_content WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: updatedContent[0]
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating content',
      error: error.message
    });
  }
};

// Delete content item
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if content exists
    const [existing] = await pool.query(
      'SELECT id FROM site_content WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    await pool.query('DELETE FROM site_content WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting content',
      error: error.message
    });
  }
};

// Get content for user dashboard specifically
const getUserDashboardContent = async (req, res) => {
  try {
    const [content] = await pool.query(`
      SELECT * FROM site_content 
      WHERE section IN ('hero', 'welcome', 'how_it_works') AND is_active = 1
      ORDER BY sort_order
    `);

    // Transform data for easy frontend consumption
    const dashboardContent = {
      hero: {
        title: '',
        subtitle: '',
        searchSuggestions: '',
        ctaButtonText: 'Find Job'
      },
      welcome: {
        title: '',
        content: '',
        ctaButtonText: 'Get Started',
        secondaryLinks: []
      },
      howItWorks: {
        title: '',
        steps: []
      },
      heroImage: {
        url: '/assets/person_searching_job.png',
        alt: 'Person searching job'
      }
    };

    content.forEach(item => {
      try {
        // MySQL JSON fields are already parsed as objects
        const additionalData = item.additional_data || {};
        
        switch (item.section) {
          case 'hero':
            dashboardContent.hero.title = item.title || '';
            dashboardContent.hero.subtitle = item.content || '';
            dashboardContent.hero.searchSuggestions = additionalData.searchSuggestions || '';
            dashboardContent.hero.ctaButtonText = additionalData.ctaButtonText || 'Find Job';
            if (additionalData.imageUrl) {
              dashboardContent.heroImage.url = additionalData.imageUrl;
            }
            if (additionalData.imageAlt) {
              dashboardContent.heroImage.alt = additionalData.imageAlt;
            }
            break;
          case 'welcome':
            dashboardContent.welcome.title = item.title || '';
            dashboardContent.welcome.content = item.content || '';
            dashboardContent.welcome.ctaButtonText = additionalData.ctaButtonText || 'Get Started';
            dashboardContent.welcome.secondaryLinks = additionalData.secondaryLinks || [];
            break;
          case 'how_it_works':
            dashboardContent.howItWorks.title = item.title || '';
            dashboardContent.howItWorks.steps = additionalData.steps || [];
            break;
        }
      } catch (parseError) {
        console.warn('Error parsing additional_data for item:', item.id, parseError);
      }
    });

    res.json({
      success: true,
      data: dashboardContent
    });
  } catch (error) {
    console.error('Error fetching user dashboard content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard content',
      error: error.message
    });
  }
};

module.exports = {
  getAllContent,
  getContentBySection,
  getContentBySectionType,
  createContent,
  updateContent,
  deleteContent,
  getUserDashboardContent
};
