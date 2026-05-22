<div align="center">

# Aureon

**A full-stack web application built for performance, clarity, and scale.**

<br />

[![Stars](https://img.shields.io/github/stars/YashGoyal06/Aureon?style=flat-square&color=0f0f0f&labelColor=1a1a1a)](https://github.com/YashGoyal06/Aureon/stargazers)
[![Forks](https://img.shields.io/github/forks/YashGoyal06/Aureon?style=flat-square&color=0f0f0f&labelColor=1a1a1a)](https://github.com/YashGoyal06/Aureon/network/members)
[![Issues](https://img.shields.io/github/issues/YashGoyal06/Aureon?style=flat-square&color=0f0f0f&labelColor=1a1a1a)](https://github.com/YashGoyal06/Aureon/issues)
[![License](https://img.shields.io/github/license/YashGoyal06/Aureon?style=flat-square&color=0f0f0f&labelColor=1a1a1a)](./LICENSE)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://aureon-rho.vercel.app)

<br />

[Live Demo](https://aureon-rho.vercel.app) &nbsp;&middot;&nbsp; [Report a Bug](https://github.com/YashGoyal06/Aureon/issues) &nbsp;&middot;&nbsp; [Request a Feature](https://github.com/YashGoyal06/Aureon/issues)

</div>

---

## Overview

Aureon is a production-grade full-stack application with a JavaScript frontend and a Python-powered backend. The architecture is designed around a clean separation of concerns — the frontend handles UI composition and client-side state while the backend manages data processing, business logic, and API delivery.

The project prioritises maintainability from the ground up: modular directory structure, reusable component design, and a consistent code style that scales without friction. Deployment is fully automated via Vercel, with the backend designed for containerised or serverless environments.

Whether you are running it locally or deploying to production, the setup is intentionally lean with no unnecessary abstractions or framework overhead.

---

## Features

- **Responsive Interface** — Fluid layouts that adapt across devices without compromising visual fidelity
- **Scalable Architecture** — Decoupled frontend and backend designed to grow independently
- **Reusable Components** — UI built with composition in mind; shared logic extracted into utilities and hooks
- **Clean Codebase** — Consistent naming conventions, clear module boundaries, and minimal dead code
- **Performance-First** — Optimised asset delivery, lazy loading, and efficient API communication
- **SEO-Friendly Setup** — Structured markup and metadata configuration ready for indexing
- **Production-Ready Structure** — Environment-aware configuration, build pipeline, and deployment setup included

---

## Tech Stack

| Layer           | Technology              |
| --------------- | ----------------------- |
| Frontend        | React, Vite             |
| Backend         | Python, FastAPI          |
| Database        | PostgreSQL               |
| Styling         | CSS Modules / Tailwind  |
| Animation       | Framer Motion           |
| Version Control | Git, GitHub             |

---

## Project Structure

```
Aureon/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   └── layout/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   │   └── config.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   ├── .env.example
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

## Installation

**Prerequisites:** Node.js 18+, Python 3.10+, Git

```bash
# Clone the repository
git clone https://github.com/YashGoyal06/Aureon.git

# Navigate to the project root
cd Aureon

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && pip install -r requirements.txt
```

**Start the development servers:**

```bash
# Frontend (from /frontend)
npm run dev

# Backend (from /backend)
uvicorn app.main:app --reload
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:8000`.

---

## Environment Variables

Create `.env` files in both `frontend/` and `backend/` based on the examples below.

**`frontend/.env`**

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_ENV=development
```

**`backend/.env`**

```env
APP_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/aureon
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:5173
```

---

## Build & Deployment

**Frontend production build:**

```bash
cd frontend
npm run build
```

Static output is written to `frontend/dist/` and is ready for deployment to any static host.

**Deployment platforms:**

| Platform | Use Case              | Notes                                  |
| -------- | --------------------- | -------------------------------------- |
| Vercel   | Frontend              | Zero-config, auto-deploy on push       |
| Netlify  | Frontend              | Drag-and-drop or Git-based deploy      |
| Render   | Backend (Python)      | Native Python support, free tier       |
| Railway  | Full stack or backend | Simple environment variable management |

The live deployment is hosted at [aureon-rho.vercel.app](https://aureon-rho.vercel.app).

---

## Screenshots

<div align="center">

> **Preview Coming Soon**
> Replace this section with actual screenshots once the UI is finalised.

```
[ Add screenshot here ]
![Aureon Preview](./docs/preview.png)
```

</div>

---

## Development Principles

Aureon is developed with a set of explicit engineering values rather than informal conventions:

- **Separation of Concerns** — UI, state, business logic, and network calls live in distinct layers with defined interfaces between them
- **Reusable Architecture** — Every component, hook, and utility is authored to be independent and composable
- **Modular Design** — Features are self-contained; adding or removing functionality does not require restructuring unrelated parts of the codebase
- **Maintainable Code** — Clarity is treated as a first-class constraint; complex logic is documented, and side effects are isolated
- **Performance-First Development** — Performance is a design consideration at the architecture level, not an afterthought addressed through patches

---

## Contributing

Contributions are welcome and reviewed carefully.

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'feat: describe your change'`
4. Push to your branch — `git push origin feature/your-feature`
5. Open a Pull Request with a clear description of the change and its motivation

Please follow existing code conventions and keep pull requests focused on a single concern. Large, unfocused PRs will be asked to be split before review.

---

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">

**Author**

[Yash Goyal](https://github.com/YashGoyal06) &nbsp;&middot;&nbsp; [LinkedIn](https://linkedin.com/in/yashgoyal06)

<br />

<sub>Built and maintained with care.</sub>

</div>
