import { expect, test } from "@playwright/test";

test("guest replies, admin confirms, counter caps at 2", async ({ page }, testInfo) => {
  const partyName = `Playwright ${testInfo.project.name}`;
  const email = `pw-${testInfo.project.name}@example.com`;

  await page.goto("/");
  await expect(page.getByRole("timer")).toContainText("Days");
  await page.getByText("Yes - Can't wait to celebrate!").click();
  await expect(page.getByLabel("Yes - Can't wait to celebrate!")).toBeChecked();
  await page.getByLabel("Your name(s)").fill(partyName);
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "One more guest" }).click();
  await page.getByRole("button", { name: "One more guest" }).click();
  await expect(page.locator("output")).toHaveText("2");
  await expect(page.getByLabel("Guest 3’s name")).toHaveCount(0);
  await page.getByLabel("Guest 2’s name").fill("Chrome Guest");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("heading", { name: /thank you, playwright/i })).toBeVisible();

  await page.goto("/admin");
  const row = page.getByRole("row", { name: new RegExp(partyName) });
  await expect(row.getByText("with Chrome Guest")).toBeVisible();
  await expect(row.getByText("Pending")).toBeVisible();
  await row.getByRole("button", { name: "Confirm" }).click();
  await expect(row.getByText("Confirmed")).toBeVisible();
  await expect(row.getByRole("button", { name: "Confirm" })).toHaveCount(0);
});

test("admin can compose an update to selected guests", async ({ page }, testInfo) => {
  await page.goto("/admin/updates");
  await expect(page.getByRole("heading", { name: "Send an update." })).toBeVisible();
  await page.getByText("Selected guests").click();
  const firstGuest = page.locator(".adm-guest").first();
  await firstGuest.locator("input").check();
  await page.getByLabel("Subject").fill(`Venue news ${testInfo.project.name}`);
  await page.getByLabel("Message").fill("We booked the venue — details soon!");
  await page.getByRole("button", { name: "Send update" }).click();
  await expect(page.getByText("This will email 1 guest.")).toBeVisible();
  await page.getByRole("button", { name: "Confirm send" }).click();
  await expect(page.getByText(/Recorded — demo mode|Sent to 1 guest/)).toBeVisible();
  await expect(page.getByRole("cell", { name: `Venue news ${testInfo.project.name}` }).first()).toBeVisible();
});
