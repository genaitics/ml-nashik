# EduMentor AI 🎓🤖

**AI-powered evaluation assistant that generates, evaluates, and personalizes learning grounded directly in course syllabi.**

---

## 📌 Overview

EduMentor AI transforms course syllabi and lecture notes into interactive, RAG-grounded multiple-choice quizzes, evaluates student answers with zero hallucination, and provides transparent explanations tied directly to source syllabus excerpts.

Built during a 24-hour sprint following strict **PRD.md**, **TRD.md**, **Architecture.md**, and **Phases.md** specifications, with UI pixel-matched directly to **Stitch MCP** design systems (`projects/7641126668640619592`).

---

## 🚀 Key Features

1. **Syllabus Ingestion & Chunking (`/upload`)**: Upload PDF or text syllabi. Extracts text, cleans metadata, generates vector embeddings, and stores document chunks in local ChromaDB / SQLite stores.
2. **Grounded Quiz Generation (`/generate`)**: Retrieves key syllabus chunks and prompts Gemini AI (or Gemma 4) to generate 5 distinct MCQs with 4 options and identified ground truth chunks.
3. **Interactive Quiz Attempt Engine (`/submit`)**: Tactile paper-styled quiz UI matching Stitch design specifications with question-step navigation and selection state management.
4. **Transparent Evaluation & Grounding (`/evaluate/{id}`)**: Evaluates student responses, scores performance, isolates weak topics, and highlights the **exact syllabus excerpt** used to verify the answer.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, TypeScript 5, TailwindCSS 3, Lucide React, Google Fonts (Literata, Inter, JetBrains Mono) |
| **Backend** | Python 3.13, FastAPI, Uvicorn, SQLAlchemy |
| **AI / RAG** | Gemini API / Gemma 4 model, SentenceTransformers embeddings, PyMuPDF |
| **Storage** | SQLite (documents, quizzes, submissions), ChromaDB (vector embeddings) |

---

## 🏗️ Architecture

```
┌─────────────────┐      HTTP/JSON      ┌─────────────────────┐
│   React UI      │ ──────────────────▶ │   FastAPI Backend   │
│  (Vite, TS)     │ ◀────────────────── │  (localhost:8000)   │
└─────────────────┘                     └──────────┬──────────┘
                                                   │
                  ┌────────────────────────────────┼────────────────────────────────┐
                  ▼                                ▼                                ▼
         ┌────────────────┐               ┌──────────────────┐             ┌──────────────────┐
         │ Document Agent │               │ Generation Agent │             │ Evaluation Agent │
         └───────┬────────┘               └────────┬─────────┘             └────────┬─────────┘
                 │                                 │                                │
                 ▼                                 ▼                                ▼
         ┌────────────────┐               ┌──────────────────┐             ┌──────────────────┐
         │ Vector Storage │               │ SQLite Database  │             │   Gemini API     │
         │ (Chroma / RAG) │               │(docs/quizzes/sub)│             │ (Gemma 4 Model)  │
         └────────────────┘               └──────────────────┘             └──────────────────┘
```

---

## 🚦 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set Gemini API Key (optional, built-in fallback engine provided)
cp .env.example .env
# Edit backend/.env to add your GEMINI_API_KEY

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start Vite development server (proxies /api to localhost:8000)
npm run dev
```

Open `http://localhost:3000` (or `http://localhost:5173`) in your browser.

---

## 🧪 Verification & Testing

To test the backend API endpoints end-to-end:
```bash
cd backend
python3 test_backend.py
```

To run frontend TypeScript & build verification:
```bash
cd frontend
npm run build
```

---

## 🚫 Out of Scope (24-Hour Hackathon Build)

Per **PRD.md §5**, the following features were deliberately scoped out to guarantee a rock-solid core RAG evaluation loop:
- Descriptive/long-answer grading
- Multi-tenant real teacher/student authentication
- Class analytics dashboards & multi-student progress tracking
- Adaptive practice flashcards & PDF report exports

---

## 📄 License
MIT License. Created for EduMentor AI project.