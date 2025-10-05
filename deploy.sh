#!/bin/bash

# ML Engineer Portfolio Deployment Script
# This script builds and deploys the portfolio to GitHub Pages

set -e

echo "🚀 Starting deployment process..."

# Build the project
echo "📦 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Built files are in the 'dist' directory"
    echo "🌐 Ready for GitHub Pages deployment"
    echo ""
    echo "Next steps:"
    echo "1. Commit and push your changes to the main branch"
    echo "2. Enable GitHub Pages in your repository settings"
    echo "3. Set source to 'GitHub Actions'"
    echo "4. The site will be available at your GitHub Pages URL"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi