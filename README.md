# Hausavy multi-page site

## What is included
- Multi-page static front end: `index.html`, `about.html`, `how-it-works.html`, `pricing.html`, `contact.html`, `get-started.html`
- Shared responsive navigation and footer from `app.js`
- One-step-at-a-time guided signup flow on `get-started.html`
- Demo smart recommendations using OpenStreetMap Nominatim + Overpass
- Node/Express backend starter in `server.js`
- SQLite lead database created automatically as `hausavy.db`
- Email delivery example using Resend

## How to run locally
1. `npm install`
2. Copy `.env.example` to `.env`
3. Add your values for `ADMIN_EMAIL`, `FROM_EMAIL`, and `RESEND_API_KEY`
4. `npm start`
5. Open `http://localhost:3000`

## Notes
- The client-side recommendations use free map data and are best treated as a prototype.
- For production, replace the geocoding / nearby search logic with Google Places, Mapbox, or another commercial API for more reliable place coverage.
- The static front end cannot email you or create a database by itself, so the included backend is the required piece that makes that work.
