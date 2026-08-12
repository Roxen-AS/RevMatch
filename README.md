# RevMatch

**Live Demo:** https://rev-match-smoky.vercel.app/

RevMatch is a Next.js web application that analyzes Formula 1 team radio communications. It processes audio clips to extract exact text transcripts and evaluates the driver's emotional tone (e.g., calm, stressed, tired) to generate plain-English racing insights.

## Tech Stack

* **Framework:** Next.js (React)
* **Backend:** Next.js Serverless API Routes (`/api/transcribe`, `/api/tone`, `/api/insight`)
* **Deployment:** Vercel

## AI & Models

RevMatch utilizes hosted inference APIs to keep the application lightweight without requiring local GPU resources:

* **Speech-to-Text:** `openai/whisper-small` (via Hugging Face Inference API)
* **Emotion/Tone Recognition:** `ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition` (via Hugging Face Inference API)
* **Insight Generation:** Llama 3.3 (via Groq)

## Local Development

1. **Install dependencies:**
   ```bash
   npm install