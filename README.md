# VedaAI – AI Assessment Creator

> Full-stack AI-powered assessment creation platform for teachers. Generate structured question papers from topic descriptions or uploaded materials using Gemini AI.

---

## 🏗 Architecture Overview
```
vedaai/
├── frontend/          # Next.js 14 + TypeScript + Zustand
│   └── src/
│       ├── app/       # App Router pages
│       ├── components/ # Reusable UI components
│       ├── store/     # Zustand state management
│       ├── lib/       # API client, polling, PDF export
│       └── types/     # Shared TypeScript types
│
├── backend/           # Node.js + Express + TypeScript
│   └── src/
│       ├── routes/    # Express route handlers
│       ├── models/    # Mongoose schemas
│       ├── services/  # AI generation service
│       ├── workers/   # BullMQ worker processes
│       └── lib/       # Queue, WebSocket, Redis setup
│
└── docker-compose.yml # Local dev environment
```

## 🔄 System Flow
```
Teacher fills form → POST /api/assignments
    → Job queued in BullMQ (Redis)
    → Worker picks up job
    → Calls Gemini AI with structured prompt
    → Parses & validates AI response
    → Stores in MongoDB
    → Frontend polls for completion
    → Frontend renders paper
    → Optional: Export as PDF
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Gemini API key (free at aistudio.google.com)

### Option A: Docker (Recommended)
```bash
git clone <your-repo-url>
cd vedaai

# Add your API key
echo "GEMINI_API_KEY=your_key_here" > .env

# Start everything
docker-compose up --build
```

Frontend: http://localhost:3000  
Backend API: http://localhost:5000

### Option B: Manual Setup

**1. Start infrastructure**
```bash
docker run -d -p 27017:27017 mongo:7
docker run -d -p 6379:6379 redis:7-alpine
```

**2. Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your GEMINI_API_KEY
npm install
npm run dev
```

**3. Frontend** (separate terminal)
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## ⚙️ Environment Variables

**Backend (`backend/.env`)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend (`frontend/.env.local`)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

## 🧠 Technical Decisions

### AI Strategy
- **Model**: Gemini 2.5 Flash (free tier, high quality structured output)
- **Prompt**: Structured, context-rich prompt with explicit JSON schema
- **Parsing**: Regex-extracted JSON + field validation — no raw LLM output rendered
- **Difficulty distribution**: Prompted for even Easy/Moderate/Hard spread
- **Answer generation**: Each question includes a complete answer in the same API call

### State Management
- **Zustand** with devtools — lightweight, no boilerplate, perfect for this scope
- All form state, assignment list, and generation state in one store

### Real-time Updates
- **Polling** every 3 seconds — checks assignment status from backend
- Smooth animated progress bar with fake progress while waiting
- Auto-redirects on completion, shows clear error UI on failure
- More reliable than WebSocket on free hosting tiers

### Queue Architecture
- **BullMQ** over Redis for reliable job processing
- Worker runs inside the same process as the backend (free tier friendly)
- 3 retry attempts with exponential backoff on failure
- Job results cached in Redis (1hr TTL) to reduce DB reads

### PDF Export
- **jsPDF** — client-side, no server round-trip
- Proper page breaks, centered header, student info section, answer key on last page

## 📐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments` | List all assignments |
| POST | `/api/assignments` | Create assignment + queue job |
| GET | `/api/assignments/:id` | Get single assignment |
| GET | `/api/assignments/:id/paper` | Get generated paper (cached) |
| DELETE | `/api/assignments/:id` | Delete assignment |
| GET | `/api/assignments/job/:jobId/status` | Poll job state |

## 🎯 Bonus Features Implemented
- ✅ PDF export with proper formatting and answer key
- ✅ Difficulty badges (Easy/Moderate/Hard) with color coding
- ✅ Redis caching for generated papers
- ✅ Docker Compose for one-command local setup
- ✅ Zustand devtools
- ✅ Form validation (no empty/negative values)
- ✅ Toggle answer key visibility
- ✅ Mobile responsive with collapsible sidebar
- ✅ Polling-based progress with animated UI

## 🏭 Production Deployment

- **Frontend** → Vercel
- **Backend + Worker** → Render (Web Service)
- **MongoDB** → MongoDB Atlas (free M0 tier)
- **Redis** → Upstash (free tier)

## 🌐 Live Demo

- Frontend: https://your-app.vercel.app
- Backend: https://vedaai-backend-oo6c.onrender.com
