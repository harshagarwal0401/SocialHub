#!/bin/bash

echo "🚀 SocialHub Deployment Script"
echo "=============================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build
cd ..

# Check if build was successful
if [ ! -d "frontend/build" ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend built successfully!"

# Check if all dependencies are installed
echo "🔍 Checking dependencies..."
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm run install-all
fi

echo "✅ Dependencies check complete!"

echo ""
echo "🎉 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for deployment'"
echo "   git push"
echo ""
echo "2. Deploy backend to Render:"
echo "   - Go to https://dashboard.render.com/"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Set root directory to 'backend'"
echo "   - Add environment variables (see DEPLOYMENT.md)"
echo ""
echo "3. Deploy frontend to Vercel:"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Create new project"
echo "   - Import your GitHub repo"
echo "   - Set root directory to 'frontend'"
echo "   - Add environment variables (see DEPLOYMENT.md)"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions!" 