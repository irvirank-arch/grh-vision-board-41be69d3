import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, CalendarDays, Plane, Building2, UserCheck, UserX, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { DashboardStats } from "@/lib/api/dashboard";

// Mock data for demo — replace with dashboardApi.getStats() when connected
const mockStats: DashboardStats = {
  total_agents: 342,
  active_agents: 298,
  inactive_agents: 44,
  total_recruits: 67,
  pending_recruits: 23,
  pending_leave_requests: 15,
  active_missions: 8,
  services_count: 55,
  agents_by_service: [
    { service: "Cabinet du Président", count: 45 },
    { service: "Direction du Protocole", count: 38 },
    { service: "Direction Administrative", count: 32 },
    { service: "Service de Sécurité", count: 28 },
    { service: "Direction Financière", count: 25 },
  ],
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description?: string;
  color: string;
}) => (
  <Card className="animate-fade-in border-0 shadow-md hover:shadow-lg transition-shadow">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value.toLocaleString("fr-FR")}</p>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(mockStats);

  useEffect(() => {
    // When API is connected:
    // dashboardApi.getStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble du système de gestion des ressources humaines
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Agents"
          value={stats.total_agents}
          icon={Users}
          description={`${stats.active_agents} actifs`}
          color="bg-[hsl(214,80%,42%)]"
        />
        <StatCard
          title="Agents Actifs"
          value={stats.active_agents}
          icon={UserCheck}
          color="bg-[hsl(152,60%,40%)]"
        />
        <StatCard
          title="Recrues en cours"
          value={stats.pending_recruits}
          icon={UserPlus}
          description={`${stats.total_recruits} total`}
          color="bg-[hsl(48,90%,45%)]"
        />
        <StatCard
          title="Congés en attente"
          value={stats.pending_leave_requests}
          icon={CalendarDays}
          color="bg-[hsl(0,72%,50%)]"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Missions actives"
          value={stats.active_missions}
          icon={Plane}
          color="bg-[hsl(214,80%,55%)]"
        />
        <StatCard
          title="Agents Inactifs"
          value={stats.inactive_agents}
          icon={UserX}
          color="bg-[hsl(220,10%,46%)]"
        />
        <StatCard
          title="Services GRH"
          value={stats.services_count}
          icon={Building2}
          color="bg-[hsl(220,30%,25%)]"
        />
        <StatCard
          title="Attestations"
          value={12}
          icon={FileText}
          color="bg-[hsl(270,60%,50%)]"
        />
      </div>

      {/* Services breakdown (SuperAdmin only) */}
      {(user?.role === "SUPERADMIN" || !user) && stats.agents_by_service && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-serif">Répartition par service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.agents_by_service.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    <span className="text-sm text-foreground truncate">{item.service}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(item.count / stats.total_agents) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
