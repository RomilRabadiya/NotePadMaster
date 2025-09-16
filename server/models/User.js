// Import Mongoose to work with MongoDB
const mongoose = require('mongoose');

// Create a schema (structure) for the User collection
const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: true,
      trim: true
    },

    // User's email address
    email: {
      type: String,
      required: true,
      lowercase: true
    },

    // User's password (will be hashed before storing)
    password: {
      type: String,
      required: true
    },

    // Email verification status
    isEmailVerified: {
      type: Boolean,
      default: false
    },

    // Email verification token
    emailVerificationToken: {
      type: String,
      default: null
    },

    // Password reset token
    passwordResetToken: {
      type: String,
      default: null
    },

    // Password reset token expiry
    passwordResetExpires: {
      type: Date,
      default: null
    },

    // User preferences and settings
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      },
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      },
      language: {
        type: String,
        default: 'en'
      },
      autoSave: {
        type: Boolean,
        default: true
      },
      autoSaveInterval: {
        type: Number,
        default: 30 // seconds
      },
      notificationsEnabled: {
        type: Boolean,
        default: true
      }
    },

    // Last login timestamp
    lastLogin: {
      type: Date,
      default: null
    }
  },
  {
    // Automatically add createdAt & updatedAt timestamps
    timestamps: true
  }
);

// Add indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ passwordResetToken: 1 });
userSchema.index({ emailVerificationToken: 1 });

// Export the User model so it can be used in other files
module.exports = mongoose.model('User', userSchema);
