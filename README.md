# 📝 NotePad Master

A full-stack collaborative notepad application built with React and Node.js/Express.

## ✨ Features

- **User Authentication** - Register, login, and secure JWT-based authentication
- **Real-time Collaboration** - Multiple users can edit notes simultaneously using WebSocket
- **Rich Text Editing** - Advanced note editor with formatting options
- **Note Management** - Create, edit, delete, search, and organize notes
- **Sharing & Collaboration** - Share notes with others using secure share codes
- **Undo/Redo** - Version history with undo/redo functionality
- **Favorites & Tags** - Organize notes with favorites and tagging system
- **Themes** - Light and dark theme support
- **Responsive Design** - Works on desktop and mobile devices

## 🏗️ Project Structure

```
NotepadProject/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── api/          # API client
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   └── themes.css    # Global styles
│   └── package.json      # Frontend dependencies
└── server/                # Node.js backend
    ├── controller/        # Route controllers
    ├── middleware/        # Custom middleware
    ├── models/           # MongoDB models
    ├── routes/           # Express routes
    ├── .env              # Environment variables
    ├── index.js          # Server entry point
    └── package.json      # Backend dependencies
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RomilRabadiya/NotePadMaster.git
   cd NotePadMaster
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   ```
   
   Create `.env` file in server directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/notepadproject
   JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
   NODE_ENV=development
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd server
   npm start
   ```
   Backend will run on `http://localhost:5000`

2. **Start Frontend (in new terminal)**
   ```bash
   cd client
   npm start
   ```
   Frontend will run on `http://localhost:3000`

3. **Open your browser** and navigate to `http://localhost:3000`

## 🛠️ Available Scripts

### Backend (`server/`)
- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon

### Frontend (`client/`)
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/preferences` - Update user preferences

### Notes
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get specific note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/join` - Join shared note

## 🔐 Environment Variables

### Server `.env` file:
```env
PORT=5000                                                    # Server port
MONGO_URI=mongodb://127.0.0.1:27017/notepadproject         # MongoDB connection
JWT_SECRET=your-jwt-secret-key                              # JWT signing secret
NODE_ENV=development                                         # Environment
```

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB cloud instance (MongoDB Atlas recommended)
2. Update `MONGO_URI` in environment variables
3. Set strong `JWT_SECRET`
4. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy build folder to platforms like Netlify, Vercel, or AWS S3
3. Update API base URL in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check `MONGO_URI` in `.env` file

2. **Port Already in Use**
   - Kill existing processes on ports 3000/5000
   - Or change PORT in environment variables

3. **CORS Issues**
   - Backend CORS is configured for `http://localhost:3000`
   - Update if using different frontend URL

## 📞 Support

If you encounter any issues, please create an issue in the repository or contact the development team.

---

## 📋 Project Requirements Documentation

### 1. Introduction

#### 1.1 Purpose
To save notes and share them using a code.
- Enable Login / Signup with user accounts
- Allow users to join a room using a code and access the same note across multiple devices
- Support operations to save, remove, and update notes
- Provide Undo and Redo functionality for notes
- Allow users to adjust the font size of the note content
- Enable users to search notes by title as well as description

#### 1.2 Definitions
This project is a collaborative note-taking application designed to help users create, manage, and share notes seamlessly across devices. It allows users to register/login, save personal notes, and collaborate in real-time with others by joining shared rooms using a unique code.

The application includes features such as note creation, deletion, and updating, along with Undo/Redo capabilities, font customization, and advanced search based on note title or description. The goal is to provide a user-friendly platform for individuals, teams, and students to capture and organize information efficiently, whether working solo or in a group.

### 2. System Requirements

#### 2.1 Operating Environment
Platform: Web-based, accessible via modern web browsers on desktops, laptops, tablets, and mobile devices.
- **Devices**: Computers, laptops, smartphones, and tablets
- **Operating Systems**: Windows (2000, XP, Vista, 7, 8, 10), macOS, Linux
- **RAM**: Minimum 128 MB or higher
- **Disk Space**: Minimum 20 MB of free space
- **Supported Browsers**: Mozilla Firefox, Google Chrome (Version 27.01+), Microsoft Edge, Safari, Opera
- **Internet Connection**: Stable, high-speed internet connection required

#### 2.2 Technical Specifications
- **Frontend**: React, HTML, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT-based security
- **Real-time Features**: WebSocket support for collaboration

### 3. Functional Requirements

- 🔐 **User Registration & Authentication**
- 📝 **Complete Note Management** (Create, Edit, Delete, Save)
- ↩️ **Undo/Redo Operations**
- 🔍 **Advanced Search** (by title and content)
- 🔠 **Font Size Customization**
- 🔗 **Note Sharing via Unique Codes**
- 👥 **Real-Time Collaboration**
- 📱 **Responsive Design**

### 4. Conclusion

This project provides a powerful yet user-friendly collaborative note-taking platform that enables users to create, manage, and share notes efficiently. With core features such as user authentication, real-time collaboration, note sharing via code, undo/redo operations, font customization, and advanced search, the application caters to both individual users and teams working across multiple devices.

The system is designed with a focus on simplicity, performance, and productivity, allowing users to stay organized and connected. By integrating modern collaboration and usability features, this solution offers a practical tool for students, professionals, and remote teams to capture ideas, share knowledge, and work together in real-time.
