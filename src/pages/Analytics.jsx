import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Clock, Users, Bed, AlertTriangle } from "lucide-react";

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

const POSTOP_DATA = [
  { week: "W1", booked: 8, arrived: 7, cancelled: 1 },
  { week: "W2", booked: 10, arrived: 9, cancelled: 1 },
  { week: "W3", booked: 6, arrived: 6, cancelled: 0 },
  { week: "W4", booked: 12, arrived: 11, cancelled: 1 },
];

const NURSE_CAPACITY = [
  { day: "Mon", day: 8, night: 6 },
  { day: "Tue", day: 9, night: 7 },
  { day: "Wed", day: 7, night: 6 },
  { day: "Thu", day: 8, night: 7 },
  { day: "Fri", day: 9, night: 8 },
  { day: "Sat", day: 6, night: 5 },
  { day: "Sun", day: 7, night: 6 },
];

const CAPACITY_ALERTS = [
  { day: "Mon", alerts: 0 },
  { day: "Tue", alerts: 1 },
  { day: "Wed", alerts: 0 },
  { day: "Thu", alerts: 2 },
  { day: "Fri", alerts: 1 },
  { day: "Sat", alerts: 3 },
  { day: "Sun", alerts: 1 },
];

const WARDABLE_TREND = [
  { day: "Mon", count: 1 },
  { day: "Tue", count: 2 },
  { day: "Wed", count: 1 },
  { day: "Thu", count: 3 },
  { day: "Fri", count: 2 },
  { day: "Sat", count: 1 },
  { day: "Sun", count: 2 },
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

function ChartCard({ title, children }) {
  return (
    <Card className="p-4">
      <h3 className="font-heading font-semibold text-sm mb-3">{title}</h3>
      {children}
    </Card>
  );
}

export default function Analytics() {
  const [tab, setTab] = useState("referrals");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Unit performance · last 7 days</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="postop">Post-op bookings</TabsTrigger>
          <TabsTrigger value="nurse-capacity">Nurse capacity</TabsTrigger>
          <TabsTrigger value="capacity-alerts">Capacity alerts</TabsTrigger>
          <TabsTrigger value="acuity">Acuity</TabsTrigger>
          <TabsTrigger value="wardable">Wardable</TabsTrigger>
        </TabsList>

        <TabsContent value="referrals" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard icon={TrendingUp} label="Total referrals" value="42" delta="+6" up />
            <KpiCard icon={Clock} label="Median wait (min)" value="38" delta="-12" up />
            <KpiCard icon={Activity} label="Acceptance rate" value="81%" delta="+3%" up />
            <KpiCard icon={TrendingDown} label="Decline rate" value="19%" delta="-3%" up />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Admits vs discharges">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ADMITS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="admits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="discharges" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Average length of stay (days)">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={LOS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} domain={[4, 6]} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Area type="monotone" dataKey="los" stroke="hsl(var(--primary))" fill="hsl(var(--accent))" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="postop" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard icon={TrendingUp} label="Total bookings" value="36" delta="+4" up />
            <KpiCard icon={Activity} label="Arrival rate" value="94%" delta="+2%" up />
            <KpiCard icon={Clock} label="Avg lead time (days)" value="3.2" delta="-0.5" up />
            <KpiCard icon={TrendingDown} label="Cancellation rate" value="6%" delta="-1%" up />
          </div>
          <ChartCard title="Post-op bookings — weekly">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={POSTOP_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="booked" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="arrived" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="nurse-capacity" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard icon={Users} label="Avg day nurses" value="8.3" delta="+0.5" up />
            <KpiCard icon={Users} label="Avg night nurses" value="6.4" delta="+0.2" up />
            <KpiCard icon={Bed} label="Beds covered" value="15" delta="0" up />
            <KpiCard icon={AlertTriangle} label="Shifts below target" value="3" delta="+1" up={false} />
          </div>
          <ChartCard title="Nurse staffing — day vs night">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={NURSE_CAPACITY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="day" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="night" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="capacity-alerts" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard icon={AlertTriangle} label="Total alerts (7d)" value="8" delta="+2" up={false} />
            <KpiCard icon={Clock} label="Avg resolution time" value="22m" delta="-5m" up />
            <KpiCard icon={Activity} label="Auto-resolved" value="63%" delta="+8%" up />
            <KpiCard icon={TrendingDown} label="Escalated" value="25%" delta="-4%" up />
          </div>
          <ChartCard title="Capacity alerts per day">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={CAPACITY_ALERTS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="alerts" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="acuity" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard icon={Bed} label="Total beds" value="15" delta="0" up />
            <KpiCard icon={Activity} label="Level 3 patients" value="3" delta="+1" up={false} />
            <KpiCard icon={Users} label="Ventilated" value="3" delta="0" up />
            <KpiCard icon={AlertTriangle} label="Isolated" value="3" delta="+1" up={false} />
          </div>
          <ChartCard title="Current acuity mix">
            <ResponsiveContainer width="100%" height={280}>
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
          </ChartCard>
        </TabsContent>

        <TabsContent value="wardable" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard icon={TrendingUp} label="Wardable now" value="3" delta="+1" up />
            <KpiCard icon={Clock} label="Avg time to ward" value="4.2h" delta="-0.8h" up />
            <KpiCard icon={Activity} label="Discharged (7d)" value="12" delta="+3" up />
            <KpiCard icon={Bed} label="Beds freed (7d)" value="12" delta="+3" up />
          </div>
          <ChartCard title="Wardable patients — 7 day trend">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={WARDABLE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}