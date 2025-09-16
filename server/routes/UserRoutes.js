// Import Express to create a router
const express = require('express');
const router = express.Router();

// Import controller functions for users
const { getAllUsers, getUserById } = require('../controller/userController');
// Import auth controller functions
const { registerUser, loginUser } = require('../controller/authController');

// ========================
// ROUTES
// ========================

// @route   POST /api/users/register
// @desc    Register a new user (alternative endpoint)
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Login user (alternative endpoint)
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/users
// @desc    Get all users (excluding passwords)
// @access  Public or Protected (depends on middleware)
router.get('/', getAllUsers);

// @route   GET /api/users/:id
// @desc    Get a single user by ID (excluding password)
// @access  Public or Protected (depends on middleware)
router.get('/:id', getUserById);

// Export the router to be used in server.js
module.exports = router;
