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

For remote or shared use, set `PROMPT_GUIDE_API_TOKEN` to a long random secret held in the server environment. The frontend API panel accepts that bearer token for the current page session only; it is not saved in local storage. When the environment variable is set, the prompt list, create, delete, and validation routes require `Authorization: Bearer <token>`. The unauthenticated health route reports whether authentication is required. Do not commit this token or include it in a URL.

## Routes

- GET /api/health — service status and explicit confirmation that no LLM is configured.
- POST /api/v1/prompts/validate — deterministic structural checks for instruction, context, input, output format, and likely credentials.
- GET /api/v1/prompts?limit=100 — list locally stored prompts.
- POST /api/v1/prompts — save a prompt; requires title and content.
- DELETE /api/v1/prompts/{id} — delete a saved prompt.

FastAPI's interactive API documentation is available at /docs while the service is running.

## Security limits

This is still a single-user API, not a production multi-tenant service. Bearer-token mode protects against casual unauthenticated access but does not provide per-user identity, tenant isolation, rate limiting, CSRF design, audit logging, secret rotation, or operational monitoring. Keep Uvicorn bound to 127.0.0.1 by default. For public hosting, add proper account authentication and authorization, enforce HTTPS at the deployment layer, add rate limits and monitoring, and review backups and storage permissions. The service does not make LLM calls.