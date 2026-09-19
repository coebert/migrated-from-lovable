import { Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const BRIDGE_ENDPOINTS = [
  { method: "GET", path: "/api/functions/bridgeBeds", desc: "List all beds" },
  { method: "GET", path: "/api/functions/bridgeOccupancies", desc: "List bed occupancies (?since=&limit=)" },
  { method: "POST", path: "/api/functions/bridgeOccupancies", desc: "Create/update a bed occupancy" },
  { method: "GET", path: "/api/functions/bridgeReferrals", desc: "List referrals (?since=&limit=)" },
  { method: "POST", path: "/api/functions/bridgeReferrals", desc: "Create/update a referral" },
  { method: "GET", path: "/api/functions/bridgeAudit", desc: "Read audit log (admin actor only)" },
];

export default function BridgePanel() {
  const [copied, setCopied] = useState(null);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold">Inter-app Bridge</h3>
          <Badge variant="outline" className="text-[10px]">Secure API</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Expose this app's beds, occupancies, referrals, and audit log to a partner app via authenticated HTTP endpoints.
          The partner app authenticates each request with a shared secret.
        </p>

        <div className="rounded-md border border-warning/40 bg-warning/5 p-4 space-y-2">
          <p className="text-sm font-medium text-warning-foreground">⚠ Configuration required</p>
          <p className="text-sm text-muted-foreground">
            Set the <code className="text-xs font-mono px-1 py-0.5 rounded bg-muted">BRIDGE_SHARED_SECRET</code> environment variable
            in Dashboard → Settings → Environment Variables. Share the same secret with the partner app.
            Optionally set <code className="text-xs font-mono px-1 py-0.5 rounded bg-muted">BRIDGE_ALLOWED_ORIGINS</code> (comma-separated URLs) to restrict CORS.
          </p>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-1">Authentication</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Every request must include the <code className="text-xs font-mono px-1 rounded bg-muted">x-bridge-secret</code> header
          with the shared secret value. Write endpoints (POST) should also include
          <code className="text-xs font-mono px-1 rounded bg-muted ml-1">x-bridge-actor</code> as a JSON object with
          <code className="text-xs font-mono px-1 rounded bg-muted ml-1">{"{ id, role, email }"}</code>.
        </p>
        <div className="rounded-md bg-muted p-3 font-mono text-xs space-y-1">
          <div>x-bridge-secret: {"<your_shared_secret>"}</div>
          <div>x-bridge-actor: {"{ \"id\": \"user-1\", \"role\": \"admin\", \"email\": \"...\" }"}</div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-3">Endpoints</h3>
        <div className="space-y-2">
          {BRIDGE_ENDPOINTS.map((ep) => (
            <div key={ep.path} className="flex items-center gap-3 rounded-md border border-border p-3">
              <Badge
                variant={ep.method === "GET" ? "secondary" : "default"}
                className="text-[10px] font-mono w-12 justify-center"
              >
                {ep.method}
              </Badge>
              <code className="text-xs font-mono flex-1">{ep.path}</code>
              <span className="text-xs text-muted-foreground hidden sm:block">{ep.desc}</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => copy(ep.path, ep.path)}
              >
                {copied === ep.path ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-semibold mb-1">Example: partner app fetch</h3>
        <p className="text-sm text-muted-foreground mb-3">
          From the partner app's backend, fetch referrals like this:
        </p>
        <div className="rounded-md bg-muted p-3 font-mono text-xs overflow-x-auto">
          <div>fetch("https://your-app.base44.app/api/functions/bridgeReferrals", {"{"}</div>
          <div className="pl-4">headers: {"{ \"x-bridge-secret\": SHARED_SECRET }"}</div>
          <div>{"})"}</div>
          <div className="pl-4">.then(r =&gt; r.json())</div>
        </div>
      </Card>
    </div>
  );
}