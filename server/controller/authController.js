// Required imports
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, email, and password' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase(), 
      password: hashedPassword 
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } 
  catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      message: 'Server error during registration', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Login existing user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide both email and password' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } 
  catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Server error during login', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: 'If an account with that email exists, you will receive a password reset email' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // In production, send email with resetToken
    console.log(`Password reset token for ${email}: ${resetToken}`);
    
    res.status(200).json({ 
      message: 'If an account with that email exists, you will receive a password reset email',
      // For development only - remove in production
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ 
      message: 'Server error during password reset request' 
    });
  }
};

// Reset password with token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: 'Reset token and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const user = await User.findOne({ 
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired reset token' 
      });
    }

    // Hash new password and save
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({ 
      message: 'Password has been reset successfully' 
    });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ 
      message: 'Server error during password reset' 
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -passwordResetToken -emailVerificationToken');
    
    res.status(200).json({
      message: 'Profile retrieved successfully',
      user
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ 
      message: 'Server error retrieving profile' 
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update name if provided
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Update email if provided
    if (email && email !== user.email) {
      // Check if new email is already taken
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      user.email = email.toLowerCase();
      user.isEmailVerified = false; // Reset email verification
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          message: 'Current password is required to change password' 
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          message: 'New password must be at least 6 characters long' 
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    // Return user without sensitive data
    const updatedUser = await User.findById(user._id).select('-password -passwordResetToken -emailVerificationToken');
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ 
      message: 'Server error updating profile' 
    });
  }
};

// Update user preferences
exports.updatePreferences = async (req, res) => {
  try {
    const { theme, fontSize, language, autoSave, autoSaveInterval, notificationsEnabled } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update preferences
    if (theme && ['light', 'dark'].includes(theme)) {
      user.preferences.theme = theme;
    }
    if (fontSize && ['small', 'medium', 'large'].includes(fontSize)) {
      user.preferences.fontSize = fontSize;
    }
    if (language) {
      user.preferences.language = language;
    }
    if (typeof autoSave === 'boolean') {
      user.preferences.autoSave = autoSave;
    }
    if (autoSaveInterval && typeof autoSaveInterval === 'number' && autoSaveInterval >= 10) {
      user.preferences.autoSaveInterval = autoSaveInterval;
    }
    if (typeof notificationsEnabled === 'boolean') {
      user.preferences.notificationsEnabled = notificationsEnabled;
    }

    await user.save();

    res.status(200).json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (err) {
    console.error('Update preferences error:', err);
    res.status(500).json({ 
      message: 'Server error updating preferences' 
    });
  }
};
