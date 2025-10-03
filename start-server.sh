#!/bin/bash
# Start local development server for BrainSAIT Healthcare SDK

# Ensure we're in the correct directory
cd /Users/fadil369/sdk/sdk

# Verify we have the public directory
if [ ! -d "public" ]; then
    echo "❌ Error: public directory not found in $(pwd)"
    echo "Please run this script from the SDK root directory"
    exit 1
fi

# Verify key files exist
if [ ! -f "public/index.html" ]; then
    echo "❌ Error: index.html not found"
    exit 1
fi

if [ ! -f "public/index.umd.js" ]; then
    echo "❌ Error: index.umd.js not found"
    exit 1
fi

echo "✅ Starting BrainSAIT Healthcare SDK development server..."
echo "📂 Directory: $(pwd)"
echo "🌐 Server: http://localhost:8000"
echo "🎯 Files: index.html ($(du -h public/index.html | cut -f1)), index.umd.js ($(du -h public/index.umd.js | cut -f1))"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
python3 -m http.server 8000 --directory public