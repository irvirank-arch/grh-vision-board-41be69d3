import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { Search, Eye, Users, UserCheck, UserX, Download, Filter } from "lucide-react";

const mockAgents = [
  { id: 1, lastName: "MONZELE", firstName: "Marie", postName: "Kabedi", service: "Cabinet du Président", grade: "Directeur", status: "actif", phone: "+243 812 345 678", email: "m.monzele@presidence.cd", startDate: "2019-03-15" },
  { id: 2, lastName: "KABONGO", firstName: "Jean", postName: "Mwamba", service: "Conseillers Spéciaux", grade: "Conseiller", status: "actif", phone: "+243 823 456 789", email: "j.kabongo@presidence.cd", startDate: "2020-06-01" },
  { id: 3, lastName: "LUKUSA", firstName: "Patrick", postName: "Ilunga", service: "Secrétariat Particulier", grade: "Chef de Bureau", status: "congé", phone: "+243 834 567 890", email: "p.lukusa@presidence.cd", startDate: "2018-11-20" },
  { id: 4, lastName: "MBUYI", firstName: "Anne", postName: "Tshala", service: "Protocole", grade: "Attaché", status: "actif", phone: "+243 845 678 901", email: "a.mbuyi@presidence.cd", startDate: "2021-01-10" },
  { id: 5, lastName: "TSHIMANGA", firstName: "David", postName: "Kasongo", service: "Conseillers Techniques", grade: "Conseiller", status: "mission", phone: "+243 856 789 012", email: "d.tshimanga@presidence.cd", startDate: "2017-08-05" },
  { id: 6, lastName: "NGALULA", firstName: "Grace", postName: "Mbombo", service: "Attachés de Presse", grade: "Chef de Division", status: "actif", phone: "+243 867 890 123", email: "g.ngalula@presidence.cd", startDate: "2022-04-18" },
  { id: 7, lastName: "KALALA", firstName: "Pierre", postName: "Mutombo", service: "Comptabilité", grade: "Agent", status: "inactif", phone: "+243 878 901 234", email: "p.kalala@presidence.cd", startDate: "2016-02-28" },
  { id: 8, lastName: "MULUNDA", firstName: "Sophie", postName: "Kayembe", service: "Cabinet du Président", grade: "Directeur", status: "actif", phone: "+243 889 012 345", email: "s.mulunda@presidence.cd", startDate: "2020-09-12" },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  actif: { label: "Actif", variant: "default", color: "bg-success/10 text-success" },
  congé: { label: "En congé", variant: "secondary", color: "bg-secondary/10 text-secondary" },
  mission: { label: "En mission", variant: "outline", color: "bg-info/10 text-info" },
  inactif: { label: "Inactif", variant: "destructive", color: "bg-destructive/10 text-destructive" },
};

const services = [
  "Cabinet du Président", "Conseillers Spéciaux", "Conseillers Techniques",
  "Secrétariat Particulier", "Protocole", "Attachés de Presse", "Comptabilité",
];

const AgentsList = () => {
  const [search, setSearch] = useState("");
  const [filterService, setFilterService] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  const filtered = mockAgents.filter((a) => {
    const matchSearch = `${a.lastName} ${a.firstName} ${a.postName}`.toLowerCase().includes(search.toLowerCase())
      || a.service.toLowerCase().includes(search.toLowerCase());
    const matchService = filterService === "all" || a.service === filterService;
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchService && matchStatus;
  });

  const getInitials = (a: typeof mockAgents[0]) =>
    `${a.firstName[0]}${a.lastName[0]}`.toUpperCase();

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-serif text-foreground">Agents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Répertoire du personnel de la Présidence</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exporter
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: "Total", value: mockAgents.length, icon: Users, bg: "bg-primary/10 text-primary" },
          { label: "Actifs", value: mockAgents.filter((a) => a.status === "actif").length, icon: UserCheck, bg: "bg-success/10 text-success" },
          { label: "En congé", value: mockAgents.filter((a) => a.status === "congé").length, icon: Filter, bg: "bg-secondary/10 text-secondary" },
          { label: "Inactifs", value: mockAgents.filter((a) => a.status === "inactif").length, icon: UserX, bg: "bg-destructive/10 text-destructive" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
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
              <Input
                placeholder="Rechercher par nom ou service..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les services</SelectItem>
                {services.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="congé">En congé</SelectItem>
                <SelectItem value="mission">En mission</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Prise de service</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((agent, i) => (
                <motion.tr
                  key={agent.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {getInitials(agent)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {agent.lastName} {agent.firstName}
                        </p>
                        <p className="text-xs text-muted-foreground">{agent.postName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{agent.service}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{agent.grade}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[agent.status]?.color}`}>
                      {statusConfig[agent.status]?.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(agent.startDate).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/agents/${agent.id}`); }}>
                      <Eye className="h-3.5 w-3.5 mr-1" /> Fiche
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Aucun agent trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentsList;
