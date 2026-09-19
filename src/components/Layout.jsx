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
  PanelLeft,
  Activity,
  Heart,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

const NAV = [
  { to: "/", label: "Bed board", icon: Bed, end: true },
  { to: "/referrals", label: "Referrals", icon: Forward },
  { to: "/inbox", label: "Inbox", icon: Mail },
  { to: "/postop", label: "Post-op bookings", icon: CalendarClock },
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
  const location = useLocation();
  const [alertsOn, setAlertsOn] = useState(true);

  const active = NAV.find((n) =>
    n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to)
  );

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-display font-bold text-sm shrink-0">
              SD
            </div>
            <span className="font-heading font-semibold text-sm group-data-[collapsible=icon]:hidden">
              SDH Critical Care
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.to === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.to)
                    }
                    tooltip={item.label}
                  >
                    <NavLink to={item.to} end={item.end}>
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2 px-2 py-1.5 text-emerald-600 group-data-[collapsible=icon]:justify-center">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-medium group-data-[collapsible=icon]:hidden">
              System operational
            </span>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 h-14 border-b border-border bg-card/80 backdrop-blur flex items-center gap-3 px-4">
          <SidebarTrigger className="h-7 w-7" />
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
          </div>
        </header>

        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}