from fastapi import APIRouter
from pydantic import BaseModel
from backend.storage.db import create_job, get_job, list_jobs, set_runtime_provider
from backend.worker.queue_worker import enqueue

router = APIRouter()

class JobIn(BaseModel):
    project_name: str
    stack: str = "python"
    spec: str
    max_iters: int | None = None

class ProviderIn(BaseModel):
    provider: str

@router.post("")
def submit_job(inp: JobIn):
    job = create_job(inp.model_dump())
    enqueue(job["id"])
    return {"job_id": job["id"], "status": job["status"]}

@router.get("/{job_id}")
def status(job_id: str):
    return get_job(job_id)

@router.get("")
def all_jobs():
    return list_jobs()

@router.post("/provider")
def set_provider_route(inp: ProviderIn):
    set_runtime_provider(inp.provider)
    return {"provider": inp.provider}
