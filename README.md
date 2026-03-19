# VedaAI – AI Assessment Creator

> Full-stack AI-powered assessment creation platform for teachers. Generate structured question papers from topic descriptions or uploaded materials using Claude AI.

---

## 🏗 Architecture Overview

```
vedaai/
├── frontend/          # Next.js 14 + TypeScript + Zustand
│   └── src/
│       ├── app/       # App Router pages
│       ├── components/ # Reusable UI components
│       ├── store/     # Zustand state management
│       ├── lib/       # API client, WebSocket hook, PDF export
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
    → Calls Claude API with structured prompt
    → Parses & validates AI response
    → Stores in MongoDB
    → Notifies frontend via WebSocket
    → Frontend renders paper
    → Optional: Export as PDF
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Anthropic API key

### Option A: Docker (Recommended)

```bash
git clone <your-repo-url>
cd vedaai

# Add your API key
echo "ANTHROPIC_API_KEY=your_key_here" > .env

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
# Edit .env with your ANTHROPIC_API_KEY
npm install
npm run dev
```

**3. Worker** (separate terminal)
```bash
cd backend
npm run worker
```

**4. Frontend** (separate terminal)
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
ANTHROPIC_API_KEY=your_key
FRONTEND_URL=http://localhost:3000
```

**Frontend (`frontend/.env.local`)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

## 🧠 Technical Decisions

### AI Strategy
- **Model**: Claude claude-opus-4-5 (best structured output quality)
- **Prompt**: Structured, context-rich prompt with explicit JSON schema
- **Parsing**: Regex-extracted JSON + field validation — no raw LLM output rendered
- **Difficulty distribution**: Prompted for even Easy/Moderate/Hard spread
- **Answer generation**: Each question includes a complete answer in the same API call

### State Management
- **Zustand** with devtools — lightweight, no boilerplate, perfect for this scope
- All form state, assignment list, and generation state in one store
- Devtools enabled for debugging in development

### Real-time Updates
- **WebSocket** connection keyed by `jobId`
- Reconnects automatically on disconnect
- Progress events: `JOB_STATUS` → `JOB_PROGRESS` → `JOB_COMPLETE` / `JOB_ERROR`

### Queue Architecture
- **BullMQ** over Redis for reliable job processing
- Worker runs as a separate process (scalable independently)
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
| POST | `/api/assignments/:id/regenerate` | Re-queue generation |
| DELETE | `/api/assignments/:id` | Delete assignment |
| GET | `/api/assignments/job/:jobId/status` | Poll job state |
| WS | `/ws?jobId=xxx` | Real-time job updates |

## 🎯 Bonus Features Implemented
- ✅ PDF export with proper formatting and answer key
- ✅ Regenerate action on output page
- ✅ Difficulty badges (Easy/Moderate/Hard) with color coding
- ✅ Redis caching for generated papers
- ✅ Docker Compose for one-command setup
- ✅ WebSocket reconnect logic
- ✅ Zustand devtools
- ✅ Form validation (no empty/negative values)
- ✅ Toggle answer key visibility

## 🏭 Production Deployment

For Render/Railway:
1. Deploy MongoDB Atlas + Redis Cloud (free tiers work)
2. Deploy backend as web service + set env vars
3. Deploy worker as background worker service
4. Deploy frontend as static/Next.js service
5. Update `NEXT_PUBLIC_API_URL` to production backend URL
