import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Plus, Search, Download, Eye, Printer,
  FileBadge, FileCheck, Clock, CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type AttestationType = "SERVICE" | "TRAVAIL" | "SALAIRE" | "CONGE";
type AttestationStatus = "GENEREE" | "VALIDEE" | "REMISE";

interface Attestation {
  id: number;
  reference: string;
  type: AttestationType;
  agent: string;
  matricule: string;
  service: string;
  date_generation: string;
  status: AttestationStatus;
  objet?: string;
}

const typeLabels: Record<AttestationType, string> = {
  SERVICE: "Attestation de service",
  TRAVAIL: "Attestation de travail",
  SALAIRE: "Attestation de salaire",
  CONGE: "Attestation de congé",
};

const typeColors: Record<AttestationType, string> = {
  SERVICE: "bg-primary/10 text-primary",
  TRAVAIL: "bg-accent/10 text-accent",
  SALAIRE: "bg-chart-4/10 text-chart-4",
  CONGE: "bg-chart-3/10 text-chart-3",
};

const statusConfig: Record<AttestationStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  GENEREE: { label: "Générée", variant: "secondary" },
  VALIDEE: { label: "Validée", variant: "default" },
  REMISE: { label: "Remise", variant: "outline" },
};

const mockAttestations: Attestation[] = [
  { id: 1, reference: "ATT-2025-001", type: "SERVICE", agent: "Jean Mukendi", matricule: "PR-2020-045", service: "Direction Administrative", date_generation: "2025-02-20", status: "REMISE", objet: "Demande de prêt bancaire" },
  { id: 2, reference: "ATT-2025-002", type: "TRAVAIL", agent: "Marie Kabongo", matricule: "PR-2021-112", service: "Secrétariat Général", date_generation: "2025-02-22", status: "VALIDEE", objet: "Dossier administratif" },
  { id: 3, reference: "ATT-2025-003", type: "SALAIRE", agent: "Patrick Ilunga", matricule: "PR-2019-078", service: "Direction Financière", date_generation: "2025-02-25", status: "GENEREE", objet: "Bail de location" },
  { id: 4, reference: "ATT-2025-004", type: "SERVICE", agent: "Sophie Mbuyi", matricule: "PR-2022-033", service: "Cabinet du Président", date_generation: "2025-02-26", status: "GENEREE" },
  { id: 5, reference: "ATT-2025-005", type: "CONGE", agent: "David Kasongo", matricule: "PR-2020-091", service: "Direction des Ressources Humaines", date_generation: "2025-02-27", status: "VALIDEE", objet: "Voyage personnel" },
];

const mockAgents = [
  { name: "Jean Mukendi", matricule: "PR-2020-045", service: "Direction Administrative", grade: "Attaché de Bureau 1ère classe", date_engagement: "15/03/2020" },
  { name: "Marie Kabongo", matricule: "PR-2021-112", service: "Secrétariat Général", grade: "Secrétaire Administrative", date_engagement: "01/06/2021" },
  { name: "Patrick Ilunga", matricule: "PR-2019-078", service: "Direction Financière", grade: "Comptable Principal", date_engagement: "10/01/2019" },
  { name: "Sophie Mbuyi", matricule: "PR-2022-033", service: "Cabinet du Président", grade: "Conseillère", date_engagement: "20/09/2022" },
  { name: "David Kasongo", matricule: "PR-2020-091", service: "Direction des Ressources Humaines", grade: "Gestionnaire RH", date_engagement: "05/04/2020" },
];

export default function AttestationsList() {
  const { toast } = useToast();
  const [attestations, setAttestations] = useState<Attestation[]>(mockAttestations);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAttestation, setPreviewAttestation] = useState<Attestation | null>(null);

  // Form state
  const [formType, setFormType] = useState<AttestationType>("SERVICE");
  const [formAgent, setFormAgent] = useState("");
  const [formObjet, setFormObjet] = useState("");

  const filtered = attestations.filter((a) => {
    const matchSearch = a.agent.toLowerCase().includes(search.toLowerCase()) ||
      a.reference.toLowerCase().includes(search.toLowerCase()) ||
      a.matricule.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "ALL" || a.type === typeFilter;
    return matchSearch && matchType;
  });

  const stats = {
    total: attestations.length,
    generees: attestations.filter((a) => a.status === "GENEREE").length,
    validees: attestations.filter((a) => a.status === "VALIDEE").length,
    remises: attestations.filter((a) => a.status === "REMISE").length,
  };

  const handleGenerate = () => {
    if (!formAgent) return;
    const agent = mockAgents.find((a) => a.name === formAgent);
    if (!agent) return;

    const newRef = `ATT-2025-${String(attestations.length + 1).padStart(3, "0")}`;
    const newAttestation: Attestation = {
      id: attestations.length + 1,
      reference: newRef,
      type: formType,
      agent: agent.name,
      matricule: agent.matricule,
      service: agent.service,
      date_generation: format(new Date(), "yyyy-MM-dd"),
      status: "GENEREE",
      objet: formObjet || undefined,
    };

    setAttestations([newAttestation, ...attestations]);
    setDialogOpen(false);
    setFormType("SERVICE");
    setFormAgent("");
    setFormObjet("");
    toast({ title: "Attestation générée", description: `${typeLabels[formType]} pour ${agent.name} — ${newRef}` });
  };

  const handleValidate = (id: number) => {
    setAttestations((prev) => prev.map((a) => a.id === id ? { ...a, status: "VALIDEE" as AttestationStatus } : a));
    toast({ title: "Attestation validée" });
  };

  const handleMarkRemise = (id: number) => {
    setAttestations((prev) => prev.map((a) => a.id === id ? { ...a, status: "REMISE" as AttestationStatus } : a));
    toast({ title: "Attestation marquée comme remise" });
  };

  const handlePreview = (att: Attestation) => {
    setPreviewAttestation(att);
    setPreviewOpen(true);
  };

  const agentDetails = previewAttestation ? mockAgents.find((a) => a.name === previewAttestation.agent) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attestations</h1>
          <p className="text-sm text-muted-foreground mt-1">Génération et suivi des attestations administratives</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Générer une attestation</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Nouvelle attestation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Type d'attestation</Label>
                <Select value={formType} onValueChange={(v) => setFormType(v as AttestationType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Agent</Label>
                <Select value={formAgent} onValueChange={setFormAgent}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner un agent" /></SelectTrigger>
                  <SelectContent>
                    {mockAgents.map((a) => (
                      <SelectItem key={a.matricule} value={a.name}>
                        {a.name} — {a.matricule}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Objet / Motif <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                <Input value={formObjet} onChange={(e) => setFormObjet(e.target.value)} placeholder="Ex: Demande de prêt bancaire" />
              </div>
              <Button onClick={handleGenerate} disabled={!formAgent} className="w-full gap-2">
                <FileText className="h-4 w-4" /> Générer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, icon: FileBadge, color: "text-primary" },
          { label: "Générées", value: stats.generees, icon: Clock, color: "text-muted-foreground" },
          { label: "Validées", value: stats.validees, icon: FileCheck, color: "text-chart-3" },
          { label: "Remises", value: stats.remises, icon: CheckCircle2, color: "text-chart-4" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl bg-muted ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par nom, référence…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-52"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les types</SelectItem>
              {Object.entries(typeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead className="hidden md:table-cell">Service</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Aucune attestation trouvée</TableCell></TableRow>
              ) : (
                filtered.map((att) => (
                  <TableRow key={att.id}>
                    <TableCell className="font-mono text-xs">{att.reference}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeColors[att.type]}`}>
                        {typeLabels[att.type].replace("Attestation de ", "").replace("Attestation d'", "")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm text-foreground">{att.agent}</p>
                        <p className="text-xs text-muted-foreground">{att.matricule}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{att.service}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {format(new Date(att.date_generation), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[att.status].variant}>{statusConfig[att.status].label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePreview(att)} title="Aperçu">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {att.status === "GENEREE" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-chart-3" onClick={() => handleValidate(att.id)} title="Valider">
                            <FileCheck className="h-4 w-4" />
                          </Button>
                        )}
                        {att.status === "VALIDEE" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-chart-4" onClick={() => handleMarkRemise(att.id)} title="Marquer remise">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Aperçu — {previewAttestation?.reference}
            </DialogTitle>
          </DialogHeader>
          {previewAttestation && agentDetails && (
            <div className="border rounded-xl p-8 bg-card space-y-6 text-sm">
              {/* Document header */}
              <div className="text-center space-y-1 border-b pb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">République Démocratique du Congo</p>
                <p className="text-xs text-muted-foreground">Présidence de la République</p>
                <p className="text-xs text-muted-foreground">Direction des Ressources Humaines</p>
                <h2 className="text-lg font-bold text-foreground mt-4 uppercase tracking-wide">
                  {typeLabels[previewAttestation.type]}
                </h2>
                <p className="text-xs text-muted-foreground">Réf : {previewAttestation.reference}</p>
              </div>

              {/* Body */}
              <div className="space-y-4 leading-relaxed text-foreground">
                <p>
                  Je soussigné, <strong>Directeur des Ressources Humaines</strong> de la Présidence de la République,
                  atteste par la présente que :
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1.5">
                  <p><span className="text-muted-foreground">Nom complet :</span> <strong>{agentDetails.name}</strong></p>
                  <p><span className="text-muted-foreground">Matricule :</span> <strong>{agentDetails.matricule}</strong></p>
                  <p><span className="text-muted-foreground">Grade :</span> <strong>{agentDetails.grade}</strong></p>
                  <p><span className="text-muted-foreground">Service :</span> <strong>{agentDetails.service}</strong></p>
                  <p><span className="text-muted-foreground">Date d'engagement :</span> <strong>{agentDetails.date_engagement}</strong></p>
                </div>
                {previewAttestation.type === "SERVICE" && (
                  <p>est en service actif au sein de notre institution depuis le <strong>{agentDetails.date_engagement}</strong> et y exerce ses fonctions de manière régulière et continue à ce jour.</p>
                )}
                {previewAttestation.type === "TRAVAIL" && (
                  <p>travaille effectivement au sein de notre institution en qualité de <strong>{agentDetails.grade}</strong> au service <strong>{agentDetails.service}</strong>.</p>
                )}
                {previewAttestation.type === "SALAIRE" && (
                  <p>perçoit régulièrement sa rémunération mensuelle au titre de ses fonctions de <strong>{agentDetails.grade}</strong>.</p>
                )}
                {previewAttestation.type === "CONGE" && (
                  <p>bénéficie d'un congé dûment autorisé conformément à la réglementation en vigueur.</p>
                )}
                {previewAttestation.objet && (
                  <p>La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit, notamment pour : <strong>{previewAttestation.objet}</strong>.</p>
                )}
                {!previewAttestation.objet && (
                  <p>La présente attestation est délivrée à l'intéressé(e) pour servir et valoir ce que de droit.</p>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-end pt-6 border-t">
                <p className="text-xs text-muted-foreground">
                  Fait à Kinshasa, le {format(new Date(previewAttestation.date_generation), "dd MMMM yyyy", { locale: fr })}
                </p>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Le Directeur des Ressources Humaines</p>
                  <div className="h-12" />
                  <p className="text-xs font-semibold text-foreground">___________________________</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Imprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
