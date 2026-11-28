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
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_v4-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" /></a>
    <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Vitest-Testing-green?style=for-the-badge&logo=vitest" alt="Vitest" /></a>
  </p>
</div>

---

## 📖 About The Project

**StudyPro** is a full-stack, real-time study planner built for students who want to optimize their learning. It is not just a to-do list; it is an **extensible platform** featuring a plugin marketplace, AI-powered bulk imports, and live multi-user interactions.

### ✨ Key Features

- **🤖 AI Smart Import:** Paste unstructured text or JSON, and StudyPro will automatically parse and generate subjects, tasks, and due dates using Zod validation.
- **🔌 Plugin Marketplace:** A dynamic architecture allowing users to install and uninstall plugins (like the Study Planner and Word Bank) with live installation counters.
- **⚡ Real-Time Sync:** Powered by Convex WebSockets. Tasks, comments, and installs update instantly across all devices without refreshing.
- **💬 Live Comments:** Users can leave threaded comments on plugin detail pages with pagination and real-time updates.
- **🔒 Secure by Default:** Double-layer Zod validation (frontend + backend), secure file uploads, and atomic account deletion.
- **🎨 Beautiful UI:** Fully responsive, supporting Light/Dark mode, built with Shadcn UI (Base UI version) and Tailwind CSS v4.

---

## 🏗️ Architecture Highlights

- **Next.js 16 App Router:** Utilizes Server Components for static, cached layouts and isolates interactive logic into Client Components.
- **Advanced Caching:** Uses `"use cache"` and `cacheLife` for the Marketplace, ensuring fast loads for public visitors while keeping real-time data (comments) live.
- **Atomic Backend:** Convex mutations are fully transactional. If a Smart Import fails validation, zero partial data is written to the database.
- **AI Agent Ready:** Includes `AGENTS.md` and `CLAUDE.md` files to enforce architectural rules for AI coding assistants.

---

## 🚀 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Database / Backend** | [Convex](https://convex.dev/) (Real-time WebSockets, Serverless DB) |
| **Authentication** | [Better Auth](https://better-auth.com/) |
| **UI / Styling** | [Tailwind CSS v4](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/) (Base UI), [Lucide Icons](https://lucide.dev/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) |
| **Testing** | [Vitest](https://vitest.dev/), [convex-test](https://docs.convex.dev/testing/convex-test) |

---

## 💻 Local Development Setup

### 1. Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v20.9 or higher) — [Download](https://nodejs.org/)
- **pnpm** — Install via `npm install -g pnpm`
- A **Convex** account — [Sign up free](https://www.convex.dev/)
- **Git** — [Download](https://git-scm.com/)

### 2. Clone the Repository

```bash
git clone https://github.com/Yousef-pc/nextjs-convex-study-planner.git
cd nextjs-convex-study-planner
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Initialize Convex

This step will create your personal development Convex deployment, generate the `_generated` folder, and set up the database.

```bash
pnpm convex dev
```

This command will open a browser window asking you to log in to Convex.

Follow the prompts to create a new project called `study-pro` (or any name you like).

Once complete, leave this terminal running. Convex will watch your backend files for changes.

### 5. Configure Environment Variables

Create a `.env.local` file in the root of your project:

```env
# Your development Convex deployment URL
NEXT_PUBLIC_CONVEX_URL="https://<your-dev-deployment>.convex.cloud"

# The base URL of your app
SITE_URL="http://localhost:3000"

# A secret key for Better Auth
BETTER_AUTH_SECRET="<your-generated-secret>"
```

`pnpm convex dev` may automatically populate your Convex development URL and deployment configuration. Make sure the required variables are present.

**Generate a secure BETTER_AUTH_SECRET:**

On macOS/Linux:

```bash
openssl rand -base64 32
```

On Windows (PowerShell):

```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Replace the placeholder with your generated secret.

**Important:** Never commit `.env.local` or expose authentication secrets, deployment keys, or other sensitive environment variables in your public repository.

### 6. Start the Frontend

Open a second terminal tab (leave `convex dev` running in the first) and run:

```bash
pnpm dev
```

Your app should now be live at:

http://localhost:3000

### 7. Seed the Database

Before using the app, you need to populate the plugins table with the default Study Planner and Word Bank.

**Option A — From Convex Dashboard:**

1. Go to [dashboard.convex.dev](https://dashboard.convex.dev/).
2. Select your development project.
3. Open the Functions tab.
4. Find `plugins:seedPlugins` and click Run.

**Option B — From Terminal:**

```bash
pnpm convex run plugins:seedPlugins
```

You should see:

```text
Seeded: 2 inserted, 0 updated, 0 unchanged.
```

---

## 🧪 Running Tests

This project uses Vitest and convex-test to ensure backend integrity. The test suite covers Smart Import limits, account deletion, and plugin cleanup.

Run tests once (CI mode):

```bash
pnpm test:once
```

Run tests in watch mode (during development):

```bash
pnpm test
```

All tests live in `convex/tests/`. Shared test utilities (such as the authenticated user helper) live in `lib/testUtils.ts`.

---

## 🌐 Production Deployment

StudyPro uses two separate deployments: Convex handles the backend, and Vercel handles the frontend.

The following instructions describe a production deployment using Convex and Vercel.

### Step 1: Deploy the Convex Backend

In your terminal, with your project root as the working directory:

```bash
pnpm convex deploy
```

Follow the CLI prompts and make sure you deploy to your production deployment.

Once complete, your Convex production deployment will be available in the Convex Dashboard.

### Step 2: Configure Convex Production Environment Variables

Convex has its own environment variables, separate from Vercel.

Better Auth needs the correct production site URL.

Set your production `SITE_URL`:

```bash
pnpm convex env set SITE_URL "https://<your-app>.vercel.app" --prod
```

Replace the placeholder with your actual Vercel domain.

Also configure any other environment variables required by your Convex backend.

### Step 3: Seed the Production Database

Just like local development, the production database starts empty.

Seed the default plugins:

```bash
pnpm convex run plugins:seedPlugins --prod
```

Alternatively, use the Convex Dashboard:

1. Open [dashboard.convex.dev](https://dashboard.convex.dev/).
2. Switch to your Production deployment.
3. Go to Functions.
4. Find `plugins:seedPlugins` and click Run.

### Step 4: Push to GitHub

Ensure all your latest changes are committed and pushed:

```bash
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

### Step 5: Configure Vercel

1. Go to [vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New → Project**.
3. Import your `nextjs-convex-study-planner` repository.

**Configure the Build Command:**

Under Vercel → Settings → Build and Development Settings, use:

```bash
pnpm convex deploy --cmd 'pnpm build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL
```

This allows Convex to deploy the backend and provide the production deployment URL during the frontend build.

**Configure Environment Variables:**

Add the following variables in Vercel → Settings → Environment Variables:

| Variable | Value |
| :--- | :--- |
| `CONVEX_DEPLOY_KEY` | Your Convex Production Deploy Key |
| `SITE_URL` | `https://<your-app>.vercel.app` |
| `BETTER_AUTH_SECRET` | Your generated Better Auth secret |

For `CONVEX_DEPLOY_KEY`:

1. Open your Convex Dashboard.
2. Select your Production deployment.
3. Navigate to Deployment Settings.
4. Generate a Production Deploy Key.
5. Copy the key and add it to Vercel as an environment variable.

**Important:** Keep your deploy key private. Configure it for the Production environment only.

The `NEXT_PUBLIC_CONVEX_URL` is supplied to the build by the configured Convex deployment command. When configuring a different deployment workflow, make sure this variable points to your production Convex URL.

Click **Deploy** to deploy your application.

### Step 6: Post-Deployment Configuration

Once Vercel gives you your final domain:

1. Go to Vercel → Settings → Environment Variables.
2. Verify that `SITE_URL` matches your actual production domain.
3. Update the production Convex environment variable if necessary:

```bash
pnpm convex env set SITE_URL "https://<your-app>.vercel.app" --prod
```

If you change environment variables in Vercel, redeploy your application so the new values are applied to the deployment.

### Step 7: Verify Production

Visit your Vercel URL and run through this checklist:

- [ ] Landing page loads correctly.
- [ ] Sign up with a new email works.
- [ ] Study Planner is auto-installed (install count should be 2+).
- [ ] Marketplace shows both plugins.
- [ ] Smart Import works (paste valid JSON into the Study Planner).
- [ ] Comments appear in real time.
- [ ] Settings → Remove profile picture works.
- [ ] Settings → Delete account wipes all associated data.

---

## 📁 Project Structure

```text
.
├── app/                          # Next.js routing (thin wrappers only)
│   ├── dashboard/                # Authenticated routes
│   │   ├── marketplace/          # Marketplace + plugin details
│   │   └── ...
│   ├── schemas/                  # Shared Zod schemas (frontend)
│   ├── sitemap.ts                # Auto-generated sitemap
│   ├── robots.ts                 # Auto-generated robots.txt
│   └── opengraph-image.tsx       # Dynamic social preview image
│
├── components/
│   ├── ui/                       # Shadcn UI components
│   └── web/dashboard/            # Feature-based components
│       ├── marketplace/          # Marketplace UI + Client Components
│       ├── plugins/              # Plugin shells
│       ├── study-planner/        # Study Planner logic
│       └── word-bank/            # Word Bank logic
│
├── convex/                       # Convex backend
│   ├── plugins/                  # Seed data & cleanup logic
│   ├── tests/                    # Vitest + convex-test suites
│   ├── schema.ts                 # Database schema
│   ├── auth.ts                   # Better Auth config
│   └── smartImport.ts            # Smart Import mutations
│
├── lib/
│   ├── auth-client.ts            # Better Auth frontend client
│   ├── auth-server.ts            # Server-side auth helpers
│   └── testUtils.ts              # Shared test helpers
│
├── AGENTS.md                     # AI agent architecture rules
├── CLAUDE.md                     # Claude-specific instructions
└── README.md
```

---

## 🤝 Contributing

This is a personal learning project, but suggestions and pull requests are welcome.

Please open an issue first to discuss what you would like to change.

---

## 📄 License

Distributed under the MIT License. See the [LICENSE](LICENSE) file for more information.

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/Yousef-pc">Yousef</a></p>
</div>