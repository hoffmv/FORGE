import os
import uuid
from backend.config import settings

def create_workspace(job):
    ws_root = settings.WORKSPACE_ROOT
    os.makedirs(ws_root, exist_ok=True)
    path = os.path.join(ws_root, f"{job['project_name'].replace(' ','_')}_{uuid.uuid4().hex[:8]}")
    os.makedirs(path, exist_ok=True)
    os.makedirs(os.path.join(path, "src"), exist_ok=True)
    return path
