# PRD — EduMentor AI
**AI-powered evaluation assistant that generates, evaluates, and personalizes learning from a single syllabus**

| | |
|---|---|
| Team size | 2 |
| Build window | 24 hours |
| AI layer | Gemini API, Gemma 4 model |
| Status | Draft v1 |

---

## 1. Problem

Teachers spend hours creating question papers, grading answers, and giving feedback. Students get a score but no explanation of *why* they lost marks or *how* to improve. Existing AI tools hallucinate or ignore the source syllabus, so feedback isn't trustworthy.

## 2. Goal (24h scope)

Ship a working, demoable slice of the full vision: **Upload → Generate → Evaluate → Explain.** ("Improve" — practice/flashcards — is a stretch goal only if the core loop is done and stable with time to spare.)

## 3. Target Users

Teachers and students at schools, colleges, and coaching institutes (demo framed around one classroom/subject, not multi-tenant scale).

## 4. Why This Wins (judging angle)

Every generated question and every evaluation is grounded in the uploaded syllabus via RAG — not the model's general knowledge. The demo should visibly prove this (e.g., show the retrieved chunk next to the evaluation reasoning) so judges see it's not "just a chatbot."

---

## 5. MVP Scope — What Actually Ships in 24 Hours

Cut ruthlessly. Two people, 24 hours, including setup, debugging, and demo prep, leaves realistically **12–14 hours of net feature-building time per person**. The full 7-agent, dual-role (teacher+student) system in the source doc is a multi-week product, not a hackathon build. Scope it down to one clean end-to-end loop:

**In scope:**
- [ ] Upload one PDF (syllabus/lecture notes)
- [ ] Chunk + embed + store in ChromaDB
- [ ] Auto-generate a small question set (MCQs only — skip descriptive/case-study generation, they add grading complexity for little demo value)
- [ ] User answers the MCQs in a simple UI
- [ ] Evaluation: retrieve relevant chunks, score the answers, generate a short explanation of *why* each wrong answer is wrong, grounded in the retrieved text
- [ ] Weak-topic summary (a few lines, not a full dashboard)

**Explicitly out of scope for the 24h build** (keep in "Future Scope," don't touch during the sprint):
- Descriptive/long-answer/case-study grading (needs much harder semantic evaluation)
- Bloom's Taxonomy tagging, difficulty tiers
- Flashcards, revision notes, adaptive practice
- Progress dashboards, class analytics, PDF reports
- Voice answers, multi-language
- Real auth/multi-user teacher-student accounts — use a single shared session or a simple role toggle instead

**One open decision before you split work — pick now, don't decide mid-build:**
Single-question live evaluation (evaluate as each MCQ is answered) vs. batch evaluation (submit all, evaluate together)? Batch is simpler to build and demo; live is more impressive but doubles your state-management surface area. Recommend **batch** for a 24h build.

---

## 6. Team Split (2 people, 24h)

| Track | Owner | Covers |
|---|---|---|
| **A — RAG + Backend** | Person 1 | FastAPI, PDF ingestion (PyMuPDF), chunking, embeddings, ChromaDB, retrieval endpoint, Gemini/Gemma API calls for generation + evaluation |
| **B — Frontend + Demo flow** | Person 2 | React/Vite UI: upload screen, question-attempt screen, results/feedback screen; wiring to backend API; demo script + sample syllabus PDF prepped in advance |

Integrate early and often — wire the UI to a stub/mock API response in the first 2–3 hours so both tracks aren't blocked waiting on each other.

## 7. Suggested Timeline

| Hours | Milestone |
|---|---|
| 0–2 | Repo scaffolded, API contract agreed (see §9), mock data flowing frontend↔backend |
| 2–6 | PDF upload → chunk → embed → ChromaDB working end to end |
| 6–10 | Question generation endpoint returns real MCQs grounded in retrieved chunks |
| 10–15 | Evaluation endpoint: score answers + generate grounded explanations |
| 15–18 | Frontend fully wired to real endpoints, weak-topic summary UI |
| 18–21 | Bug fixes, error handling for edge cases (bad PDF, empty answers, API timeouts) |
| 21–23 | Demo rehearsal with the real sample PDF, polish UI |
| 23–24 | Buffer / submission |

---

## 8. Architecture (scoped agents)

Three logical agents instead of seven — same pipeline, less orchestration overhead to build and debug in one day:

1. **Document Agent** — reads PDF (PyMuPDF), cleans text, chunks, generates embeddings (sentence-transformers), stores in ChromaDB.
2. **Generation Agent** — retrieves relevant chunks, prompts Gemma 4 to produce a grounded MCQ set.
3. **Evaluation Agent** — retrieves relevant chunks per question, prompts Gemma 4 to score the student's answer and explain the reasoning, referencing the source text.

(Retrieval Agent, Feedback Agent, Practice Agent from the original doc collapse into these three for now — reintroduce as separate services post-hackathon if the product continues.)

## 9. API Contract (draft — lock this in hour 0–2)

```
POST /upload          → { document_id }
POST /generate         { document_id, num_questions } → { quiz_id, questions: [...] }
POST /submit           { quiz_id, answers: [...] } → { quiz_id, submitted: true }
GET  /evaluate/{quiz_id} → { score, per_question: [{ verdict, explanation, source_chunk }], weak_topics: [...] }
```

## 10. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind + shadcn/ui |
| Backend | Python, FastAPI |
| AI | Gemini API, Gemma 4 model |
| PDF processing | PyMuPDF |
| Embeddings | sentence-transformers |
| Vector store | ChromaDB |
| DB | SQLite |
| Deployment | Frontend on Vercel; backend on Render/Railway, or local for demo if hosting is flaky |

## 11. Risks

| Risk | Mitigation |
|---|---|
| Gemma 4 API latency/rate limits during live demo | Pre-run the full flow on the demo PDF beforehand; have a recorded fallback or cached response ready |
| PDF parsing breaks on the demo file | Test with the *actual* demo PDF early, not a placeholder |
| Scope creep back toward the full 7-agent vision mid-build | Refer back to §5 "out of scope" list; don't add features after hour 10 |
| Two people stepping on each other's code | Lock the API contract (§9) in the first 2 hours and don't change it without syncing |

## 12. Success Criteria for the Demo

- Upload a real syllabus PDF live (or start pre-uploaded if risky)
- Generate a grounded MCQ set in front of judges
- Answer a couple deliberately wrong to show the explanation + weak-topic output
- Visibly show a retrieved source chunk next to the AI's reasoning — this is the differentiator, don't bury it in the UI

## 13. Future Scope (post-hackathon)

Descriptive/long-answer grading, Bloom's Taxonomy generation, flashcards & revision notes, adaptive practice, teacher/student dashboards, analytics, PDF reports, voice answers, multi-language support, LMS integration (Google Classroom, Moodle, Canvas), coding-assignment evaluation.
