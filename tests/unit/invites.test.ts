import { describe, expect, it } from "vitest";
import { buildShareUrl, toE164BR } from "@/lib/invites";

describe("buildShareUrl", () => {
  it("uses NEXT_PUBLIC_APP_URL removing trailing slashes", () => {
    expect(buildShareUrl("abc", "https://app.example.com/")).toBe(
      "https://app.example.com/pools/abc/join"
    );
  });

  it("falls back to window origin when app url is empty", () => {
    expect(buildShareUrl("pool123", "", "https://origin.test")).toBe(
      "https://origin.test/pools/pool123/join"
    );
  });

  it("returns relative path when no base is available", () => {
    expect(buildShareUrl("pool123", "", "")).toBe("/pools/pool123/join");
  });
});

describe("toE164BR", () => {
  it("normalizes local mobile numbers", () => {
    expect(toE164BR("(11) 91234-5678")).toBe("+5511912345678");
  });

  it("keeps numbers that already include country code", () => {
    expect(toE164BR("5511987654321")).toBe("+5511987654321");
  });

  it("returns null for invalid numbers", () => {
    expect(toE164BR("12345")).toBeNull();
  });
});
