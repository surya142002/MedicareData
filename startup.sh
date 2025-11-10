#!/bin/bash
# Medicare Project Startup Script (VS Code terminals version)

echo "🚀 Starting Medicare Project..."

# Start PostgreSQL if not already running
if ! brew services list | grep -q "postgresql.*started"; then
  echo "🐘 Starting PostgreSQL..."
  brew services start postgresql
else
  echo "🐘 PostgreSQL already running."
fi

echo "✅ PostgreSQL ready. Launching backend and frontend via VS Code tasks..."
