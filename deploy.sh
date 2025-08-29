#!/bin/bash

echo "========================================"
echo "NubiaGo Mobile Responsive Deployment"
echo "========================================"
echo

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing Git repository..."
    git init
    echo
fi

# Add all files
echo "Adding files to Git..."
git add .
echo

# Commit changes
read -p "Enter commit message (or press Enter for default): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Deploy mobile responsive ecommerce site"
fi

echo "Committing changes..."
git commit -m "$commit_message"
echo

# Check if remote origin exists
if ! git remote get-url origin >/dev/null 2>&1; then
    echo
    echo "No remote repository found."
    read -p "Enter your GitHub repository URL: " repo_url
    git remote add origin "$repo_url"
    echo "Remote origin added."
    echo
fi

# Push to GitHub
echo "Pushing to GitHub..."
git branch -M main
git push -u origin main
echo

# Build and test
echo "Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "Build failed! Please fix errors before deploying."
    exit 1
fi
echo

# Deploy to Vercel (optional)
echo
read -p "Deploy to Vercel now? (y/n): " deploy_vercel
if [ "$deploy_vercel" = "y" ] || [ "$deploy_vercel" = "Y" ]; then
    echo "Deploying to Vercel..."
    vercel --prod
else
    echo "Skipping Vercel deployment."
    echo "You can deploy later with: vercel --prod"
fi

echo
echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo
echo "Your mobile responsive NubiaGo site has been:"
echo " Committed to Git"
echo " Pushed to GitHub"
echo " Built successfully"
echo
echo "Next steps:"
echo "1. Check your GitHub repository"
echo "2. Set up Vercel deployment if not done"
echo "3. Test on mobile devices"
echo