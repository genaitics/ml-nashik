# TRD — EduMentor AI
**Technical Requirements Document**

Companion to PRD v1. Scope, timeline, and feature cuts are defined there — this covers *how* it's built.

| | |
|---|---|
| Runtime target | Local only for the 24h build; deploy (Render/Railway) is a stretch goal if time remains |
| Dev setup | Same machine, pair-programming style |
| Storage | Local disk for PDFs, SQLite for structured data, ChromaDB (local persistent client) for vectors |

---

## 1. System Architecture

```
┌─────────────┐      HTTP/JSON      ┌──────────────────┐
│   React UI  │ ──────────────────▶ │  FastAPI backend  │
│ (Vite, TS)  │ ◀────────────────── │   (localhost:8000) │
└─────────────┘                     └────────┬──────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
            ┌───────────────┐        ┌────────────────┐        ┌───────────────┐
            │ Document Agent │        │ Generation Agent│        │Evaluation Agent│
            │  (PyMuPDF +    │        │ (retrieve +      │        │ (retrieve +   │
            │  sentence-      │        │  Gemma 4 call)   │        │  Gemma 4 call)│
            │  transformers)  │        └────────┬────────┘        └───────┬───────┘
            └───────┬────────┘                  │                        │
                    ▼                            ▼                        ▼
            ┌───────────────┐            ┌───────────────────────────────┐
            │   ChromaDB     │            │   Gemini API (Gemma 4 model)   │
            │ (local, on-disk)│           └───────────────────────────────┘
            └───────────────┘
                    │
                    ▼
            ┌───────────────┐
            │   SQLite       │
            │ (docs, quizzes,│
            │  submissions)  │
            └───────────────┘
```

Both people work in one repo on one machine — no need to design for network sync, but still **branch per feature** and commit often so you have rollback points if a Gemma prompt or a refactor breaks something at hour 20.

## 2. Repo Structure

```
edumentor/
├── backend/
│   ├── main.py                 # FastAPI app, route registration
│   ├── api/
│   │   ├── upload.py
│   │   ├── generate.py
│   │   ├── submit.py
│   │   └── evaluate.py
│   ├── agents/
│   │   ├── document_agent.py
│   │   ├── generation_agent.py
│   │   └── evaluation_agent.py
│   ├── rag/
│   │   ├── chunking.py
│   │   ├── embeddings.py
│   │   └── chroma_store.py
│   ├── db/
│   │   ├── models.py           # SQLAlchemy models
│   │   └── database.py
│   ├── uploads/                # raw PDFs, local disk
│   ├── chromadb_data/          # persistent Chroma client storage
│   ├── database.db             # SQLite file
│   ├── .env                    # GEMINI_API_KEY (gitignored)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── UploadPage.tsx
    │   │   ├── QuizPage.tsx
    │   │   └── ResultsPage.tsx
    │   ├── components/
    │   ├── api/client.ts        # fetch wrapper for backend calls
    │   └── App.tsx
    └── package.json
```

## 3. Data Models (SQLite)

```sql
CREATE TABLE documents (
    id TEXT PRIMARY KEY,          -- uuid
    filename TEXT NOT NULL,
    upload_path TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chunk_count INTEGER
);

CREATE TABLE quizzes (
    id TEXT PRIMARY KEY,
    document_id TEXT REFERENCES documents(id),
    questions_json TEXT NOT NULL,  -- serialized question set incl. correct answers + source chunk ids
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
    id TEXT PRIMARY KEY,
    quiz_id TEXT REFERENCES quizzes(id),
    answers_json TEXT NOT NULL,
    evaluated INTEGER DEFAULT 0,   -- boolean
    result_json TEXT,              -- populated after evaluation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Storing `questions_json` / `answers_json` / `result_json` as JSON blobs (not fully normalized) is deliberate — it avoids extra migrations and joins that cost time you don't have in a 24h build. Revisit if the project continues past the hackathon.

**ChromaDB collection:** one collection per document, named `doc_{document_id}`, storing chunk text + metadata `{document_id, chunk_index, page_number}`.

## 4. API Spec

### `POST /upload`
- **Body:** multipart form, single PDF file
- **Response 200:**
```json
{ "document_id": "uuid", "chunk_count": 42 }
```
- **Errors:** 400 if not a PDF or unreadable; 413 if file too large (cap at ~15MB for the demo)

### `POST /generate`
- **Body:**
```json
{ "document_id": "uuid", "num_questions": 5 }
```
- **Response 200:**
```json
{
  "quiz_id": "uuid",
  "questions": [
    {
      "id": "q1",
      "text": "...",
      "options": ["A", "B", "C", "D"],
      "correct_option": "B",
      "source_chunk_id": "chunk_7"
    }
  ]
}
```
- Note: `correct_option` and `source_chunk_id` are returned to the frontend for this MVP (no separate teacher/student auth) but the UI must not display them until after submission.

### `POST /submit`
- **Body:**
```json
{ "quiz_id": "uuid", "answers": [{ "question_id": "q1", "selected_option": "A" }] }
```
- **Response 200:**
```json
{ "submission_id": "uuid" }
```

### `GET /evaluate/{submission_id}`
- **Response 200:**
```json
{
  "score": "3/5",
  "per_question": [
    {
      "question_id": "q1",
      "verdict": "incorrect",
      "explanation": "You selected A, but the syllabus states... (grounded in source_chunk)",
      "source_excerpt": "..."
    }
  ],
  "weak_topics": ["Topic X", "Topic Y"]
}
```
- If called before evaluation has run, this endpoint triggers evaluation synchronously (acceptable for demo-scale quiz sizes — no need for a job queue).

## 5. Agent Prompt Design (lock these early — they're the riskiest part)

**Generation Agent prompt (sketch):**
```
You are generating exam questions strictly from the provided syllabus excerpt.
Do not use outside knowledge. If the excerpt doesn't support {num_questions}
distinct questions, generate fewer.

Excerpt:
{retrieved_chunks}

Return ONLY valid JSON matching this schema: [...]
```

**Evaluation Agent prompt (sketch):**
```
You are evaluating a student's answer using only the provided source excerpt
as ground truth. State whether the answer is correct, then explain why in
1-2 sentences, citing the specific concept from the excerpt the student
missed or got right.

Question: {question}
Student's answer: {answer}
Source excerpt: {retrieved_chunk}

Return ONLY valid JSON matching this schema: [...]
```

Both prompts demand **JSON-only output** — parse defensively (strip markdown fences, `try/except` with a retry-once-on-parse-failure fallback) since this is the single most likely failure point in the demo.

## 6. Environment & Secrets

- `GEMINI_API_KEY` in `backend/.env`, loaded via `python-dotenv`, never committed
- Single `.env.example` checked into the repo so both of you can bootstrap fast
- No auth system for the 24h build — it's a shared local session, not multi-tenant

## 7. Error Handling Priorities (in order of demo risk)

1. Gemini/Gemma API call fails or times out → catch, retry once, then return a clear error the UI can show ("generation failed, try again") rather than crashing
2. LLM returns malformed JSON → retry once with a stricter "JSON only, no prose" reminder appended to the prompt
3. PDF has no extractable text (scanned image, not real text) → detect early in Document Agent, return a 400 with a clear message rather than silently producing empty chunks
4. Empty/partial quiz submission → validate on the frontend before hitting `/submit`

## 8. Local Dev Setup

```bash
# backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in GEMINI_API_KEY
uvicorn main:app --reload --port 8000

# frontend
cd frontend
npm install
npm run dev             # defaults to localhost:5173, proxy to :8000
```

Since you're pairing on one machine, run both servers simultaneously in split terminal panes and keep hot-reload on for both — this is your fastest iteration loop for the 24h window.

## 9. Testing Approach (hackathon-appropriate, not exhaustive)

No formal test suite — not worth the time budget. Instead:
- Manually verify the full pipeline against the actual demo PDF by hour 15 (see PRD timeline)
- Keep 2–3 sample student answer sets (one all-correct, one all-wrong, one mixed) to sanity-check the Evaluation Agent's output before the real demo run
- A `curl`/Postman collection or a simple `test_flow.py` script hitting all four endpoints in sequence is enough to catch integration breaks fast — build this in hour 2–3, not as an afterthought

## 10. Deployment (stretch goal only)

If core flow is solid with time to spare: frontend → Vercel (static build, trivial), backend → Render or Railway with `GEMINI_API_KEY` set as an environment variable in the platform dashboard, ChromaDB and SQLite as local files on the backend instance (fine for a single-demo deployment, not for real multi-user traffic). Don't attempt this before the core loop works locally — a broken deploy with a working local demo is a worse outcome than skipping deployment entirely.
