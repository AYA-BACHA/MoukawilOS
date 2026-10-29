import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractBrowserTokens, resolveAuthToken } from "./auth-token.ts";

const CONFIGURED_DEMO_TOKEN = "94e558583cd33d268d0ddc89a3bc036f766dcacb38f9674a2fc01e8a591174c9";
const VALID_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotRealKey";
const STALE_LOCAL_JWT = "eyJhbGciOiJIUzI1NiJ9.stale-local-jwt.xyz123";
const STALE_COOKIE_JWT = "eyJhbGciOiJIUzI1NiJ9.stale-cookie-jwt.abc123";
const ACTIVE_SUPABASE_JWT = "eyJhbGciOiJFUzI1NiJ9.active-supabase-jwt.xyz789";

describe("Auth Token Resolution Priority (resolveAuthToken)", () => {
  it("uses configured demo token when localStorage contains legacy 'demo' string", () => {
    const token = resolveAuthToken({
      envToken: CONFIGURED_DEMO_TOKEN,
      localToken: "demo",
      cookieToken: null,
      sessionToken: null,
    });
    assert.equal(token, CONFIGURED_DEMO_TOKEN);
  });

  it("uses configured demo token when cookie contains legacy 'demo' string", () => {
    const token = resolveAuthToken({
      envToken: CONFIGURED_DEMO_TOKEN,
      localToken: null,
      cookieToken: "demo",
      sessionToken: null,
    });
    assert.equal(token, CONFIGURED_DEMO_TOKEN);
  });

  it("uses configured demo token when both localStorage and cookie contain 'demo'", () => {
    const token = resolveAuthToken({
      envToken: CONFIGURED_DEMO_TOKEN,
      localToken: "demo",
      cookieToken: "demo",
      sessionToken: null,
    });
    assert.equal(token, CONFIGURED_DEMO_TOKEN);
  });

  it("prioritizes active Supabase session when localStorage contains a stale JWT", () => {
    // Conflict test: stale token in localStorage must NOT shadow an active Supabase session
    const token = resolveAuthToken({
      envToken: CONFIGURED_DEMO_TOKEN,
      localToken: STALE_LOCAL_JWT,
      cookieToken: null,
      sessionToken: ACTIVE_SUPABASE_JWT,
    });
    assert.equal(token, ACTIVE_SUPABASE_JWT);
  });

  it("prioritizes active Supabase session when both localStorage and cookie contain stale JWTs", () => {
    // Conflict test: active session takes precedence over both storage mechanisms
    const token = resolveAuthToken({
      envToken: CONFIGURED_DEMO_TOKEN,
      localToken: STALE_LOCAL_JWT,
      cookieToken: STALE_COOKIE_JWT,
      sessionToken: ACTIVE_SUPABASE_JWT,
    });
    assert.equal(token, ACTIVE_SUPABASE_JWT);
  });

  it("selects cookie token when localStorage is 'demo' and cookie has non-demo token with no active session", () => {
    const token = resolveAuthToken({
      envToken: CONFIGURED_DEMO_TOKEN,
      localToken: "demo",
      cookieToken: STALE_COOKIE_JWT,
      sessionToken: null,
    });
    assert.equal(token, STALE_COOKIE_JWT);
  });

  it("preserves valid stored token from localStorage when no active Supabase session exists", () => {
    const token = resolveAuthToken({
      envToken: CONFIGURED_DEMO_TOKEN,
      localToken: VALID_JWT,
      cookieToken: null,
      sessionToken: null,
    });
    assert.equal(token, VALID_JWT);
  });

  it("preserves valid stored token from cookie when no active Supabase session exists", () => {
    const token = resolveAuthToken({
      envToken: CONFIGURED_DEMO_TOKEN,
      localToken: null,
      cookieToken: VALID_JWT,
      sessionToken: null,
    });
    assert.equal(token, VALID_JWT);
  });

  it("falls back to 'demo' when no env token and no stored credentials exist", () => {
    const token = resolveAuthToken({
      envToken: undefined,
      localToken: null,
      cookieToken: null,
      sessionToken: null,
    });
    assert.equal(token, "demo");
  });
});

describe("Browser Storage & Cookie Header Extraction (extractBrowserTokens)", () => {
  it("correctly reads localStorage and builds Authorization header", () => {
    const mockStorage = {
      getItem(key: string) {
        return key === "moukawil_token" ? VALID_JWT : null;
      },
    };
    const headers = extractBrowserTokens({
      storage: mockStorage,
      cookieStr: "",
      sessionToken: null,
      envToken: CONFIGURED_DEMO_TOKEN,
    });
    assert.deepEqual(headers, {
      Authorization: `Bearer ${VALID_JWT}`,
      "Content-Type": "application/json",
    });
  });

  it("correctly parses cookies and ignores legacy 'demo' cookie in favor of envToken", () => {
    const headers = extractBrowserTokens({
      storage: { getItem: () => null },
      cookieStr: "other_cookie=123; moukawil_token=demo; session=abc",
      sessionToken: null,
      envToken: CONFIGURED_DEMO_TOKEN,
    });
    assert.deepEqual(headers, {
      Authorization: `Bearer ${CONFIGURED_DEMO_TOKEN}`,
      "Content-Type": "application/json",
    });
  });

  it("correctly parses encoded cookies with real token when no session exists", () => {
    const encodedToken = encodeURIComponent(VALID_JWT);
    const headers = extractBrowserTokens({
      storage: { getItem: () => null },
      cookieStr: `moukawil_token=${encodedToken}`,
      sessionToken: null,
      envToken: CONFIGURED_DEMO_TOKEN,
    });
    assert.deepEqual(headers, {
      Authorization: `Bearer ${VALID_JWT}`,
      "Content-Type": "application/json",
    });
  });

  it("safely handles malformed percent-encoded cookies without throwing URIError", () => {
    // Malformed sequence: %E0%A4%A throws URIError in standard decodeURIComponent
    const headers = extractBrowserTokens({
      storage: { getItem: () => null },
      cookieStr: "moukawil_token=%E0%A4%A; other_cookie=123",
      sessionToken: null,
      envToken: CONFIGURED_DEMO_TOKEN,
    });
    assert.deepEqual(headers, {
      Authorization: `Bearer ${CONFIGURED_DEMO_TOKEN}`,
      "Content-Type": "application/json",
    });
  });

  it("safely handles restricted localStorage that throws on getItem without crashing", () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error("SecurityError: localStorage is disabled in restricted environments");
      },
    };
    const headers = extractBrowserTokens({
      storage: throwingStorage,
      cookieStr: "",
      sessionToken: null,
      envToken: CONFIGURED_DEMO_TOKEN,
    });
    assert.deepEqual(headers, {
      Authorization: `Bearer ${CONFIGURED_DEMO_TOKEN}`,
      "Content-Type": "application/json",
    });
  });

  it("prioritizes active Supabase session over stale localStorage and cookie values", () => {
    const mockStorage = {
      getItem: (key: string) => (key === "moukawil_token" ? STALE_LOCAL_JWT : null),
    };
    const headers = extractBrowserTokens({
      storage: mockStorage,
      cookieStr: `moukawil_token=${STALE_COOKIE_JWT}`,
      sessionToken: ACTIVE_SUPABASE_JWT,
      envToken: CONFIGURED_DEMO_TOKEN,
    });
    assert.deepEqual(headers, {
      Authorization: `Bearer ${ACTIVE_SUPABASE_JWT}`,
      "Content-Type": "application/json",
    });
  });
});
