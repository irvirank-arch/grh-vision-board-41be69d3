import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, UserPlus, CalendarDays, Plane, UserCheck, MoreHorizontal,
  ArrowUpRight, FileText, TrendingUp, Clock, ChevronRight, Plus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, Cell,
} from "recharts";

// ─── Mock Data ──────────────────────────────────────────────
const leavesTrend = [
  { month: "Jan", demandes: 4, approbations: 3 },
  { month: "Fév", demandes: 6, approbations: 5 },
  { month: "Mar", demandes: 12, approbations: 9 },
  { month: "Avr", demandes: 15, approbations: 14 },
  { month: "Mai", demandes: 18, approbations: 15 },
  { month: "Jun", demandes: 22, approbations: 20 },
  { month: "Jul", demandes: 28, approbations: 24 },
];

const structureData = [
  { name: "Conseillers PR", count: 52 },
  { name: "Conseillers Spéciaux", count: 45 },
  { name: "Conseillers Tech.", count: 38 },
  { name: "Attachés Presse", count: 28 },
  { name: "Secrétariat Part.", count: 22 },
  { name: "Moyen Cabinets", count: 15 },
  { name: "Comptabilités", count: 12 },
  { name: "Divers", count: 8 },
];

const recentActivities = [
  {
    initials: "P.L.",
    text: "Fiche agent (Conseiller Technique) mise à jour par Jean Dupont.",
    time: "Il y a 12 min",
    type: "update" as const,
  },
  {
    initials: "A.K.",
    text: "Nouvelle demande de congé de Marie Curie (Secrétariat, En attente).",
    time: "Il y a 45 min",
    type: "leave" as const,
  },
  {
    initials: "D.S.",
    text: "Mission validée pour le Kenya par Conseiller A.",
    time: "Il y a 1h",
    type: "mission" as const,
  },
  {
    initials: "M.N.",
    text: "Nouvelle recrue enregistrée — étape Identité complétée.",
    time: "Il y a 2h",
    type: "recruit" as const,
  },
];

const quickActions = [
  { label: "Nouveau Recrutement", sublabel: "Poste Cabinet", icon: UserPlus, color: "bg-primary" },
  { label: "Générer une Attestation", sublabel: "Service", icon: FileText, color: "bg-secondary" },
  { label: "Valider les Congés", sublabel: "En attente", icon: CalendarDays, color: "bg-accent" },
];

// ─── Animated Counter ───────────────────────────────────────
const AnimatedNumber = ({ value, duration = 1200 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display.toLocaleString("fr-FR")}</>;
};

// ─── Stat Card ──────────────────────────────────────────────
const StatCard = ({
  title, value, icon: Icon, subtitle, glowClass, iconBg, delay,
}: {
  title: string; value: number; icon: React.ElementType;
  subtitle?: string; glowClass: string; iconBg: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className={`border-0 shadow-md hover:shadow-xl transition-all duration-300 ${glowClass} group cursor-default`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-bold text-foreground mt-2 tabular-nums">
              [<AnimatedNumber value={value} />]
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                {subtitle}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${iconBg} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// ─── Custom Tooltip ─────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-xl p-3 text-xs">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
            {p.name}: <span className="font-semibold text-foreground">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Activity Type Colors ───────────────────────────────────
const activityColors: Record<string, string> = {
  update: "bg-primary",
  leave: "bg-secondary",
  mission: "bg-info",
  recruit: "bg-success",
};

// ─── Dashboard ──────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const serviceName = user?.service?.name || "Cabinet du Président (PR)";

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2"
      >
        <div>
          <h1 className="text-2xl font-serif text-foreground">Tableau de Bord</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{serviceName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal gap-1">
            <Clock className="h-3 w-3" />
            Mis à jour il y a 5 min
          </Badge>
        </div>
      </motion.div>

      {/* Stats + Activity row */}
      <div className="grid grid-cols-12 gap-5">
        {/* Stat cards */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="Total Agents"
            value={215}
            subtitle={serviceName}
            icon={Users}
            iconBg="bg-primary"
            glowClass="stat-glow-blue"
            delay={0}
          />
          <StatCard
            title="Agents en Congé"
            value={12}
            icon={CalendarDays}
            iconBg="bg-secondary"
            glowClass="stat-glow-gold"
            delay={0.1}
          />
          <StatCard
            title="Missions Actives"
            value={5}
            subtitle="2 internationales"
            icon={Plane}
            iconBg="bg-info"
            glowClass="stat-glow-blue"
            delay={0.2}
          />
          <StatCard
            title="Recrutements"
            value={2}
            subtitle="En cours"
            icon={UserPlus}
            iconBg="bg-success"
            glowClass="stat-glow-green"
            delay={0.3}
          />
        </div>

        {/* Activity feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-span-12 lg:col-span-4 row-span-2"
        >
          <Card className="border-0 shadow-md h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground font-sans">
                Activités Récentes
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pb-5">
              {recentActivities.map((activity, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                  className="flex gap-3 group cursor-default"
                >
                  <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${activityColors[activity.type]}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-foreground leading-relaxed">
                      <span className="font-bold">{activity.initials}</span> — {activity.text}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground mt-2">
                Voir tout <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts row */}
        {/* Leave trends chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="col-span-12 sm:col-span-6 lg:col-span-4"
        >
          <Card className="border-0 shadow-md h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground font-sans">
                Tendance des Congés
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Demandes déposées
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/40" /> Approbations
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={leavesTrend}>
                  <defs>
                    <linearGradient id="gradDemandes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(216, 72%, 30%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(216, 72%, 30%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradApprobations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(216, 72%, 60%)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="hsl(216, 72%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "hsl(220, 10%, 46%)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(220, 10%, 46%)" }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="demandes"
                    name="Demandes"
                    stroke="hsl(216, 72%, 30%)"
                    strokeWidth={2.5}
                    fill="url(#gradDemandes)"
                    dot={{ r: 3, fill: "hsl(216, 72%, 30%)", strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "white" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="approbations"
                    name="Approbations"
                    stroke="hsl(216, 72%, 60%)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#gradApprobations)"
                    dot={{ r: 2.5, fill: "hsl(216, 72%, 60%)", strokeWidth: 0 }}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "white" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Structure bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="col-span-12 sm:col-span-6 lg:col-span-4"
        >
          <Card className="border-0 shadow-md h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground font-sans">
                Structure Interne
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={structureData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 8, fill: "hsl(220, 10%, 46%)" }}
                    axisLine={false}
                    tickLine={false}
                    angle={-35}
                    textAnchor="end"
                    height={55}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(220, 10%, 46%)" }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Agents" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {structureData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={i < 3 ? "hsl(216, 72%, 30%)" : `hsl(216, 60%, ${40 + i * 5}%)`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-0 shadow-md bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground font-sans">
              Raccourcis Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card hover:bg-muted/50 hover:border-primary/20 hover:shadow-md transition-all duration-200 group text-left"
                >
                  <div className={`p-2.5 rounded-lg ${action.color} transition-transform group-hover:scale-110`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{action.label}</p>
                    <p className="text-[10px] text-muted-foreground">{action.sublabel}</p>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
