import { expect, test } from "@playwright/test";

test("overview loads without any model initialized", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Prompt Engineering Guide/);
  await expect(page.getByText("Build a better prompt")).toBeVisible();
  await expect(page.getByText("No hosted LLM configured").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Load local model/ })).toHaveCount(0);
});

test("guide search filters content locally", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Learning guide/ }).click();
  await expect(page.getByRole("heading", { name: "Learning guide" })).toBeVisible();
  await page.getByLabel("FIND A LESSON").fill("prompt injection");
  await expect(page.getByRole("button", { name: /Prompt injection and trust boundaries/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Zero-shot prompting/ })).toHaveCount(0);
});

test("Prompt Lab saves two snapshots and compares them", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Prompt Lab/ }).first().click();
  await page.locator("#field-title").fill("E2E prompt version");
  await page.locator("#field-instruction").fill("Summarize the first supplied text in three bullets.");
  await page.getByRole("button", { name: "Save prompt" }).click();
  await page.locator("#field-instruction").fill("Classify the supplied text as positive, neutral, or negative.");
  await page.getByRole("button", { name: "Save prompt" }).click();
  await page.getByRole("button", { name: /My library/ }).click();
  await expect(page.getByRole("heading", { name: "What changed?" })).toBeVisible();
  await expect(page.locator(".diff-view .diff-added")).toBeVisible();
  await expect(page.locator(".diff-view .diff-removed")).toBeVisible();
});


test("lesson knowledge checks are deterministic and persist locally", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Learning guide/ }).click();
  await expect(page.getByRole("heading", { name: "Test your understanding" })).toBeVisible();
  await page.getByLabel("Return exactly five bullets and include one caveat.").check();
  await page.getByRole("button", { name: "Check answer" }).click();
  await expect(page.getByText("Correct", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /Learning guide/ }).click();
  await expect(page.getByText("PASSED", { exact: true })).toBeVisible();
  await expect(page.getByText("A fixed count and an explicit required element can be checked directly.", { exact: false })).toBeVisible();
});

test("evaluation bench and dataset controls work without loading a model", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Evaluation bench/ }).click();
  await expect(page.getByRole("heading", { name: "Evaluation bench" })).toBeVisible();
  await expect(page.locator(".evaluation-metrics")).toContainText("3");
  await expect(page.getByRole("button", { name: "Run evaluation locally" })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Export dataset/ })).toBeVisible();
});


test("advanced techniques are searchable and transfer into Prompt Lab", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Techniques/ }).click();
  await expect(page.getByRole("heading", { name: "Techniques Library" })).toBeVisible();
  await page.getByLabel("SEARCH TECHNIQUES").fill("Graph of Thoughts");
  const card = page.getByRole("button", { name: /Graph of Thoughts \(research concept\)/ });
  await expect(card).toBeVisible();
  await expect(page.getByText(/Graph workflow prompting is this product's visual orchestration feature/)).toBeVisible();
  await card.click();
  await page.getByRole("button", { name: /Use in Prompt Lab/ }).click();
  await expect(page.getByRole("heading", { name: "Prompt Lab" })).toBeVisible();
  await expect(page.locator("#field-title")).toHaveValue("Graph of Thoughts (research concept)");
});

test("workflow builder runs a deterministic graph without local inference", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Graph & loops/ }).click();
  await expect(page.getByRole("heading", { name: "Graph & Loop Builder" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Workflow editor view" })).toBeVisible();
  await page.getByRole("button", { name: "Outline" }).click();
  await expect(page.locator(".workflow-node-list")).toBeVisible();
  await page.getByRole("button", { name: "Canvas" }).click();
  await expect(page.locator(".workflow-canvas")).toBeVisible();
  await expect(page.locator(".workflow-canvas-edge").first()).toBeVisible();
  await expect(page.getByText("Graph structure valid")).toBeVisible();
  await expect(page.locator("#workflow-position-x")).toBeVisible();
  await page.getByRole("button", { name: /Add node/ }).click();
  await expect(page.locator(".workflow-status-strip")).toContainText("6 nodes");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".workflow-status-strip")).toContainText("5 nodes");
  await page.getByRole("button", { name: "Redo" }).click();
  await expect(page.locator(".workflow-status-strip")).toContainText("6 nodes");
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator(".workflow-status-strip")).toContainText("5 nodes");
  await page.getByRole("button", { name: "Run workflow" }).click();
  await expect(page.getByRole("status")).toContainText("Workflow completed");
  await expect(page.getByText("Please summarize this document.", { exact: true }).last()).toBeVisible();
  await page.getByRole("button", { name: "Save locally" }).click();
  await expect(page.getByRole("status")).toContainText("Workflow saved to this browser");
});


test("human review pauses a workflow and forwards approved edits", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Graph & loops/ }).click();
  await page.locator(".workflow-file-button input").setInputFiles("e2e/fixtures/human-review-workflow.json");
  await expect(page.getByRole("status")).toContainText("Workflow imported and validated");
  await page.locator("#workflow-input-value").fill("Original draft");
  await page.getByRole("button", { name: "Run workflow" }).click();

  const reviewDialog = page.getByRole("dialog");
  await expect(reviewDialog).toBeVisible();
  await expect(reviewDialog.getByRole("heading", { name: "Review release note" })).toBeVisible();
  await expect(reviewDialog.locator(".workflow-review-source pre")).toHaveText("Original draft");
  await page.locator("#workflow-review-draft").fill("Approved result");
  await page.locator("#workflow-review-note").fill("Checked the facts and required fields.");
  await reviewDialog.getByRole("button", { name: "Approve and continue" }).click();

  await expect(page.getByRole("status")).toContainText("Workflow completed");
  await expect(page.locator(".workflow-final-output pre")).toHaveText("Approved result");
  await expect(page.locator(".workflow-review-result")).toContainText("approve");
  await expect(page.locator(".workflow-review-result")).toContainText("Checked the facts and required fields.");
});
