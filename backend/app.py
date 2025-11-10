from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import health, jobs

app = FastAPI(title="FORGE")
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_methods=["*"], 
    allow_headers=["*"]
)
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
