const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/UserRoutes');
const noteRoutes = require('./routes/noteRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 5000;

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/notepad';
mongoose.connect(mongoURI).then(() => {
  console.log('MongoDB Connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  console.log('Make sure MongoDB is running or check your MONGO_URI in .env file');
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);

// Root route
app.get('/', (_req, res) => {
  res.send('API is working');
});

// WebSocket real-time collaboration
const activeUsers = new Map(); // Map of noteId -> Set of socketIds
const userSockets = new Map(); // Map of socketId -> user info

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join a note room for collaboration
  socket.on('join-note', (data) => {
    const { noteId, userId, userName } = data;
    
    // Leave previous room if any
    if (userSockets.has(socket.id)) {
      const prevNoteId = userSockets.get(socket.id).noteId;
      socket.leave(prevNoteId);
      
      // Remove from active users
      if (activeUsers.has(prevNoteId)) {
        activeUsers.get(prevNoteId).delete(socket.id);
        if (activeUsers.get(prevNoteId).size === 0) {
          activeUsers.delete(prevNoteId);
        }
      }
    }
    
    // Join new room
    socket.join(noteId);
    
    // Track user in this note
    if (!activeUsers.has(noteId)) {
      activeUsers.set(noteId, new Set());
    }
    activeUsers.get(noteId).add(socket.id);
    
    userSockets.set(socket.id, { noteId, userId, userName });
    
    // Notify other users in the room
    socket.to(noteId).emit('user-joined', {
      userId,
      userName,
      socketId: socket.id
    });
    
    // Send list of active users to the joining user
    const activeUsersList = [];
    if (activeUsers.has(noteId)) {
      for (const socketId of activeUsers.get(noteId)) {
        if (socketId !== socket.id && userSockets.has(socketId)) {
          const user = userSockets.get(socketId);
          activeUsersList.push({
            userId: user.userId,
            userName: user.userName,
            socketId
          });
        }
      }
    }
    
    socket.emit('active-users', activeUsersList);
  });
  
  // Handle real-time note updates
  socket.on('note-update', (data) => {
    const { noteId, content, title, userId, userName } = data;
    
    // Broadcast to all other users in the room
    socket.to(noteId).emit('note-updated', {
      content,
      title,
      userId,
      userName,
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle cursor position updates
  socket.on('cursor-update', (data) => {
    const { noteId, position, userId, userName } = data;
    
    socket.to(noteId).emit('cursor-updated', {
      position,
      userId,
      userName,
      socketId: socket.id
    });
  });
  
  // Handle user disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (userSockets.has(socket.id)) {
      const { noteId, userId, userName } = userSockets.get(socket.id);
      
      // Remove from active users
      if (activeUsers.has(noteId)) {
        activeUsers.get(noteId).delete(socket.id);
        if (activeUsers.get(noteId).size === 0) {
          activeUsers.delete(noteId);
        }
      }
      
      // Notify other users
      socket.to(noteId).emit('user-left', {
        userId,
        userName,
        socketId: socket.id
      });
      
      userSockets.delete(socket.id);
    }
  });
});

// Make io available to routes
app.set('io', io);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready for real-time collaboration`);
});
