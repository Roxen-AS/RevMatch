# RevMatch

**Live Demo:** https://rev-match-smoky.vercel.app/

RevMatch is a Next.js web application that analyzes Formula 1 team radio communications. It processes audio clips to extract exact text transcripts and evaluates the driver's emotional tone (e.g., calm, stressed, tired) to generate plain-English racing insights.

## Tech Stack

* **Framework:** Next.js (React)
* **Backend:** Next.js Serverless API Routes (`/api/transcribe`, `/api/tone`, `/api/insight`)
* **Deployment:** Vercel

## AI & Models

RevMatch utilizes hosted inference APIs alongside local telemetry heuristics to ensure high reliability:

* **Speech-to-Text:** Whisper (via Groq `whisper-large-v3-turbo` or Hugging Face Inference API) with acoustic radio fallback
* **Emotion/Tone Recognition:** `ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition` with acoustic energy/variance classification fallback
* **Insight Generation:** Llama 3.3 (via Groq) / Gemini with autonomous telemetry co-driver heuristics

## Local Development

1. **Navigate to the app directory & install dependencies:**
   ```bash
   cd revmatch
   npm install
   ```

2. **Configure Environment Variables (Optional):**
   Copy `.env.example` to `.env.local` if you wish to configure remote inference providers (Groq, Hugging Face, or Gemini):
   ```bash
   cp ../.env.example .env.local
   ```
   *Note: RevMatch includes autonomous acoustic telemetry and co-driver heuristics, so all features run seamlessly out-of-the-box even without external API keys.*

3. **Run the development server:**
   ```bash
   npm run dev
   ```
