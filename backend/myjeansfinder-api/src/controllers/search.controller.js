const User = require('../models/user');

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    }).select('-password -salt');

    res.status(200).json({
      success: true,
      message: 'Search results retrieved successfully',
      data: users,
    });
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve search results',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
