# 🛡️ NeurAudit Sentinel

> **Real-time anti-corruption intelligence for Colombian public contracts**

[![Deploy](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://neuraudit-sentinel.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-green?logo=postgresql)](https://neon.tech)
[![AWS](https://img.shields.io/badge/AWS-Aurora%20DSQL-orange?logo=amazon-aws)](https://aws.amazon.com)

---

## 🌐 Live Demo

**👉 https://neuraudit-sentinel.vercel.app**

---

## 🧠 What is NeurAudit Sentinel?

NeurAudit Sentinel is a continuous anti-corruption monitoring SaaS platform designed to analyze, watch, and alert on the contractual behavior of Colombian public entities.

Unlike traditional reactive tools, Sentinel operates **proactively**: it monitors entities in real time, cross-references data from multiple sources (SECOP II, Contraloría, Procuraduría) and generates automatic alerts classified by risk level before problems escalate.

Sentinel is the continuous monitoring module of the **NeurAudit AI** ecosystem, complementing its point-in-time investigation capability with permanent surveillance.

---

## 🎯 Problem it solves

Colombia loses approximately **$50 trillion COP per year** to corruption in public procurement. Current control tools are:

- ❌ Reactive — they detect the problem after the damage is done
- ❌ Fragmented — they don't cross-reference data sources
- ❌ Inaccessible — only available to large government entities
- ❌ No alerts — require constant manual searching

**NeurAudit Sentinel solves this** with automatic monitoring, real-time alerts, and intelligent risk analysis accessible to any company or organization.

---

## ✨ Features

### 📊 Executive Dashboard
- Real-time KPIs: monitored entities, active alerts, contracts at risk
- Recent alerts feed with criticality level
- Quick watchlist view with latest activity

### 👁️ Smart Watchlist
- Add public entities by name and NIT
- Classification by type: company, person, territorial entity
- Persistent monitoring with activity history
- Search and filter by risk level (HIGH / MEDIUM / LOW)
- Entity deletion and management

### 🚨 Alert Center
- Automatic alerts classified by criticality
- Sources: SECOP II, Contraloría General, Procuraduría
- Visual indicators with pulse animation for critical alerts
- Filter by level and date

### 🔍 Investigate Module
- Free search of entities and contracts
- Risk analysis per contract
- Integration with SECOP II data

### ⚙️ Settings
- Notification preference management
- Alert threshold configuration
- Data source integrations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                    USER                          │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│          Next.js 16 App Router                   │
│         (Server + Client Components)             │
│                                                  │
│  /dashboard  /watchlist  /alerts  /investigate  │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           Next.js API Routes                     │
│        (Serverless Functions - Vercel)           │
│                                                  │
│   /api/watchlist   /api/alerts   /api/test-db   │
└─────────────────┬───────────────────────────────┘
                  │
     ┌────────────┴────────────┐
     │                         │
┌────▼────────┐      ┌────────▼────────┐
│    Neon     │      │   AWS Aurora    │
│ PostgreSQL  │      │     DSQL        │
│  (primary)  │      │  (scalability)  │
└─────────────┘      └─────────────────┘
```

---

## 🛠️ Tech stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16, React 19 | App Router, Server Components |
| Styles | Tailwind CSS v4 | Complete design system |
| UI | v0.dev + Lucide Icons | SOC-style components |
| Backend | Next.js API Routes | Serverless functions |
| Database | Neon PostgreSQL | Primary persistence |
| Cloud DB | AWS Aurora DSQL | Enterprise scalability |
| Hosting | Vercel | Automatic deployment |
| Animations | tw-animate-css | Micro-interactions |

---

## ⚙️ Installation & setup

### Prerequisites

- Node.js 22+
- npm
- [Neon](https://neon.tech) account (free)

### 1. Clone the repository

    git clone https://github.com/VIVIANAPLATA16/neuraudit-sentinel
    cd neuraudit-sentinel

### 2. Install dependencies

    npm install

### 3. Environment variables

Create a `.env.local` file in the root:

    DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require

### 4. Initialize database

With the server running, visit:

    http://localhost:3000/api/setup

### 5. Run in development

    npm run dev

Open http://localhost:3001

---

## 📊 Database schema

    -- Monitored entities
    CREATE TABLE watchlists (
      id          SERIAL PRIMARY KEY,
      nombre      TEXT NOT NULL,
      nit         TEXT,
      tipo        TEXT CHECK (tipo IN ('empresa', 'persona', 'entidad')),
      descripcion TEXT,
      created_at  TIMESTAMP DEFAULT NOW()
    );

    -- System-generated alerts
    CREATE TABLE alerts (
      id           SERIAL PRIMARY KEY,
      watchlist_id INTEGER REFERENCES watchlists(id) ON DELETE CASCADE,
      titulo       TEXT NOT NULL,
      descripcion  TEXT,
      nivel        TEXT CHECK (nivel IN ('alto', 'medio', 'bajo')),
      fuente       TEXT, -- 'SECOP', 'Contraloría', 'Procuraduría'
      created_at   TIMESTAMP DEFAULT NOW()
    );

    -- Investigation history
    CREATE TABLE investigations (
      id           SERIAL PRIMARY KEY,
      watchlist_id INTEGER REFERENCES watchlists(id) ON DELETE CASCADE,
      query        TEXT NOT NULL,
      resultado    JSONB,
      created_at   TIMESTAMP DEFAULT NOW()
    );

---

## 📁 Project structure

    neuraudit-sentinel/
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx                    # Main dashboard
    │   │   ├── layout.tsx                  # Global layout + sidebar
    │   │   ├── globals.css                 # Design tokens + Tailwind v4
    │   │   ├── watchlist/
    │   │   │   └── page.tsx                # Entity management (live DB)
    │   │   ├── alertas/
    │   │   │   └── page.tsx                # Alert center
    │   │   ├── investigar/
    │   │   │   └── page.tsx                # Search and analysis
    │   │   ├── configuracion/
    │   │   │   └── page.tsx                # Settings
    │   │   └── api/
    │   │       ├── watchlist/
    │   │       │   ├── route.ts            # GET + POST entities
    │   │       │   └── [id]/route.ts       # DELETE entity
    │   │       ├── setup/route.ts          # Initialize tables
    │   │       └── test-db/route.ts        # Health check
    │   ├── components/
    │   │   ├── app-shell.tsx               # Main shell + navigation
    │   │   ├── sidebar.tsx                 # Sidebar with active nav
    │   │   ├── risk-badge.tsx              # HIGH/MEDIUM/LOW badge
    │   │   ├── alert-feed.tsx              # Alert feed
    │   │   ├── kpi-card.tsx                # Metric cards
    │   │   ├── entity-card.tsx             # Entity card
    │   │   ├── page-header.tsx             # Page header
    │   │   ├── empty-state.tsx             # Empty state
    │   │   └── risk-gauge.tsx              # Risk gauge
    │   └── lib/
    │       ├── db.ts                       # Neon PostgreSQL connection
    │       ├── data.ts                     # TypeScript types
    │       └── utils.ts                    # cn() helper
    ├── .env.local                          # Environment variables (do not commit)
    ├── next.config.mjs
    └── package.json

---

## 🚀 Deploy on Vercel

    npm install -g vercel
    vercel

Add environment variables in the Vercel dashboard:
- `DATABASE_URL` — Neon connection string

---

## 🗺️ Roadmap

- [x] Dashboard with real-time KPIs
- [x] Watchlist connected to database
- [x] Full CRUD for entities
- [x] Alert system with risk levels
- [ ] Real-time SECOP II API integration
- [ ] Automatic alerts via webhook
- [ ] AI module for risk scoring
- [ ] PDF report export
- [ ] Email/Slack notifications

---

## 🤝 Part of the NeurAudit Ecosystem

| Product | Description | URL |
|---------|-------------|-----|
| **NeurAudit AI** | Point-in-time investigation with AI | [neuraudit-web...run.app](https://neuraudit-web-986541948066.us-central1.run.app/) |
| **NeurAudit Sentinel** | Continuous monitoring + alerts | [neuraudit-sentinel.vercel.app](https://neuraudit-sentinel.vercel.app) |

---

## 📄 License

MIT © 2026 Viviana Plata

---

*Built for H0 Hackathon — AWS + Vercel + Neon 2026*
