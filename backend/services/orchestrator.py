import os
import json
import re
from backend.services.llm_router import get_llm
from backend.services.chunker import chunk_text
from backend.services import repo_scaffold, evaluator
from backend.storage.db import update_job_status
from backend.config import settings

SYSTEM_PLANNER = "You are a senior software architect. Plan tasks, files, and tests. Output JSON with keys: files[], tests[], steps[]. Keep it compact."
SYSTEM_CODER   = "You are a senior developer. Implement the files. Reply with fenced blocks: ```path/to/file\n<content>\n``` Repeat per file."
SYSTEM_FIXER   = "You are a senior maintainer. Given failing output, reply ONLY with fenced patches as above."


def apply_fenced(repo: str, text: str):
    for header, body in re.findall(r"```(.*?)\n([\s\S]*?)```", text):
        fname = header.strip().split()[0]
        full = os.path.join(repo, fname)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, "w", encoding="utf-8") as f:
            f.write(body)


def run_build(job: dict):
    llm = get_llm()
    repo = repo_scaffold.create_workspace(job)

    spec_chunks = chunk_text(job["spec"])

    plan = llm.complete(system=SYSTEM_PLANNER, user=spec_chunks[0], max_tokens=settings.MAX_REPLY_TOKENS)

    for ch in spec_chunks:
        patch = llm.complete(system=SYSTEM_CODER, user=f"SPEC CHUNK:\n{ch}\n\nPLAN:\n{plan}", max_tokens=settings.MAX_REPLY_TOKENS)
        apply_fenced(repo, patch)

    report = None
    for _ in range(settings.MAX_ITERS):
        ok, report = evaluator.run(repo)
        if ok:
            update_job_status(job['id'], 'succeeded', report)
            return True, repo
        fix = llm.complete(system=SYSTEM_FIXER, user=json.dumps(report)[:settings.MAX_INPUT_CHARS], max_tokens=settings.MAX_REPLY_TOKENS)
        apply_fenced(repo, fix)

    update_job_status(job['id'], 'failed', report)
    return False, repo
