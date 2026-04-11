# Caaampaign — System & Stack Overview

A full-stack campaign management platform that allows administrators to create and manage campaigns, products, and track participant submissions. Public visitors can browse active campaigns and register their interest by submitting a form, triggering an automated confirmation email.

---

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

### Directory Structure

```
frontend/src/
├── app/
│   ├── (public)/               ← Route group: public-facing pages
│   │   ├── layout.tsx          ← Wraps all public pages with Navbar + Footer
│   │   ├── page.tsx            ← Landing page  /
│   │   └── campaign/
│   │       └── [slug]/
│   │           ├── page.tsx            ← Campaign detail  /campaign/:slug
│   │           └── submission-form.tsx ← Client component: submission form
│   ├── admin/                  ← Admin CMS (no auth guard currently)
│   │   ├── layout.tsx          ← Admin shell with sidebar
│   │   ├── sidebar.tsx         ← Client component: active-link navigation
│   │   ├── page.tsx            ← Dashboard with stats  /admin
│   │   ├── campaigns/
│   │   │   ├── page.tsx                ← SSR: fetch all campaigns
│   │   │   └── campaigns-client.tsx    ← Client: CRUD modal + table
│   │   ├── products/
│   │   │   ├── page.tsx                ← SSR: fetch products + campaigns
│   │   │   └── products-client.tsx     ← Client: CRUD modal + table
│   │   └── submissions/
│   │       ├── page.tsx                ← SSR: fetch submissions + lookup data
│   │       └── submissions-client.tsx  ← Client: table + delete
│   ├── layout.tsx              ← Root layout: html/body/fonts
│   └── globals.css             ← Tailwind v4 + CSS custom properties
├── components/
│   ├── navbar.tsx              ← Reusable public navbar (Server Component)
│   └── footer.tsx              ← Reusable footer (Server Component)
├── lib/
│   └── api.ts                  ← Typed API client (campaignApi, productApi, submissionApi)
└── types/
    └── index.ts                ← Shared TypeScript interfaces (Campaign, Product, Submission)
```

### Server / Client Component Split

```
PublicLayout (Server)
├── Navbar (Server)
├── Page content (Server) — SSR data fetch happens here
│   └── SubmissionForm (Client) — needs useState, form events
└── Footer (Server)

AdminLayout (Server)
├── AdminSidebar (Client) — needs usePathname for active link
└── Page content (Server)
    └── *Client components (Client) — CRUD modals, local state
```

### Key Design Decisions

- **Route group `(public)/`** — groups public pages under a shared layout without affecting URL structure. Adding a new public page just requires dropping a file in this folder.
- **Typed API client** (`lib/api.ts`) — all API calls go through `campaignApi`, `productApi`, and `submissionApi` helpers. This centralises the base URL, error handling, and TypeScript generics in one place.
- **Environment variable guard** — the API module throws at startup if `NEXT_PUBLIC_API_URL` is not set, giving an explicit error instead of silent failures at runtime.

---

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

### Module Architecture

NestJS organises the application into self-contained feature modules. Each module owns its controller, service, entity, and DTOs.

```
AppModule
├── ConfigModule (global)        ← .env → ConfigService across all modules
├── TypeOrmModule (async)        ← Database connection via ConfigService
├── CampaignModule
│   ├── CampaignController       ← REST endpoints  /campaigns
│   ├── CampaignService          ← Business logic, slug uniqueness
│   └── Campaign entity          ← Mapped to `campaign` table
├── ProductModule
│   ├── ProductController        ← REST endpoints  /products
│   ├── ProductService           ← Business logic, name uniqueness per campaign
│   └── Product entity           ← Mapped to `product` table
└── SubmissionModule
    ├── SubmissionController     ← REST endpoints  /submissions
    ├── SubmissionService        ← Orchestrates: save → send email (fire-and-forget)
    ├── Submission entity         ← Mapped to `submission` table
    ├── ProductModule (imported)  ← Resolves product for email context
    ├── CampaignModule (imported) ← Resolves campaign name for email subject
    └── MailModule (imported)     ← Injected for sending confirmation
```

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

### Schema

```
┌─────────────────────────────────────────────────────┐
│  campaign                                           │
├─────────────────────────────────────────────────────┤
│  id             UUID        PK  gen_random_uuid()   │
│  campaign_name  TEXT        NOT NULL                │
│  slug           VARCHAR(255) UNIQUE  INDEX          │
│  description    TEXT        NOT NULL                │
│  status         ENUM        'draft' | 'published'   │
│  background_image TEXT      NULLABLE                │
│  created_at     TIMESTAMP   DEFAULT current_timestamp│
│  updated_at     TIMESTAMP   DEFAULT current_timestamp│
└─────────────────────────────────────────────────────┘
           │ 1
           │
           │ N
┌─────────────────────────────────────────────────────┐
│  product                                            │
├─────────────────────────────────────────────────────┤
│  id             UUID        PK                      │
│  campaign_id    UUID        FK → campaign.id        │
│  product_name   TEXT        NOT NULL  UNIQUE        │
│  description    TEXT        NOT NULL                │
│  event_date     DATE        NOT NULL                │
│  created_at     TIMESTAMP                           │
│  updated_at     TIMESTAMP                           │
└─────────────────────────────────────────────────────┘
           │ 1
           │
           │ N
┌─────────────────────────────────────────────────────┐
│  submission                                         │
├─────────────────────────────────────────────────────┤
│  id             UUID        PK                      │
│  product_id     UUID        FK → product.id         │
│  name           TEXT        NOT NULL                │
│  email          TEXT        NOT NULL                │
│  phone          TEXT        NOT NULL                │
│  created_at     TIMESTAMP                           │
│  updated_at     TIMESTAMP                           │
└─────────────────────────────────────────────────────┘
```

## Third-Party Integrations

### Cloudinary — Image CDN

Campaign background images are uploaded through the backend API, not directly from the browser. This keeps credentials server-side.

```
Browser → multipart/form-data → NestJS (Multer)
                                      │
                                      │ file.buffer
                                      ▼
                              CloudinaryService
                                      │  upload_stream  →  Cloudinary CDN
                                      │
                                      ▼
                              secure_url (stored in DB)
                                      │
                                      ▼
                     Next.js <Image> with remotePatterns: res.cloudinary.com
```

Cloudinary is configured with a dedicated `campaigns/` folder. The returned `secure_url` is stored in the `background_image` column and rendered via Next.js `<Image>` with built-in optimisation (lazy load, WebP conversion, responsive sizing).

### Gmail OAuth2 — Transactional Email

Confirmation emails are sent after every successful submission. The email is sent **fire-and-forget** — the HTTP response is not delayed or failed if the email fails. Errors are caught and logged server-side.

```
SubmissionService.create()
        │
        └── MailService.sendSubmissionConfirmation()  [non-blocking]
                │
                ▼
         Nodemailer SMTP transport
                │  OAuth2: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
                ▼
         Gmail API → user's inbox
```

Email content is HTML, written in Indonesian (`id-ID` locale for date formatting), and includes campaign name, product name, and event date.

---

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

## Data Flow: Submission End-to-End

This is the most complete flow in the system, touching every layer.

```
1. Browser
   └─ User fills submission form (name, email, phone, productId)
   └─ POST /submissions  { productId, name, email, phone }

2. NestJS — ValidationPipe
   └─ Validates all fields (IsUUID, IsEmail, IsString, IsNotEmpty)
   └─ Strips any extra properties (whitelist: true)

3. NestJS — SubmissionService.create()
   ├─ ProductService.findOne(productId)
   │    └─ SELECT * FROM product WHERE id = $1
   │    └─ Throws NotFoundException if not found
   ├─ CampaignService.findOne(product.campaignId)
   │    └─ SELECT * FROM campaign WHERE id = $1
   ├─ INSERT INTO submission (product_id, name, email, phone)
   │    └─ Returns saved submission with generated UUID + timestamps
   └─ MailService.sendSubmissionConfirmation()  [non-blocking .catch()]
        └─ Builds HTML email with campaign name, product name, event date
        └─ Sends via Nodemailer → Gmail OAuth2

4. HTTP Response  201 Created
   └─ Returns saved Submission JSON

5. Browser — SubmissionForm (client component)
   └─ res.ok → setSubmitted(true) → shows success state
   └─ User sees: "Submitted Successfully! Check your email."

6. Gmail → User's inbox
   └─ HTML email: "Pendaftaran Berhasil – {productName}"
```

---

## Local Development Setup

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker & Docker Compose (for the database)

---

### 1. Start the Database (Docker)

A single command spins up PostgreSQL with the correct credentials:

```bash
docker run -d \
  --name caaampaign-db \
  -e POSTGRES_USER=caaampaign \
  -e POSTGRES_PASSWORD=caaampaign_secret \
  -e POSTGRES_DB=caaampaign_db \
  -p 5432:5432 \
  postgres:16-alpine
```

Verify it's running:

```bash
docker ps
# You should see caaampaign-db with status "Up"
```

To stop / restart later:

```bash
docker stop caaampaign-db
docker start caaampaign-db
```

---

### 2. Backend

```bash
cd backend

# Install dependencies
pnpm install

# Create the .env file
cp .env.example .env   # or create manually (see Environment Variables section)

# Apply all database migrations
pnpm migration:run

# Start the development server with hot-reload
pnpm start:dev
# → API running at http://localhost:8080
```

Minimum required `backend/.env`:

```env
PORT=8080

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=caaampaign
POSTGRES_PASSWORD=caaampaign_secret
POSTGRES_DB=caaampaign_db

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GMAIL_USER=your@gmail.com
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
```

---

### 3. Frontend

```bash
cd frontend

# Install dependencies
pnpm install

# Create the .env file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env

# Start the development server
pnpm dev
# → App running at http://localhost:3000
```

---

### Verify Everything Works

| URL | Expected |
|---|---|
| `http://localhost:3000` | Landing page (empty campaigns list if DB is fresh) |
| `http://localhost:3000/admin` | Admin dashboard showing 0 items |
| `http://localhost:8080/campaigns` | `[]` JSON response |

---

## AI-Assisted Development

This project was built with **Claude Code** (Anthropic's AI coding assistant) as a primary development tool. This section is transparent about how AI was used, what decisions were made by the developer, and what was delegated to the AI.

### Role of AI in This Project

AI was used as a **force multiplier** — it handled implementation speed while the developer focused on system design, requirements, and quality review. The workflow followed a pattern of: developer directs → AI implements → developer reviews and adjusts.

### What AI Did

| Area | AI Contribution |
|---|---|
| **Frontend architecture** | Proposed and implemented the `(public)` route group pattern, Server/Client component split, and typed API client design |
| **Page implementation** | Built all pages (landing, campaign detail, admin CRUD) from a design reference and written requirements |
| **Component extraction** | Separated `Navbar` and `Footer` into reusable standalone components with a shared public layout |
| **TypeScript types** | Derived type interfaces by reading the actual backend entity files — not guessing |
| **API client layer** | Designed the `campaignApi / productApi / submissionApi` abstraction in `lib/api.ts` |
| **Configuration** | Set up Next.js remote image patterns for Cloudinary, root layout metadata, Tailwind CSS design tokens |
| **Bug diagnosis** | Explained the `NOT_FOUND` error chain (backend down → `notFound()` called → 404 page), the `NEXT_PUBLIC_*` build-time embedding behaviour, and the module-level throw risk |
| **Code cleanup** | Removed all AI-generated comments on request, leaving clean production-style code |
| **Documentation** | Generated this entire `readme.md` by reading every relevant source file before writing |

### What the Developer Directed

- **Product requirements** — what pages exist, what each page does, what the submission flow looks like
- **Design reference** — provided the visual reference (Orpetron award site) that informed the UI style
- **Technology choices** — Next.js App Router, NestJS, PostgreSQL, Tailwind v4, Cloudinary, Gmail OAuth2
- **Architecture constraints** — SSR for all pages, no auth layer in scope, robust long-term structure
- **Review and correction** — accepted or rejected AI proposals, caught API endpoint mismatches (e.g., `by-product/:productId` vs `product/:productId`), adjusted UI copy and footer text
- **Iteration decisions** — when to separate components, when to remove comments, when to refactor

### AI Tool Used

| Tool | Version | Purpose |
|---|---|---|
| Claude Code | claude-sonnet-4-6 | Primary coding assistant (terminal + IDE integration) |

### Honest Assessment

AI significantly accelerated implementation — what would take multiple days of boilerplate writing was compressed into a single session. However, AI required:

- Accurate codebase context to generate correct code (it read every entity, controller, and DTO before writing types)
- Human review to catch subtle mismatches between what it assumed and what the actual API contracts were
- Clear, specific direction — vague prompts produced generic results; specific requirements produced production-quality code

The final code reflects the developer's architectural intent; AI was the tool that translated intent into working implementation.
