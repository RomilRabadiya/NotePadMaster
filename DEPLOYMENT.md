# 🚀 Deployment Guide - NotePad Master

This guide will help you deploy NotePad Master to Vercel successfully.

## 📋 Prerequisites

1. **GitHub Repository** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **MongoDB Atlas** - Set up a cloud database at [mongodb.com/atlas](https://www.mongodb.com/atlas)

## 🔧 Pre-Deployment Setup

### 1. MongoDB Atlas Setup
1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Add a database user with read/write permissions
4. Whitelist your IP addresses (or use 0.0.0.0/0 for all IPs)
5. Get your connection string

### 2. Environment Variables
The following environment variables need to be set in Vercel:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/notepadproject
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
```

## 🚀 Vercel Deployment Steps

### Method 1: Vercel Dashboard (Recommended)

1. **Connect Repository**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository: `RomilRabadiya/NotePadMaster`

2. **Configure Project**
   - **Framework Preset:** Other
   - **Root Directory:** `.` (leave as root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `client/build`
   - **Install Command:** `npm install`

3. **Set Environment Variables**
   - Go to Settings → Environment Variables
   - Add the following variables:
     ```
     NODE_ENV=production
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow the prompts:
# - Set up and deploy? [Y/n] y
# - Which scope? [Your username]
# - Link to existing project? [y/N] n
# - Project name: notepad-master
# - In which directory is your code located? ./
```

## 🔧 Post-Deployment Configuration

### 1. Update API URLs
If your frontend needs to communicate with the backend, update any hardcoded API URLs to use relative paths:

```javascript
// Instead of: http://localhost:5000/api
// Use: /api
const API_BASE_URL = '/api';
```

### 2. Environment Variables for Production
Set these in your Vercel dashboard:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `MONGO_URI` | Your MongoDB connection string | Database connection |
| `JWT_SECRET` | Secure random string (32+ chars) | JWT signing secret |

### 3. Domain Configuration
- Your app will be available at: `https://your-project-name.vercel.app`
- You can add a custom domain in Vercel dashboard → Settings → Domains

## 🔍 Troubleshooting

### Common Issues and Solutions

1. **Build Fails**
   ```
   Error: Could not detect a supported production build
   ```
   **Solution:** Ensure `package.json` exists in root and has proper build scripts.

2. **API Routes Not Working**
   ```
   404 - API routes not found
   ```
   **Solution:** Check `vercel.json` configuration for proper routing.

3. **Database Connection Issues**
   ```
   MongoNetworkError: failed to connect to server
   ```
   **Solution:** 
   - Verify MongoDB URI is correct
   - Check Atlas IP whitelist
   - Ensure database user has proper permissions

4. **Environment Variables Not Loading**
   ```
   JWT_SECRET is not defined
   ```
   **Solution:** 
   - Verify env vars are set in Vercel dashboard
   - Redeploy the project after adding variables

### 🧪 Testing Deployment

1. **Check Build Logs**
   - Go to Vercel Dashboard → Your Project → Functions tab
   - Check build logs for any errors

2. **Test API Endpoints**
   ```bash
   curl https://your-app.vercel.app/api/health
   ```

3. **Test Database Connection**
   - Register a new user
   - Create a note
   - Verify data persistence

## 📝 Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Environment variables set in Vercel
- [ ] Repository connected to Vercel
- [ ] Build configuration verified
- [ ] API routes working
- [ ] Frontend served correctly
- [ ] Database operations functional
- [ ] Real-time features (Socket.IO) working

## 🔄 Redeployment

For future updates:
1. Push changes to GitHub
2. Vercel will automatically redeploy
3. Monitor build status in Vercel dashboard

## 📞 Support

If you encounter issues:
1. Check Vercel build logs
2. Review environment variables
3. Verify MongoDB Atlas configuration
4. Check GitHub Issues for similar problems

---

**Happy Deploying! 🚀**
