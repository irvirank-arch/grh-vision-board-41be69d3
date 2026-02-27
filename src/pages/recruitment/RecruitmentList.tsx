import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { motion } from "framer-motion";
import { Plus, Search, Eye, Filter, UserPlus } from "lucide-react";

const mockRecruits = [
  { id: 1, name: "MONZELE Marie", service: "Cabinet du Président", step: 4, status: "complet", date: "2025-06-15" },
  { id: 2, name: "KABONGO Jean", service: "Conseillers Spéciaux", step: 2, status: "en_cours", date: "2025-06-18" },
  { id: 3, name: "LUKUSA Patrick", service: "Secrétariat Particulier", step: 1, status: "en_cours", date: "2025-06-20" },
  { id: 4, name: "MBUYI Anne", service: "Protocole", step: 4, status: "complet", date: "2025-06-10" },
  { id: 5, name: "TSHIMANGA David", service: "Conseillers Techniques", step: 3, status: "en_cours", date: "2025-06-22" },
  { id: 6, name: "NGALULA Grace", service: "Attachés de Presse", step: 4, status: "validé", date: "2025-06-08" },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  en_cours: { label: "En cours", variant: "secondary" },
  complet: { label: "Complet", variant: "default" },
  validé: { label: "Validé", variant: "outline" },
};

const stepLabels = ["Identité", "Famille", "Études", "Affectation"];

const RecruitmentList = () => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();

  const filtered = mockRecruits.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.service.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-serif text-foreground">Recrutement</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestion des nouvelles recrues</p>
        </div>
        <Button onClick={() => navigate("/recruitment/new")} className="shadow-lg">
          <Plus className="h-4 w-4 mr-2" /> Nouvelle Recrue
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: "Total", value: mockRecruits.length, icon: UserPlus, bg: "bg-primary/10 text-primary" },
          { label: "En cours", value: mockRecruits.filter((r) => r.status === "en_cours").length, icon: Filter, bg: "bg-secondary/10 text-secondary" },
          { label: "Validées", value: mockRecruits.filter((r) => r.status === "validé").length, icon: Eye, bg: "bg-success/10 text-success" },
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

      {/* Filters */}
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="complet">Complet</SelectItem>
                <SelectItem value="validé">Validé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom Complet</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Étape</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((recruit, i) => (
                <motion.tr
                  key={recruit.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium text-foreground">{recruit.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{recruit.service}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground">{recruit.step}/4</span>
                      <span className="text-xs text-muted-foreground">— {stepLabels[recruit.step - 1]}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[recruit.status]?.variant || "outline"}>
                      {statusConfig[recruit.status]?.label || recruit.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(recruit.date).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      <Eye className="h-3.5 w-3.5 mr-1" /> Voir
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    Aucune recrue trouvée
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

export default RecruitmentList;
