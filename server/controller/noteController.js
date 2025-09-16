const Note = require("../models/Note");
const User = require("../models/User");

// GET all notes for authenticated user with advanced filtering
exports.getNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { search, tags, folder, sortBy, sortOrder, page = 1, limit = 50, favorites } = req.query;
    
    // Build query
    let query = {
      $or: [
        { userId: userId },
        { collaborators: { $elemMatch: { userId: userId } } }
      ]
    };
    
    // Add search filter
    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]
      });
    }
    
    // Add tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    // Add folder filter
    if (folder) {
      query.folder = folder;
    }
    
    // Add favorites filter
    if (favorites === 'true') {
      query.isFavorite = true;
    }
    
    // Build sort options
    let sort = {};
    switch (sortBy) {
      case 'title':
        sort.title = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'updated':
        sort.lastEditedAt = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'created':
      default:
        sort.createdAt = sortOrder === 'asc' ? 1 : -1;
        break;
    }
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const notes = await Note.find(query)
      .populate('userId', 'name email')
      .populate('collaborators.userId', 'name email')
      .populate('lastEditedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const totalCount = await Note.countDocuments(query);
    
    res.status(200).json({
      message: 'Notes retrieved successfully',
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ 
      message: 'Error fetching notes', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// CREATE new note for authenticated user
exports.createNote = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const userId = req.user._id;

    // Input validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Title is required and cannot be empty' 
      });
    }

    const newNote = new Note({
      title: title.trim(),
      content: content || '',
      tags: Array.isArray(tags) ? tags : [],
      userId
    });

    await newNote.save();

    res.status(201).json({
      message: 'Note created successfully',
      note: newNote
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ 
      message: 'Error creating note', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// UPDATE note by ID for authenticated user
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user._id;

    // Find note that belongs to the authenticated user
    const note = await Note.findOne({ _id: id, userId });
    
    if (!note) {
      return res.status(404).json({ 
        message: 'Note not found or you do not have permission to update it' 
      });
    }

    // Update fields if provided
    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = Array.isArray(tags) ? tags : [];

    await note.save();

    res.status(200).json({
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ 
      message: 'Error updating note', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// DELETE note by ID for authenticated user
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find and delete note that belongs to the authenticated user
    const deletedNote = await Note.findOneAndDelete({ _id: id, userId });
    
    if (!deletedNote) {
      return res.status(404).json({ 
        message: 'Note not found or you do not have permission to delete it' 
      });
    }

    res.status(200).json({
      message: 'Note deleted successfully',
      note: deletedNote
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ 
      message: 'Error deleting note', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// GET single note by ID for authenticated user
exports.getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findOne({ _id: id, userId });
    
    if (!note) {
      return res.status(404).json({ 
        message: 'Note not found or you do not have permission to view it' 
      });
    }

    res.status(200).json({
      message: 'Note retrieved successfully',
      note
    });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ 
      message: 'Error fetching note', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// SHARING & COLLABORATION FEATURES

// Generate share code for a note
exports.generateShareCode = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { expiresIn = 7 } = req.body; // Days until expiration

    const note = await Note.findOne({ _id: id, userId });
    
    if (!note) {
      return res.status(404).json({ 
        message: 'Note not found or you do not have permission to share it' 
      });
    }

    // Generate unique share code
    let shareCode;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      shareCode = note.generateShareCode();
      const existingNote = await Note.findOne({ shareCode });
      if (!existingNote) break;
      attempts++;
    } while (attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      return res.status(500).json({ message: 'Failed to generate unique share code' });
    }

    note.isShared = true;
    note.shareCodeExpires = new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000);
    await note.save();

    res.status(200).json({
      message: 'Share code generated successfully',
      shareCode: note.shareCode,
      expiresAt: note.shareCodeExpires
    });
  } catch (error) {
    console.error('Error generating share code:', error);
    res.status(500).json({ 
      message: 'Error generating share code', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Join shared note with share code
exports.joinSharedNote = async (req, res) => {
  try {
    const { shareCode } = req.body;
    const userId = req.user._id;

    if (!shareCode) {
      return res.status(400).json({ message: 'Share code is required' });
    }

    const note = await Note.findOne({ 
      shareCode,
      shareCodeExpires: { $gt: new Date() }
    }).populate('userId', 'name email');
    
    if (!note) {
      return res.status(404).json({ 
        message: 'Invalid or expired share code' 
      });
    }

    // Check if user is already a collaborator
    const existingCollaborator = note.collaborators.find(
      c => c.userId.toString() === userId.toString()
    );
    
    if (!existingCollaborator && note.userId._id.toString() !== userId.toString()) {
      // Add user as collaborator
      note.collaborators.push({
        userId,
        permission: 'write',
        joinedAt: new Date()
      });
      await note.save();
    }

    const populatedNote = await Note.findById(note._id)
      .populate('userId', 'name email')
      .populate('collaborators.userId', 'name email')
      .populate('lastEditedBy', 'name email');

    res.status(200).json({
      message: 'Successfully joined shared note',
      note: populatedNote
    });
  } catch (error) {
    console.error('Error joining shared note:', error);
    res.status(500).json({ 
      message: 'Error joining shared note', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Remove share code and stop sharing
exports.stopSharing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findOne({ _id: id, userId });
    
    if (!note) {
      return res.status(404).json({ 
        message: 'Note not found or you do not have permission to stop sharing' 
      });
    }

    note.isShared = false;
    note.shareCode = null;
    note.shareCodeExpires = null;
    note.collaborators = []; // Remove all collaborators
    await note.save();

    res.status(200).json({
      message: 'Note sharing stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping share:', error);
    res.status(500).json({ 
      message: 'Error stopping share', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// UNDO/REDO FUNCTIONALITY

// Save current version before making changes (for undo/redo)
exports.saveVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findById(id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!note.canUserEdit(userId)) {
      return res.status(403).json({ 
        message: 'You do not have permission to edit this note' 
      });
    }

    // Add current version to history
    note.addVersion(userId);
    await note.save();

    res.status(200).json({
      message: 'Version saved successfully',
      currentVersion: note.currentVersion,
      totalVersions: note.versions.length
    });
  } catch (error) {
    console.error('Error saving version:', error);
    res.status(500).json({ 
      message: 'Error saving version', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Undo to previous version
exports.undoVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findById(id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!note.canUserEdit(userId)) {
      return res.status(403).json({ 
        message: 'You do not have permission to edit this note' 
      });
    }

    if (note.versions.length === 0 || note.currentVersion < 0) {
      return res.status(400).json({ message: 'No version to undo to' });
    }

    // Get the version to restore
    const versionToRestore = note.versions[note.currentVersion];
    
    if (!versionToRestore) {
      return res.status(400).json({ message: 'Version not found' });
    }

    // Restore the version
    note.title = versionToRestore.title;
    note.content = versionToRestore.content;
    note.currentVersion = Math.max(0, note.currentVersion - 1);
    note.lastEditedBy = userId;
    note.lastEditedAt = new Date();
    
    await note.save();

    res.status(200).json({
      message: 'Undo successful',
      note: {
        _id: note._id,
        title: note.title,
        content: note.content,
        currentVersion: note.currentVersion,
        totalVersions: note.versions.length
      }
    });
  } catch (error) {
    console.error('Error undoing version:', error);
    res.status(500).json({ 
      message: 'Error undoing version', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Redo to next version
exports.redoVersion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findById(id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!note.canUserEdit(userId)) {
      return res.status(403).json({ 
        message: 'You do not have permission to edit this note' 
      });
    }

    if (note.currentVersion >= note.versions.length - 1) {
      return res.status(400).json({ message: 'No version to redo to' });
    }

    // Move to next version
    note.currentVersion = Math.min(note.versions.length - 1, note.currentVersion + 1);
    const versionToRestore = note.versions[note.currentVersion];
    
    if (!versionToRestore) {
      return res.status(400).json({ message: 'Version not found' });
    }

    // Restore the version
    note.title = versionToRestore.title;
    note.content = versionToRestore.content;
    note.lastEditedBy = userId;
    note.lastEditedAt = new Date();
    
    await note.save();

    res.status(200).json({
      message: 'Redo successful',
      note: {
        _id: note._id,
        title: note.title,
        content: note.content,
        currentVersion: note.currentVersion,
        totalVersions: note.versions.length
      }
    });
  } catch (error) {
    console.error('Error redoing version:', error);
    res.status(500).json({ 
      message: 'Error redoing version', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Toggle favorite status
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const note = await Note.findOne({ 
      $or: [
        { _id: id, userId },
        { _id: id, collaborators: { $elemMatch: { userId } } }
      ]
    });
    
    if (!note) {
      return res.status(404).json({ 
        message: 'Note not found or you do not have access to it' 
      });
    }

    note.isFavorite = !note.isFavorite;
    await note.save();

    res.status(200).json({
      message: `Note ${note.isFavorite ? 'added to' : 'removed from'} favorites`,
      isFavorite: note.isFavorite
    });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ 
      message: 'Error toggling favorite', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
