# Smart Meeting Generator

An AI-powered meeting intelligence application that transforms meeting transcripts into structured, actionable information using Natural Language Processing (NLP).

## Features

- AI-generated meeting summaries
- Topic and keyword extraction
- Action item extraction, including owners and deadlines when detected
- Decision extraction
- Sentiment analysis
- TXT and DOCX transcript uploads
- Paste-transcript input
- Browser-based Speech-to-Text
- Dashboard with meeting overview and recent activity
- Meeting history and analytics

## Technology Stack

**Frontend:** HTML, CSS, JavaScript

**Backend:** Python, Flask, Flask-CORS

**NLP and Machine Learning:** NLTK, scikit-learn, Hugging Face Transformers, Sentence Transformers, PyTorch

**Other Libraries:** Mammoth.js, Chart.js

## Project Structure

- `backend/app.py` — Flask API
- `backend/nlp_engine.py` — NLP processing pipeline
- `genius/index.html` — Frontend interface
- `genius/smartmeet.js` — Frontend interactions
- `requirements.txt` — Python dependencies

## Run Locally

### 1. Create a virtual environment

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1