import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Bed,
  Forward,
  Mail,
  CalendarClock,
  BarChart3,
  ShieldCheck,
  Search,
  Bell,
  Menu,
  X,
  Activity,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const NAV = [
  { to: "/", label: "Bed board", icon: Bed, end: true },
  { to: "/referrals", label: "Referrals", icon: Forward },
  { to: "/inbox", label: "Inbox", icon: Mail },
  { to: "/postop", label: "Post-op", icon: CalendarClock },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
];

const PAGE_TITLE = {
  "/": "Bed board",
  "/referrals": "Referrals",
  "/inbox": "Inbox",
  "/postop": "Post-op bookings",
  "/analytics": "Analytics",
  "/admin": "Admin",
};

export default function Layout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [alertsOn, setAlertsOn] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const active = NAV.find((n) =>
    n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to)
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Desktop vertical nav rail */}
      {!isMobile && (
        <aside className="fixed inset-y-0 left-0 w-16 border-r border-border bg-card flex flex-col items-center py-4 z-30">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm">
            SD
          </div>
          <nav className="mt-8 flex flex-col gap-1 flex-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`
                  }
                  title={item.label}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r bg-primary" />
                      )}
                      <Icon className="w-5 h-5" />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1 text-emerald-600" title="System operational">
              <Activity className="w-4 h-4" />
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        </aside>
      )}

      {/* Main column */}
      <div className={!isMobile ? "ml-16" : ""}>
        {/* Top contextual header */}
        <header className="sticky top-0 z-20 h-14 border-b border-border bg-card/80 backdrop-blur flex items-center gap-3 px-4">
          {isMobile && (
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-display font-bold text-xs">
                SD
              </div>
            </div>
          )}
          <h1 className="font-heading font-semibold text-[0.95rem] text-foreground truncate">
            {PAGE_TITLE[active?.to] ?? "SDH Critical Care"}
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Quick search…"
                className="h-9 w-48 lg:w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={() => setAlertsOn((v) => !v)}
              className={`flex items-center justify-center w-9 h-9 rounded-md border border-border transition-colors ${
                alertsOn ? "bg-accent text-accent-foreground" : "bg-card text-muted-foreground"
              }`}
              title={alertsOn ? "Alerts on" : "Alerts off"}
              aria-label="Toggle alerts"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSheetOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              <Menu className="w-4 h-4" />
              Actions
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="px-4 sm:px-6 py-4 sm:py-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 inset-x-0 z-30 h-12 border-t border-border bg-card flex items-center justify-around px-2">
          {NAV.slice(0, 5).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[0.625rem] font-medium ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label.split(" ")[0]}
              </NavLink>
            );
          })}
        </nav>
      )}

      {/* Quick actions bottom sheet (mobile) */}
      {isMobile && sheetOpen && (
        <div className="fixed inset-0 z-40 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="relative w-full rounded-t-xl border-t border-border bg-card p-4 pb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-sm">Quick actions</h2>
              <button onClick={() => setSheetOpen(false)} className="p-1" aria-label="Close">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSheetOpen(false)}
                    className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm font-medium hover:bg-accent"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}