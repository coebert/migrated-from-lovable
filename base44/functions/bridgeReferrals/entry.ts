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

    if (req.method === "GET") {
      const records = await base44.asServiceRole.entities.Referral.list("-updated_date", limit);
      return jsonResponse({ records });
    }

    if (req.method === "POST") {
      const body = await req.json();
      if (!body.patient_initials || !body.reason_for_referral) {
        return jsonResponse({ error: "patient_initials_and_reason_required" }, { status: 400 });
      }
      let record;
      if (body.id) {
        record = await base44.asServiceRole.entities.Referral.update(body.id, body);
      } else {
        record = await base44.asServiceRole.entities.Referral.create(body);
      }
      return jsonResponse({ record });
    }

    return jsonResponse({ error: "method_not_allowed" }, { status: 405 });
  } catch (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }
}