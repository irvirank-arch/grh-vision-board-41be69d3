import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Plane, Globe, MapPin, Clock, CheckCircle2, XCircle,
  CalendarIcon, Eye, Filter, ArrowUpRight, Flag,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Types ──────────────────────────────────────────────────
interface Mission {
  id: number;
  agent: string;
  service: string;
  destination: string;
  country: string;
  type: "nationale" | "internationale";
  start: string;
  end: string;
  days: number;
  status: "en_attente" | "approuvée" | "en_cours" | "terminée" | "annulée";
  objective: string;
  budget?: string;
}

// ─── Config ─────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  en_attente: { label: "En attente", icon: Clock, color: "bg-warning/10 text-warning" },
  approuvée: { label: "Approuvée", icon: CheckCircle2, color: "bg-success/10 text-success" },
  en_cours: { label: "En cours", icon: ArrowUpRight, color: "bg-info/10 text-info" },
  terminée: { label: "Terminée", icon: CheckCircle2, color: "bg-muted text-muted-foreground" },
  annulée: { label: "Annulée", icon: XCircle, color: "bg-destructive/10 text-destructive" },
};

const initialMissions: Mission[] = [
  { id: 1, agent: "TSHIMANGA David", service: "Conseillers Techniques", destination: "Bruxelles", country: "Belgique", type: "internationale", start: "2025-07-10", end: "2025-07-17", days: 7, status: "approuvée", objective: "Réunion diplomatique", budget: "15 000 $" },
  { id: 2, agent: "MONZELE Marie", service: "Cabinet du Président", destination: "Lubumbashi", country: "RDC", type: "nationale", start: "2025-07-20", end: "2025-07-23", days: 3, status: "en_attente", objective: "Inspection des services provinciaux" },
  { id: 3, agent: "KABONGO Jean", service: "Conseillers Spéciaux", destination: "Paris", country: "France", type: "internationale", start: "2025-06-01", end: "2025-06-05", days: 5, status: "terminée", objective: "Forum économique", budget: "12 000 $" },
  { id: 4, agent: "NGALULA Grace", service: "Attachés de Presse", destination: "Addis-Abeba", country: "Éthiopie", type: "internationale", start: "2025-08-15", end: "2025-08-20", days: 5, status: "en_attente", objective: "Sommet UA — couverture médiatique", budget: "8 500 $" },
  { id: 5, agent: "MULUNDA Sophie", service: "Cabinet du Président", destination: "Goma", country: "RDC", type: "nationale", start: "2025-07-05", end: "2025-07-08", days: 3, status: "en_cours", objective: "Mission humanitaire" },
  { id: 6, agent: "LUKUSA Patrick", service: "Secrétariat Particulier", destination: "Matadi", country: "RDC", type: "nationale", start: "2025-05-10", end: "2025-05-12", days: 2, status: "terminée", objective: "Formation agents provinciaux" },
];

// ─── Main Component ─────────────────────────────────────────
const MissionsList = () => {
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailMission, setDetailMission] = useState<Mission | null>(null);

  // Form state
  const [newAgent, setNewAgent] = useState("");
  const [newDest, setNewDest] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newType, setNewType] = useState<"nationale" | "internationale">("nationale");
  const [newStart, setNewStart] = useState<Date>();
  const [newEnd, setNewEnd] = useState<Date>();
  const [newObjective, setNewObjective] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const { toast } = useToast();

  const filtered = missions.filter((m) => {
    const matchSearch = m.agent.toLowerCase().includes(search.toLowerCase()) || m.destination.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || m.status === filterStatus;
    const matchType = filterType === "all" || m.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const stats = {
    total: missions.length,
    enCours: missions.filter((m) => m.status === "en_cours").length,
    internationales: missions.filter((m) => m.type === "internationale").length,
    enAttente: missions.filter((m) => m.status === "en_attente").length,
  };

  const resetForm = () => {
    setNewAgent(""); setNewDest(""); setNewCountry(""); setNewType("nationale");
    setNewStart(undefined); setNewEnd(undefined); setNewObjective(""); setNewBudget("");
  };

  const handleSubmit = () => {
    if (!newAgent || !newDest || !newStart || !newEnd || !newObjective) {
      toast({ title: "Champs requis", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }
    const days = differenceInDays(newEnd, newStart) + 1;
    const mission: Mission = {
      id: Date.now(),
      agent: newAgent,
      service: "Service",
      destination: newDest,
      country: newCountry || "RDC",
      type: newType,
      start: format(newStart, "yyyy-MM-dd"),
      end: format(newEnd, "yyyy-MM-dd"),
      days,
      status: "en_attente",
      objective: newObjective,
      budget: newBudget || undefined,
    };
    setMissions((prev) => [mission, ...prev]);
    toast({ title: "Mission créée", description: `Mission de ${days} jours soumise pour validation.` });
    resetForm();
    setDialogOpen(false);
  };

  const handleApprove = (id: number) => {
    setMissions((prev) => prev.map((m) => m.id === id ? { ...m, status: "approuvée" as const } : m));
    toast({ title: "Mission approuvée" });
  };

  const handleReject = (id: number) => {
    setMissions((prev) => prev.map((m) => m.id === id ? { ...m, status: "annulée" as const } : m));
    toast({ title: "Mission annulée" });
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif text-foreground">Missions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Suivi des missions nationales et internationales</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="shadow-lg"><Plus className="h-4 w-4 mr-2" /> Nouvelle Mission</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="font-serif">Nouvelle Mission</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Agent <span className="text-destructive">*</span></Label>
                  <Input placeholder="Nom de l'agent" value={newAgent} onChange={(e) => setNewAgent(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Type <span className="text-destructive">*</span></Label>
                  <Select value={newType} onValueChange={(v) => setNewType(v as "nationale" | "internationale")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nationale">Nationale</SelectItem>
                      <SelectItem value="internationale">Internationale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Destination <span className="text-destructive">*</span></Label>
                  <Input placeholder="Ville" value={newDest} onChange={(e) => setNewDest(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Pays</Label>
                  <Input placeholder={newType === "nationale" ? "RDC" : "Pays"} value={newCountry} onChange={(e) => setNewCountry(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Début <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newStart && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newStart ? format(newStart, "dd/MM/yyyy") : "Date début"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={newStart} onSelect={setNewStart} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1.5">
                  <Label>Fin <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newEnd && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newEnd ? format(newEnd, "dd/MM/yyyy") : "Date fin"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={newEnd} onSelect={setNewEnd} disabled={(d) => newStart ? d < newStart : false} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {newType === "internationale" && (
                <div className="space-y-1.5">
                  <Label>Budget estimé</Label>
                  <Input placeholder="Ex: 10 000 $" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Objectif <span className="text-destructive">*</span></Label>
                <Textarea placeholder="Décrivez l'objectif de la mission..." rows={3} value={newObjective} onChange={(e) => setNewObjective(e.target.value)} />
              </div>
              <Separator />
              <Button onClick={handleSubmit} className="w-full" disabled={!newAgent || !newDest || !newStart || !newEnd || !newObjective}>
                Soumettre la mission
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: Plane, bg: "bg-primary/10 text-primary" },
          { label: "En cours", value: stats.enCours, icon: ArrowUpRight, bg: "bg-info/10 text-info" },
          { label: "Internationales", value: stats.internationales, icon: Globe, bg: "bg-secondary/10 text-secondary" },
          { label: "En attente", value: stats.enAttente, icon: Clock, bg: "bg-warning/10 text-warning" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${s.bg}`}><s.icon className="h-4 w-4" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filters + Table */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Rechercher par nom ou destination..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="nationale">Nationale</SelectItem>
                <SelectItem value="internationale">Internationale</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="approuvée">Approuvée</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="terminée">Terminée</SelectItem>
                <SelectItem value="annulée">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Jours</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filtered.map((mission, i) => {
                  const st = statusConfig[mission.status];
                  return (
                    <motion.tr
                      key={mission.id}
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
                              {mission.agent.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{mission.agent}</p>
                            <p className="text-xs text-muted-foreground">{mission.service}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-foreground">{mission.destination}</span>
                          <span className="text-muted-foreground text-xs">({mission.country})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                          mission.type === "internationale" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                        )}>
                          {mission.type === "internationale" ? <Globe className="h-3 w-3" /> : <Flag className="h-3 w-3" />}
                          {mission.type === "internationale" ? "Int." : "Nat."}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(mission.start).toLocaleDateString("fr-FR")} — {new Date(mission.end).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">{mission.days}j</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                          <st.icon className="h-3 w-3" />
                          {st.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDetailMission(mission)}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> Voir
                          </Button>
                          {mission.status === "en_attente" && (
                            <>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-success hover:text-success hover:bg-success/10" onClick={() => handleApprove(mission.id)}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleReject(mission.id)}>
                                <XCircle className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">Aucune mission trouvée</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailMission} onOpenChange={(o) => !o && setDetailMission(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {detailMission && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif">Détail de la Mission</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {detailMission.agent.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">{detailMission.agent}</p>
                    <p className="text-xs text-muted-foreground">{detailMission.service}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground text-xs">Destination</p><p className="font-medium">{detailMission.destination}, {detailMission.country}</p></div>
                  <div><p className="text-muted-foreground text-xs">Type</p><p className="font-medium capitalize">{detailMission.type}</p></div>
                  <div><p className="text-muted-foreground text-xs">Période</p><p className="font-medium">{new Date(detailMission.start).toLocaleDateString("fr-FR")} — {new Date(detailMission.end).toLocaleDateString("fr-FR")}</p></div>
                  <div><p className="text-muted-foreground text-xs">Durée</p><p className="font-medium">{detailMission.days} jours</p></div>
                  {detailMission.budget && <div><p className="text-muted-foreground text-xs">Budget</p><p className="font-medium">{detailMission.budget}</p></div>}
                  <div><p className="text-muted-foreground text-xs">Statut</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[detailMission.status].color}`}>
                      {statusConfig[detailMission.status].label}
                    </span>
                  </div>
                </div>
                <div><p className="text-muted-foreground text-xs mb-1">Objectif</p><p className="text-sm text-foreground">{detailMission.objective}</p></div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MissionsList;
