#!/bin/bash

# Start script for RESTerX Test API (Node.js)
echo "🚀 Starting RESTerX Test API (Node.js)..."
echo "📍 Directory: $(pwd)"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "📥 Please install Node.js from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed or not in PATH"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start the server
echo "🎯 Starting server on port 3000..."
npm start