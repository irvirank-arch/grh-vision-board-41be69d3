import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, GraduationCap,
  Briefcase, Clock, FileText, Edit,
} from "lucide-react";

// Mock — in real app this comes from API
const mockAgent = {
  id: 1,
  lastName: "MONZELE",
  firstName: "Marie",
  postName: "Kabedi",
  gender: "F",
  birthDate: "1985-04-12",
  birthPlace: "Kinshasa",
  maritalStatus: "Mariée",
  phone: "+243 812 345 678",
  email: "m.monzele@presidence.cd",
  province: "Kinshasa",
  commune: "Gombe",
  avenue: "Av. de la Libération",
  service: "Cabinet du Président",
  grade: "Directeur",
  function: "Directrice Administrative",
  matricule: "PR-2019-0342",
  startDate: "2019-03-15",
  status: "actif",
  studyLevel: "Licence",
  studyField: "Droit Public",
  institution: "Université de Kinshasa",
  languages: "Français, Lingala, Anglais",
  childrenCount: 3,
  spouseName: "MONZELE Jean-Pierre",
  emergencyContact: "KABEDI Louise — +243 890 123 456",
  leaves: [
    { type: "Congé annuel", start: "2024-12-20", end: "2025-01-05", status: "approuvé" },
    { type: "Congé maladie", start: "2024-08-10", end: "2024-08-14", status: "approuvé" },
  ],
  missions: [
    { destination: "Bruxelles, Belgique", start: "2024-11-01", end: "2024-11-07", status: "terminée" },
  ],
  audit: [
    { action: "Fiche mise à jour", by: "Admin Système", date: "2025-06-20 14:30" },
    { action: "Congé approuvé", by: "RH Manager", date: "2024-12-18 09:15" },
    { action: "Affectation modifiée", by: "Super Admin", date: "2024-06-01 11:00" },
    { action: "Création du dossier", by: "Admin Système", date: "2019-03-15 08:00" },
  ],
};

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  </div>
);

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const agent = mockAgent; // In real app: fetch by id

  const initials = `${agent.firstName[0]}${agent.lastName[0]}`;

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      {/* Back */}
      <Button variant="ghost" onClick={() => navigate("/agents")} className="gap-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Retour à la liste
      </Button>

      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <Avatar className="h-20 w-20 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-serif text-foreground">
                      {agent.lastName} {agent.firstName} {agent.postName}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">{agent.function} — {agent.service}</p>
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <Badge variant="default" className="bg-success/15 text-success border-0">Actif</Badge>
                      <span className="text-xs text-muted-foreground">Matricule: <strong>{agent.matricule}</strong></span>
                      <span className="text-xs text-muted-foreground">Grade: <strong>{agent.grade}</strong></span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                    <Edit className="h-3.5 w-3.5" /> Modifier
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="leaves">Congés</TabsTrigger>
            <TabsTrigger value="missions">Missions</TabsTrigger>
            <TabsTrigger value="audit">Historique</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold font-sans">Identité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <InfoRow icon={Calendar} label="Date de naissance" value={`${new Date(agent.birthDate).toLocaleDateString("fr-FR")} — ${agent.birthPlace}`} />
                  <InfoRow icon={FileText} label="État civil" value={agent.maritalStatus} />
                  <InfoRow icon={Phone} label="Téléphone" value={agent.phone} />
                  <InfoRow icon={Mail} label="Email" value={agent.email} />
                  <InfoRow icon={MapPin} label="Adresse" value={`${agent.avenue}, ${agent.commune}, ${agent.province}`} />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold font-sans">Affectation & Études</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <InfoRow icon={Building2} label="Service" value={agent.service} />
                  <InfoRow icon={Briefcase} label="Fonction / Grade" value={`${agent.function} — ${agent.grade}`} />
                  <InfoRow icon={Clock} label="Prise de service" value={new Date(agent.startDate).toLocaleDateString("fr-FR")} />
                  <Separator className="my-2" />
                  <InfoRow icon={GraduationCap} label="Études" value={`${agent.studyLevel} en ${agent.studyField}`} />
                  <InfoRow icon={GraduationCap} label="Établissement" value={agent.institution} />
                  <InfoRow icon={FileText} label="Langues" value={agent.languages} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Leaves Tab */}
          <TabsContent value="leaves">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Début</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Fin</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agent.leaves.map((l, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-4 font-medium text-foreground">{l.type}</td>
                        <td className="p-4 text-muted-foreground">{new Date(l.start).toLocaleDateString("fr-FR")}</td>
                        <td className="p-4 text-muted-foreground">{new Date(l.end).toLocaleDateString("fr-FR")}</td>
                        <td className="p-4"><Badge variant="outline" className="bg-success/10 text-success border-0">{l.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Missions Tab */}
          <TabsContent value="missions">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Destination</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Début</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Fin</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agent.missions.map((m, i) => (
                      <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                        <td className="p-4 font-medium text-foreground">{m.destination}</td>
                        <td className="p-4 text-muted-foreground">{new Date(m.start).toLocaleDateString("fr-FR")}</td>
                        <td className="p-4 text-muted-foreground">{new Date(m.end).toLocaleDateString("fr-FR")}</td>
                        <td className="p-4"><Badge variant="outline">{m.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {agent.audit.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div>
                        <p className="text-sm text-foreground font-medium">{entry.action}</p>
                        <p className="text-xs text-muted-foreground">par {entry.by} — {entry.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AgentDetail;
