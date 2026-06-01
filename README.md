# ONYX ✦ Adaptive AI Technical Interviewer

> **Architected by Lakshan Muruganandam**

ONYX is an elite, autonomous AI technical interviewer designed to rigorously evaluate FAANG-level engineering talent. It moves beyond standard chatbots by utilizing an **Adaptive State Logic Engine** that dynamically adjusts question difficulty based on real-time candidate performance, cross-referenced against their Resume and the specific Job Description.

## 🚀 The Core Innovations

### 1. Invincible Fallback Architecture (100% Uptime Guarantee)
To ensure absolute reliability in enterprise environments, ONYX is built on a 3-tier cascading AI architecture:
*   **Tier 1 (Primary):** Powered by **Google Gemini 2.5 Flash**, delivering sub-second, highly contextual reasoning.
*   **Tier 2 (Failover):** If the primary API rate-limits or fails, the backend intercepts the `400/500` error and silently reroutes the payload to **Meta Llama 3.3 70B via OpenRouter**.
*   **Tier 3 (Safety Net):** In the event of a total internet/API blackout, the system drops to a sophisticated mock-state generator, ensuring the frontend UI never crashes during an interview.

### 2. Adaptive State Logic
ONYX does not ask a static list of questions. 
*   **The Initialization:** It ingests the candidate's Resume and the target JD to formulate a hyper-specific opening scenario.
*   **The Evaluation:** Every answer is scored across 5 metrics: *Accuracy, Clarity, Depth, Relevance, and Time Efficiency*.
*   **The Pivot:** If a candidate demonstrates mastery (Score > 85%), ONYX escalates to "Hard Mode" to test architectural limits. If they struggle, it pivots to fundamentals to establish a baseline.

### 3. Elite Career Coach Diagnostics
When the interview concludes, ONYX drops the "Interviewer" persona and generates a massively detailed JSON payload that acts as a Principal Engineering Career Coach:
*   **Technical Upgrades:** Pinpoints exact architectural concepts (e.g., *LSM-Trees vs B-Trees, Paxos consensus*) the candidate needs to study.
*   **Resume Rewrites:** Instructs the candidate exactly how to rewrite their bullet points using the XYZ metric formula to pass ATS systems.
*   **Action Plan:** Provides a week-by-week study roadmap to guarantee an offer on the next attempt.

## 🛠️ Tech Stack
*   **Frontend:** React, Vite, Tailwind CSS, Framer Motion (Glassmorphism "Obsidian & Plasma" UI)
*   **Backend:** Node.js, Express
*   **AI Engine:** Google Generative AI SDK (Gemini 2.5 Flash), OpenRouter API (Llama 3.3 70B)

## ⚡ Quick Start
1. Clone the repository.
2. `cd frontend && npm install && npm run dev`
3. `cd backend && npm install && node server.js`
4. Add your `.env` keys (`GEMINI_API_KEY`, `OPENROUTER_API_KEY`) in the backend.

---
*Built to redefine autonomous technical recruiting.*
