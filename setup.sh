#!/bin/bash
set -e

echo "🚀 VedaAI Setup Script"
echo "======================="

# Check dependencies
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required. Install from https://docker.com"; exit 1; }

# Check for .env
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "📝 Created backend/.env — please set your ANTHROPIC_API_KEY"
  echo "   Edit backend/.env and add: ANTHROPIC_API_KEY=sk-ant-..."
  read -p "Press Enter after setting your API key..."
fi

if [ ! -f frontend/.env.local ]; then
  cp frontend/.env.example frontend/.env.local
  echo "📝 Created frontend/.env.local"
fi

# Option: Docker or Manual
echo ""
echo "How would you like to run VedaAI?"
echo "1) Docker Compose (easiest, requires Docker)"
echo "2) Manual (requires Node.js + local MongoDB/Redis)"
read -p "Choice [1/2]: " CHOICE

if [ "$CHOICE" = "1" ]; then
  echo ""
  echo "🐳 Starting with Docker Compose..."
  # Load ANTHROPIC_API_KEY into docker env
  export $(grep -v '^#' backend/.env | xargs)
  docker-compose up --build
else
  echo ""
  echo "📦 Installing dependencies..."
  cd backend && npm install && cd ..
  cd frontend && npm install && cd ..

  echo ""
  echo "🔴 Starting Redis & MongoDB via Docker..."
  docker run -d --name vedaai-mongo -p 27017:27017 mongo:7 2>/dev/null || echo "MongoDB already running"
  docker run -d --name vedaai-redis -p 6379:6379 redis:7-alpine 2>/dev/null || echo "Redis already running"

  echo ""
  echo "✅ Ready! Start each service in a separate terminal:"
  echo ""
  echo "  Terminal 1 (Backend):  cd backend && npm run dev"
  echo "  Terminal 2 (Worker):   cd backend && npm run worker"
  echo "  Terminal 3 (Frontend): cd frontend && npm run dev"
  echo ""
  echo "  Then open: http://localhost:3000"
fi
