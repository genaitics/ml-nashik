import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from db.database import init_db
from api.upload import router as upload_router
from api.generate import router as generate_router
from api.submit import router as submit_router
from api.evaluate import router as evaluate_router
from api.dashboard import router as dashboard_router
from api.demo import router as demo_router

app = FastAPI(
    title="EduMentor AI Backend",
    description="RAG-powered interactive quiz generation and automated grounded evaluation API",
    version="1.0.0"
)

# Enable CORS for all origins and local development frontend (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


# Include API routers
app.include_router(upload_router)
app.include_router(generate_router)
app.include_router(submit_router)
app.include_router(evaluate_router)
app.include_router(dashboard_router)
app.include_router(dashboard_router, prefix="/api")
app.include_router(dashboard_router, prefix="/dashboard")
app.include_router(demo_router)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "EduMentor AI Backend",
        "version": "1.0.0",
        "docs": "/docs"
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
