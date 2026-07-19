# Klaro — Know Before You Sign

> AI-powered legal document explainer for Africa. Understand employment contracts, tenancy agreements, loan forms and more — in plain language, in your language.

<p align="center">
  <a href="https://klaro-africa.netlify.app" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-klaro--africa.netlify.app-1B4332?style=for-the-badge&logo=netlify&logoColor=white" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

**Explore the live app → [klaro-africa.netlify.app](https://klaro-africa.netlify.app)**

Available across 9 African countries: Ghana · Nigeria · South Africa · Kenya · Rwanda · Côte d'Ivoire · Senegal · Egypt · Tanzania

---

## What is Klaro?

Klaro reads your legal documents and explains every clause in plain language — flagging dangerous clauses in red, highlighting your rights in blue, and telling you exactly what to watch out for before you sign.

This repository contains the **frontend only**. The backend API is hosted separately on Cloudflare Workers and is already wired up to the live demo.

---

## Features

| Feature               | Description                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Document Analysis** | Upload PDF or paste text — every clause rated GREEN / YELLOW / RED / BLUE / GREY with plain-language explanation |
| **Legal Chat**        | Ask open legal questions; answers cite the relevant Act and section                                              |
| **Law Library**       | On-demand guides for 10 legal fields grounded by live Google Search, 24hr cached                                 |
| **Local Voice**       | Hear your analysis read aloud in Twi, Ewe, or Fante via real GhanaNLP voices                                    |
| **Lawyer Directory**  | Find verified lawyers by country, region, and specialty                                                          |
| **Template Builder**  | Generate 10 types of legal documents tailored to your country's law                                              |
| **Multi-language**    | 10 languages: English, French, Twi, Ga, Ewe, Dagbani, Hausa, Fante, Swahili, Arabic                             |
| **Dark / Light Mode** | Full theme toggle, persisted across sessions                                                                     |
| **PWA**               | Installable as a Progressive Web App with offline support                                                        |

---

## Tech Stack

| Layer      | Technology                                                   |
| ---------- | ------------------------------------------------------------ |
| Framework  | React 18 + Vite 5                                            |
| Styling    | Tailwind CSS (`darkMode: 'class'`)                           |
| Routing    | React Router v6                                              |
| State      | React Context + local state                                  |
| API        | Cloudflare Workers (`klaro-api.emmanuelboye1957.workers.dev`) |
| TTS        | GhanaNLP (Twi · Ewe · Fante) + Web Speech API fallback      |
| PWA        | VitePWA (autoUpdate, NetworkOnly for /api)                   |
| Auth       | JWT (email/password) + Google OAuth                          |

---

## Project Structure

```
src/
├── pages/
│   ├── Landing.jsx          # Marketing / home page (always dark)
│   ├── Auth.jsx             # Login & register
│   ├── Dashboard.jsx        # User dashboard
│   ├── Upload.jsx           # Document upload
│   ├── Analysis.jsx         # Clause-by-clause analysis view
│   ├── LegalChat.jsx        # Open legal Q&A
│   ├── LegalLibrary.jsx     # Law guides by field
│   ├── Lawyers.jsx          # Lawyer directory
│   ├── Profile.jsx          # User profile
│   ├── Payment.jsx          # Paystack payment flow
│   ├── Onboarding.jsx       # First-time setup
│   ├── PrivacyPolicy.jsx
│   ├── Terms.jsx
│   ├── AdminLogin.jsx
│   └── AdminDashboard.jsx
│
├── components/
│   ├── Navbar.jsx
│   ├── ClauseCard.jsx       # Individual clause display
│   ├── RiskBadge.jsx        # GREEN/YELLOW/RED/BLUE/GREY badges
│   ├── FilterBar.jsx
│   ├── LanguageToggle.jsx
│   ├── ThemeToggle.jsx
│   ├── UpgradeModal.jsx
│   ├── SplashScreen.jsx
│   └── PreviewBanner.jsx
│
├── context/
│   └── LangContext.jsx      # EN / FR UI language toggle
│
├── hooks/
│   ├── useVoiceReader.js    # GhanaNLP + Web Speech TTS
│   └── useInactivityLogout.js  # 30-min silent auto-logout
│
└── lib/
    ├── api.js               # API client
    ├── auth.js              # Auth helpers
    ├── adminApi.js          # Admin API client
    ├── theme.js             # Dark / light mode helpers
    └── i18n.js              # EN + FR UI strings
```

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/t-boye/klaro-frontend.git
cd klaro-frontend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Set your API base URL in `.env`:

```env
VITE_API_BASE_URL=https://klaro-api.emmanuelboye1957.workers.dev
```

> The live API is already public — you can use it directly without spinning up a backend.

### 3. Start development server

```bash
npm run dev
```

Open **http://localhost:5173**

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/` — deploy to Netlify, Vercel, or any static host.

---

## Clause Rating System

| Badge                     | Meaning                           |
| ------------------------- | --------------------------------- |
| 🟢 **GREEN** — Standard   | Normal, fair clause               |
| 🟡 **YELLOW** — Attention | Unusual — read carefully          |
| 🔴 **RED** — Danger       | Potentially harmful — seek advice |
| 🔵 **BLUE** — Your Rights | This clause protects you          |
| ⚫ **GREY** — Boilerplate | Standard filler — safe to skim    |

---

## Supported Languages

| Code  | Language   | TTS Voice                |
| ----- | ---------- | ------------------------ |
| `en`  | English    | Web Speech API           |
| `fr`  | French     | Web Speech API           |
| `tw`  | Asante Twi | GhanaNLP (native)        |
| `ewe` | Ewe        | GhanaNLP (native)        |
| `fan` | Fante      | GhanaNLP via Twi speaker |
| `ga`  | Ga         | Web Speech API           |
| `dag` | Dagbani    | Web Speech API           |
| `ha`  | Hausa      | Web Speech API           |
| `sw`  | Swahili    | Web Speech API           |
| `ar`  | Arabic     | Web Speech API           |

---

## Deploy Your Own

One-click deploy to Netlify:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/t-boye/klaro-frontend)

Set `VITE_API_BASE_URL` to your own backend URL, or use the public Klaro API.

---

## Supported Countries

Ghana · Nigeria · South Africa · Kenya · Rwanda · Côte d'Ivoire · Senegal · Egypt · Tanzania

Payments supported in GHS · NGN · ZAR · KES · XOF · EGP.

---

## License

MIT — feel free to fork, build on it, and contribute.

> Klaro explains documents. It does **not** give legal advice.
