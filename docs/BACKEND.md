# Optional backend

## Start locally

Requirements: Python 3.11 or newer.

~~~sh
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
~~~

The service creates its SQLite database under backend/data/ by default. Set PROMPT_GUIDE_DB_PATH to choose a different file. Set PROMPT_GUIDE_CORS_ORIGINS to a comma-separated list of trusted frontend origins.

## Routes

- GET /api/health — service status and explicit confirmation that no LLM is configured.
- POST /api/v1/prompts/validate — deterministic structural checks for instruction, context, input, output format, and likely credentials.
- GET /api/v1/prompts?limit=100 — list locally stored prompts.
- POST /api/v1/prompts — save a prompt; requires title and content.
- DELETE /api/v1/prompts/{id} — delete a saved prompt.

FastAPI's interactive API documentation is available at /docs while the service is running.

## Security limits

This is a local development API, not a production multi-user service. There is no authentication or tenant isolation. Keep Uvicorn bound to 127.0.0.1 and do not expose the service publicly until authentication, authorization, rate limits, deployment secrets, and operational monitoring are implemented. The service does not make LLM calls.