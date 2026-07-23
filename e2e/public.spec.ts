import { expect, test } from "@playwright/test";

test("guest replies for themselves and admin confirms", async ({ page }, testInfo) => {
  const partyName = `Playwright ${testInfo.project.name}`;
  const email = `pw-${testInfo.project.name}@example.com`;

  await page.goto("/");
  await expect(page.getByRole("timer")).toContainText("Days");
  await page.getByText("Yes - Can't wait to celebrate!").click();
  await expect(page.getByLabel("Yes - Can't wait to celebrate!")).toBeChecked();
  await expect(page.getByText(/strictly by invitation/)).toBeVisible();
  await expect(page.getByText("How many of you?")).toHaveCount(0);
  await page.getByLabel("First name").fill("Playwright");
  await page.getByLabel("Last name").fill(testInfo.project.name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Phone number").fill("+44 7392 576501");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByRole("heading", { name: /thank you, playwright/i })).toBeVisible();

  await page.goto("/admin");
  const row = page.getByRole("row", { name: new RegExp(partyName) });
  await expect(row.getByText("Unmatched")).toBeVisible();
  await expect(row.getByText("Pending")).toBeVisible();
  await row.getByRole("button", { name: "Confirm" }).click();
  await expect(row.getByText("Confirmed")).toBeVisible();
  await expect(row.getByRole("button", { name: "Confirm" })).toHaveCount(0);
});

test("personal invite link greets the guest and unlocks their plus-one", async ({ page }, testInfo) => {
  const guest = `Ada ${testInfo.project.name}`;

  await page.goto("/admin/guests");
  await page.getByLabel("Guest name").fill(guest);
  await page.getByText("Allow a plus-one").click();
  await page.getByRole("button", { name: "Create invite" }).click();
  const inviteRow = page.getByRole("row", { name: new RegExp(guest) });
  await expect(inviteRow.getByText("Awaiting reply")).toBeVisible();
  const linkText = await inviteRow.locator(".adm-invite-link").textContent();
  const code = linkText?.match(/\/i\/([a-z2-9]+)/)?.[1];
  expect(code).toBeTruthy();

  await page.goto(`/i/${code}`);
  await expect(page.getByText(`Kindly reply, Ada`)).toBeVisible();
  await expect(page.getByLabel("First name")).toHaveValue("Ada");
  await expect(page.getByLabel("Last name")).toHaveValue(testInfo.project.name);
  await page.getByText("Yes - Can't wait to celebrate!").click();
  await expect(page.getByText(/includes a plus-one/)).toBeVisible();
  await page.getByLabel(/guest’s name/i).fill("Tunde Plus");
  await page.getByLabel("Email").fill(`ada-${testInfo.project.name}@example.com`);
  await page.getByLabel("Phone number").fill("+234 801 234 5678");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(page.getByText(/one for Tunde Plus/)).toBeVisible();

  await page.goto("/admin/guests");
  await expect(page.getByRole("row", { name: new RegExp(guest) }).getByText("Replied · yes")).toBeVisible();
  await page.goto("/admin");
  const replyRow = page.getByRole("row", { name: new RegExp(guest) });
  await expect(replyRow.getByText(`invited as ${guest}`)).toBeVisible();
  await expect(replyRow.getByText("with Tunde Plus")).toBeVisible();
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
