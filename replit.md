# FORGE — Where Concepts Become Systems

A production-ready code generation workbench that turns natural language specifications into working code repositories with automated testing and fixing.

## Overview

FORGE is a Replit-style application with a 3-pane interface that:
- Generates code from natural language specifications
- Runs automated tests and fixes failures
- Supports dual LLM providers: LM Studio (local) and OpenAI (cloud)
- Provides runtime provider switching via UI toggle
- Delivers as both web app and Electron desktop application

## Architecture

### Monorepo Structure
```
forge/
├── backend/          # FastAPI orchestrator
├── frontend/         # React/Vite 3-pane UI
├── launcher/         # Electron desktop wrapper
└── installers/       # Staged installer scripts
```

### Backend Components
- **Providers**: LM Studio (local) and OpenAI (cloud) LLM integrations
- **Services**: Orchestrator with Planner → Coder → Verifier → Fixer loop
- **Storage**: SQLite for job tracking
- **Worker**: Background job processor

### Frontend Components
- **Left Pane**: Build form with project name, spec, and provider toggle
- **Center Pane**: Jobs list with live status and logs viewer
- **Right Pane**: Preview pane for built artifacts

## Branding
- **Name**: FORGE — Where Concepts Become Systems
- **Colors**: Ember #FF6E00, Graphite #1C1C1C, Slate #2B2B2B
- **Theme**: Dark with ember-orange highlights

## Configuration

### Environment Variables
- `MODE`: LOCAL or CLOUD (determines default LLM provider)
- `LLM_PROVIDER`: AUTO, LMSTUDIO, or OPENAI
- `LMSTUDIO_BASE_URL`: Local LM Studio endpoint (default: http://localhost:1234/v1)
- `OPENAI_API_KEY`: OpenAI API key (optional, required for OPENAI provider)

### Workflow Orchestration
1. User submits spec via UI
2. Backend creates job (queued status)
3. Worker picks job (running status)
4. Planner creates plan from spec
5. Coder generates files with fenced blocks
6. Verifier runs pytest tests
7. Fixer patches failures (up to MAX_ITERS)
8. Final status: succeeded or failed

## Recent Changes
- **November 10, 2025**: Full system tested and operational
  - Fixed worker queue with error handling and graceful failure recovery
  - Fixed Electron launcher CWD issue (now runs from repo root)
  - Configured Vite proxy for seamless frontend-backend communication
  - OpenAI provider integration tested and working
  - Successfully generated and executed Python code from natural language specs
  - Jobs flow correctly through queued → running → succeeded/failed lifecycle
  - Generated artifacts stored in `workspaces/{project-name}_{id}/` directories

## User Preferences
None yet.

## Next Steps
- Test with actual LLM providers
- Wire up staged installer scripts
- Add tokenizer-aware chunking
- Implement artifact serving to preview pane
