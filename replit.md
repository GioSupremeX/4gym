# 4ο Γυμνάσιο Ρόδου – Καζούλλειο

## Project Overview

Premium full-stack school website for "4ο Γυμνάσιο Ρόδου – Καζούλλειο" (Rhodes Middle School). Features include article publishing, announcements, contact form, newsletter subscription, comments, admin dashboard, accessibility menu, math CAPTCHA, spam cooldowns, and dynamic school year.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite, shadcn/ui, Tailwind CSS, wouter, TanStack Query v5
- **Backend**: Express + TypeScript, Drizzle ORM, PostgreSQL
- **Database**: PostgreSQL with Drizzle ORM schema in `shared/schema.ts`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NODE_ENV` | No | `development` or `production` |
| `PORT` | No | Server port (default: 5000) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Express + Vite) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema changes to database |
| `npm run check` | TypeScript type check |

## Local Development Setup

1. **Install Node.js 20+** and **PostgreSQL**
2. **Install dependencies**: `npm install`
3. **Create `.env`**: `cp .env.example .env` — edit `DATABASE_URL` with your local Postgres
4. **Create database**: `createdb school_db`
5. **Push schema**: `npx drizzle-kit push`
6. **Seed data**: Seed the `site_settings` table (row id=1) via SQL or first API call
7. **Run**: `npm run dev` — app opens on `http://localhost:5000`

## Admin Dashboard

Access at `/secret/edit`. Passcode is stored in `site_settings.adminCode` (default: `123`). Auto-login via `?passcode=123` query parameter.

## User Preferences
- Light mode default (dark mode available)
- Greek language throughout
- Accessibility menu: Ctrl+U shortcut
