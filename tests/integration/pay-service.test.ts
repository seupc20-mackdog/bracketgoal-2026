import { afterEach, describe, expect, it, vi } from "vitest";

describe("POST /api/pools/[poolId]/pay-service", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
    vi.resetModules();
  });

  it("fails with 500 when Supabase env vars are missing", async () => {
    delete (process.env as Record<string, string | undefined>)
      .NEXT_PUBLIC_SUPABASE_URL;
    delete (process.env as Record<string, string | undefined>)
      .SUPABASE_SERVICE_ROLE_KEY;

    vi.resetModules();
    const { POST } = await import(
      "../../src/app/api/pools/[poolId]/pay-service/route"
    );

    const response = await POST(
      new Request("http://localhost/api/pools/test/pay-service", {
        method: "POST",
      }),
      { params: { poolId: "test" } }
    );

    expect(response.status).toBe(500);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toMatch(/Supabase n/i);
  });
});
