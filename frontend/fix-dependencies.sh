#!/bin/bash

# Fix react-easy-crop compatibility issues for all teammates
echo "🔧 Fixing react-easy-crop compatibility issues..."

# Remove and reinstall react-easy-crop with compatible version
echo "📦 Removing and reinstalling react-easy-crop..."
npm uninstall react-easy-crop
npm install react-easy-crop@^5.0.6 --save

# Clear npm cache to avoid version conflicts
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Reinstall dependencies to ensure consistency
echo "🔄 Reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

echo "✅ react-easy-crop compatibility issues fixed!"
echo "📝 Please restart your development server."
