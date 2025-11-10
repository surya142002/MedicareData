#!/bin/bash
echo "🛑 Stopping PostgreSQL..."
brew services stop postgresql
pkill -f "nodemon server.js"
pkill -f "npm run dev"
echo "✅ All services stopped."
