from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.storage.db import (
    create_project, get_project, list_projects, delete_project,
    add_message, get_messages, update_project_workspace
)

router = APIRouter()

class CreateProjectRequest(BaseModel):
    name: str
    description: str = ""

class AddMessageRequest(BaseModel):
    role: str
    content: str
    job_id: Optional[str] = None

@router.post("/")
def create_project_endpoint(req: CreateProjectRequest):
    """Create a new project for conversational iteration"""
    project = create_project(req.name, req.description)
    return project

@router.get("/")
def list_projects_endpoint():
    """List all projects ordered by most recently updated"""
    projects = list_projects()
    return {"projects": projects}

@router.get("/{project_id}")
def get_project_endpoint(project_id: str):
    """Get a project by ID"""
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.delete("/{project_id}")
def delete_project_endpoint(project_id: str):
    """Delete a project and all its messages"""
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    delete_project(project_id)
    return {"success": True}

@router.post("/{project_id}/messages")
def add_message_endpoint(project_id: str, req: AddMessageRequest):
    """Add a message to a project's conversation history"""
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    message = add_message(project_id, req.role, req.content, req.job_id)
    return message

@router.get("/{project_id}/messages")
def get_messages_endpoint(project_id: str):
    """Get all messages for a project"""
    project = get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    messages = get_messages(project_id)
    return {"messages": messages}
