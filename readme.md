# Caaampaign — System & Stack Overview

A full-stack campaign management platform that allows administrators to create and manage campaigns, products, and track participant submissions. Public visitors can browse active campaigns and register their interest by submitting a form, triggering an automated confirmation email.

---

## Access the website

https://industrious-prosperity-production-aae3.up.railway.app/

## Local Development Setup

```bash
# 1. Start PostgreSQL (ensure DB caaampaign_db exists)
docker compose up

# 2. Backend
cd backend
pnpm install
pnpm migration:run         # apply all migrations
pnpm start:dev             # http://localhost:8080

# 3. Frontend
cd frontend
pnpm install
# create .env with NEXT_PUBLIC_API_URL=http://localhost:8080
pnpm run dev                   # http://localhost:3000
```

## High-Level Architecture

```
Browser (User / Admin)
        │
        │  HTTP / HTTPS
        ▼
┌───────────────────┐
│   Next.js 16      │  ← Frontend (SSR + Client)
│   (Port 3000)     │
└────────┬──────────┘
         │
         │  REST API  (JSON over HTTP)
         ▼
┌───────────────────┐
│   NestJS 11       │  ← Backend API Server
│   (Port 8080)     │
└──┬────────────┬───┘
   │            │
   ▼            ▼
┌──────────┐  ┌─────────────────┐
│PostgreSQL│  │ Third-party APIs │
│(TypeORM) │  │                 │
│          │  │ • Cloudinary    │  ← Image CDN
│          │  │ • Gmail OAuth2  │  ← Transactional Email
└──────────┘  └─────────────────┘
```

---

## Frontend

### Technology Stack

| Layer           | Technology            | Version |
| --------------- | --------------------- | ------- |
| Framework       | Next.js (App Router)  | 16.2.3  |
| UI Runtime      | React                 | 19.2.4  |
| Language        | TypeScript            | ^5      |
| Styling         | Tailwind CSS          | v4      |
| Icons           | Lucide React          | ^1.8    |
| Font            | Geist (via next/font) | —       |
| Package Manager | pnpm                  | —       |

### Rendering Strategy

Next.js App Router is used throughout. Each page chooses the right rendering model for its data requirements:

| Page               | Rendering   | Reason                                                             |
| ------------------ | ----------- | ------------------------------------------------------------------ |
| `/` (Landing)      | Dynamic SSR | Always fetches latest published campaigns from API at request time |
| `/campaign/[slug]` | Dynamic SSR | Fetches campaign + products per request; slug-based routing        |
| `/admin/*`         | Dynamic SSR | All admin data is always fresh; no stale cache                     |

There is no client-side data fetching for initial page loads — the server renders fully-populated HTML. Client components (`'use client'`) are used only for interactive UI that requires browser state (forms, modals, sidebar navigation).

## Backend

### Technology Stack

| Layer           | Technology                            | Version      |
| --------------- | ------------------------------------- | ------------ |
| Framework       | NestJS                                | ^11          |
| Language        | TypeScript                            | —            |
| ORM             | TypeORM                               | ^11          |
| Database Driver | pg (node-postgres)                    | ^8           |
| Validation      | class-validator + class-transformer   | ^0.15 / ^0.5 |
| File Upload     | Multer (via @nestjs/platform-express) | ^2           |
| Email           | Nodemailer + Gmail OAuth2             | ^8           |
| Image CDN       | Cloudinary SDK v2                     | ^2.9         |
| Migration Tool  | node-pg-migrate                       | ^8           |
| Config          | @nestjs/config (dotenv)               | ^4           |

### REST API Endpoints

#### Campaigns — `/campaigns`

| Method   | Path                    | Description                                               |
| -------- | ----------------------- | --------------------------------------------------------- |
| `POST`   | `/campaigns`            | Create campaign (multipart/form-data with optional image) |
| `GET`    | `/campaigns`            | List all campaigns ordered by `created_at DESC`           |
| `GET`    | `/campaigns/slug/:slug` | Find campaign by URL slug                                 |
| `GET`    | `/campaigns/:id`        | Find campaign by UUID                                     |
| `PATCH`  | `/campaigns/:id`        | Partial update                                            |
| `DELETE` | `/campaigns/:id`        | Delete (returns 204 No Content)                           |

#### Products — `/products`

| Method   | Path                             | Description                           |
| -------- | -------------------------------- | ------------------------------------- |
| `POST`   | `/products`                      | Create product (linked to a campaign) |
| `GET`    | `/products`                      | List all products                     |
| `GET`    | `/products/campaign/:campaignId` | List products for a specific campaign |
| `GET`    | `/products/:id`                  | Find product by UUID                  |
| `PATCH`  | `/products/:id`                  | Partial update                        |
| `DELETE` | `/products/:id`                  | Delete (returns 204 No Content)       |

#### Submissions — `/submissions`

| Method   | Path                                 | Description                                 |
| -------- | ------------------------------------ | ------------------------------------------- |
| `POST`   | `/submissions`                       | Create submission + fire email confirmation |
| `GET`    | `/submissions`                       | List all submissions                        |
| `GET`    | `/submissions/by-product/:productId` | Filter submissions by product               |
| `GET`    | `/submissions/:id`                   | Find submission by UUID                     |
| `DELETE` | `/submissions/:id`                   | Delete (returns 204 No Content)             |

### Request Lifecycle

```
HTTP Request
     │
     ▼
ValidationPipe (global)
     │  class-validator decorators run on DTO
     │  whitelist: true strips unknown properties
     ▼
Controller   (route handler, no logic)
     │
     ▼
Service      (business logic)
     │  findOneBy / find / save / remove via TypeORM Repository
     ▼
TypeORM Repository
     │
     ▼
PostgreSQL
```

For the submission flow specifically:

```
POST /submissions
     │
     ▼
SubmissionService.create()
     ├── ProductService.findOne(productId)    ← validates product exists
     ├── CampaignService.findOne(campaignId)  ← resolves campaign name
     ├── submissionRepo.save(submission)      ← persist to DB
     └── MailService.sendSubmissionConfirmation()  ← fire-and-forget
              │  (errors are caught + logged, do not fail the HTTP response)
              ▼
         Nodemailer → Gmail OAuth2 → User's inbox
```

---

## Database

### Technology

| Component  | Technology                          |
| ---------- | ----------------------------------- |
| Database   | PostgreSQL                          |
| ORM        | TypeORM (with `synchronize: false`) |
| Migrations | node-pg-migrate                     |

`synchronize: false` is intentional — the schema is never auto-modified by the ORM. All schema changes go through versioned migration files.

## Third-Party Integrations

### Cloudinary — Image CDN

### Gmail OAuth2 — Transactional Email

## Environment Variables

### Frontend (`frontend/.env`)

| Variable              | Purpose                                                                    |
| --------------------- | -------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the NestJS backend. Embedded at build time into the JS bundle. |

### Backend (`backend/.env`)

| Variable                | Purpose                                                 |
| ----------------------- | ------------------------------------------------------- |
| `PORT`                  | HTTP port the NestJS server listens on (default `8080`) |
| `POSTGRES_HOST`         | PostgreSQL host                                         |
| `POSTGRES_PORT`         | PostgreSQL port (default `5432`)                        |
| `POSTGRES_USER`         | Database user                                           |
| `POSTGRES_PASSWORD`     | Database password                                       |
| `POSTGRES_DB`           | Database name                                           |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name                           |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                                      |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                                   |
| `GMAIL_USER`            | Gmail address used as sender                            |
| `GMAIL_CLIENT_ID`       | Google OAuth2 client ID                                 |
| `GMAIL_CLIENT_SECRET`   | Google OAuth2 client secret                             |
| `GMAIL_REFRESH_TOKEN`   | Long-lived OAuth2 refresh token for Gmail               |

---

---

## AI-Assisted Development

This project was built assisted with **Claude Code** as development tool.

```

```
