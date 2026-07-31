# Phases — EduMentor AI
**24-hour build, 2 people, local dev (same machine)**

Companion to PRD, TRD, and Architecture docs. This turns the PRD's timeline table into an actionable checklist with clear phase-exit criteria — don't move to the next phase until the current one's checklist is done, even if the clock says you're behind. A working smaller demo beats a broken bigger one.

Person 1 = **Backend/RAG**. Person 2 = **Frontend/Demo**. Work in parallel within each phase; sync at every phase boundary.

---

## Phase 0 — Setup & Contract (Hours 0–2)

**Goal:** Both of you can run your half independently, against agreed interfaces, without blocking each other.

- [ ] Repo created, both people can push
- [ ] `backend/` and `frontend/` scaffolded per TRD §2 structure
- [ ] API contract from TRD §4 pasted into a shared doc/README — locked, don't change without syncing
- [ ] `.env.example` committed; real `.env` with `GEMINI_API_KEY` working locally (P1)
- [ ] FastAPI running on `:8000` with all 4 route stubs returning **mock JSON** matching the contract exactly (P1)
- [ ] React app running on `:5173`, hitting the mock endpoints successfully (P2)
- [ ] Sample syllabus PDF chosen for the demo — **not a placeholder**, the real one you'll present with (both)

**Exit check:** P2 can click through Upload → Generate → Submit → Results using mock data end to end, even though nothing is "real" yet.

---

## Phase 1 — Real Ingestion Pipeline (Hours 2–6)

**Owner: P1.** P2 continues building UI screens against mocks in parallel.

- [ ] PyMuPDF text extraction working on the real demo PDF
- [ ] Text cleaning (strip headers/footers/page numbers if noisy)
- [ ] Chunking strategy chosen and implemented (fixed-size with overlap is fine — don't over-engineer this)
- [ ] sentence-transformers embedding pipeline working
- [ ] ChromaDB collection created per document, chunks stored with metadata
- [ ] SQLite `documents` table populated on upload
- [ ] `/upload` endpoint returns real `document_id` + `chunk_count`, no longer mocked

**P2 in parallel:**
- [ ] Upload screen: file picker, upload progress state, error state for bad files
- [ ] Quiz-attempt screen UI built (still against mock question data)

**Exit check:** Upload the real demo PDF, confirm chunk count looks sane, spot-check 2–3 stored chunks in ChromaDB actually contain readable syllabus text.

---

## Phase 2 — Generation Agent (Hours 6–10)

**Owner: P1.**

- [ ] Retrieval query for generation implemented (what gets fetched to ground question creation)
- [ ] Gemma 4 prompt drafted per TRD §5, tested manually against the real demo PDF's chunks
- [ ] JSON parsing with retry-once-on-malformed-output implemented
- [ ] `/generate` endpoint returns real questions, no longer mocked
- [ ] Manually verify: do the generated MCQs actually match what's in the syllabus? (read them yourself, don't just check the JSON is valid)

**P2 in parallel:**
- [ ] Wire quiz-attempt screen to real `/generate` response shape
- [ ] Results screen UI built (still against mock evaluation data)

**Exit check:** Generate a real question set from the real PDF, both of you independently agree the questions are reasonable and grounded — this is your first real demo-quality artifact.

---

## Phase 3 — Evaluation Agent (Hours 10–15)

**Owner: P1.** This is the highest-risk phase — start it with maximum focus, don't let it slip into Phase 4's window.

- [ ] Retrieval query for evaluation implemented (per-question chunk lookup)
- [ ] Evaluation prompt drafted per TRD §5, tested against known right/wrong sample answers
- [ ] Verdict + explanation + source excerpt returned per question
- [ ] Weak-topic aggregation logic (even simple keyword/topic grouping is fine)
- [ ] `/submit` and `/evaluate/{id}` endpoints wired to real data, no longer mocked
- [ ] Test with the 3 sample answer sets from TRD §9 (all-correct, all-wrong, mixed) — confirm explanations make sense in all three cases

**P2 in parallel:**
- [ ] Wire results screen to real `/evaluate` response
- [ ] Surface the source excerpt next to each explanation in the UI (this is the differentiator — don't let it get buried, see Architecture §6)

**Exit check:** Full pipeline — real PDF → real questions → real answers → real grounded evaluation — works end to end at least once without any mocked data anywhere.

---

## Phase 4 — Integration Hardening (Hours 15–18)

**Both.** Sit together for this phase.

- [ ] Full click-through on the real demo PDF, done by the person who *didn't* build that part (fresh eyes catch UI/API mismatches)
- [ ] Error states actually tested: bad PDF upload, Gemini timeout, malformed JSON — confirm the UI shows a message instead of hanging or crashing
- [ ] Loading states added anywhere a Gemini call happens (these are not instant)
- [ ] Weak-topic summary displayed clearly on results screen
- [ ] Page-refresh recovery checked per Architecture §8 (does re-fetching by `quiz_id`/`submission_id` actually work?)

**Exit check:** Either of you can run the full demo flow solo, from a cold start, without the other person's help.

---

## Phase 5 — Rehearsal & Polish (Hours 18–21)

- [ ] Full demo run-through, timed, using the exact PDF and exact click sequence you'll use live
- [ ] Fix anything that broke during rehearsal — don't add new features here
- [ ] Cache/record a known-good Gemini response as an emergency fallback (per TRD §7 risk mitigation) in case of live API flakiness
- [ ] Basic visual polish pass — spacing, empty states, obvious UI rough edges only
- [ ] Decide who presents which part of the demo

**Exit check:** A second full run-through, faster than the first, with no surprises.

---

## Phase 6 — Buffer & Submission (Hours 21–24)

- [ ] Final rehearsal
- [ ] README written: what it does, tech stack, how to run it, what's out of scope (point to PRD §5 "explicitly out of scope" so judges know it's deliberate, not an oversight)
- [ ] Submission form/repo link/demo video (if required) done with margin before the deadline — not at minute 1439
- [ ] Stretch deployment (TRD §10) **only** attempted here, and only if everything above is solid

**Exit check:** Submitted, with time to spare. If you're not here by hour 23, cut the stretch deployment first, then cut demo polish — never cut rehearsal.

---

## Non-Negotiable Rule Across All Phases

If a phase's exit check isn't met by its deadline hour, **stop adding scope and fix what's broken** before moving on. Referring back to PRD §5's cut list is the fastest way to resist scope creep when the clock is against you.
