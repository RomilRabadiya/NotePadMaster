const mongoose = require("mongoose");

// Sub-schema for note versions (for undo/redo functionality)
const noteVersionSchema = new mongoose.Schema({
  content: String,
  title: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Sub-schema for collaborators
const collaboratorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permission: {
    type: String,
    enum: ['read', 'write', 'owner'],
    default: 'write'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ""
  },
  tags: {
    type: [String],
    default: []
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  
  // Sharing and collaboration
  isShared: {
    type: Boolean,
    default: false
  },
  shareCode: {
    type: String,
    unique: true,
    sparse: true // Only create index for non-null values
  },
  shareCodeExpires: {
    type: Date,
    default: null
  },
  collaborators: [collaboratorSchema],
  
  // Version history for undo/redo
  versions: {
    type: [noteVersionSchema],
    default: []
  },
  currentVersion: {
    type: Number,
    default: 0
  },
  
  // Note metadata
  isPublic: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastEditedAt: {
    type: Date,
    default: Date.now
  },
  
  // Organization
  folder: {
    type: String,
    default: null
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // Rich text formatting metadata
  contentType: {
    type: String,
    enum: ['plain', 'markdown', 'html'],
    default: 'plain'
  }
}, {
  timestamps: true
});

// Add indexes for better performance
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ title: 'text', content: 'text' });
noteSchema.index({ tags: 1 });
noteSchema.index({ folder: 1 });
noteSchema.index({ isShared: 1 });
noteSchema.index({ lastEditedAt: -1 });

// Methods
noteSchema.methods.generateShareCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.shareCode = result;
  this.shareCodeExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return result;
};

noteSchema.methods.addVersion = function(userId) {
  // Keep only last 50 versions to prevent memory issues
  if (this.versions.length >= 50) {
    this.versions = this.versions.slice(-49);
  }
  
  this.versions.push({
    content: this.content,
    title: this.title,
    userId: userId,
    timestamp: new Date()
  });
  
  this.currentVersion = this.versions.length - 1;
};

noteSchema.methods.canUserEdit = function(userId) {
  // Owner can always edit
  if (this.userId.toString() === userId.toString()) {
    return true;
  }
  
  // Check collaborator permissions
  const collaborator = this.collaborators.find(c => c.userId.toString() === userId.toString());
  return collaborator && (collaborator.permission === 'write' || collaborator.permission === 'owner');
};

module.exports = mongoose.model("Note", noteSchema);
