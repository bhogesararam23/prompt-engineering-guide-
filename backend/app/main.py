from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
import os
import re
import sqlite3
import hmac
from uuid import uuid4

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

DEFAULT_DB_PATH = Path(__file__).resolve().parents[1] / "data" / "prompts.sqlite3"
DB_PATH = Path(os.environ.get("PROMPT_GUIDE_DB_PATH", str(DEFAULT_DB_PATH)))
API_TOKEN = os.environ.get("PROMPT_GUIDE_API_TOKEN", "").strip()


class PromptCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    content: str = Field(min_length=1, max_length=100_000)


class PromptRecord(BaseModel):
    id: str
    title: str
    content: str
    created_at: str


class PromptCheckInput(BaseModel):
    instruction: str = Field(default="", max_length=20_000)
    input: str = Field(default="", max_length=100_000)
    context: str = Field(default="", max_length=50_000)
    output_format: str = Field(default="", max_length=20_000)


class PromptCheckOutput(BaseModel):
    errors: list[str]
    warnings: list[str]


def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    conn = get_connection()
    try:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS saved_prompts (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 120),
                content TEXT NOT NULL CHECK(length(content) BETWEEN 1 AND 100000),
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()
    finally:
        conn.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Prompt Engineering Guide API",
    description="Optional local persistence and deterministic prompt validation. This API does not call an LLM.",
    version="0.2.0",
    lifespan=lifespan,
)

origins = [
    item.strip()
    for item in os.environ.get(
        "PROMPT_GUIDE_CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if item.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


def require_api_access(authorization: str | None = Header(default=None)) -> None:
    """Require a configured bearer token; default local development can remain tokenless."""
    if not API_TOKEN:
        return
    expected = "Bearer " + API_TOKEN
    supplied = authorization or ""
    if not hmac.compare_digest(supplied, expected):
        raise HTTPException(
            status_code=401,
            detail="A valid bearer token is required for this API.",
            headers={"WWW-Authenticate": "Bearer"},
        )


@app.get("/api/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "service": "prompt-engineering-guide-api",
        "llm": "not-configured",
        "auth_required": bool(API_TOKEN),
    }


@app.post("/api/v1/prompts/validate", response_model=PromptCheckOutput, dependencies=[Depends(require_api_access)])
def validate_prompt(payload: PromptCheckInput) -> PromptCheckOutput:
    errors: list[str] = []
    warnings: list[str] = []
    instruction = payload.instruction.strip()

    if not instruction:
        errors.append("Add a task or instruction before using this prompt.")
    elif len(instruction) < 12:
        warnings.append("The task is very short. Check whether the intended action is unambiguous.")

    if not payload.input.strip() and not payload.context.strip():
        warnings.append("There is no input data or context. Check whether the task has enough information.")
    if not payload.output_format.strip():
        warnings.append("No output format is specified. Add one when consistency matters.")
    if re.search(r"api[_ -]?key|password|secret\s*[:=]", payload.input, re.IGNORECASE):
        warnings.append("The input may contain a credential. Remove secrets before sharing or processing this prompt.")

    return PromptCheckOutput(errors=errors, warnings=warnings)


@app.get("/api/v1/prompts", response_model=list[PromptRecord], dependencies=[Depends(require_api_access)])
def list_prompts(limit: int = Query(default=100, ge=1, le=500)) -> list[PromptRecord]:
    conn = get_connection()
    try:
        rows = conn.execute(
            "SELECT id, title, content, created_at FROM saved_prompts ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
        return [PromptRecord(**dict(row)) for row in rows]
    finally:
        conn.close()


@app.post("/api/v1/prompts", response_model=PromptRecord, status_code=201, dependencies=[Depends(require_api_access)])
def create_prompt(payload: PromptCreate) -> PromptRecord:
    title = payload.title.strip()
    content = payload.content.strip()
    if not title or not content:
        raise HTTPException(status_code=422, detail="Title and content must not be blank.")

    record = PromptRecord(
        id=str(uuid4()),
        title=title,
        content=content,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO saved_prompts (id, title, content, created_at) VALUES (?, ?, ?, ?)",
            (record.id, record.title, record.content, record.created_at),
        )
        conn.commit()
    finally:
        conn.close()
    return record


@app.delete("/api/v1/prompts/{prompt_id}", status_code=204, dependencies=[Depends(require_api_access)])
def delete_prompt(prompt_id: str) -> Response:
    conn = get_connection()
    try:
        cursor = conn.execute("DELETE FROM saved_prompts WHERE id = ?", (prompt_id,))
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Prompt not found.")
    finally:
        conn.close()
    return Response(status_code=204)
