import {
  LayoutDashboard, Activity, BrainCircuit, Network,
  Server, Rocket, BarChart2, BellRing, ShieldAlert,
  AlertTriangle, Flame, ScrollText, CalendarClock,
  Building2, Users, FileLock2, Webhook, Blocks,
  GaugeCircle, Bookmark, Radio, User
} from "lucide-react";

export const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", to: "/app", icon: LayoutDashboard },
      { label: "Analytics", to: "/app/analytics", icon: Activity },
      { label: "AI Insights", to: "/app/ai", icon: BrainCircuit },
      { label: "Dependency Graph", to: "/app/graph", icon: Network },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Services", to: "/app/services", icon: Server },
      { label: "Deployments", to: "/app/deployments", icon: Rocket },
      { label: "Metrics", to: "/app/metrics", icon: BarChart2 },
      { label: "Alert Rules", to: "/app/alert-rules", roles: ["super-admin", "admin"], icon: BellRing },
      { label: "Escalation", to: "/app/escalation-policies", roles: ["super-admin", "admin"], icon: ShieldAlert },
      { label: "Alerts", to: "/app/alerts", icon: AlertTriangle },
      { label: "Incidents", to: "/app/incidents", icon: Flame },
      { label: "Logs", to: "/app/logs", icon: ScrollText },
      { label: "Maintenance", to: "/app/maintenance", roles: ["super-admin", "admin"], icon: CalendarClock },
    ],
  },
  {
    label: "Governance",
    items: [
      { label: "Organization", to: "/app/org", roles: ["super-admin", "admin"], icon: Building2 },
      { label: "Teams", to: "/app/teams", roles: ["super-admin", "admin"], icon: Users },
      { label: "Audit Logs", to: "/app/audit", roles: ["super-admin", "admin"], icon: FileLock2 },
      { label: "Notifications", to: "/app/notifications", roles: ["super-admin", "admin"], icon: Webhook },
      { label: "Integrations", to: "/app/integrations", roles: ["super-admin", "admin"], icon: Blocks },
      { label: "SLO/SLA", to: "/app/slo", roles: ["super-admin", "admin"], icon: GaugeCircle },
      { label: "Saved Views", to: "/app/views", icon: Bookmark },
      { label: "Status Page", to: "/app/status", roles: ["super-admin", "admin"], icon: Radio },
      { label: "Profile", to: "/app/profile", icon: User },
    ],
  },
];
