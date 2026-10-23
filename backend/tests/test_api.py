from fastapi.testclient import TestClient
import pytest

from backend.app import main


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "DB_PATH", tmp_path / "test-prompts.sqlite3")
    monkeypatch.setattr(main, "API_TOKEN", "")
    with TestClient(main.app) as test_client:
        yield test_client


def test_health_is_explicit_about_llm(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["llm"] == "not-configured"
    assert response.json()["auth_required"] is False


def test_prompt_validation_is_deterministic(client):
    response = client.post(
        "/api/v1/prompts/validate",
        json={"instruction": "", "input": "", "context": "", "output_format": ""},
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["errors"]
    assert payload["warnings"]


def test_saved_prompt_crud(client):
    created = client.post(
        "/api/v1/prompts",
        json={"title": "  Example  ", "content": "  Task:\nSummarize the text.  "},
    )
    assert created.status_code == 201
    record = created.json()
    assert record["title"] == "Example"
    assert record["content"] == "Task:\nSummarize the text."

    listed = client.get("/api/v1/prompts")
    assert listed.status_code == 200
    assert any(item["id"] == record["id"] for item in listed.json())

    removed = client.delete("/api/v1/prompts/" + record["id"])
    assert removed.status_code == 204
    assert client.delete("/api/v1/prompts/" + record["id"]).status_code == 404


def test_prompt_input_is_length_limited(client):
    response = client.post("/api/v1/prompts", json={"title": "x" * 121, "content": "content"})
    assert response.status_code == 422


def test_optional_bearer_token_protects_prompt_routes(client, monkeypatch):
    monkeypatch.setattr(main, "API_TOKEN", "test-token")
    assert client.get("/api/v1/prompts").status_code == 401
    assert client.get("/api/v1/prompts", headers={"Authorization": "Bearer wrong"}).status_code == 401
    response = client.get("/api/v1/prompts", headers={"Authorization": "Bearer test-token"})
    assert response.status_code == 200
    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["auth_required"] is True


def test_credential_warning(client):
    response = client.post(
        "/api/v1/prompts/validate",
        json={
            "instruction": "Summarize this configuration file",
            "input": "api_key=example",
            "context": "",
            "output_format": "plain text",
        },
    )
    assert any("credential" in item.lower() for item in response.json()["warnings"])
