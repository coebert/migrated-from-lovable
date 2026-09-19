import { secrets } from "base44:runtime";

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-bridge-secret, x-bridge-actor",
  "Access-Control-Max-Age": "86400",
};

export function buildCorsHeaders(origin) {
  const allowed = secrets.get("BRIDGE_ALLOWED_ORIGINS");
  const headers = { ...CORS_HEADERS };
  if (!allowed) {
    headers["Access-Control-Allow-Origin"] = "*";
    return headers;
  }
  const list = allowed.split(",").map((s) => s.trim());
  if (origin && list.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  }
  return headers;
}

export function preflight(req) {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(req.headers.get("origin")),
  });
}

export function jsonResponse(body, init = {}) {
  const origin = init.headers?.["origin"];
  const cors = buildCorsHeaders(origin);
  return Response.json(body, {
    ...init,
    headers: { ...cors, ...(init.headers || {}) },
  });
}

function safeEq(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function verifyBridgeSecret(req) {
  const secret = secrets.get("BRIDGE_SHARED_SECRET");
  if (!secret) return { ok: false, status: 503, error: "bridge_not_configured" };
  const provided = req.headers.get("x-bridge-secret") ?? "";
  if (!safeEq(provided, secret)) {
    return { ok: false, status: 401, error: "invalid_bridge_secret" };
  }
  return { ok: true };
}

export function parseActorHeader(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.id !== "string") return null;
    if (!["admin", "clinician", "system"].includes(parsed.role)) return null;
    return {
      id: parsed.id,
      email: typeof parsed.email === "string" ? parsed.email : undefined,
      role: parsed.role,
    };
  } catch {
    return null;
  }
}

export function actorMayWrite(actor) {
  return actor && ["admin", "clinician", "system"].includes(actor.role);
}

export function actorIsAdmin(actor) {
  return actor && ["admin", "system"].includes(actor.role);
}