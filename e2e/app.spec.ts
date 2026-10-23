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

test("evaluation bench and dataset controls work without loading a model", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Evaluation bench/ }).click();
  await expect(page.getByRole("heading", { name: "Evaluation bench" })).toBeVisible();
  await expect(page.locator(".evaluation-metrics")).toContainText("3");
  await expect(page.getByRole("button", { name: "Run evaluation locally" })).toBeDisabled();
  await expect(page.getByRole("button", { name: /Export dataset/ })).toBeVisible();
});
