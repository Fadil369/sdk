#!/bin/bash
# Quick deployment script for BrainSAIT Healthcare SDK

set -e

echo "🚀 BrainSAIT Healthcare SDK - Quick Deploy"
echo "==========================================="

# Ensure we're in the correct directory
cd "$(dirname "$0")"

# Check git status
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "feat: UI enhancements and deployment fixes - $(date '+%Y-%m-%d %H:%M')"
    echo "✅ Changes committed"
else
    echo "✅ No changes to commit"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main
echo "✅ Pushed to GitHub"

# Deploy to Cloudflare Pages
echo "🌐 Deploying to Cloudflare Pages..."
npm run deploy:pages
echo "✅ Deployment complete!"

echo ""
echo "🎯 Live URL: https://15dc20c4.brainsait-healthcare-sdk.pages.dev"
echo "📊 Local Dev: ./start-server.sh"
echo ""
echo "🏆 Deployment successful!"