import subprocess
import os

def run(repo_path: str):
    tests_dir = os.path.join(repo_path, "tests")
    if not os.path.exists(tests_dir):
        return True, {"tests": "no tests found; skipping"}
    out = subprocess.run(
        ["pytest", "-q"], 
        cwd=repo_path, 
        capture_output=True, 
        text=True, 
        timeout=180
    )
    return out.returncode == 0, {"stdout": out.stdout, "stderr": out.stderr}
