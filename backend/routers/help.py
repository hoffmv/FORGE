from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
from backend.services.llm_router import get_llm

router = APIRouter()

# Load user manual content at startup
MANUAL_PATH = Path(__file__).parent.parent.parent / "USER_MANUAL.md"
USER_MANUAL_CONTENT = ""

try:
    with open(MANUAL_PATH, 'r', encoding='utf-8') as f:
        USER_MANUAL_CONTENT = f.read()
except Exception as e:
    print(f"Warning: Could not load user manual: {e}")
    USER_MANUAL_CONTENT = "User manual not available."

class HelpQuery(BaseModel):
    question: str

@router.get("/manual")
async def get_manual():
    """
    Return the full user manual content.
    """
    return {
        "content": USER_MANUAL_CONTENT,
        "format": "markdown"
    }

@router.post("/ask")
async def ask_help_question(query: HelpQuery):
    """
    Ask a question about FORGE and get an LLM-powered answer
    based on the user manual.
    """
    if not query.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    # Create context from user manual
    system_prompt = f"""You are FORGE Help Assistant, an expert on the FORGE code generation platform.

Your job is to answer user questions about how to use FORGE based on the User Manual provided below.

USER MANUAL:
{USER_MANUAL_CONTENT}

Guidelines:
1. Answer questions clearly and concisely
2. Reference specific sections of the manual when relevant
3. If the question is not covered in the manual, say so honestly
4. Provide step-by-step instructions when appropriate
5. Be friendly and helpful
6. Keep answers focused on FORGE usage, not general programming questions

Answer the user's question based on the manual above."""

    try:
        llm = get_llm()
        
        response = llm.complete(
            system=system_prompt,
            user=query.question,
            max_tokens=1000
        )
        
        return {
            "question": query.question,
            "answer": response,
            "source": "FORGE User Manual + LLM"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate answer: {str(e)}"
        )

@router.get("/search")
async def search_manual(q: str):
    """
    Search the user manual for specific terms or topics.
    Returns relevant sections.
    """
    if not q.strip():
        raise HTTPException(status_code=400, detail="Search query cannot be empty")
    
    query_lower = q.lower()
    lines = USER_MANUAL_CONTENT.split('\n')
    results = []
    
    # Search for matching sections
    current_section = ""
    section_content = []
    
    for line in lines:
        # Track current section (headers start with #)
        if line.startswith('#'):
            # Save previous section if it matched
            if section_content and any(query_lower in l.lower() for l in section_content):
                results.append({
                    "section": current_section,
                    "content": '\n'.join(section_content),
                    "relevance": sum(1 for l in section_content if query_lower in l.lower())
                })
            
            # Start new section
            current_section = line.strip('#').strip()
            section_content = [line]
        else:
            section_content.append(line)
    
    # Check last section
    if section_content and any(query_lower in l.lower() for l in section_content):
        results.append({
            "section": current_section,
            "content": '\n'.join(section_content),
            "relevance": sum(1 for l in section_content if query_lower in l.lower())
        })
    
    # Sort by relevance
    results.sort(key=lambda x: x['relevance'], reverse=True)
    
    return {
        "query": q,
        "results": results[:10],  # Top 10 results
        "total_found": len(results)
    }
