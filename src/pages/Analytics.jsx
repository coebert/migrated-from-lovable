import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Clock } from "lucide-react";

const ADMITS = [
  { day: "Mon", admits: 4, discharges: 3 },
  { day: "Tue", admits: 6, discharges: 5 },
  { day: "Wed", admits: 3, discharges: 4 },
  { day: "Thu", admits: 7, discharges: 5 },
  { day: "Fri", admits: 5, discharges: 6 },
  { day: "Sat", admits: 2, discharges: 3 },
  { day: "Sun", admits: 3, discharges: 2 },
];

const LOS = [
  { day: "Mon", los: 5.2 },
  { day: "Tue", los: 4.8 },
  { day: "Wed", los: 5.1 },
  { day: "Thu", los: 4.5 },
  { day: "Fri", los: 4.9 },
  { day: "Sat", los: 5.4 },
  { day: "Sun", los: 5.0 },
];

const ACUITY = [
  { name: "Level 0", value: 1, color: "#10b981" },
  { name: "Level 1", value: 2, color: "#0ea5e9" },
  { name: "Level 2", value: 3, color: "#f59e0b" },
  { name: "Level 3", value: 3, color: "#f43f5e" },
];

function KpiCard({ icon: Icon, label, value, delta, up }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-bold">{value}</span>
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? "text-emerald-600" : "text-rose-600"}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {delta}
        </span>
      </div>
    </Card>
  );
}

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-semibold text-lg">Analytics</h2>
        <p className="text-xs text-muted-foreground">Unit performance · last 7 days</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={Activity} label="Avg occupancy" value="60%" delta="+4%" up />
        <KpiCard icon={Clock} label="Avg LOS (days)" value="5.0" delta="-0.3" up />
        <KpiCard icon={TrendingUp} label="Admits (7d)" value="30" delta="+6" up />
        <KpiCard icon={TrendingDown} label="Mortality" value="8.2%" delta="-1.1%" up />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-heading font-semibold text-sm mb-3">Admits vs discharges</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={ADMITS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="admits" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="discharges" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4">
          <h3 className="font-heading font-semibold text-sm mb-3">Average length of stay</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={LOS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} domain={[4, 6]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Area type="monotone" dataKey="los" stroke="#2563eb" fill="#eff6ff" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-heading font-semibold text-sm mb-3">Current acuity mix</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={ACUITY} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
              {ACUITY.map((a) => (
                <Cell key={a.name} fill={a.color} />
              ))}
            </Pie>
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}