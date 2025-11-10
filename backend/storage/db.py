import sqlite3
import os
import json
import time
import uuid
import threading
from backend.config import settings

os.makedirs(os.path.dirname(settings.DB_PATH) or ".", exist_ok=True)

# Thread-safe database connection with lock
_db_lock = threading.Lock()
_conn = sqlite3.connect(settings.DB_PATH, check_same_thread=False)

# Initialize tables
with _db_lock:
    cur = _conn.cursor()
    cur.execute("CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, data TEXT)")
    cur.execute("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT)")
    
    # Projects: persistent workspaces for conversational iteration
    cur.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            workspace_path TEXT,
            created REAL NOT NULL,
            updated REAL NOT NULL
        )
    """)
    
    # Messages: conversation history for each project
    cur.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp REAL NOT NULL,
            job_id TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(id)
        )
    """)
    
    _conn.commit()
    cur.close()

def create_job(payload: dict):
    j = {
        "id": uuid.uuid4().hex,
        "project_name": payload["project_name"],
        "stack": payload.get("stack", "python"),
        "spec": payload["spec"],
        "max_iters": payload.get("max_iters") or 3,
        "status": "queued",
        "created": time.time(),
        "report": None,
        "logs": [],  # Real-time build process logs
        "project_id": payload.get("project_id"),  # Optional: for conversational builds
        "mode": payload.get("mode", "create"),  # 'create' or 'modify'
    }
    with _db_lock:
        cur = _conn.cursor()
        cur.execute("INSERT INTO jobs (id, data) VALUES (?, ?)", (j["id"], json.dumps(j)))
        _conn.commit()
        cur.close()
    return j

def update_job_status(job_id: str, status: str, report: dict | None = None):
    j = get_job(job_id)
    if j is None:
        raise ValueError(f"Job {job_id} not found")
    j["status"] = status
    if report is not None:
        j["report"] = report
    with _db_lock:
        cur = _conn.cursor()
        cur.execute("UPDATE jobs SET data=? WHERE id=?", (json.dumps(j), job_id))
        _conn.commit()
        cur.close()

def get_job(job_id: str):
    with _db_lock:
        cur = _conn.cursor()
        row = cur.execute("SELECT data FROM jobs WHERE id=?", (job_id,)).fetchone()
        cur.close()
    return json.loads(row[0]) if row else None

def list_jobs():
    with _db_lock:
        cur = _conn.cursor()
        rows = cur.execute("SELECT data FROM jobs ORDER BY json_extract(data,'$.created') DESC").fetchall()
        cur.close()
    return [json.loads(r[0]) for r in rows]

def set_runtime_provider(provider: str):
    with _db_lock:
        cur = _conn.cursor()
        cur.execute("INSERT INTO kv (k,v) VALUES ('provider',?) ON CONFLICT(k) DO UPDATE SET v=excluded.v", (provider,))
        _conn.commit()
        cur.close()

def get_runtime_provider():
    with _db_lock:
        cur = _conn.cursor()
        row = cur.execute("SELECT v FROM kv WHERE k='provider'").fetchone()
        cur.close()
    return row[0] if row else None

def append_job_log(job_id: str, log_type: str, content: str | dict):
    """Append a log entry to the job's logs array for real-time visibility"""
    j = get_job(job_id)
    if j is None:
        raise ValueError(f"Job {job_id} not found")
    
    if "logs" not in j:
        j["logs"] = []
    
    log_entry = {
        "timestamp": time.time(),
        "type": log_type,  # 'plan', 'file', 'test', 'output', 'error'
        "content": content
    }
    j["logs"].append(log_entry)
    
    with _db_lock:
        cur = _conn.cursor()
        cur.execute("UPDATE jobs SET data=? WHERE id=?", (json.dumps(j), job_id))
        _conn.commit()
        cur.close()

# Thread-safe execute helpers for external modules
def execute_query(query: str, params: tuple = ()):
    """Execute a SELECT query and return results"""
    with _db_lock:
        cur = _conn.cursor()
        result = cur.execute(query, params).fetchall()
        cur.close()
    return result

def execute_one(query: str, params: tuple = ()):
    """Execute a SELECT query and return one result"""
    with _db_lock:
        cur = _conn.cursor()
        result = cur.execute(query, params).fetchone()
        cur.close()
    return result

def execute_update(query: str, params: tuple = ()):
    """Execute an INSERT/UPDATE/DELETE query"""
    with _db_lock:
        cur = _conn.cursor()
        cur.execute(query, params)
        _conn.commit()
        cur.close()

# ============== Project Management ==============

def create_project(name: str, description: str = ""):
    """Create a new project for conversational iteration"""
    project_id = uuid.uuid4().hex
    now = time.time()
    
    with _db_lock:
        cur = _conn.cursor()
        cur.execute("""
            INSERT INTO projects (id, name, description, workspace_path, created, updated)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (project_id, name, description, None, now, now))
        _conn.commit()
        cur.close()
    
    return {
        "id": project_id,
        "name": name,
        "description": description,
        "workspace_path": None,
        "created": now,
        "updated": now
    }

def get_project(project_id: str):
    """Get a project by ID"""
    with _db_lock:
        cur = _conn.cursor()
        row = cur.execute("""
            SELECT id, name, description, workspace_path, created, updated
            FROM projects WHERE id = ?
        """, (project_id,)).fetchone()
        cur.close()
    
    if not row:
        return None
    
    return {
        "id": row[0],
        "name": row[1],
        "description": row[2],
        "workspace_path": row[3],
        "created": row[4],
        "updated": row[5]
    }

def list_projects():
    """List all projects ordered by most recently updated"""
    with _db_lock:
        cur = _conn.cursor()
        rows = cur.execute("""
            SELECT id, name, description, workspace_path, created, updated
            FROM projects ORDER BY updated DESC
        """).fetchall()
        cur.close()
    
    return [{
        "id": row[0],
        "name": row[1],
        "description": row[2],
        "workspace_path": row[3],
        "created": row[4],
        "updated": row[5]
    } for row in rows]

def update_project_workspace(project_id: str, workspace_path: str):
    """Update the workspace path for a project"""
    now = time.time()
    with _db_lock:
        cur = _conn.cursor()
        cur.execute("""
            UPDATE projects SET workspace_path = ?, updated = ?
            WHERE id = ?
        """, (workspace_path, now, project_id))
        _conn.commit()
        cur.close()

def delete_project(project_id: str):
    """Delete a project and all its messages"""
    with _db_lock:
        cur = _conn.cursor()
        cur.execute("DELETE FROM messages WHERE project_id = ?", (project_id,))
        cur.execute("DELETE FROM projects WHERE id = ?", (project_id,))
        _conn.commit()
        cur.close()

# ============== Message Management ==============

def add_message(project_id: str, role: str, content: str, job_id: str | None = None):
    """Add a message to a project's conversation history"""
    message_id = uuid.uuid4().hex
    now = time.time()
    
    with _db_lock:
        cur = _conn.cursor()
        cur.execute("""
            INSERT INTO messages (id, project_id, role, content, timestamp, job_id)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (message_id, project_id, role, content, now, job_id))
        
        # Update project's updated timestamp
        cur.execute("UPDATE projects SET updated = ? WHERE id = ?", (now, project_id))
        
        _conn.commit()
        cur.close()
    
    return {
        "id": message_id,
        "project_id": project_id,
        "role": role,
        "content": content,
        "timestamp": now,
        "job_id": job_id
    }

def get_messages(project_id: str):
    """Get all messages for a project in chronological order"""
    with _db_lock:
        cur = _conn.cursor()
        rows = cur.execute("""
            SELECT id, project_id, role, content, timestamp, job_id
            FROM messages WHERE project_id = ?
            ORDER BY timestamp ASC
        """, (project_id,)).fetchall()
        cur.close()
    
    return [{
        "id": row[0],
        "project_id": row[1],
        "role": row[2],
        "content": row[3],
        "timestamp": row[4],
        "job_id": row[5]
    } for row in rows]
