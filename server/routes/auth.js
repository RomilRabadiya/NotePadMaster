// backend/routes/auth.js

const express = require('express');
const router = express.Router();

// Import authentication controller functions
const { 
  registerUser, 
  loginUser, 
  requestPasswordReset, 
  resetPassword, 
  getProfile, 
  updateProfile, 
  updatePreferences 
} = require('../controller/authController');
const { authenticateToken } = require('../middleware/auth');

// ========================
// AUTH ROUTES
// ========================

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login an existing user
// @access  Public
router.post('/login', loginUser);

// @route   POST /api/auth/request-password-reset
// @desc    Request password reset email
// @access  Public
router.post('/request-password-reset', requestPasswordReset);

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', resetPassword);

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, updateProfile);

// @route   PUT /api/auth/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', authenticateToken, updatePreferences);

module.exports = router;
