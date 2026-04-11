# CodeOrbit

A full-stack competitive programming platform — think LeetCode, built from scratch. Solve DSA problems, run code against test cases, and get AI-powered hints from **Orbo**, a context-aware tutor that sees your code and your last failed test case.

---

## Features

- **Problem Library** — Browse problems by difficulty (Easy / Medium / Hard), filter by tags (Array, Linked List, Graph, DP), paginated with search
- **Code Editor** — Monaco-based in-browser editor with multi-language support (JavaScript, Python, C++, Java)
- **Run & Submit** — Code is executed against visible test cases (Run) or hidden test cases (Submit) via the Judge0 API
- **Submission Tracking** — View past submissions per problem with verdict, runtime, memory usage, and test case pass rate
- **Orbo AI Tutor** — Context-aware AI assistant powered by Groq (LLaMA 3.1). Knows the problem, your current code, and your last failed test case. Won't give away solutions unless asked
- **Auth System** — JWT-based auth with cookie storage, Redis-backed token blacklisting on logout, and role-based access (user / admin)
- **Admin Panel** — Admins can create, update, and delete problems. New problems are validated by running the reference solution against visible test cases before being saved
- **Progress Tracking** — Solved problems are tracked per user

---

## Tech Stack

**Backend**
- Node.js + Express (ESM)
- MongoDB + Mongoose
- Redis (token blacklist)
- Judge0 API (code execution)
- Groq SDK — LLaMA 3.1 8B (AI tutor)
- JWT + bcrypt (auth)

**Frontend**
- React 19 + Vite
- Redux Toolkit (auth state)
- React Router v7
- Monaco Editor
- Tailwind CSS + DaisyUI
- Axios
- Zod + React Hook Form (form validation)

---

## Project Structure

```
CodeOrbit/
├── backend/
│   └── src/
│       ├── configs/       # MongoDB + Redis connections
│       ├── controllers/   # Route handlers
│       ├── middlewares/   # JWT validator, admin guard
│       ├── models/        # User, Problem, Submission schemas
│       ├── routes/        # Auth, Problems, Submissions, AI, User
│       ├── services/      # Judge0, problem validation, submission logic
│       └── utils/         # Language map, input validator
└── frontend/
    └── src/
        ├── components/    # Navbar, OrboAI chat widget
        ├── pages/         # Home, Problems, ProblemSolver, Login, SignUp
        ├── store/         # Redux store
        └── utils/         # Axios client
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance
- Redis instance
- [Judge0 API key](https://rapidapi.com/judge0-official/api/judge0-ce) (RapidAPI)
- [Groq API key](https://console.groq.com)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JUDGE0_API_KEY=your_rapidapi_key
GROQ_API_KEY=your_groq_api_key
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:3000`.

---

## API Overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout (blacklists token) |
| GET | `/auth/me` | Get current user |
| GET | `/problems` | List problems (paginated) |
| GET | `/problems/:id` | Get problem by ID |
| POST | `/problems` | Create problem (admin only) |
| POST | `/problems/:id/run` | Run code against visible test cases |
| POST | `/problems/:id/submit` | Submit code against hidden test cases |
| GET | `/problems/solved` | Get solved problems for current user |
| POST | `/ai/query` | Ask Orbo AI about the current problem |

---

## Roadmap

### In Progress
- [ ] **Profile page** — personal stats, solved count by difficulty, submission heatmap
- [ ] **Contest mode** — real-time timed contests using WebSockets (Socket.io), live leaderboard updates during contest, freeze window in final minutes
- [ ] **OAuth** — Google and GitHub sign-in via Passport.js, alongside existing email/password auth
- [ ] **Email verification** — confirm email on signup, password reset via nodemailer

### Planned
- [ ] **Leaderboard** — global and contest-specific rankings with rating system
- [ ] **Editorials & solutions tab** — admin-authored editorial per problem, community solution sharing after solving
- [ ] **Discussion threads** — per-problem comment section for hints and approaches
- [ ] **Streak & badges** — daily solve streaks, achievement badges, difficulty milestones
- [ ] **Notifications** — contest reminders, submission results via email

### Infrastructure
- [ ] **Dockerize** — Docker Compose setup for backend, frontend, MongoDB, Redis, and a self-hosted Judge0 instance (removes RapidAPI dependency and rate limits)
- [ ] **CI/CD** — GitHub Actions pipeline for lint, test, and build on every PR
- [ ] **AWS deployment** — Backend on EC2 or ECS (Fargate), frontend on S3 + CloudFront, MongoDB Atlas, ElastiCache for Redis
- [ ] **Rate limiting** — per-user submission rate limits to prevent abuse
- [ ] **Environment hardening** — secrets via AWS Secrets Manager, HTTPS via ACM + ALB

---

## License

MIT
