const express = require('express');
const router = express.Router();
const { 
  getNotes, 
  getNote, 
  createNote, 
  updateNote, 
  deleteNote,
  generateShareCode,
  joinSharedNote,
  stopSharing,
  saveVersion,
  undoVersion,
  redoVersion,
  toggleFavorite
} = require('../controller/noteController');
const { authenticateToken } = require('../middleware/auth');

// All note routes require authentication
router.use(authenticateToken);

// @route   GET /api/notes
// @desc    Get all notes for authenticated user
// @access  Private (JWT required)
router.get('/', getNotes);

// @route   GET /api/notes/:id
// @desc    Get single note by ID for authenticated user
// @access  Private (JWT required)
router.get('/:id', getNote);

// @route   POST /api/notes
// @desc    Create new note for authenticated user
// @access  Private (JWT required)
router.post('/', createNote);

// @route   PUT /api/notes/:id
// @desc    Update note by ID for authenticated user
// @access  Private (JWT required)
router.put('/:id', updateNote);

// @route   DELETE /api/notes/:id
// @desc    Delete note by ID for authenticated user
// @access  Private (JWT required)
router.delete('/:id', deleteNote);

// SHARING ROUTES
// @route   POST /api/notes/:id/share
// @desc    Generate share code for note
// @access  Private (JWT required)
router.post('/:id/share', generateShareCode);

// @route   POST /api/notes/join
// @desc    Join shared note with code
// @access  Private (JWT required)
router.post('/join', joinSharedNote);

// @route   DELETE /api/notes/:id/share
// @desc    Stop sharing note
// @access  Private (JWT required)
router.delete('/:id/share', stopSharing);

// VERSION CONTROL ROUTES
// @route   POST /api/notes/:id/version
// @desc    Save current version
// @access  Private (JWT required)
router.post('/:id/version', saveVersion);

// @route   POST /api/notes/:id/undo
// @desc    Undo to previous version
// @access  Private (JWT required)
router.post('/:id/undo', undoVersion);

// @route   POST /api/notes/:id/redo
// @desc    Redo to next version
// @access  Private (JWT required)
router.post('/:id/redo', redoVersion);

// FAVORITE ROUTES
// @route   POST /api/notes/:id/favorite
// @desc    Toggle favorite status
// @access  Private (JWT required)
router.post('/:id/favorite', toggleFavorite);

module.exports = router;
