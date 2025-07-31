# SocialHub Deployment Guide

This guide will help you deploy SocialHub on Vercel (frontend) and Render (backend).

## Prerequisites

1. **MongoDB Atlas Account** - For cloud database
2. **Vercel Account** - For frontend deployment
3. **Render Account** - For backend deployment
4. **GitHub Account** - To host your code

## Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Add your IP address to the whitelist (or use 0.0.0.0/0 for all IPs)

## Step 2: Deploy Backend to Render

### 2.1 Prepare Your Repository

1. Push your code to GitHub
2. Make sure your repository is public (for free Render plan)

### 2.2 Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `socialhub-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 2.3 Environment Variables

Add these environment variables in Render:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/socialhub?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=10000
```

**Important**: Replace the MongoDB URI with your actual connection string from MongoDB Atlas.

### 2.4 Update CORS Settings

After deployment, update the CORS settings in `backend/server.js` with your actual frontend domain:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-actual-frontend-domain.vercel.app'] 
    : 'http://localhost:3000',
  credentials: true
}));
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Prepare Frontend

1. Update the API URL in your frontend environment
2. Create a `.env.local` file in the frontend directory:

```env
REACT_APP_API_URL=https://your-backend-domain.onrender.com
```

### 3.2 Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 3.3 Environment Variables

Add this environment variable in Vercel:

```
REACT_APP_API_URL=https://your-backend-domain.onrender.com
```

## Step 4: Update Configuration

### 4.1 Update CORS in Backend

After getting your Vercel domain, update the CORS settings in your backend:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-actual-vercel-domain.vercel.app'] 
    : 'http://localhost:3000',
  credentials: true
}));
```

### 4.2 Redeploy Backend

After updating the CORS settings, redeploy your backend on Render.

## Step 5: Test Your Deployment

1. Test the backend API: `https://your-backend-domain.onrender.com/api/health`
2. Test the frontend: `https://your-frontend-domain.vercel.app`
3. Try creating an account and posting

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your frontend domain is correctly added to the backend CORS settings
2. **MongoDB Connection**: Ensure your MongoDB Atlas cluster is accessible and the connection string is correct
3. **Environment Variables**: Double-check all environment variables are set correctly
4. **Build Errors**: Check the build logs in both Vercel and Render

### Debugging

1. **Backend Logs**: Check Render logs for any errors
2. **Frontend Console**: Open browser dev tools to see any API errors
3. **Network Tab**: Check if API calls are reaching the backend

## Security Considerations

1. **JWT Secret**: Use a strong, random JWT secret in production
2. **MongoDB**: Use environment variables for database credentials
3. **CORS**: Only allow your frontend domain in production
4. **Rate Limiting**: The backend already includes rate limiting

## Performance Optimization

1. **Image Upload**: Consider using Cloudinary or AWS S3 for image storage
2. **Caching**: Implement Redis for session management
3. **CDN**: Vercel provides CDN for static assets automatically

## Monitoring

1. **Vercel Analytics**: Enable Vercel Analytics for frontend monitoring
2. **Render Logs**: Monitor backend logs in Render dashboard
3. **MongoDB Atlas**: Monitor database performance in Atlas dashboard

## Cost Optimization

1. **Free Tiers**: Both Vercel and Render offer generous free tiers
2. **MongoDB Atlas**: Free tier includes 512MB storage
3. **Image Storage**: Use free tier of Cloudinary for image uploads

---

**Your SocialHub application should now be live! 🚀**

- Frontend: `https://your-frontend-domain.vercel.app`
- Backend: `https://your-backend-domain.onrender.com`
- API Health: `https://your-backend-domain.onrender.com/api/health` 