import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";

const STATUS_TO_CATEGORY = {
  accepted: "accept",
  declined: "decline",
  admitted: "handover",
  pending: "advice",
};

const STATUS_LABEL = {
  pending: "Pending",
  accepted: "Accepted",
  admitted: "Admitted to unit",
  declined: "Declined",
};

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { referral_id, old_status, new_status } = body;

    if (!referral_id || !new_status) {
      return Response.json({ error: "referral_id and new_status required" }, { status: 400 });
    }

    // Fetch the referral to populate template placeholders
    const referral = await base44.asServiceRole.entities.Referral.get(referral_id);

    // Find an active message template matching the new status category
    const category = STATUS_TO_CATEGORY[new_status] || "advice";
    const templates = await base44.asServiceRole.entities.MessageTemplate.filter({
      category,
      active: true,
    });
    const template = templates[0];

    const patientId = referral.patient_initials || "Unknown patient";
    const hospNum = referral.hospital_number || "";
    const statusLabel = STATUS_LABEL[new_status] || new_status;
    const oldLabel = STATUS_LABEL[old_status] || old_status || "previous status";

    const patientContext = `${patientId}${hospNum ? ` (${hospNum})` : ""} — status changed from ${oldLabel} to ${statusLabel}.`;

    let message;
    if (template) {
      // Substitute placeholders if present, otherwise append template as guidance
      const hasPlaceholders = template.body.includes("{{");
      if (hasPlaceholders) {
        message = template.body
          .replace(/\{\{patient_initials\}\}/g, patientId)
          .replace(/\{\{hospital_number\}\}/g, hospNum)
          .replace(/\{\{status\}\}/g, statusLabel)
          .replace(/\{\{old_status\}\}/g, oldLabel)
          .replace(/\{\{reason_for_referral\}\}/g, referral.reason_for_referral || "")
          .replace(/\{\{current_ward\}\}/g, referral.current_ward || referral.source_ward || "")
          .replace(/\{\{accepting_consultant\}\}/g, referral.accepting_consultant || "");
      } else {
        message = `${patientContext} ${template.body}`;
      }
    } else {
      message = patientContext;
    }

    const notification = await base44.asServiceRole.entities.Notification.create({
      referral_id,
      kind: "status",
      message,
    });

    return Response.json({ ok: true, notification_id: notification.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}