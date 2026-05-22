<div align="center">

<br />

# AUREON

### Full-stack web application &mdash; built for clarity, velocity, and production.

<br />

[![Stars](https://img.shields.io/github/stars/YashGoyal06/Aureon?style=for-the-badge&color=111111&labelColor=000000&logo=github&logoColor=white)](https://github.com/YashGoyal06/Aureon/stargazers)
[![Forks](https://img.shields.io/github/forks/YashGoyal06/Aureon?style=for-the-badge&color=111111&labelColor=000000&logo=git&logoColor=white)](https://github.com/YashGoyal06/Aureon/network/members)
[![Issues](https://img.shields.io/github/issues/YashGoyal06/Aureon?style=for-the-badge&color=111111&labelColor=000000&logo=githubactions&logoColor=white)](https://github.com/YashGoyal06/Aureon/issues)
[![License](https://img.shields.io/github/license/YashGoyal06/Aureon?style=for-the-badge&color=111111&labelColor=000000)](./LICENSE)

<br />

[![Live](https://img.shields.io/badge/Live%20Preview-aureon--rho.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://aureon-rho.vercel.app)

<br />

</div>

---

## Overview

Aureon is a decoupled full-stack application — a React/Vite frontend consuming a Python/FastAPI backend, connected through a well-defined HTTP interface. The architecture enforces a hard boundary between the presentation layer and business logic, making both sides independently testable, scalable, and deployable.

The codebase is structured for longevity: every directory has a single purpose, components are authored for reuse, and no layer reaches into the concerns of another. The result is a system that new contributors can navigate in minutes and senior engineers can extend without hesitation.

Deployed to Vercel with zero-config CI from the main branch.

---

## Features

<br />

<table>
  <tr>
    <td width="50%">
      <b>Responsive Interface</b><br />
      <sub>Fluid, device-agnostic layouts with no breakpoint hacks or layout jank at any viewport width.</sub>
    </td>
    <td width="50%">
      <b>Decoupled Architecture</b><br />
      <sub>Frontend and backend are fully independent — each has its own dependency tree, config, and deploy pipeline.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <b>Reusable Component System</b><br />
      <sub>UI is built from composable primitives. Shared logic lives in hooks and utilities, not inside components.</sub>
    </td>
    <td width="50%">
      <b>Performance-First Delivery</b><br />
      <sub>Vite's build pipeline with code splitting, lazy routes, and optimised asset handling out of the box.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <b>SEO-Ready Structure</b><br />
      <sub>Semantic HTML, structured metadata, and open graph configuration wired up from the start.</sub>
    </td>
    <td width="50%">
      <b>Production-Grade Setup</b><br />
      <sub>Environment-separated config, a working build pipeline, and deployment targets documented and tested.</sub>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <b>Clean, Navigable Codebase</b><br />
      <sub>Consistent naming, explicit module boundaries, and no speculative abstractions cluttering the structure.</sub>
    </td>
    <td width="50%">
      <b>Typed API Contract</b><br />
      <sub>FastAPI generates a live OpenAPI schema at <code>/docs</code> — the frontend and backend always agree on shape.</sub>
    </td>
  </tr>
</table>

<br />

---

## Tech Stack

<div align="center">

<br />

| Layer           | Technology |
| :-------------- | :--------- |
| **Frontend**    | ![React](https://img.shields.io/badge/React-0D1117?style=flat-square&logo=react&logoColor=58C4DC) ![Vite](https://img.shields.io/badge/Vite-0D1117?style=flat-square&logo=vite&logoColor=BD34FE) |
| **Backend**     | ![Python](https://img.shields.io/badge/Python-0D1117?style=flat-square&logo=python&logoColor=3776AB) ![FastAPI](https://img.shields.io/badge/FastAPI-0D1117?style=flat-square&logo=fastapi&logoColor=00C7B7) |
| **Database**    | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-0D1117?style=flat-square&logo=postgresql&logoColor=4169E1) |
| **Styling**     | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-0D1117?style=flat-square&logo=tailwindcss&logoColor=06B6D4) |
| **Animation**   | ![Framer](https://img.shields.io/badge/Framer_Motion-0D1117?style=flat-square&logo=framer&logoColor=white) |
| **Deployment**  | ![Vercel](https://img.shields.io/badge/Vercel-0D1117?style=flat-square&logo=vercel&logoColor=white) |

<br />

</div>

---

## Project Structure

```
Aureon/
├── frontend/                   # React + Vite application
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── common/         # Shared primitives (Button, Input, Modal...)
│       │   └── layout/         # Structural components (Navbar, Sidebar, Footer)
│       ├── hooks/              # Custom React hooks
│       ├── pages/              # Route-level components
│       ├── services/           # API client and request abstractions
│       ├── store/              # Global state management
│       ├── styles/             # Global CSS / Tailwind config
│       ├── utils/              # Pure functions, formatters, constants
│       ├── App.jsx
│       └── main.jsx
│
├── backend/                    # Python + FastAPI service
│   └── app/
│       ├── api/
│       │   └── routes/         # Endpoint definitions
│       ├── core/
│       │   └── config.py       # Settings and environment loading
│       ├── models/             # ORM / database models
│       ├── schemas/            # Pydantic request/response schemas
│       ├── services/           # Business logic layer
│       └── main.py
│
├── .gitignore
└── README.md
```

---

## Getting Started

**Prerequisites:** Node.js `>= 18`, Python `>= 3.10`, Git

**Clone and install:**

```bash
git clone https://github.com/YashGoyal06/Aureon.git
cd Aureon
```

```bash
# Frontend
cd frontend
npm install
```

```bash
# Backend
cd ../backend
pip install -r requirements.txt
```

**Run development servers:**

```bash
# Terminal 1 — Frontend
cd frontend && npm run dev
# Runs on http://localhost:5173

# Terminal 2 — Backend
cd backend && uvicorn app.main:app --reload
# Runs on http://localhost:8000
# API docs at http://localhost:8000/docs
```

---

## Environment Variables

Copy and populate the example files before running either service.

**`frontend/.env`**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_ENV=development
```

**`backend/.env`**
```env
APP_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/aureon
SECRET_KEY=change-this-in-production
ALLOWED_ORIGINS=http://localhost:5173
```

> Never commit `.env` files. Both are listed in `.gitignore`.

---

## Build & Deployment

**Production build:**

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

**Deployment targets:**

| Platform   | Target             | Notes                                              |
| :--------- | :----------------- | :------------------------------------------------- |
| **Vercel** | Frontend           | Auto-deploys from `main`. Zero configuration.      |
| **Netlify**| Frontend           | Equivalent to Vercel; useful as a fallback target. |
| **Render** | Backend (Python)   | Native ASGI support; connects to managed Postgres. |
| **Railway**| Backend + Database | One-environment setup for staging; free tier.      |

---

## Screenshots

<div align="center">

<br />

*Application screenshots will be added on stable release.*

<!-- Replace with actual screenshot once available -->
<!-- ![Aureon — Dashboard](./docs/assets/preview-dashboard.png) -->

<br />

</div>

---

## Engineering Principles

These aren't aspirational guidelines — they are the constraints that shaped every decision in this codebase.

**Separation of Concerns** &nbsp;|&nbsp; The UI layer has no knowledge of data fetching logic. The API layer has no knowledge of rendering. Each layer exposes a contract and nothing more.

**Modular by Default** &nbsp;|&nbsp; Features are self-contained. A module can be removed, moved, or replaced without touching anything adjacent to it.

**Explicit Over Implicit** &nbsp;|&nbsp; Configuration is visible. Side effects are isolated. Nothing happens for reasons that require reading three files to understand.

**Maintainability as a Constraint** &nbsp;|&nbsp; Code is written to be read six months later by someone who wasn't in the room. Comments explain intent, not mechanics.

**Performance Is Designed, Not Patched** &nbsp;|&nbsp; Rendering strategy, data shape, and API contract are chosen with performance in mind, not tuned after the fact.

---

## Contributing

1. Fork the repository and create a branch: `git checkout -b feat/your-feature-name`
2. Make focused, well-scoped changes — one concern per pull request
3. Write a clear commit message: `git commit -m "feat: describe the change and its purpose"`
4. Push and open a pull request against `main` with context on what changed and why

PRs that mix unrelated changes will be asked to be split. Code review prioritises correctness, clarity, and fit with the existing architecture — not line count.

---

## License

Released under the [MIT License](./LICENSE).

---

<div align="center">

<br />

Designed and built by **[Yash Goyal](https://github.com/YashGoyal06)**

[![GitHub](https://img.shields.io/badge/GitHub-YashGoyal06-0D1117?style=flat-square&logo=github&logoColor=white)](https://github.com/YashGoyal06)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0D1117?style=flat-square&logo=linkedin&logoColor=0A66C2)](https://linkedin.com/in/yashgoyal06)

<br />

<sub>If this project was useful, consider leaving a star.</sub>

<br />

</div>
