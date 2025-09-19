# Lead Intent Scoring

🚀 A SaaS tool to score leads based on rule-based logic and AI-enhanced scoring, with CSV upload, scoring, results export, and optional Slack notifications.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Rule Logic & AI Scoring](#rule-logic--ai-scoring)
- [Frontend Usage](#frontend-usage)
- [Deployment](#deployment)
- [License](#license)

---

## Features
- Upload leads via CSV
- Configure your offer with value propositions & ideal use cases
- Score leads with:
  - **Rule-based scoring**
  - **AI-based scoring** (optional)
- Export scored results as CSV
- Optional Slack integration to send top leads

---

## Tech Stack
- **Backend:** Node.js, Express
- **Frontend:** React + TypeScript
- **AI:** OpenAI GPT-3.5/GPT-5-mini
- **Storage:** CSV files
- **Other:** Multer for file upload, CSV Parser, CSV Writer

---

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/Chandan4005/lead-intent-scoring.git
cd lead-intent-scoring
2. Install dependencies
Backend
npm install

Frontend
cd frontend
npm install

3. Create .env file

Copy .env.example to .env and add your secrets:

cp .env.example .env


Fill in:

PORT=3000
OPENAI_API_KEY=sk-your-openai-key
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXXX/XXXX/XXXX
AI_PROVIDER=openai

API Endpoints
Endpoint	Method	Description
/	GET	Health check
/ping	GET	Simple ping response
/offer	POST	Save your offer configuration
/leads/upload	POST	Upload CSV file of leads
/score	POST	Score uploaded leads
/results	GET	Get scored results
/results/export	GET	Download scored results as CSV
/api/summarize	POST	Summarize top leads and send to Slack (optional)

Example cURL for scoring:

curl -X POST http://localhost:3000/score

Rule Logic & AI Scoring

Rule-based scoring (0–50):

Decision makers (Head of Growth, VP Sales, CEO, Founder): +20

Influencers (Manager, Director): +10

Industry matches ideal use cases: +20, else +10

Required fields filled: +10

AI-based scoring (0–50, optional):

High intent → +50

Medium intent → +30

Low intent → +10

Fallback: AI skipped → default High (+50)

Final score = Rule score + AI score

Frontend Usage

Run backend:

npm start


Run frontend:

cd frontend
npm start


Open http://localhost:5173/ (or the port shown by Vite)

Upload leads CSV → configure offer → click Score → view results → export CSV.

Optional: Trigger Slack summary if SLACK_WEBHOOK_URL is configured.

Deployment
Deploy Backend

Use Render
, Railway
, Heroku
, or Vercel

Set environment variables in dashboard (OPENAI_API_KEY, SLACK_WEBHOOK_URL)

Start server (npm start)

Deploy Frontend

Host on Vercel, Netlify, or any static site host

Set backend API URL in frontend .env if needed

Notes

Never commit real API keys (OPENAI_API_KEY) to GitHub. Use .env files and .env.example placeholders.

Ensure CSV files have headers: name, role, company, industry, location, linkedin_bio
