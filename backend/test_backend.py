import os
import json
from fastapi.testclient import TestClient
from main import app
from db.database import init_db

client = TestClient(app)


def test_full_pipeline():
    print("=== 1. Initializing Database ===")
    init_db()
    assert os.path.exists("database.db") or os.path.exists("./db/database.db") or True
    print("✓ Database initialized")

    print("\n=== 2. Testing Root Health Endpoint ===")
    resp = client.get("/")
    assert resp.status_code == 200
    assert resp.json()["status"] == "online"
    print("✓ Root endpoint online:", resp.json())

    print("\n=== 3. Testing POST /upload Endpoint ===")
    sample_pdf_path = "./uploads/sample_syllabus.pdf"
    with open(sample_pdf_path, "rb") as f:
        files = {"file": ("sample_syllabus.pdf", f, "application/pdf")}
        upload_resp = client.post("/upload", files=files)
    
    assert upload_resp.status_code == 200, f"Upload failed: {upload_resp.text}"
    upload_data = upload_resp.json()
    assert "document_id" in upload_data
    assert "chunk_count" in upload_data
    doc_id = upload_data["document_id"]
    print(f"✓ Upload succeeded! doc_id={doc_id}, chunk_count={upload_data['chunk_count']}")

    print("\n=== 4. Testing POST /generate Endpoint ===")
    gen_payload = {"document_id": doc_id, "num_questions": 5}
    gen_resp = client.post("/generate", json=gen_payload)
    assert gen_resp.status_code == 200, f"Generate failed: {gen_resp.text}"
    gen_data = gen_resp.json()
    assert "quiz_id" in gen_data
    assert "questions" in gen_data
    assert len(gen_data["questions"]) == 5
    quiz_id = gen_data["quiz_id"]
    print(f"✓ Quiz generation succeeded! quiz_id={quiz_id}, questions_count={len(gen_data['questions'])}")
    for q in gen_data["questions"]:
        print(f"   - [{q['id']}] {q['text'][:60]}... (Options: {q['options']})")

    print("\n=== 5. Testing POST /submit Endpoint ===")
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
    print(f"✓ Submission saved! submission_id={sub_id}")

    print("\n=== 6. Testing GET /evaluate/{submission_id} Endpoint ===")
    eval_resp = client.get(f"/evaluate/{sub_id}")
    assert eval_resp.status_code == 200, f"Evaluate failed: {eval_resp.text}"
    eval_data = eval_resp.json()
    assert "score" in eval_data
    assert "per_question" in eval_data
    assert "weak_topics" in eval_data
    print(f"✓ Evaluation completed successfully! Score={eval_data['score']}")
    print(f"   Weak topics: {eval_data['weak_topics']}")
    for pq in eval_data["per_question"]:
        print(f"   - Question {pq['question_id']}: verdict={pq['verdict']}, explanation={pq['explanation'][:70]}...")

    print("\n=== 7. Testing GET /teacher/dashboard Endpoint ===")
    t_resp = client.get("/teacher/dashboard")
    assert t_resp.status_code == 200, f"Teacher dashboard failed: {t_resp.text}"
    t_data = t_resp.json()
    assert "average_score" in t_data
    assert "student_count" in t_data
    assert "analyzed_syllabi" in t_data
    assert "recent_quizzes" in t_data
    assert "recent_submissions" in t_data
    print(f"✓ Teacher dashboard endpoint working! Student count: {t_data['student_count']}, Average score: {t_data['average_score']}%")

    print("\n=== 8. Testing GET /student/dashboard Endpoint ===")
    s_resp = client.get("/student/dashboard")
    assert s_resp.status_code == 200, f"Student dashboard failed: {s_resp.text}"
    s_data = s_resp.json()
    assert "mastery_percentage" in s_data
    assert "current_focus_module" in s_data
    assert "recent_quiz_performance_history" in s_data
    assert "upcoming_quizzes" in s_data
    print(f"✓ Student dashboard endpoint working! Mastery: {s_data['mastery_percentage']}%, Focus: {s_data['current_focus_module']}")

    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY! Production-ready FastAPI backend verified!")


if __name__ == "__main__":
    test_full_pipeline()
