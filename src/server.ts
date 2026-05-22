import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

const FRAME_ANCESTORS = [
  "'self'",
  "https://pmail.page.gd",
  "https://app.pmail.page.gd",
  "https://*.lovable.app",
  "https://*.lovableproject.com",
  "https://lovable.dev",
];

function applyFrameHeaders(response: Response): Response {
  // Clone headers so we can mutate even on immutable responses.
  const headers = new Headers(response.headers);
  // X-Frame-Options can't express multiple origins; remove it and rely on CSP.
  headers.delete("x-frame-options");
  const existingCsp = headers.get("content-security-policy");
  const frameDirective = `frame-ancestors ${FRAME_ANCESTORS.join(" ")}`;
  if (existingCsp && /frame-ancestors/i.test(existingCsp)) {
    headers.set(
      "content-security-policy",
      existingCsp.replace(/frame-ancestors[^;]*/i, frameDirective),
    );
  } else if (existingCsp) {
    headers.set("content-security-policy", `${existingCsp}; ${frameDirective}`);
  } else {
    headers.set("content-security-policy", frameDirective);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return applyFrameHeaders(normalized);
    } catch (error) {
      console.error(error);
      return applyFrameHeaders(brandedErrorResponse());
    }
  },
};
