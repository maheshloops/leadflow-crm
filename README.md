# LeadFlow CRM — Client Lead Management System

A production-ready mini CRM for managing client leads from website contact forms. Built with React, Node.js/Express, and MongoDB.

## Features

- **Lead Management** — Add, view, edit, delete leads with full contact details
- **Status Tracking** — New → Contacted → Converted / Lost pipeline
- **Sales Pipeline View** — Kanban-style visual board
- **Analytics Dashboard** — Conversion rates, source breakdown, pipeline value
- **Notes & Follow-ups** — Per-lead notes with timestamps
- **AI Follow-up Generator** — Claude AI writes personalized outreach emails
- **Secure Admin Access** — JWT-based authentication
- **Search & Filter** — Real-time search and status filtering

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcrypt |
| AI | Anthropic Claude API |

## Project Structure

```
leadflow-crm/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── api.js       # Axios API client
│   └── vite.config.js
├── server/              # Express backend
│   ├── routes/          # API route handlers
│   ├── models/          # Mongoose schemas
│   ├── middleware/       # Auth, error handling
│   └── index.js         # Server entry point
├── .env.example
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local or MongoDB Atlas)
- Anthropic API key (for AI features)

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/leadflow-crm.git
cd leadflow-crm

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Run development servers

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

Frontend runs at `http://localhost:5173`, API at `http://localhost:3001`.

### 4. Create admin account

```bash
cd server && node scripts/createAdmin.js
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Admin login |
| GET | `/api/leads` | List all leads (with filters) |
| POST | `/api/leads` | Create a lead |
| GET | `/api/leads/:id` | Get lead details |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| PATCH | `/api/leads/:id/status` | Update status only |
| POST | `/api/leads/:id/notes` | Add a note |
| GET | `/api/leads/stats` | Aggregate stats |
| POST | `/api/leads/:id/followup` | Generate AI email |

## Environment Variables

```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/leadflow
JWT_SECRET=your_secret_key_here
ANTHROPIC_API_KEY=sk-ant-...
CLIENT_URL=http://localhost:5173
```

## Deployment

The app is ready for deployment on:
- **Railway** — `railway up` from root (uses docker-compose)
- **Render** — Connect repo, set env vars, deploy backend + frontend separately
- **Vercel + Railway** — Frontend on Vercel, backend on Railway

## License

MIT
