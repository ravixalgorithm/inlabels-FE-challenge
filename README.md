(ravixalgorithm) fad62070c0e013d455f588c55226b016dcba3a8821486df4be90de30ccd7c7957

# Svelte Note App 📝

A responsive, feature-rich Notes Web Application built with **Svelte 5**, **TailwindCSS v4**, and **TypeScript**. Designed for the Frontend Internship Take-Home Challenge.

## 🚀 Live Demo
[Live Link:](https://inlabels-fe-challenge.vercel.app)

**Deployment Instructions:**
This app is Vite + Svelte. You can deploy it seamlessly to **Vercel**, **Netlify**, or **GitHub Pages**:
1. Connect your repository to Vercel/Netlify.
2. Set the build command to `npm run build`.
3. Set the output directory to `dist`.
4. Ensure you add `VITE_MOCK_API_URL` to your environment variables in the deployment dashboard.

## ✨ Features
- **Full CRUD**: View, create, update, and delete notes gracefully.
- **Infinite Scroll Pagination**: Notes load 20 at a time. Scroll to the bottom and the next batch loads automatically via `IntersectionObserver`.
- **Offline Sync (Local-First)**: Create, edit, and delete notes while offline. Mutations are queued in `localStorage` and flushed when connectivity is restored. UI shows "Offline" and "Syncing..." status badges.
- **Soft Deletion with Undo**: Deleting a note gives you exactly 10 seconds to undo before the API call fires.
- **Search & Sort**: Debounced search (400ms) and versatile sorting options (Title, Date, ID).
- **Responsive Dark Mode**: Toggle between light and dark themes with persistent `localStorage` preference.
- **Form Validation**: Title is required (max 100 chars), content has a 5,000 char limit with a live counter.
- **Keyboard Shortcuts**: `Ctrl+Q` new note, `Esc` close modals, `/` focus search bar.
- **Custom 404 Page**: Navigate to any unknown route and see a beautiful animated 404 page.
- **Custom Feature: Pinned Notes 📌**: Pin important notes to the top of the grid! Pinned state persists in `localStorage` across sessions.

## 🛠 Tech Stack
- **Framework**: `Vite 7` + `Svelte 5` (Runes mode)
- **Styling**: `TailwindCSS v4`
- **Language**: `TypeScript` (strict, no implicit `any`)
- **Linting**: `ESLint` with `eslint-plugin-svelte` + `typescript-eslint`
- **Backend**: Generic `fetch` wrapper targeting `MockAPI.io`

## 🏃‍♂️ How to Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/11ara/take-home-challenge.git
   ```
2. **Install dependencies**:
   ```bash
   cd take-home-challenge
   npm install
   ```
3. **Configure Environment**:
   Duplicate `.env.example` as `.env`, and provide your `VITE_MOCK_API_URL` pointing to your mockapi.io endpoint.
   *(Note: The `mockapi.io` schema requires `title`, `content`, and `createdAt` fields).*
4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Navigate to `localhost:5173` to view the app!

## 🤔 Reflection & Approach

### Architecture & Mindset
My primary approach focused on building a scalable, responsive SPA without introducing heavy third-party state-management or UI frameworks. Using **Svelte 5 runes** (`$state`), I constructed a reactive, central UI store (`store.svelte.ts`) connected to a lightweight, offline-aware Fetch wrapper (`api.ts`).

### Trade-offs & Assumptions
- **MockAPI Search**: Because `mockapi.io` native full-text search syntax differs by configuration, I implemented standard client-side/server-side query params for filtering but assumed `?title=foo` syntax for the endpoint.
- **Optimistic UI & Offline Queue**: Instead of using heavy Service Workers, I utilized `navigator.onLine` and `window.addEventListener('online')` combined with `localStorage` to create a seamless offline experience. It caches Create/Update/Delete operations and intelligently updates `tempIds` to real server IDs on sync.

### Custom Feature: Pinned Notes 📌
I chose to implement **Pinned Notes** because in a standard note app with sorting and searching, high-priority items get buried quickly. Pinning inherently overrides sort behavior to keep crucial data at the top, dramatically increasing usability for power users.

**How it works:**
- Click the pin icon on any note card to pin/unpin it.
- Pinned notes are visually distinguished with a filled blue pin icon.
- Pin state is stored in `localStorage` as an array of note IDs, meaning pins persist across sessions without needing a backend schema change.
- Pinned notes always appear first in the grid, regardless of the active sort order.

**Why this feature?** It's a common pattern in productivity tools (Gmail, Slack, Notion) that users intuitively understand. It adds genuine utility without requiring backend changes, making it the perfect client-side enhancement.

### What I'd do with more time
- Unit integration tests utilizing `Vitest` and `svelte-testing-library`.
- Rich-text markdown editor instead of standard textarea.
- Native Service Worker caching (`workbox`) for a true PWA experience.

### Additional Dependencies Added
- `lucide-svelte` (Optional): Used only for consistent, clean vector icons throughout the UI if any extra shapes were needed, otherwise I purely relied on standard inline SVG paths to keep the bundle size microscopically small. No heavy third-party state managers or UI frameworks were added to demonstrate raw Svelte capabilities.
