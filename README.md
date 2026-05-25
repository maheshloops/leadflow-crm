# LeadFlow CRM — Client Lead Management System

A production-ready mini CRM for managing client leads from website contact forms. Built with React, Node.js/Express, and **MySQL** via Sequelize ORM.

## Features

- **Lead Management** — Add, view, edit, delete leads with full contact details
- **Status Tracking** — New → Contacted → Converted / Lost pipeline
- **Sales Pipeline** — Drag-and-drop Kanban board
- **Analytics Dashboard** — Conversion rates, source breakdown, pipeline value
- **Notes & Follow-ups** — Per-lead notes stored in a relational `notes` table
- **AI Follow-up Generator** — Claude AI writes personalized outreach emails
- **Secure Admin Access** — JWT-based authentication with bcrypt passwords

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express 4 |
| Database | **MySQL 8** via **Sequelize ORM** |
| Auth | JWT + bcrypt |
| AI | Anthropic Claude API |

## Database Schema

```
users
  id, name, email, password, role, created_at, updated_at

leads
  id, first, last, email, phone, company, source, status,
  value, tags (JSON), assigned_to, created_at, updated_at

notes
  id, lead_id (FK → leads.id CASCADE DELETE), text, created_at
```

## Project Structure

```
leadflow-crm/
├── client/              # React frontend (unchanged)
│   └── src/
│       ├── api.js
│       ├── pages/
│       └── components/
├── server/
│   ├── db/index.js      # Sequelize connection singleton
│   ├── models/
│   │   ├── index.js     # Associations (Lead hasMany Notes)
│   │   ├── Lead.js      # Sequelize model
│   │   ├── Note.js      # Sequelize model
│   │   └── User.js      # Sequelize model + bcrypt hook
│   ├── routes/
│   │   ├── auth.js
│   │   └── leads.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js  # Handles Sequelize ValidationError etc.
│   ├── scripts/createAdmin.js
│   └── index.js
├── docker-compose.yml   # MySQL 8 + server + client
└── .env.example
```

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8 running locally (or use Docker)
- Anthropic API key

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/leadflow-crm.git
cd leadflow-crm
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Set MYSQL_HOST, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, JWT_SECRET, ANTHROPIC_API_KEY
```

### 3. Create MySQL database

```sql
CREATE DATABASE leadflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Sequelize will auto-create the tables on first run (`sync({ alter: true })` in dev).

### 4. Run dev servers

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

### 5. Seed admin account

```bash
cd server && node scripts/createAdmin.js
# Email: admin@leadflow.com  Password: Admin@123
```

## Docker (full stack)

```bash
cp .env.example .env   # fill in JWT_SECRET, ANTHROPIC_API_KEY
docker-compose up --build
```

MySQL data persists in the `mysql_data` volume.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Current user |
| GET | `/api/leads` | List (search, filter, paginate) |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads/stats` | Aggregate stats |
| GET | `/api/leads/:id` | Lead + notes |
| PUT | `/api/leads/:id` | Update lead |
| PATCH | `/api/leads/:id/status` | Status only |
| POST | `/api/leads/:id/notes` | Add note |
| DELETE | `/api/leads/:id` | Delete (cascades notes) |
| POST | `/api/leads/:id/followup` | AI email |

## License

MIT
