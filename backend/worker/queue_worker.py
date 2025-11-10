import time
from backend.storage.db import list_jobs, update_job_status
from backend.services.orchestrator import run_build

def enqueue(job_id: str):
    pass

def main_loop():
    while True:
        for j in list_jobs():
            if j["status"] == "queued":
                update_job_status(j["id"], "running")
                run_build(j)
        time.sleep(1)

if __name__ == "__main__":
    main_loop()
