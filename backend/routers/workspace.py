import os
from pathlib import Path
from fastapi import APIRouter, HTTPException
from backend.storage.db import get_job
from backend.config import settings

router = APIRouter()

@router.get("/{job_id}/files")
def list_workspace_files(job_id: str):
    """List all files in a job's workspace"""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    workspace_path = Path(job.workspace_path)
    if not workspace_path.exists():
        return {"files": []}
    
    files = []
    for root, dirs, filenames in os.walk(workspace_path):
        # Skip hidden dirs and cache
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != '__pycache__']
        
        for filename in filenames:
            if filename.startswith('.'):
                continue
            
            filepath = Path(root) / filename
            rel_path = filepath.relative_to(workspace_path)
            
            try:
                size = filepath.stat().st_size
                files.append({
                    "path": str(rel_path),
                    "size": size,
                    "type": "file"
                })
            except Exception:
                continue
    
    return {"files": sorted(files, key=lambda x: x["path"])}

@router.get("/{job_id}/files/{file_path:path}")
def read_workspace_file(job_id: str, file_path: str):
    """Read content of a specific file in the workspace"""
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    workspace_path = Path(job.workspace_path)
    target_file = workspace_path / file_path
    
    # Security check: ensure file is within workspace
    try:
        target_file = target_file.resolve()
        workspace_path = workspace_path.resolve()
        if not str(target_file).startswith(str(workspace_path)):
            raise HTTPException(status_code=403, detail="Access denied")
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid file path")
    
    if not target_file.exists() or not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        content = target_file.read_text()
        return {
            "path": file_path,
            "content": content,
            "size": len(content)
        }
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File is not text-readable")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
