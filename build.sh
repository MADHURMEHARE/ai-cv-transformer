#!/bin/bash

echo "🔨 Building AI CV Transformer Frontend..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

# Verify build output
if [ -d "out" ]; then
    echo "✅ Build successful! Output directory: out/"
    ls -la out/
else
    echo "❌ Build failed! Output directory not found."
    exit 1
fi

echo "🚀 Build completed successfully!"