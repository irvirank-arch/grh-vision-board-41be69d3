import { useState, useMemo } from "react";
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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  isWithinInterval, addMonths, subMonths, isSameDay, differenceInBusinessDays,
} from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, CalendarDays, Clock, CheckCircle2, XCircle, CalendarIcon,
  Palmtree, Stethoscope, Baby, BookOpen, List, ChevronLeft, ChevronRight,
  LayoutGrid, AlertTriangle, Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ──────────────────────────────────────────────────
interface LeaveRequest {
  id: number;
  agent: string;
  service: string;
  type: string;
  start: string;
  end: string;
  days: number;
  status: "en_attente" | "approuvé" | "rejeté";
  reason: string;
}

interface LeaveBalance {
  type: string;
  leaveType: string;
  total: number;
  used: number;
  color: string;
}

// ─── Config ─────────────────────────────────────────────────
const leaveTypes = [
  { value: "annuel", label: "Congé annuel", icon: Palmtree, maxDays: 30 },
  { value: "maladie", label: "Congé maladie", icon: Stethoscope, maxDays: 15 },
  { value: "maternite", label: "Congé maternité", icon: Baby, maxDays: 90 },
  { value: "formation", label: "Congé formation", icon: BookOpen, maxDays: 20 },
  { value: "exceptionnel", label: "Congé exceptionnel", icon: CalendarDays, maxDays: 10 },
];

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  en_attente: { label: "En attente", icon: Clock, color: "bg-warning/10 text-warning" },
  approuvé: { label: "Approuvé", icon: CheckCircle2, color: "bg-success/10 text-success" },
  rejeté: { label: "Rejeté", icon: XCircle, color: "bg-destructive/10 text-destructive" },
};

const initialLeaves: LeaveRequest[] = [
  { id: 1, agent: "MONZELE Marie", service: "Cabinet du Président", type: "annuel", start: "2025-07-01", end: "2025-07-15", days: 15, status: "en_attente", reason: "Vacances familiales" },
  { id: 2, agent: "KABONGO Jean", service: "Conseillers Spéciaux", type: "maladie", start: "2025-06-20", end: "2025-06-24", days: 5, status: "approuvé", reason: "Consultation médicale" },
  { id: 3, agent: "LUKUSA Patrick", service: "Secrétariat Particulier", type: "annuel", start: "2025-08-01", end: "2025-08-10", days: 10, status: "approuvé", reason: "Repos" },
  { id: 4, agent: "MBUYI Anne", service: "Protocole", type: "exceptionnel", start: "2025-06-28", end: "2025-06-30", days: 3, status: "rejeté", reason: "Événement familial" },
  { id: 5, agent: "TSHIMANGA David", service: "Conseillers Techniques", type: "formation", start: "2025-09-01", end: "2025-09-14", days: 14, status: "en_attente", reason: "Formation en management" },
  { id: 6, agent: "NGALULA Grace", service: "Attachés de Presse", type: "maternite", start: "2025-10-01", end: "2025-12-31", days: 90, status: "approuvé", reason: "Congé maternité" },
];

const initialBalances: LeaveBalance[] = [
  { type: "Congé annuel", leaveType: "annuel", total: 30, used: 10, color: "bg-primary" },
  { type: "Congé maladie", leaveType: "maladie", total: 15, used: 5, color: "bg-warning" },
  { type: "Congé maternité", leaveType: "maternite", total: 90, used: 0, color: "bg-info" },
  { type: "Congé exceptionnel", leaveType: "exceptionnel", total: 10, used: 3, color: "bg-accent" },
  { type: "Congé formation", leaveType: "formation", total: 20, used: 0, color: "bg-success" },
];

// ─── Main Component ─────────────────────────────────────────
const LeaveList = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(initialLeaves);
  const [balances, setBalances] = useState<LeaveBalance[]>(initialBalances);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarMonth, setCalendarMonth] = useState(new Date(2025, 6, 1));

  // New request form state
  const [newType, setNewType] = useState("");
  const [newStart, setNewStart] = useState<Date>();
  const [newEnd, setNewEnd] = useState<Date>();
  const [newReason, setNewReason] = useState("");
  const { toast } = useToast();

  // Auto-calculate days
  const calculatedDays = useMemo(() => {
    if (!newStart || !newEnd) return 0;
    if (newEnd < newStart) return 0;
    return differenceInBusinessDays(newEnd, newStart) + 1;
  }, [newStart, newEnd]);

  // Check balance
  const selectedBalance = balances.find((b) => b.leaveType === newType);
  const remainingForType = selectedBalance ? selectedBalance.total - selectedBalance.used : 0;
  const exceedsBalance = newType && calculatedDays > remainingForType;

  const filtered = leaves.filter((l) => {
    const matchSearch = l.agent.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    const matchType = filterType === "all" || l.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const resetForm = () => {
    setNewType("");
    setNewStart(undefined);
    setNewEnd(undefined);
    setNewReason("");
  };

  const handleSubmit = () => {
    if (!newType || !newStart || !newEnd || !newReason.trim()) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs.", variant: "destructive" });
      return;
    }
    if (exceedsBalance) {
      toast({ title: "Solde insuffisant", description: `Il vous reste ${remainingForType} jours pour ce type de congé.`, variant: "destructive" });
      return;
    }

    const newLeave: LeaveRequest = {
      id: Date.now(),
      agent: "Utilisateur Actuel",
      service: "Mon Service",
      type: newType,
      start: format(newStart, "yyyy-MM-dd"),
      end: format(newEnd, "yyyy-MM-dd"),
      days: calculatedDays,
      status: "en_attente",
      reason: newReason,
    };

    setLeaves((prev) => [newLeave, ...prev]);
    toast({ title: "Demande envoyée", description: `Congé de ${calculatedDays} jours soumis avec succès.` });
    resetForm();
    setDialogOpen(false);
  };

  const handleApprove = (id: number) => {
    setLeaves((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        // Update balance
        setBalances((bals) =>
          bals.map((b) =>
            b.leaveType === l.type ? { ...b, used: b.used + l.days } : b
          )
        );
        return { ...l, status: "approuvé" as const };
      })
    );
    toast({ title: "Congé approuvé", description: "La demande a été approuvée avec succès." });
  };

  const handleReject = (id: number) => {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "rejeté" as const } : l))
    );
    toast({ title: "Congé rejeté", description: "La demande a été rejetée." });
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
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="shadow-lg">
              <Plus className="h-4 w-4 mr-2" /> Nouvelle Demande
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle className="font-serif">Demande de Congé</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Type de congé <span className="text-destructive">*</span></Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger><SelectValue placeholder="Choisir le type" /></SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((t) => {
                      const bal = balances.find((b) => b.leaveType === t.value);
                      const rem = bal ? bal.total - bal.used : 0;
                      return (
                        <SelectItem key={t.value} value={t.value}>
                          <div className="flex items-center justify-between w-full gap-3">
                            <span>{t.label}</span>
                            <span className="text-xs text-muted-foreground">({rem}j restants)</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Balance info */}
              {newType && selectedBalance && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="rounded-lg bg-muted/50 p-3"
                >
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Solde disponible</span>
                    <span className="font-bold text-foreground">{remainingForType} jours</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${selectedBalance.color} transition-all duration-300`}
                      style={{ width: `${(selectedBalance.used / selectedBalance.total) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{selectedBalance.used}j utilisés</span>
                    <span>{selectedBalance.total}j total</span>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date de début <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newStart && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newStart ? format(newStart, "dd/MM/yyyy") : "Début"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={newStart} onSelect={setNewStart} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label>Date de fin <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newEnd && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newEnd ? format(newEnd, "dd/MM/yyyy") : "Fin"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newEnd}
                        onSelect={setNewEnd}
                        disabled={(date) => newStart ? date < newStart : false}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Auto-calculated days */}
              {calculatedDays > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg text-sm",
                    exceedsBalance
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {exceedsBalance ? (
                    <>
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span><strong>{calculatedDays} jours ouvrables</strong> — Solde insuffisant ({remainingForType}j restants)</span>
                    </>
                  ) : (
                    <>
                      <Info className="h-4 w-4 shrink-0" />
                      <span><strong>{calculatedDays} jours ouvrables</strong> seront déduits de votre solde</span>
                    </>
                  )}
                </motion.div>
              )}

              <div className="space-y-1.5">
                <Label>Motif <span className="text-destructive">*</span></Label>
                <Textarea
                  placeholder="Décrivez le motif de votre demande..."
                  rows={3}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                />
              </div>

              <Separator />

              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={!newType || !newStart || !newEnd || !newReason.trim() || !!exceedsBalance}
              >
                Soumettre la demande
                {calculatedDays > 0 && !exceedsBalance && ` (${calculatedDays} jours)`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Balances */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-5 gap-4"
      >
        {balances.map((b) => {
          const remaining = b.total - b.used;
          return (
            <Card key={b.type} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground font-medium mb-2">{b.type}</p>
                <div className="flex items-end justify-between mb-2">
                  <p className="text-2xl font-bold text-foreground">{remaining}</p>
                  <p className="text-xs text-muted-foreground">/ {b.total}j</p>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${b.color} transition-all duration-500`}
                    style={{ width: `${(b.used / b.total) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{b.used}j utilisés</p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")} className="gap-1.5">
          <List className="h-4 w-4" /> Liste
        </Button>
        <Button variant={viewMode === "calendar" ? "default" : "outline"} size="sm" onClick={() => setViewMode("calendar")} className="gap-1.5">
          <LayoutGrid className="h-4 w-4" /> Calendrier
        </Button>
      </div>

      {viewMode === "list" ? (
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher par nom..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {leaveTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px]"><SelectValue placeholder="Statut" /></SelectTrigger>
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
                <AnimatePresence>
                  {filtered.map((leave, i) => {
                    const st = statusConfig[leave.status];
                    const typeInfo = leaveTypes.find((t) => t.value === leave.type);
                    return (
                      <motion.tr
                        key={leave.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
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
                                variant="ghost" size="sm"
                                className="h-7 text-xs text-success hover:text-success hover:bg-success/10"
                                onClick={() => handleApprove(leave.id)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approuver
                              </Button>
                              <Button
                                variant="ghost" size="sm"
                                className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleReject(leave.id)}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Rejeter
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
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
        <LeaveCalendarView
          leaves={leaves}
          month={calendarMonth}
          onPrevMonth={() => setCalendarMonth((m) => subMonths(m, 1))}
          onNextMonth={() => setCalendarMonth((m) => addMonths(m, 1))}
        />
      )}
    </div>
  );
};

// ─── Calendar View ──────────────────────────────────────────
const leaveStatusColors: Record<string, string> = {
  en_attente: "bg-warning/80",
  approuvé: "bg-success/80",
  rejeté: "bg-destructive/60",
};

const LeaveCalendarView = ({
  leaves, month, onPrevMonth, onNextMonth,
}: {
  leaves: LeaveRequest[];
  month: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);
  const adjustedStart = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
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

        <div className="grid grid-cols-7 gap-1 mb-1">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
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
                <p className={cn("text-xs font-medium mb-1", isToday ? "text-primary font-bold" : "text-foreground")}>
                  {format(day, "d")}
                </p>
                <div className="space-y-0.5">
                  {dayLeaves.slice(0, 3).map((l) => (
                    <div
                      key={l.id}
                      className={cn("rounded px-1 py-0.5 text-[9px] font-medium text-white truncate", leaveStatusColors[l.status])}
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
