import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";
import { preflight, jsonResponse, verifyBridgeSecret, parseActorHeader, actorIsAdmin } from "../../shared/bridge-auth.ts";

export default async function (req) {
  try {
    if (req.method === "OPTIONS") return preflight(req);
    const verified = verifyBridgeSecret(req);
    if (!verified.ok) return jsonResponse({ error: verified.error }, { status: verified.status });

    const actor = parseActorHeader(req.headers.get("x-bridge-actor"));
    if (!actorIsAdmin(actor)) {
      return jsonResponse({ error: "admin_actor_required" }, { status: 403 });
    }

    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? "200") || 200, 1000);
    const entity = url.searchParams.get("entity");
    const entityId = url.searchParams.get("entity_id");

    let filter = {};
    if (entity) filter.entity = entity;
    if (entityId) filter.entity_id = entityId;

    const records = await base44.asServiceRole.entities.AuditLog.filter(filter, "-created_date", limit);
    return jsonResponse({ records });
  } catch (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}