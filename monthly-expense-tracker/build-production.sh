#!/bin/bash

# Production build script for Monthly Expense Tracker

set -e

echo "🚀 Starting production build..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf client/dist server/dist shared/dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build shared package first
echo "🔧 Building shared package..."
npm run build -w shared

# Build server
echo "🖥️  Building server..."
npm run build -w server

# Build client with production optimizations
echo "🌐 Building client..."
NODE_ENV=production npm run build -w client

# Create production directory structure
echo "📁 Creating production structure..."
mkdir -p dist/server
mkdir -p dist/client
mkdir -p dist/shared

# Copy built files
cp -r server/dist/* dist/server/
cp -r client/dist/* dist/client/
cp -r shared/dist/* dist/shared/

# Copy package files
cp server/package.json dist/server/
cp shared/package.json dist/shared/

# Copy environment files
cp .env.production dist/

echo "✅ Production build completed!"
echo "📊 Build summary:"
echo "   - Client: $(du -sh dist/client | cut -f1)"
echo "   - Server: $(du -sh dist/server | cut -f1)"
echo "   - Shared: $(du -sh dist/shared | cut -f1)"
echo ""
echo "🎯 To run in production:"
echo "   cd dist/server && npm install --production && node index.js"