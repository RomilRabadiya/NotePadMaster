const User = require('../models/User');

/**
 * GET ALL USERS
 * This function retrieves all users from the database
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch all users but exclude the 'password' field for security
    const users = await User.find().select('-password');

    // Send the list of users as JSON
    res.json(users);

  } 
  catch (err) {
    // If something goes wrong, return error response
    res.status(500).json({
      message: 'Error fetching users',
      error: err.message
    });
  }
};

/**
 * GET SINGLE USER BY ID
 * This function retrieves a specific user by their MongoDB _id
 */
exports.getUserById = async (req, res) => {
  try {
    // Find the user by their ID from the request params
    // Also exclude password for security
    const user = await User.findById(req.params.id).select('-password');

    // If no user is found, send 404 error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the user data
    res.json(user);

  } 
  catch (err) {
    // If something goes wrong, return error response
    res.status(500).json({
      message: 'Error fetching user',
      error: err.message
    });
  }
};
