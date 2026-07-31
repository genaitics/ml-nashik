# Architecture — EduMentor AI

Companion to PRD v1 and TRD v1. Those cover scope and implementation details — this covers how the pieces fit together and how data moves through the system.

---

## 1. System Overview

```mermaid
flowchart LR
    subgraph Client["Client"]
        UI["React UI (Vite + TS)"]
    end

    subgraph Server["FastAPI Backend (localhost:8000)"]
        API["API Layer"]
        DA["Document Agent"]
        GA["Generation Agent"]
        EA["Evaluation Agent"]
    end

    subgraph Storage["Storage"]
        FS["Local Disk (raw PDFs)"]
        SQL["SQLite (documents, quizzes, submissions)"]
        Chroma["ChromaDB (chunk embeddings)"]
    end

    subgraph External["External"]
        Gemini["Gemini API — Gemma 4"]
    end

    UI <--> API
    API --> DA
    API --> GA
    API --> EA
    DA --> FS
    DA --> Chroma
    DA --> SQL
    GA --> Chroma
    GA --> Gemini
    GA --> SQL
    EA --> Chroma
    EA --> Gemini
    EA --> SQL
```

## 2. Component Responsibilities

| Component | Owns | Does not do |
|---|---|---|
| **React UI** | Upload screen, quiz-attempt screen, results screen, client-side validation | Any grounding/retrieval logic, any LLM calls — it only talks to the FastAPI layer |
| **API Layer** | Route handling, request validation, orchestrating agent calls, error responses | Business logic — delegates to agents |
| **Document Agent** | PDF text extraction, cleaning, chunking, embedding, writing to ChromaDB + SQLite | Question generation or evaluation |
| **Generation Agent** | Retrieving relevant chunks, prompting Gemma 4, parsing/validating the returned question JSON | Storing raw files, evaluating answers |
| **Evaluation Agent** | Retrieving relevant chunks per question, prompting Gemma 4 for verdict + explanation, aggregating weak topics | Question generation |
| **ChromaDB** | Vector similarity search over syllabus chunks | Storing quiz/submission state (that's SQLite's job) |
| **SQLite** | Structured state: documents, quizzes, submissions, results | Vector search |

The Document/Generation/Evaluation split matters for the 24h build specifically because it lets each agent be developed and tested in isolation against a fixed ChromaDB collection — you don't need the full pipeline working to test the Evaluation Agent, just a populated collection and a sample answer.

## 3. Data Flow — Upload

```mermaid
sequenceDiagram
    participant U as User (Teacher)
    participant UI as React UI
    participant API as FastAPI
    participant DA as Document Agent
    participant FS as Local Disk
    participant Chroma as ChromaDB
    participant SQL as SQLite

    U->>UI: Selects PDF
    UI->>API: POST /upload (multipart)
    API->>DA: process(file)
    DA->>FS: Save raw PDF
    DA->>DA: Extract text (PyMuPDF)
    DA->>DA: Clean + chunk text
    DA->>DA: Generate embeddings
    DA->>Chroma: Store chunks + embeddings
    DA->>SQL: Insert document row
    DA-->>API: document_id, chunk_count
    API-->>UI: 200 { document_id, chunk_count }
```

## 4. Data Flow — Generate Quiz

```mermaid
sequenceDiagram
    participant UI as React UI
    participant API as FastAPI
    participant GA as Generation Agent
    participant Chroma as ChromaDB
    participant Gemini as Gemini API (Gemma 4)
    participant SQL as SQLite

    UI->>API: POST /generate { document_id, num_questions }
    API->>GA: generate(document_id, num_questions)
    GA->>Chroma: Retrieve relevant chunks
    GA->>Gemini: Prompt (chunks + JSON schema)
    Gemini-->>GA: Question set (JSON)
    GA->>GA: Validate/parse JSON (retry once on failure)
    GA->>SQL: Insert quiz row
    GA-->>API: quiz_id, questions
    API-->>UI: 200 { quiz_id, questions }
```

## 5. Data Flow — Submit & Evaluate

```mermaid
sequenceDiagram
    participant U as User (Student)
    participant UI as React UI
    participant API as FastAPI
    participant EA as Evaluation Agent
    participant Chroma as ChromaDB
    participant Gemini as Gemini API (Gemma 4)
    participant SQL as SQLite

    U->>UI: Answers questions, submits
    UI->>API: POST /submit { quiz_id, answers }
    API->>SQL: Insert submission row
    API-->>UI: 200 { submission_id }
    UI->>API: GET /evaluate/{submission_id}
    API->>EA: evaluate(submission_id)
    loop per question
        EA->>Chroma: Retrieve source chunk
        EA->>Gemini: Prompt (question + answer + chunk)
        Gemini-->>EA: Verdict + explanation (JSON)
    end
    EA->>EA: Aggregate weak topics
    EA->>SQL: Update submission with result_json
    EA-->>API: score, per_question, weak_topics
    API-->>UI: 200 { evaluation result }
```

## 6. Grounding Boundary (the core differentiator)

```mermaid
flowchart TD
    Q["Question or Answer to evaluate"] --> R["Retrieval: top-k chunks from ChromaDB"]
    R --> P["Prompt: 'Use ONLY this excerpt as ground truth'"]
    P --> M["Gemma 4"]
    M --> V{"Valid grounded JSON?"}
    V -->|yes| Out["Return verdict + explanation + source excerpt"]
    V -->|no, malformed| Retry["Retry once with stricter format instruction"]
    Retry --> M
```

Every response the UI shows must be traceable to a specific retrieved chunk — this is what separates the system from a generic PDF chatbot and is worth surfacing visibly in the results UI (show the source excerpt next to the explanation), not just enforcing it server-side.

## 7. Deployment Topology

**24h build (primary target):**

```mermaid
flowchart LR
    subgraph Laptop["Single Laptop"]
        FE["Vite dev server :5173"]
        BE["Uvicorn :8000"]
        Files["Local disk: PDFs, SQLite, ChromaDB"]
    end
    FE <--> BE
    BE <--> Files
    BE -.->|HTTPS| Gemini["Gemini API"]
```

**Stretch goal, if time remains:**

```mermaid
flowchart LR
    Vercel["Frontend — Vercel"] -->|HTTPS| Render["Backend — Render/Railway"]
    Render --> Files["Instance disk: SQLite + ChromaDB"]
    Render -.->|HTTPS| Gemini["Gemini API"]
```

Note the stretch deployment keeps SQLite/ChromaDB as instance-local files — fine for a single demo session, not durable across redeploys. Don't invest in a managed DB for this hackathon; it's not worth the setup time against the payoff.

## 8. Failure Domains

| If this fails... | Blast radius | Contained by |
|---|---|---|
| Gemini API down/slow | Generation + Evaluation both blocked | Retry-once + clear UI error (TRD §7); pre-cache a known-good response for demo fallback |
| ChromaDB write fails on upload | Document unusable for generation | Fail the `/upload` call loudly rather than silently continuing |
| Malformed LLM JSON | Single question/evaluation, not the whole quiz | Per-question try/except, don't let one bad response 500 the whole endpoint |
| Frontend crash | UI only | Backend state is unaffected — refreshing the page and re-fetching by `quiz_id`/`submission_id` should recover |

This last point is why quiz/submission IDs are returned to the client rather than kept only in frontend state — it gives you a cheap recovery path if the UI hiccups mid-demo.
