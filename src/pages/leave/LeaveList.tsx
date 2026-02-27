import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isWithinInterval, addMonths, subMonths, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  Search, Plus, CalendarDays, Clock, CheckCircle2, XCircle, CalendarIcon,
  Palmtree, Stethoscope, Baby, BookOpen, List, ChevronLeft, ChevronRight, LayoutGrid,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const leaveTypes = [
  { value: "annuel", label: "Congé annuel", icon: Palmtree },
  { value: "maladie", label: "Congé maladie", icon: Stethoscope },
  { value: "maternite", label: "Congé maternité", icon: Baby },
  { value: "formation", label: "Congé formation", icon: BookOpen },
  { value: "exceptionnel", label: "Congé exceptionnel", icon: CalendarDays },
];

const mockLeaves = [
  { id: 1, agent: "MONZELE Marie", service: "Cabinet du Président", type: "annuel", start: "2025-07-01", end: "2025-07-15", days: 15, status: "en_attente", reason: "Vacances familiales" },
  { id: 2, agent: "KABONGO Jean", service: "Conseillers Spéciaux", type: "maladie", start: "2025-06-20", end: "2025-06-24", days: 5, status: "approuvé", reason: "Consultation médicale" },
  { id: 3, agent: "LUKUSA Patrick", service: "Secrétariat Particulier", type: "annuel", start: "2025-08-01", end: "2025-08-10", days: 10, status: "approuvé", reason: "Repos" },
  { id: 4, agent: "MBUYI Anne", service: "Protocole", type: "exceptionnel", start: "2025-06-28", end: "2025-06-30", days: 3, status: "rejeté", reason: "Événement familial" },
  { id: 5, agent: "TSHIMANGA David", service: "Conseillers Techniques", type: "formation", start: "2025-09-01", end: "2025-09-14", days: 14, status: "en_attente", reason: "Formation en management" },
  { id: 6, agent: "NGALULA Grace", service: "Attachés de Presse", type: "maternite", start: "2025-10-01", end: "2025-12-31", days: 90, status: "approuvé", reason: "Congé maternité" },
];

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  en_attente: { label: "En attente", icon: Clock, color: "bg-warning/10 text-warning" },
  approuvé: { label: "Approuvé", icon: CheckCircle2, color: "bg-success/10 text-success" },
  rejeté: { label: "Rejeté", icon: XCircle, color: "bg-destructive/10 text-destructive" },
};

const balances = [
  { type: "Congé annuel", total: 30, used: 10, remaining: 20, color: "bg-primary" },
  { type: "Congé maladie", total: 15, used: 5, remaining: 10, color: "bg-warning" },
  { type: "Congé exceptionnel", total: 10, used: 3, remaining: 7, color: "bg-accent" },
  { type: "Congé formation", total: 20, used: 0, remaining: 20, color: "bg-info" },
];

const LeaveList = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarMonth, setCalendarMonth] = useState(new Date(2025, 6, 1));
  const { toast } = useToast();

  const filtered = mockLeaves.filter((l) => {
    const matchSearch = l.agent.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    const matchType = filterType === "all" || l.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const handleSubmit = () => {
    toast({ title: "Demande envoyée", description: "Votre demande de congé a été soumise avec succès." });
    setDialogOpen(false);
    setStartDate(undefined);
    setEndDate(undefined);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-serif text-foreground">Congés</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestion des demandes de congé</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg">
              <Plus className="h-4 w-4 mr-2" /> Nouvelle Demande
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-serif">Demande de Congé</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Type de congé</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Choisir le type" /></SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date de début</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd/MM/yyyy") : "Début"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label>Date de fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd/MM/yyyy") : "Fin"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Motif</Label>
                <Textarea placeholder="Décrivez le motif de votre demande..." rows={3} />
              </div>
              <Button onClick={handleSubmit} className="w-full">Soumettre la demande</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Balances */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {balances.map((b) => (
          <Card key={b.type} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium mb-2">{b.type}</p>
              <div className="flex items-end justify-between mb-2">
                <p className="text-2xl font-bold text-foreground">{b.remaining}</p>
                <p className="text-xs text-muted-foreground">/ {b.total} jours</p>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${b.color} transition-all duration-500`}
                  style={{ width: `${(b.used / b.total) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{b.used} jours utilisés</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="gap-1.5"
        >
          <List className="h-4 w-4" /> Liste
        </Button>
        <Button
          variant={viewMode === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("calendar")}
          className="gap-1.5"
        >
          <LayoutGrid className="h-4 w-4" /> Calendrier
        </Button>
      </div>

      {viewMode === "list" ? (
        /* List View */
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {leaveTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="approuvé">Approuvé</SelectItem>
                  <SelectItem value="rejeté">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Jours</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((leave, i) => {
                  const st = statusConfig[leave.status];
                  const typeInfo = leaveTypes.find((t) => t.value === leave.type);
                  return (
                    <motion.tr
                      key={leave.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.03 * i }}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                              {leave.agent.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{leave.agent}</p>
                            <p className="text-xs text-muted-foreground">{leave.service}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {typeInfo && <typeInfo.icon className="h-3.5 w-3.5" />}
                          {typeInfo?.label || leave.type}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(leave.start).toLocaleDateString("fr-FR")} — {new Date(leave.end).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{leave.days}j</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                          <st.icon className="h-3 w-3" />
                          {st.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {leave.status === "en_attente" && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-success hover:text-success hover:bg-success/10"
                              onClick={() => toast({ title: "Congé approuvé" })}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approuver
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => toast({ title: "Congé rejeté" })}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeter
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </motion.tr>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Aucune demande trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        /* Calendar View */
        <LeaveCalendarView
          leaves={mockLeaves}
          month={calendarMonth}
          onPrevMonth={() => setCalendarMonth((m) => subMonths(m, 1))}
          onNextMonth={() => setCalendarMonth((m) => addMonths(m, 1))}
        />
      )}
    </div>
  );
};

// ─── Calendar View Component ────────────────────────────────
const leaveStatusColors: Record<string, string> = {
  en_attente: "bg-warning/80",
  approuvé: "bg-success/80",
  rejeté: "bg-destructive/60",
};

const LeaveCalendarView = ({
  leaves,
  month,
  onPrevMonth,
  onNextMonth,
}: {
  leaves: typeof mockLeaves;
  month: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0=Sun
  const adjustedStart = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Mon=0

  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const getLeavesForDay = (day: Date) =>
    leaves.filter((l) =>
      isWithinInterval(day, { start: new Date(l.start), end: new Date(l.end) })
    );

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-serif text-foreground capitalize">
            {format(month, "MMMM yyyy", { locale: fr })}
          </h3>
          <Button variant="ghost" size="icon" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4">
          {[
            { label: "Approuvé", color: "bg-success/80" },
            { label: "En attente", color: "bg-warning/80" },
            { label: "Rejeté", color: "bg-destructive/60" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`h-2.5 w-2.5 rounded-sm ${item.color}`} />
              {item.label}
            </div>
          ))}
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: adjustedStart }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[90px]" />
          ))}

          {days.map((day) => {
            const dayLeaves = getLeavesForDay(day);
            const isToday = isSameDay(day, new Date());
            const isWeekend = getDay(day) === 0 || getDay(day) === 6;

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[90px] rounded-lg border p-1.5 transition-colors",
                  isToday ? "border-primary bg-primary/5" : "border-border/50",
                  isWeekend && "bg-muted/30",
                  dayLeaves.length > 0 && "hover:shadow-sm"
                )}
              >
                <p className={cn(
                  "text-xs font-medium mb-1",
                  isToday ? "text-primary font-bold" : "text-foreground"
                )}>
                  {format(day, "d")}
                </p>
                <div className="space-y-0.5">
                  {dayLeaves.slice(0, 3).map((l) => (
                    <div
                      key={l.id}
                      className={cn(
                        "rounded px-1 py-0.5 text-[9px] font-medium text-white truncate",
                        leaveStatusColors[l.status]
                      )}
                      title={`${l.agent} — ${leaveTypes.find((t) => t.value === l.type)?.label}`}
                    >
                      {l.agent.split(" ")[0]}
                    </div>
                  ))}
                  {dayLeaves.length > 3 && (
                    <p className="text-[9px] text-muted-foreground text-center">+{dayLeaves.length - 3}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaveList;
