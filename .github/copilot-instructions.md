# Copilot Instructions for link-preview-api

## Project Overview
- **Purpose:** Provides a REST API to generate link previews (title, description, images) for a given URL.
- **Main entrypoint:** `server.js` (Express server)
- **Core logic:** `utils/scrape.js` (fetches and parses metadata using `got`, `cheerio`, and Playwright)

## Architecture & Data Flow
- `POST /preview` endpoint (see `server.js`) accepts `{ url }` in JSON body.
- Calls `scrapeMeta(url)` from `utils/scrape.js`:
  - **Step 1:** Attempts fast HTTP fetch with `got` and parses HTML with `cheerio` for meta tags.
  - **Step 2:** If critical data is missing, falls back to headless browser scraping with Playwright for more robust extraction.
- Returns `{ title, description, images, url }` JSON.

## Developer Workflows
- **Start server:** `npm start` (production) or `npm run dev` (with auto-reload via nodemon)
- **No test suite** is present by default.
- Debug by adding `console.log` or using Node.js/VS Code debuggers.

## Key Conventions & Patterns
- All scraping logic is centralized in `utils/scrape.js`.
- Fallback to Playwright is only triggered if `got`/`cheerio` fails to extract required fields.
- Error handling: On scraping failure, returns empty fields but preserves the input URL.
- Only the `/preview` endpoint is implemented; root (`/`) returns a health check string.

## External Dependencies
- `express`: HTTP server
- `got`: Fast HTTP requests
- `cheerio`: HTML parsing
- `playwright`: Headless browser fallback for complex sites
- `nodemon`: Dev auto-reload (dev only)

## Examples
- **Request:** `POST /preview` with `{ "url": "https://example.com" }`
- **Response:** `{ "title": "...", "description": "...", "images": [ ... ], "url": "..." }`

## Extending/Modifying
- Add new endpoints in `server.js`.
- Update scraping logic in `utils/scrape.js` for new meta tag patterns or fallback strategies.
- For new dependencies, update `package.json` and run `npm install`.

---
If any conventions or workflows are unclear, please ask for clarification or examples from the maintainers.
