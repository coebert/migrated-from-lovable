import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { preflight, jsonResponse, verifyBridgeSecret } from "../../shared/bridge-auth.ts";

export default async function (req) {
  try {
    if (req.method === "OPTIONS") return preflight(req);
    const verified = verifyBridgeSecret(req);
    if (!verified.ok) return jsonResponse({ error: verified.error }, { status: verified.status });

    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "500") || 500, 1000);

    const records = await base44.asServiceRole.entities.Bed.list("-sort_order", limit);
    return jsonResponse({ records });
  } catch (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}