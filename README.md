# Watchpile

Watchpile is a movie search app and personal watchlist. Look up a film, save it to your collection as "want to watch" or "watched," and keep a note with your rating, tags, and thoughts.

Movie data comes from [poiskkino.dev](https://poiskkino.dev), an unofficial Kinopoisk API (formerly kinopoisk.dev, renamed over a trademark dispute). TMDB isn't used, since registration on themoviedb.org isn't available from Russia, even with a VPN.

## What it does

- **Search** — find movies by title, with paginated results; a curated "Popular" grid is shown before you type anything, so the page isn't empty
- **Movie page** — poster, description, rating, genres, and other details for a single film
- **Collection** — mark any movie as "want to watch" or "watched," stored locally in your browser
- **Notes** — add a personal rating, the date you watched it, tags, and free-form text to any movie in your collection
- A 404 page for unknown routes, loading skeletons instead of spinners, and basic accessibility support (visible focus states, live announcements for search results, page titles that update per route)
- A carbon-dark theme with a sparing red accent, and smooth Framer Motion transitions between pages and collection status changes (respects `prefers-reduced-motion`)

## Getting started

You'll need [Node.js](https://nodejs.org) 24.9 or newer and [pnpm](https://pnpm.io).

```bash
git clone https://github.com/MaximMurysov/Watch-pile.git
cd Watch-pile
pnpm install
cp .env.example .env
pnpm dev
```

The app will be available at `http://localhost:5173`. Search will return an authorization error until you add an API key — see below.

### Getting an API key

1. Go to [poiskkino.dev](https://poiskkino.dev) and get a key through their Telegram bot. Registration has no regional restrictions.
2. Open `.env` and set:

   ```
   VITE_POISKKINO_API_TOKEN=your_token_here
   ```

3. Restart `pnpm dev` if it was already running.

A couple of things worth knowing about the free key: it only covers search result pages 1–10, returns up to 10 results per page, and has a daily request limit.

> **Note on the key:** any environment variable prefixed with `VITE_` is bundled into the client-side code and is visible to anyone using the app. That's an acceptable tradeoff for a free-tier key on a project like this. In a production setting, API requests would go through your own backend instead, keeping the key server-side.

## Available commands

```bash
pnpm dev         # start the dev server
pnpm build       # production build
pnpm preview     # preview the production build locally
pnpm test        # run the test suite
pnpm test:watch  # run tests in watch mode
pnpm typecheck   # check types with TypeScript
pnpm lint        # run ESLint
pnpm lint:fsd    # check architectural layering rules
pnpm format      # format the codebase with Prettier
```

## Built with

- **React 19** + **TypeScript** for the UI
- **Vite** as the build tool
- **Redux Toolkit** + **RTK Query** for state and data fetching
- **React Hook Form** + **Zod** for forms and validation
- **React Router** for navigation
- **Jest**, **React Testing Library**, and **MSW** for testing
- **CSS Modules** for styling
- **Framer Motion** for animation

The codebase follows [Feature-Sliced Design](https://feature-sliced.design/), an architecture that organizes code by feature and business layer rather than by file type, which keeps things predictable as the project grows.

## Project status

Watchpile is a personal project built to practice a production-style React setup: strict typing, a tested and layered architecture, and real API integration. The collection and notes are stored in your browser only — there's no account system or server-side sync at this time.
