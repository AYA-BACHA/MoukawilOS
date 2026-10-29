export interface TokenSourceOptions {
  envToken?: string;
  localToken?: string | null;
  cookieToken?: string | null;
  sessionToken?: string | null;
}

/**
 * Resolves the authentication token according to priority:
 * 1. Active Supabase session access token (canonical live credential; takes precedence over stale stored tokens)
 * 2. Explicit stored token in localStorage (excluding legacy placeholder "demo")
 * 3. Stored cookie token (from SSR sign-in actions, excluding legacy placeholder "demo")
 * 4. Configured NEXT_PUBLIC_DEV_AUTH_TOKEN (production guest demo token)
 * 5. Fallback placeholder string "demo"
 */
export function resolveAuthToken(options: TokenSourceOptions): string {
  if (options.sessionToken) {
    return options.sessionToken;
  }
  if (options.localToken && options.localToken !== "demo") {
    return options.localToken;
  }
  if (options.cookieToken && options.cookieToken !== "demo") {
    return options.cookieToken;
  }
  return options.envToken || "demo";
}

export interface BrowserTokenDeps {
  storage?: { getItem(key: string): string | null };
  cookieStr?: string;
  sessionToken?: string | null;
  envToken?: string;
}

/**
 * Extracts available credentials from browser storage, cookies, and Supabase session,
 * then formats the standard Authorization header dictionary. Resilient against restricted storage and malformed cookies.
 */
export function extractBrowserTokens(deps: BrowserTokenDeps): Record<string, string> {
  let localToken: string | null = null;
  if (deps.storage) {
    try {
      localToken = deps.storage.getItem("moukawil_token");
    } catch {
      // Resilient fallback: restricted environments (e.g. strict private mode/iframes)
      localToken = null;
    }
  }

  let cookieToken: string | null = null;
  if (deps.cookieStr) {
    const match = deps.cookieStr.match(/(?:^|;\s*)moukawil_token=([^;]+)/);
    if (match) {
      try {
        cookieToken = decodeURIComponent(match[1]);
      } catch {
        // Resilient fallback: ignore malformed percent-encoded cookies
        cookieToken = null;
      }
    }
  }

  const token = resolveAuthToken({
    envToken: deps.envToken,
    localToken,
    cookieToken,
    sessionToken: deps.sessionToken,
  });

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}
