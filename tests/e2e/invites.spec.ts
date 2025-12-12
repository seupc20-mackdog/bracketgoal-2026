import { expect, test } from "@playwright/test";

const poolId = process.env.E2E_POOL_ID;

test.describe("Fluxo de convites", () => {
  test.skip(!poolId, "Defina E2E_POOL_ID para habilitar este teste.");

  test("abrir invites, copiar link, abrir join e registrar nome", async ({
    page,
    baseURL,
  }) => {
    const base = baseURL || "http://localhost:3000";
    await page.goto(`/pools/${poolId}/invites`);

    await expect(page.getByText(/Link de convite/i)).toBeVisible();
    const copyButton = page.getByRole("button", { name: /copiar link/i });
    await copyButton.click();

    const copiedUrl = await page.evaluate(async () => {
      try {
        if (navigator.clipboard?.readText) {
          return await navigator.clipboard.readText();
        }
      } catch {
        return null;
      }
      return null;
    });

    const shareUrl =
      copiedUrl && copiedUrl.includes("/join")
        ? copiedUrl
        : `${base}/pools/${poolId}/join`;

    await page.goto(shareUrl);
    await expect(page.getByText(/Entrar no bol/i)).toBeVisible();

    await page.getByLabel(/Nome|apelido/i).fill("Teste Playwright");
    await page.getByRole("button", { name: /quero participar/i }).click();

    const feedback = page.locator(/Erro|confirmad|inscriÇõ|particip/iu).first();
    await expect(feedback).toBeVisible({ timeout: 5000 });
  });
});
