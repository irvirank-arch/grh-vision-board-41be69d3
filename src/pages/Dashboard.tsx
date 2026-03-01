import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, UserPlus, CalendarDays, Plane, MoreHorizontal,
  ArrowUpRight, FileText, TrendingUp, TrendingDown, Clock,
  ChevronRight, Activity, Shield, Globe,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Area, AreaChart, Cell, PieChart, Pie,
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
  { name: "Conseillers Spéc.", count: 45 },
  { name: "Conseillers Tech.", count: 38 },
  { name: "Attachés Presse", count: 28 },
  { name: "Secrétariat", count: 22 },
  { name: "Cabinets", count: 15 },
  { name: "Comptabilité", count: 12 },
];

const presenceData = [
  { name: "Présents", value: 186, color: "hsl(158, 64%, 38%)" },
  { name: "En congé", value: 12, color: "hsl(42, 95%, 55%)" },
  { name: "En mission", value: 5, color: "hsl(216, 72%, 50%)" },
  { name: "Absents", value: 12, color: "hsl(4, 72%, 48%)" },
];

const sparklineData = [3, 5, 4, 7, 5, 8, 6, 9, 7, 11, 9, 12];

const recentActivities = [
  { initials: "JD", name: "Jean Dupont", text: "a mis à jour la fiche agent — Conseiller Technique", time: "12 min", type: "update" as const },
  { initials: "MC", name: "Marie Curie", text: "a soumis une demande de congé annuel", time: "45 min", type: "leave" as const },
  { initials: "AK", name: "André Kalonji", text: "mission validée — Délégation Kenya", time: "1h", type: "mission" as const },
  { initials: "DS", name: "Diana Samba", text: "nouvelle recrue — étape Identité complétée", time: "2h", type: "recruit" as const },
  { initials: "PL", name: "Patrick Landu", text: "attestation de service générée", time: "3h", type: "attestation" as const },
];

const quickActions = [
  { label: "Nouveau Recrutement", icon: UserPlus, href: "/recruitment/new" },
  { label: "Attestation de Service", icon: FileText, href: "/attestations" },
  { label: "Valider les Congés", icon: CalendarDays, href: "/leave" },
  { label: "Gestion des Missions", icon: Globe, href: "/missions" },
];

// ─── Animated Counter ───────────────────────────────────────
const AnimatedNumber = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display.toLocaleString("fr-FR")}</>;
};

// ─── Sparkline ──────────────────────────────────────────────
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const h = 32;
  const w = 80;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / (max - min)) * h,
  }));
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${d} L ${w} ${h} L 0 ${h} Z`} fill={`url(#spark-${color})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={3} fill={color} />
    </svg>
  );
};

// ─── Stat Card ──────────────────────────────────────────────
const StatCard = ({
  title, value, icon: Icon, trend, trendLabel, iconBg, glowClass, delay, sparkColor,
}: {
  title: string; value: number; icon: React.ElementType;
  trend?: "up" | "down"; trendLabel?: string;
  iconBg: string; glowClass: string; delay: number; sparkColor: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 group cursor-default h-full overflow-hidden relative ${glowClass}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-muted/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${iconBg} shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            <Icon className="h-5 w-5 text-primary-foreground" />
          </div>
          <Sparkline data={sparklineData} color={sparkColor} />
        </div>
        <p className="text-3xl font-bold text-foreground tabular-nums tracking-tight">
          <AnimatedNumber value={value} />
        </p>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mt-1">{title}</p>
        {trendLabel && (
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" ? (
              <TrendingUp className="h-3 w-3 text-success" />
            ) : (
              <TrendingDown className="h-3 w-3 text-accent" />
            )}
            <span className={`text-[10px] font-semibold ${trend === "up" ? "text-success" : "text-accent"}`}>
              {trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// ─── Custom Tooltip ─────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl p-3 text-xs">
      <p className="font-bold text-foreground mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-bold text-foreground">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Activity Badge Colors ──────────────────────────────────
const activityConfig: Record<string, { bg: string; label: string }> = {
  update: { bg: "bg-primary", label: "Mise à jour" },
  leave: { bg: "bg-secondary", label: "Congé" },
  mission: { bg: "bg-info", label: "Mission" },
  recruit: { bg: "bg-success", label: "Recrutement" },
  attestation: { bg: "bg-accent", label: "Attestation" },
};

// ─── Dashboard ──────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const serviceName = user?.service?.name || "Cabinet du Président de la République";

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto">
      {/* ─── Header ─────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-secondary" />
            <h1 className="text-2xl font-serif text-foreground">Tableau de Bord</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-[19px]">{serviceName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] font-medium gap-1.5 px-3 py-1.5 rounded-full border-border/60">
            <Activity className="h-3 w-3 text-success animate-pulse" />
            Système opérationnel
          </Badge>
          <Badge variant="outline" className="text-[10px] font-medium gap-1.5 px-3 py-1.5 rounded-full border-border/60">
            <Clock className="h-3 w-3" />
            Mis à jour il y a 5 min
          </Badge>
        </div>
      </motion.div>

      {/* ─── Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Agents" value={215} icon={Users} iconBg="bg-primary" glowClass="stat-glow-blue" trend="up" trendLabel="+8 ce mois" delay={0.05} sparkColor="hsl(216, 72%, 50%)" />
        <StatCard title="En Congé" value={12} icon={CalendarDays} iconBg="bg-secondary" glowClass="stat-glow-gold" trend="down" trendLabel="-3 vs. mois passé" delay={0.1} sparkColor="hsl(42, 95%, 55%)" />
        <StatCard title="Missions Actives" value={5} icon={Plane} iconBg="bg-info" glowClass="stat-glow-blue" trend="up" trendLabel="2 internationales" delay={0.15} sparkColor="hsl(216, 72%, 50%)" />
        <StatCard title="Recrutements" value={2} icon={UserPlus} iconBg="bg-success" glowClass="stat-glow-green" trendLabel="En cours" trend="up" delay={0.2} sparkColor="hsl(158, 64%, 38%)" />
      </div>

      {/* ─── Bento Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Leave Trends — wide */}
        <motion.div {...fadeUp(0.25)} className="col-span-12 lg:col-span-5">
          <Card className="border-0 shadow-lg h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground font-sans">Tendance des Congés</CardTitle>
                <p className="text-[10px] text-muted-foreground mt-0.5">7 derniers mois</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" /> Demandes
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-success" /> Approuvés
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={leavesTrend}>
                  <defs>
                    <linearGradient id="gDem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(216, 72%, 30%)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(216, 72%, 30%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gApp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(158, 64%, 38%)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(158, 64%, 38%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(220, 10%, 46%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(220, 10%, 46%)" }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="demandes" name="Demandes" stroke="hsl(216, 72%, 30%)" strokeWidth={2.5} fill="url(#gDem)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "white" }} />
                  <Area type="monotone" dataKey="approbations" name="Approuvés" stroke="hsl(158, 64%, 38%)" strokeWidth={2} fill="url(#gApp)" dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "white" }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Presence Donut */}
        <motion.div {...fadeUp(0.3)} className="col-span-12 sm:col-span-6 lg:col-span-3">
          <Card className="border-0 shadow-lg h-full">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-bold text-foreground font-sans">Présence du jour</CardTitle>
              <p className="text-[10px] text-muted-foreground">215 agents</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-4">
              <div className="relative">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={presenceData}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {presenceData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">86%</span>
                  <span className="text-[9px] text-muted-foreground font-semibold uppercase">Présents</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 w-full px-2">
                {presenceData.map((d) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-muted-foreground truncate">{d.name}</span>
                    <span className="font-bold text-foreground ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Feed */}
        <motion.div {...fadeUp(0.35)} className="col-span-12 sm:col-span-6 lg:col-span-4">
          <Card className="border-0 shadow-lg h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground font-sans">Activités Récentes</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              {recentActivities.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-default group"
                >
                  <div className={`h-8 w-8 rounded-lg ${activityConfig[a.type].bg} flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0 shadow-sm`}>
                    {a.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-foreground leading-snug">
                      <span className="font-bold">{a.name}</span>{" "}
                      <span className="text-muted-foreground">{a.text}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-muted-foreground">il y a {a.time}</span>
                      <Badge variant="outline" className="text-[8px] px-1.5 py-0 h-4 rounded-full border-border/50">
                        {activityConfig[a.type].label}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground mt-1 rounded-lg">
                Voir tout <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Structure Bar Chart */}
        <motion.div {...fadeUp(0.4)} className="col-span-12 lg:col-span-5">
          <Card className="border-0 shadow-lg h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-foreground font-sans">Répartition par Structure</CardTitle>
                <p className="text-[10px] text-muted-foreground mt-0.5">{structureData.reduce((s, d) => s + d.count, 0)} agents au total</p>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={structureData} barCategoryGap="18%" layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(220, 10%, 46%)" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "hsl(220, 10%, 46%)" }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Agents" radius={[0, 6, 6, 0]} maxBarSize={20}>
                    {structureData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "hsl(216, 72%, 30%)" : i === 1 ? "hsl(216, 72%, 40%)" : `hsl(216, 55%, ${45 + i * 5}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div {...fadeUp(0.45)} className="col-span-12 sm:col-span-6 lg:col-span-3">
          <Card className="border-0 shadow-lg h-full bg-gradient-to-br from-card via-card to-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-foreground font-sans">Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pb-4">
              {quickActions.map((action, i) => (
                <motion.a
                  key={action.label}
                  href={action.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.55 + i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card hover:bg-primary/5 hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <action.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold text-foreground flex-1">{action.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </motion.a>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Compliance strip */}
        <motion.div {...fadeUp(0.5)} className="col-span-12 lg:col-span-4">
          <Card className="border-0 shadow-lg h-full bg-gradient-to-r from-primary/5 via-card to-card">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground">Conformité RH</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">98% des dossiers agents complets</p>
                <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "98%" }}
                    transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary to-success rounded-full"
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-primary">98%</span>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
