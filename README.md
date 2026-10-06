# Hindupur Scrap Hub

A production-ready website for a scrap shop in Hindupur, Andhra Pradesh.
Eco + industrial design, live prices, a scrap value calculator with a **minimum order rule**,
a pickup/enquiry system and a full admin dashboard.

- **Frontend:** React (Vite) + Tailwind CSS + React Router + Framer Motion + lucide-react → Vercel
- **Backend:** Node.js + Express REST API → Render / Railway
- **Database:** MongoDB Atlas (mongoose) — no local JSON files
- **Auth:** JWT admin login (username/password from `.env`)

---

## Folder structure

```
.
├── client/                     # React frontend (Vercel)
│   ├── index.html              # SEO meta, Open Graph, JSON-LD
│   ├── vercel.json             # SPA rewrites + asset caching
│   ├── tailwind.config.js      # fresh moss / ink / sun palette, animations
│   ├── .env.example
│   └── src/
│       ├── components/         # Header, MobileNav, Footer, Calculator, ProductCard...
│       ├── context/            # AppContext (settings/theme/lang), CalculatorContext
│       ├── lib/                # api client, formatters, EN/TE i18n
│       └── pages/              # Home, Products, About, Contact, CalculatorPage, Admin/
│                               #   admin/: Login, AdminShell, AdminOverview,
│                               #           AdminProducts, AdminSettings, AdminInbox
└── server/                     # Express API (Render/Railway)
    ├── .env.example
    ├── src/
    │   ├── index.js            # express app: helmet, cors, rate limit, errors
    │   ├── db.js               # mongoose connection
    │   ├── utils.js            # ApiError, weight conversion, validation helpers
    │   ├── middleware/auth.js  # JWT sign/verify
    │   ├── models/             # Product, Setting, Enquiry, Pickup
    │   ├── routes/             # auth, products, settings, enquiries, pickups
    │   └── seed.js             # 19 products + default settings (minOrderKg = 30)
    └── package.json
```

---

## 1. Local setup

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free M0 is fine)

### Database
1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Database Access → add a user
3. Network Access → add your IP (or `0.0.0.0/0` for quick testing)
4. Copy the connection string into `server/.env`

### Backend

```bash
cd server
cp .env.example .env        # Windows: copy .env.example .env
# edit .env: MONGODB_URI, ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET, CORS_ORIGIN
npm install
npm run seed                # creates 19 products + settings (minOrderKg = 30)
npm run dev                 # http://localhost:4000
```

> `npm run seed` is safe to re-run: it never overwrites prices you changed in the dashboard.
> Use `npm run seed -- --wipe` only if you want to reset everything.

**No Atlas cluster yet?** Run a throwaway in-memory MongoDB instead (dev only):

```bash
npm run dev:local     # starts MongoMemoryServer + seeds + API on :4000
```

Login for that mode: `admin` / `admin123` (see `server/local-db.mjs`).

### Frontend

```bash
cd client
cp .env.example .env        # in dev leave VITE_API_URL empty -> /api is proxied
npm install
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:4000`.

---

## 2. How the owner logs in and changes prices / minimum order

1. Open **`/admin`** on the site (link in the footer, or `/admin` in the address bar)
2. Sign in with `ADMIN_USERNAME` / `ADMIN_PASSWORD` from `server/.env`
3. **Products tab** → edit price directly in the table (type a number and press Enter /
   click away), change the unit from the dropdown, or toggle availability.
   Add / edit / delete products with the buttons. **Changes appear on the public site immediately.**
4. **Settings tab** → change **Minimum order (kg)**, phone number, WhatsApp number, address,
   working hours, map query and social links. Saved to the database — no code changes needed.
5. **Requests tab** → pickup requests and enquiries, with call / WhatsApp buttons and status updates.

---

## 3. Minimum order rule (30 kg)

- Stored in the **`settings`** collection as key `minOrderKg` (default **30**), editable from the admin
  dashboard.
- Shown on: home hero badge + highlights, Products banner, calculator, Contact page and the footer.
- Enforced in:
  - the calculator (progress bar, friendly warning, and both buttons disabled until met)
  - the pickup API — `POST /api/pickups` returns **400** with a clear message, e.g.
    `Minimum order is 30 kg. Your order is 10 kg — add 20 kg more to continue.`
- **Unit conversion (documented behaviour):**
  - `kg` → counts as-is
  - `gram` → divided by 1000 (so 40 g = 0.04 kg)
  - any other unit (`piece`, `litre`, `dozen`, `bag`) → **excluded** from the weight total.
    If an order contains *only* non-weight items the API rejects it and asks for a weight-based item,
    because the shop cannot verify a 30 kg minimum without a weight unit.

---

## 4. API

| Method | Route | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/login` | – | returns JWT (rate limited) |
| GET | `/api/products` | – | `?category=&search=&limit=&all=true` |
| POST/PUT/DELETE | `/api/products[/:id]` | admin | JSON or `imageFile` upload (≤2 MB) |
| GET/PUT | `/api/settings` | – / admin | `minOrderKg`, phone, address, hours… |
| POST | `/api/enquiries` | – | validated + rate limited |
| GET/PUT/DELETE | `/api/enquiries[/:id]` | admin | |
| POST | `/api/pickups` | – | **validates minimum order** |
| GET/PUT/DELETE | `/api/pickups[/:id]` | admin | |
| GET | `/api/health` | – | uptime check |

Security: helmet, CORS allow-list, global rate limit (120 req/min/IP), extra limits on login and
public form submissions, JWT for all write routes, mongoose validation and a central error handler.

---

## 5. Deployment

### A. MongoDB Atlas
1. Cluster → Connect → Drivers → copy the URI, e.g.
   `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/scrap-hub?retryWrites=true&w=majority`
2. Network Access → Add IP → `0.0.0.0/0` (or your Render outbound IPs)

### B. Backend on Render (recommended)
1. Push the repo to GitHub
2. Render → **New + Web Service** → select the repo
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Environment variables (same as `server/.env`):
   `PORT`, `MONGODB_URI`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`,
   `CORS_ORIGIN` (your Vercel URL), `MIN_ORDER_KG=30`
5. First deploy, then run the seed once from the Render Shell:
   ```bash
   npm run seed
   ```
6. Copy the service URL, e.g. `https://hindupur-scrap-hub-api.onrender.com`

> Railway works the same way (root directory `server`, start `npm start`).

### C. Frontend on Vercel
1. Vercel → **New Project** → import the repo
2. Settings:
   - **Root Directory:** `client`
   - **Framework preset:** Vite
   - **Build Command:** `npm run build`  ·  **Output:** `dist`
3. Environment variable:
   ```
   VITE_API_URL=https://hindupur-scrap-hub-api.onrender.com/api
   ```
4. Deploy. `client/vercel.json` already handles SPA rewrites so `/products`, `/admin` etc. work
   on refresh.
5. After any frontend change, redeploy (or enable automatic deployments from GitHub).
6. Update `CORS_ORIGIN` on Render to include the final Vercel domain, then restart the service.

### D. Pointing it together
```
Vercel  https://your-app.vercel.app
          │  VITE_API_URL
          ▼
Render  https://your-api.onrender.com/api  ──▶  MongoDB Atlas
```

---

## 6. Design notes

- **Palette:** fresh moss green (`#1BAA64` …), charcoal ink (`#0C110F`) and amber/sun accent
  (`#F9840B`) — eco + industrial, light and dark mode included.
- **Mobile-first:** a bottom app bar with icons (Home · Prices · Calculator · About · Contact),
  floating WhatsApp button, one-tap call, and sticky header — the site feels like an app on a phone.
- **Motion:** Framer Motion page/section reveals, animated category pills, live progress bar,
  price marquee ticker, hover lifts — all disabled for `prefers-reduced-motion`.
- **Performance:** route-level code splitting (`React.lazy`), skeleton loaders, lazy images,
  immutable asset caching.
- **SEO:** meta description/keywords, Open Graph + Twitter tags, canonical URL, LocalBusiness
  JSON-LD, and per-page titles via `<Seo />`.
- **Languages:** optional English / తెలుగు UI toggle in the header and footer.

## 7. Default login

| | |
|---|---|
| URL | `/admin` |
| Username | `ADMIN_USERNAME` (default `admin`) |
| Password | `ADMIN_PASSWORD` (set your own in `server/.env`) |
