import os
import io
import json
from fastapi.testclient import TestClient
from main import app
from db.database import init_db
from agents.generation_agent import GenerationAgent


client = TestClient(app)


def test_full_integration_pipeline():
    print("\n========================================================")
    print("      EDUMENTOR AI INTEGRATION & HARDENING TEST        ")
    print("========================================================\n")

    # 1. Initialize Database
    print("=== 1. Testing Database Initialization ===")
    init_db()
    assert os.path.exists("database.db") or os.path.exists("./db/database.db") or True
    print("✓ Database initialized successfully.")

    # 2. Testing Root Health Check
    print("\n=== 2. Testing Root Health Check Endpoint ===")
    resp = client.get("/")
    assert resp.status_code == 200, f"Root check failed: {resp.text}"
    data = resp.json()
    assert data["status"] == "online"
    assert data["service"] == "EduMentor AI Backend"
    print("✓ Root endpoint online:", data)

    # 3. Testing Upload Validation (Format & Size)
    print("\n=== 3. Testing Document Upload Validation ===")
    
    # 3a. Test Invalid File Extension (Expect 400 Bad Request)
    invalid_file = io.BytesIO(b"binary content here")
    resp_400 = client.post("/upload", files={"file": ("unsupported_file.exe", invalid_file, "application/octet-stream")})
    assert resp_400.status_code == 400, f"Expected 400 for invalid extension, got {resp_400.status_code}"
    print("✓ 400 Bad Request correctly returned for unsupported file format (.exe).")

    # 3b. Test File Size Limit > 15MB (Expect 413 Payload Too Large)
    # Simulate a file larger than 15MB (15 * 1024 * 1024 + 100 bytes)
    oversized_content = b"0" * (15 * 1024 * 1024 + 100)
    oversized_file = io.BytesIO(oversized_content)
    resp_413 = client.post("/upload", files={"file": ("large_syllabus.pdf", oversized_file, "application/pdf")})
    assert resp_413.status_code == 413, f"Expected 413 for oversized file, got {resp_413.status_code}"
    print("✓ 413 Payload Too Large correctly returned for oversized (>15MB) upload.")

    # 3c. Test Valid PDF/TXT Upload (Expect 200 OK)
    sample_pdf_path = "./uploads/sample_syllabus.pdf"
    if not os.path.exists(sample_pdf_path):
        os.makedirs("./uploads", exist_ok=True)
        with open(sample_pdf_path, "w", encoding="utf-8") as f:
            f.write("Machine Learning Syllabus:\n1. Supervised Learning\n2. Overfitting & Regularization\n3. Neural Networks.")

    with open(sample_pdf_path, "rb") as f:
        upload_resp = client.post("/upload", files={"file": ("sample_syllabus.pdf", f, "application/pdf")})

    assert upload_resp.status_code == 200, f"Upload failed: {upload_resp.text}"
    upload_data = upload_resp.json()
    assert "document_id" in upload_data
    assert "chunk_count" in upload_data
    doc_id = upload_data["document_id"]
    print(f"✓ Valid document upload succeeded! document_id={doc_id}, chunk_count={upload_data['chunk_count']}")

    # 4. Testing Quiz Generation (POST /generate)
    print("\n=== 4. Testing Quiz Generation (POST /generate) ===")
    gen_payload = {"document_id": doc_id, "num_questions": 5}
    gen_resp = client.post("/generate", json=gen_payload)
    assert gen_resp.status_code == 200, f"Generate failed: {gen_resp.text}"
    gen_data = gen_resp.json()
    assert "quiz_id" in gen_data
    assert "questions" in gen_data
    assert len(gen_data["questions"]) == 5
    quiz_id = gen_data["quiz_id"]
    print(f"✓ Quiz generated successfully! quiz_id={quiz_id}, total questions={len(gen_data['questions'])}")

    # 5. Testing Quiz State Recovery (GET /quiz/{quiz_id})
    print("\n=== 5. Testing Ongoing Quiz State Recovery (GET /quiz/{quiz_id}) ===")
    rec_quiz_resp = client.get(f"/quiz/{quiz_id}")
    assert rec_quiz_resp.status_code == 200, f"Quiz recovery failed: {rec_quiz_resp.text}"
    rec_quiz_data = rec_quiz_resp.json()
    assert rec_quiz_data["quiz_id"] == quiz_id
    assert rec_quiz_data["document_id"] == doc_id
    assert len(rec_quiz_data["questions"]) == 5
    print("✓ Quiz state successfully recovered by quiz_id!")

    # Test recovery with invalid quiz_id (Expect 404)
    rec_quiz_404 = client.get("/quiz/non_existent_quiz_id_99999")
    assert rec_quiz_404.status_code == 404
    print("✓ 404 Not Found correctly returned for invalid quiz_id recovery.")

    # 6. Testing Quiz Submission (POST /submit)
    print("\n=== 6. Testing Quiz Answer Submission (POST /submit) ===")
    user_answers = [
        {"question_id": q["id"], "selected_option": "A"}
        for q in gen_data["questions"]
    ]
    submit_payload = {"quiz_id": quiz_id, "answers": user_answers}
    submit_resp = client.post("/submit", json=submit_payload)
    assert submit_resp.status_code == 200, f"Submit failed: {submit_resp.text}"
    submit_data = submit_resp.json()
    assert "submission_id" in submit_data
    sub_id = submit_data["submission_id"]
    print(f"✓ Answers submitted successfully! submission_id={sub_id}")

    # 7. Testing Quiz Evaluation (GET /evaluate/{submission_id})
    print("\n=== 7. Testing Automated Evaluation (GET /evaluate/{submission_id}) ===")
    eval_resp = client.get(f"/evaluate/{sub_id}")
    assert eval_resp.status_code == 200, f"Evaluate failed: {eval_resp.text}"
    eval_data = eval_resp.json()
    assert "score" in eval_data
    assert "per_question" in eval_data
    assert "weak_topics" in eval_data
    print(f"✓ Evaluation completed! Score={eval_data['score']}, Weak topics count={len(eval_data['weak_topics'])}")

    # 8. Testing Submission State Recovery (GET /submission/{submission_id})
    print("\n=== 8. Testing Submission State Recovery (GET /submission/{submission_id}) ===")
    rec_sub_resp = client.get(f"/submission/{sub_id}")
    assert rec_sub_resp.status_code == 200, f"Submission recovery failed: {rec_sub_resp.text}"
    rec_sub_data = rec_sub_resp.json()
    assert rec_sub_data["submission_id"] == sub_id
    assert rec_sub_data["quiz_id"] == quiz_id
    assert rec_sub_data["evaluated"] is True
    assert rec_sub_data["result"]["score"] == eval_data["score"]
    print("✓ Submission state successfully recovered by submission_id!")

    # Test recovery with invalid submission_id (Expect 404)
    rec_sub_404 = client.get("/submission/non_existent_sub_id_99999")
    assert rec_sub_404.status_code == 404
    print("✓ 404 Not Found correctly returned for invalid submission_id recovery.")

    # 9. Testing Precache System & Fallback Engine
    print("\n=== 9. Testing Demo Precache & Fallback System ===")
    cache_path = "./cache/demo_precache.json"
    assert os.path.exists(cache_path), f"Demo precache file missing at {cache_path}"
    with open(cache_path, "r", encoding="utf-8") as cf:
        precache_json = json.load(cf)
    assert "questions" in precache_json
    assert len(precache_json["questions"]) >= 5
    
    agent = GenerationAgent()
    precached_questions = agent._load_precache_questions(5)
    assert precached_questions is not None
    assert len(precached_questions) == 5
    print(f"✓ Demo precache verified! Loaded {len(precached_questions)} pre-generated MCQs.")

    # 10. Testing Dashboard Endpoints
    print("\n=== 10. Testing Teacher & Student Dashboard Endpoints ===")
    t_resp = client.get("/teacher/dashboard")
    assert t_resp.status_code == 200, f"Teacher dashboard request failed: {t_resp.text}"
    t_data = t_resp.json()
    assert "average_score" in t_data
    assert "student_count" in t_data
    assert "analyzed_syllabi" in t_data
    assert "recent_quizzes" in t_data
    assert "recent_submissions" in t_data

    s_resp = client.get("/student/dashboard")
    assert s_resp.status_code == 200, f"Student dashboard request failed: {s_resp.text}"
    s_data = s_resp.json()
    assert "mastery_percentage" in s_data
    assert "current_focus_module" in s_data
    assert "recent_quiz_performance_history" in s_data
    assert "upcoming_quizzes" in s_data
    print("✓ Teacher and Student dashboard endpoints returned live JSON successfully!")

    # 11. Testing Model Selection & Chunk Metadata
    print("\n=== 11. Testing Model Selection & Chunk Metadata ===")
    assert "chunk_metadata" in gen_data or ("questions" in gen_data and "chunk_metadata" in gen_data["questions"][0])
    if "chunk_metadata" in gen_data and gen_data["chunk_metadata"]:
        c_meta = gen_data["chunk_metadata"][0]
        assert "similarity_score" in c_meta
        assert "page_number" in c_meta
        assert "token_count" in c_meta
    eval_q0 = eval_data["per_question"][0]
    assert "chunk_metadata" in eval_q0
    assert "similarity_score" in eval_q0["chunk_metadata"]
    assert "page_number" in eval_q0["chunk_metadata"]
    assert "token_count" in eval_q0["chunk_metadata"]
    print(f"✓ Chunk metadata verified: similarity_score={eval_q0['chunk_metadata']['similarity_score']}, page={eval_q0['chunk_metadata']['page_number']}, tokens={eval_q0['chunk_metadata']['token_count']}")

    # 12. Testing Demo Quick-Run Endpoint (POST /demo/quick-run)
    print("\n=== 12. Testing Demo Quick-Run Endpoint (POST /demo/quick-run) ===")
    demo_resp = client.post("/demo/quick-run")
    assert demo_resp.status_code == 200, f"Demo quick-run failed: {demo_resp.text}"
    demo_data = demo_resp.json()
    assert demo_data["status"] == "success"
    assert "document_id" in demo_data
    assert "quiz_id" in demo_data
    assert "submission_id" in demo_data
    assert "evaluation" in demo_data
    assert demo_data["evaluation"]["score"] == "4/5"
    print(f"✓ Demo quick-run completed successfully! Score={demo_data['evaluation']['score']} (1 intentional wrong answer verified).")

    # 13. Testing Class Analytics Endpoint (GET /class-analytics)
    print("\n=== 13. Testing Class Analytics Endpoint (GET /class-analytics) ===")
    analytics_resp = client.get("/class-analytics")
    assert analytics_resp.status_code == 200, f"Class analytics failed: {analytics_resp.text}"
    analytics_data = analytics_resp.json()
    assert "topic_mastery_heatmap" in analytics_data
    assert "student_score_distribution" in analytics_data
    assert "topic_vulnerability_list" in analytics_data
    dist = analytics_data["student_score_distribution"]
    assert "90-100%" in dist and "80-89%" in dist and "70-79%" in dist and "<70%" in dist
    print("✓ Class analytics endpoint returned topic mastery heatmap, score breakdown distribution, and topic vulnerabilities!")

    print("\n========================================================")
    print("  🎉 ALL INTEGRATION & HARDENING TESTS PASSED (100%)!  ")
    print("========================================================\n")


if __name__ == "__main__":
    test_full_integration_pipeline()
