# Taskwell — Task Management System
### Track A: Full-Stack Engineer Assessment

A complete task management system built with **Node.js + TypeScript** backend and **Next.js + TypeScript** frontend.

---

## Project Structure

```
task-management/
├── backend/                  # Node.js REST API
│   ├── prisma/
│   │   └── schema.prisma     # Database schema (SQLite)
│   ├── src/
│   │   ├── controllers/      # auth.controller.ts, task.controller.ts
│   │   ├── middleware/       # auth.middleware.ts, error.middleware.ts
│   │   ├── routes/           # auth.routes.ts, task.routes.ts
│   │   ├── utils/            # jwt.utils.ts
│   │   ├── lib/              # prisma.ts (singleton client)
│   │   └── index.ts          # Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                 # Next.js 14 App Router
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx        # Root layout (fonts, providers, toaster)
    │   │   ├── globals.css       # Tailwind + custom styles
    │   │   ├── page.tsx          # Redirect → /dashboard
    │   │   ├── login/page.tsx    # Login page
    │   │   ├── register/page.tsx # Register page
    │   │   └── dashboard/
    │   │       ├── layout.tsx    # Auth guard + Sidebar wrapper
    │   │       └── page.tsx      # Main task dashboard
    │   ├── components/
    │   │   ├── Sidebar.tsx           # Nav + user section (desktop + mobile)
    │   │   ├── TaskCard.tsx          # Individual task display
    │   │   ├── TaskModal.tsx         # Create/Edit modal
    │   │   ├── DeleteConfirmModal.tsx
    │   │   ├── FilterBar.tsx         # Search + filter + sort controls
    │   │   ├── Pagination.tsx        # Page controls
    │   │   └── SkeletonCard.tsx      # Loading placeholder
    │   ├── context/
    │   │   └── AuthContext.tsx       # Auth state + login/logout/register
    │   └── lib/
    │       └── api.ts               # Typed API client with auto token refresh
    ├── .env.example
    ├── next.config.js
    ├── tailwind.config.js
    └── tsconfig.json
```

---

## Quick Start

### 1. Backend

```bash
cd backend

# Copy and fill in environment variables
cp .env.example .env

# Install dependencies
npm install

# Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev --name init

# Start development server (http://localhost:3001)
npm run dev
```

### 2. Frontend

```bash
cd frontend

# Copy environment variables
cp .env.example .env.local

# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Backend API Reference

### Authentication

| Method | Endpoint         | Auth | Description                          |
|--------|-----------------|------|--------------------------------------|
| POST   | /auth/register  | No   | Create account, returns tokens       |
| POST   | /auth/login     | No   | Login, returns tokens                |
| POST   | /auth/refresh   | No   | Rotate refresh token, new access JWT |
| POST   | /auth/logout    | No   | Revoke refresh token                 |

**Register / Login body:**
```json
{
  "email": "jane@example.com",
  "password": "secret123",
  "name": "Jane Smith"
}
```

**Token response:**
```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "accessToken": "<jwt>",
  "refreshToken": "<uuid>"
}
```

### Tasks (all require `Authorization: Bearer <accessToken>`)

| Method | Endpoint           | Description                  |
|--------|--------------------|------------------------------|
| GET    | /tasks             | List tasks (paginated)       |
| POST   | /tasks             | Create task                  |
| GET    | /tasks/:id         | Get single task              |
| PATCH  | /tasks/:id         | Update task fields           |
| DELETE | /tasks/:id         | Delete task                  |
| PATCH  | /tasks/:id/toggle  | Cycle task status            |

**GET /tasks query parameters:**

| Param     | Type             | Default      | Description                        |
|-----------|------------------|--------------|------------------------------------|
| page      | number           | 1            | Page number                        |
| limit     | number (max 50)  | 10           | Items per page                     |
| status    | PENDING / IN_PROGRESS / COMPLETED | — | Filter by status |
| priority  | LOW / MEDIUM / HIGH | —         | Filter by priority                 |
| search    | string           | —            | Search in task title               |
| sortBy    | string           | createdAt    | Sort field                         |
| sortOrder | asc / desc       | desc         | Sort direction                     |

**Pagination response shape:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 9,
    "total": 42,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Security Implementation

### JWT Strategy
- **Access Token**: Short-lived JWT (15 min), signed with `JWT_ACCESS_SECRET`, sent in `Authorization: Bearer` header
- **Refresh Token**: UUID stored in the database with expiry (7 days). On each use, the old token is **revoked** and a new one is issued (rotation prevents replay attacks)
- On 401, the frontend **automatically retries** with a fresh access token using the stored refresh token — fully transparent to the user

### Password Security
- Hashed with **bcrypt** (12 salt rounds) before storage
- Plain-text passwords are never stored or logged

### Input Validation
- All inputs validated with `express-validator` on routes
- Proper HTTP status codes: 400 (validation), 401 (auth), 404 (not found), 409 (conflict), 500 (server error)

---

## Frontend Features

### Authentication Flow
- Login / Register pages with form validation via `react-hook-form`
- Tokens stored in `localStorage`; user object cached for UI display
- Auth context (`useAuth`) wraps the app — all protected routes check auth state
- Automatic redirect: unauthenticated → `/login`, authenticated → `/dashboard`

### Dashboard
- **Status summary bar**: real-time counts for All / Pending / In Progress / Completed
- **Task grid**: responsive 1 → 2 → 3 column layout
- **Priority stripe**: colored left border (red = high, amber = medium, grey = low)
- **Overdue indicator**: date shown in red with ⚠ icon
- **Hover actions**: toggle ↻, edit ✎, delete ✕ appear on card hover
- **Empty state**: contextual message depending on filters

### Filtering & Sorting
- Full-text search (debounced 400ms)
- Status filter dropdown
- Priority filter dropdown
- Sort by: newest, oldest, due date, title (A–Z / Z–A)
- "Clear all filters" shortcut when any filter is active

### Modals
- Create/Edit task modal: title, description, status, priority, due date
- Delete confirmation modal with task name preview
- Both modals close on Escape key or overlay click

### UX Details
- Toast notifications (top-right) for all operations
- Skeleton loading cards during fetch
- Staggered entrance animations on task grid
- Responsive sidebar: fixed on desktop, hamburger overlay on mobile
- Spinner on all async buttons

---

## Design System

**Theme:** Editorial Brutalism meets warm parchment

| Token      | Value     | Use                          |
|------------|-----------|------------------------------|
| `ink`      | `#0D0D0D` | Primary text, backgrounds    |
| `cream`    | `#F7F5EF` | Page background              |
| `parchment`| `#EDE9DE` | Secondary surfaces           |
| `clay`     | `#C4704B` | Accent, destructive actions  |
| `sage`     | `#6B8C74` | Success, in-progress state   |
| `amber`    | `#E8B84B` | Pending state, medium priority|

**Fonts:** Playfair Display (headings) + DM Sans (body) + DM Mono (labels, badges)

---

## Environment Variables

### Backend `.env`
```
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET="change-me-in-production"
JWT_REFRESH_SECRET="change-me-in-production"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| Backend     | Node.js, Express, TypeScript                   |
| ORM         | Prisma                                         |
| Database    | SQLite (dev) — swap `DATABASE_URL` for Postgres|
| Auth        | JWT (access) + UUID refresh tokens + bcrypt    |
| Validation  | express-validator                              |
| Frontend    | Next.js 14 (App Router), TypeScript            |
| Styling     | Tailwind CSS + custom design system            |
| Forms       | react-hook-form                                |
| Toasts      | react-hot-toast                                |
| Date utils  | date-fns                                       |
