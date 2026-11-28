<div align="center">
  <br />
  <h1 align="center">StudyPro 🧠</h1>
  <p align="center">
    <strong>Supercharge your study workflow with AI and a custom plugin marketplace.</strong>
  </p>
  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://convex.dev/"><img src="https://img.shields.io/badge/Convex-Backend-EE342F?style=for-the-badge&logo=convex" alt="Convex" /></a>
    <a href="https://better-auth.com/"><img src="https://img.shields.io/badge/Better_Auth-Auth-blue?style=for-the-badge" alt="Better Auth" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_v4-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" /></a>
    <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Vitest-Testing-green?style=for-the-badge&logo=vitest" alt="Vitest" /></a>
  </p>
</div>

---

## 📖 About The Project

**StudyPro** is a full-stack, real-time study planner built for students who want to optimize their learning. It is not just a to-do list; it is an **extensible platform** featuring a plugin marketplace, AI-powered bulk imports, and live multi-user interactions.

### ✨ Key Features
*   **🤖 AI Smart Import:** Paste unstructured text or JSON, and StudyPro will automatically parse and generate subjects, tasks, and due dates using Zod validation.
*   **🔌 Plugin Marketplace:** A dynamic architecture allowing users to install and uninstall plugins (like the Study Planner and Word Bank) with live installation counters.
*   **⚡ Real-Time Sync:** Powered by Convex WebSockets. Tasks, comments, and installs update instantly across all devices without refreshing.
*   **💬 Live Comments:** Users can leave threaded comments on plugin detail pages with pagination and real-time updates.
*   **🔒 Secure by Default:** Double-layer Zod validation (frontend + backend), secure file uploads, and atomic account deletion.
*   **🎨 Beautiful UI:** Fully responsive, supporting Light/Dark mode, built with Shadcn UI (Base UI version) and Tailwind CSS v4.

---

## 🏗️ Architecture Highlights

*   **Next.js 16 App Router:** Utilizes Server Components for static, cached layouts and isolates interactive logic into Client "Islands".
*   **Advanced Caching:** Uses `"use cache"` and `cacheLife` for the Marketplace, ensuring lightning-fast loads for public visitors while keeping real-time data (comments) live.
*   **Atomic Backend:** Convex mutations are fully transactional. If a Smart Import fails validation, zero partial data is written to the database.
*   **AI Agent Ready:** Includes `AGENTS.md` and `CLAUDE.md` files to enforce strict architectural rules for AI coding assistants.

---

## 🚀 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Database / Backend** | [Convex](https://convex.dev/) (Real-time WebSockets, Serverless DB) |
| **Authentication** | [Better Auth](https://better-auth.com/) |
| **UI / Styling** | [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/) (Base UI), [Lucide Icons](https://lucide.dev/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Testing** | [Vitest](https://vitest.dev/), [Convex-Test](https://docs.convex.dev/testing/convex-test) |

---

## 💻 Local Development Setup

### 1. Prerequisites
Before you begin, make sure you have the following installed:
*   **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
*   **pnpm** — Install via `npm install -g pnpm`
*   A **Convex** account — [Sign up free](https://www.convex.dev/)
*   **Git** — [Download](https://git-scm.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/Yousef-pc/nextjs-convex-study-planner.git
cd nextjs-convex-study-planner