import { expect, test } from "@playwright/test";

test("overview loads without any model initialized", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Prompt Engineering Guide/);
  await expect(page.getByText("Build a better prompt")).toBeVisible();
  await expect(page.getByText("No hosted LLM configured").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Load local model/ })).toHaveCount(0);
});

test("homepage task finder opens the relevant lesson", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "What are you trying to do?" })).toBeVisible();
  const task = page.getByRole("button", { name: /Classify or label text/ });
  await expect(task).toContainText("Zero-shot prompting");
  await task.click();
  await expect(page.getByRole("heading", { name: "Learning guide" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Zero-shot prompting" })).toBeVisible();
});

test("learning paths resume at the first incomplete lesson and show saved progress", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Choose your learning path" })).toBeVisible();
  const beginner = page.locator(".learning-path-card").filter({ hasText: "Beginner foundations" });
  await expect(beginner).toContainText("0/4 lessons");
  await beginner.getByRole("button", { name: /Continue/ }).click();
  await expect(page.getByRole("heading", { name: "Anatomy of a useful prompt" })).toBeVisible();
  await page.getByRole("button", { name: "Mark lesson complete" }).click();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(page.locator(".learning-path-card").filter({ hasText: "Beginner foundations" })).toContainText("1/4 lessons");
  await expect(page.locator(".learning-path-card").filter({ hasText: "Beginner foundations" })).toContainText("25% complete");
  await page.locator(".learning-path-card").filter({ hasText: "Beginner foundations" }).getByRole("button", { name: /Continue · Zero-shot prompting/ }).click();
  await expect(page.getByRole("heading", { name: "Zero-shot prompting" })).toBeVisible();
});



test("guide search filters content locally", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Learning guide/ }).click();
  await expect(page.getByRole("heading", { name: "Learning guide" })).toBeVisible();
  await page.getByLabel("FIND A LESSON").fill("prompt injection");
  await expect(page.getByRole("button", { name: /Prompt injection and trust boundaries/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Zero-shot prompting/ })).toHaveCount(0);
});

test("lesson routes expose learning objectives, prerequisites, contents, and next steps", async ({ page }) => {
  await page.goto("/?lesson=zero-shot#lesson-zero-shot-section-when-it-fits");
  await expect(page).toHaveURL(/lesson=zero-shot#lesson-zero-shot-section-when-it-fits$/);
  await expect(page.getByRole("heading", { name: "Zero-shot prompting" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What you will learn" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recommended prerequisites" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Anatomy of a useful prompt" }).first()).toBeVisible();

  const tableOfContents = page.getByRole("navigation", { name: "On this page" });
  await expect(page.locator("#lesson-zero-shot-section-when-it-fits")).toBeInViewport();
  await expect(tableOfContents.getByRole("link", { name: "Measure before adding complexity" })).toBeVisible();
  await tableOfContents.getByRole("link", { name: "Measure before adding complexity" }).click();
  await expect(page).toHaveURL(/lesson=zero-shot#lesson-zero-shot-section-measure-before-adding-complexity$/);
  await expect(page.locator("#lesson-zero-shot-section-measure-before-adding-complexity")).toBeInViewport();

  await page.getByRole("link", { name: "Continue to next lesson" }).click();
  await expect(page).toHaveURL(/lesson=context$/);
  await expect(page.getByRole("heading", { name: "Context engineering" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Related lessons" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/lesson=zero-shot#lesson-zero-shot-section-measure-before-adding-complexity$/);
  await expect(page.getByRole("heading", { name: "Zero-shot prompting" })).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/lesson=context$/);
  await expect(page.getByRole("heading", { name: "Context engineering" })).toBeVisible();
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
  await page.locator('.workflow-toolbar-actions .workflow-file-button input[type="file"]').setInputFiles("e2e/fixtures/human-review-workflow.json");
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


test("cancelling during human review closes the dialog and records a cancelled run", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Graph & loops/ }).click();
  await page.locator('.workflow-toolbar-actions .workflow-file-button input[type="file"]').setInputFiles("e2e/fixtures/human-review-workflow.json");
  await expect(page.getByRole("status")).toContainText("Workflow imported and validated");
  await page.locator("#workflow-input-value").fill("Draft that needs review");
  await page.getByRole("button", { name: "Run workflow" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Cancel run" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Workflow cancelled");
  await expect(page.locator(".workflow-trace")).toContainText("Last run · Cancelled");
  await expect(page.locator(".workflow-trace-item.cancelled")).toBeVisible();
});

test("workflow evaluation scores the starter graph against the same local dataset", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Graph & loops/ }).click();
  await expect(page.getByRole("heading", { name: "Workflow Evaluation" })).toBeVisible();
  await expect(page.locator(".workflow-eval-case")).toHaveCount(3);
  await page.getByRole("button", { name: "Run evaluation" }).click();
  await expect(page.getByRole("status")).toContainText("Evaluation finished: 3/3 cases passed (100.0%)");
  await expect(page.locator(".workflow-eval-result")).toHaveCount(3);
  await expect(page.locator(".workflow-eval-results")).toContainText("Selected route: match");
  await expect(page.getByRole("button", { name: "Export run JSON" })).toBeVisible();
  await page.getByRole("button", { name: "Save dataset" }).click();
  await expect(page.getByRole("status")).toContainText("dataset saved locally");
});


test("keyboard users can skip repeated navigation and identify the current section", async ({ page }) => {
  await page.goto("/");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeAttached();
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  const mainNavigation = page.getByRole("navigation", { name: "Main navigation" });
  const overview = mainNavigation.getByRole("button", { name: /Overview/ });
  await expect(overview).toHaveAttribute("aria-current", "page");
  await mainNavigation.getByRole("button", { name: /Learning guide/ }).click();
  await expect(mainNavigation.getByRole("button", { name: /Learning guide/ })).toHaveAttribute("aria-current", "page");
  await expect(overview).not.toHaveAttribute("aria-current", "page");
});
