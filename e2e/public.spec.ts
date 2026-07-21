import { expect, test } from "@playwright/test";

test("save-the-date page accepts a reply with a named guest and shows it in the admin list", async ({ page }) => {
  await page.goto("/");
  await page.getByText("Can't wait to celebrate!").click();
  await expect(page.getByLabel("Can't wait to celebrate!")).toBeChecked();
  await page.getByLabel("Your name(s)").fill("Playwright Party");
  await page.getByLabel("Email").fill("playwright@example.com");
  await page.getByRole("button", { name: "One more guest" }).click();
  await page.getByLabel("Guest 2’s name").fill("Chrome Guest");
  await page.getByRole("button", { name: "Send our reply" }).click();
  await expect(page.getByRole("heading", { name: /thank you, playwright/i })).toBeVisible();
  await expect(page.getByText(/you and Chrome Guest/)).toBeVisible();

  await page.goto("/admin");
  await expect(page.getByRole("cell", { name: /Playwright Party/ })).toBeVisible();
  await expect(page.getByText("with Chrome Guest")).toBeVisible();
});
