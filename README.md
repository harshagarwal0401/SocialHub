# SocialHub - A Social Media Platform

A full-stack social media web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring modern UI with Tailwind CSS.

## 🚀 Features

### 🔐 Authentication & User Management
- User registration and login with JWT
- Secure password hashing with bcrypt
- Protected routes
- Profile management with image upload
- User discovery and following system

### 📝 Posts
- Create posts with text and optional images
- Edit and delete own posts
- Like/unlike posts
- View post feed (all posts or following only)
- Image upload with local storage

### 💬 Comments & Replies
- Add comments on posts
- Reply to comments (nested replies)
- Edit and delete own comments
- Like comments

### 👥 Social Features
- Follow/unfollow users
- View follower and following counts
- User profiles with posts
- Following feed

### 🎨 Modern UI
- Responsive design with Tailwind CSS
- Modern card-based layout
- Modal dialogs
- Toast notifications
- Loading states and animations

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **multer** - File uploads
- **express-validator** - Input validation

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **react-hot-toast** - Notifications
- **react-icons** - Icons

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd socialHub
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/socialhub
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode (both frontend and backend)
   npm run dev
   
   # Or run separately:
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
socialHub/
├── backend/
│   ├── config.env          # Environment variables
│   ├── server.js           # Main server file
│   ├── models/             # Database models
│   │   ├── User.js
│   │   ├── Post.js
│   │   └── Comment.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── posts.js
│   │   └── comments.js
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js
│   │   └── upload.js
│   └── uploads/            # Uploaded images
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── App.js
│   │   └── index.js
│   ├── tailwind.config.js
│   └── package.json
└── package.json
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/upload-profile-picture` - Upload profile picture

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user
- `GET /api/users/:id/followers` - Get user's followers
- `GET /api/users/:id/following` - Get user's following

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts` - Get posts feed
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `GET /api/posts/user/:userId` - Get user's posts

### Comments
- `POST /api/comments` - Create comment
- `GET /api/comments/post/:postId` - Get post comments
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like/unlike comment
- `GET /api/comments/:id/replies` - Get comment replies

## 🎯 Key Features Implementation

### Authentication Flow
1. User registers/logs in
2. JWT token is generated and stored in localStorage
3. Token is sent with each API request
4. Protected routes check for valid token

### Post Creation
1. User clicks "Create Post" button
2. Modal opens with form
3. User can add text and optional image
4. Form validation ensures content is provided
5. Post is created and added to feed

### Following System
1. Users can discover other users
2. Follow/unfollow functionality
3. Following feed shows only posts from followed users
4. Follower/following counts are tracked

### Real-time Updates
- Like counts update immediately
- Post deletion removes from feed
- Profile updates reflect across the app

## 🚀 Deployment

### Quick Deployment

1. **Run the deployment script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **Follow the detailed guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions.

### Deployment Options

- **Frontend**: Deploy to [Vercel](https://vercel.com) (Recommended)
- **Backend**: Deploy to [Render](https://render.com) (Recommended)
- **Database**: Use [MongoDB Atlas](https://www.mongodb.com/atlas) (Free tier available)

### Environment Setup

1. **MongoDB Atlas**: Set up a free cluster
2. **Environment Variables**: Configure in deployment platforms
3. **CORS**: Update with your actual domains after deployment

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js security headers

## 🎨 UI/UX Features

- Responsive design for mobile and desktop
- Modern card-based layout
- Smooth animations and transitions
- Loading states and error handling
- Toast notifications for user feedback
- Modal dialogs for forms
- Image upload with preview

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with the MERN stack
- Styled with Tailwind CSS
- Icons from React Icons
- Notifications with React Hot Toast

---

**Happy coding! 🚀** 