import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, User, Users, GraduationCap, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, label: "Identité", icon: User },
  { id: 2, label: "Famille", icon: Users },
  { id: 3, label: "Etudes faites", icon: GraduationCap },
  { id: 4, label: "Affectation", icon: Building2 },
];

const provinces = [
  "Kinshasa", "Kongo-Central", "Kwango", "Kwilu", "Mai-Ndombe",
  "Équateur", "Mongala", "Nord-Ubangi", "Sud-Ubangi", "Tshuapa",
  "Tshopo", "Bas-Uélé", "Haut-Uélé", "Ituri", "Nord-Kivu",
  "Sud-Kivu", "Maniema", "Haut-Katanga", "Haut-Lomami", "Lualaba",
  "Tanganyika", "Lomami", "Sankuru", "Kasaï", "Kasaï-Central", "Kasaï-Oriental",
];

const RecruitmentWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = () => {
    toast({
      title: "Recrue enregistrée",
      description: "La nouvelle recrue a été enregistrée avec succès.",
    });
    navigate("/recruitment");
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-foreground">Nouvelle Recrue</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Enregistrement d'un nouvel agent</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/recruitment")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Liste des recrues
        </Button>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, i) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : isCompleted
                    ? "bg-success/15 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                  isActive ? "bg-primary-foreground/20" : isCompleted ? "bg-success/20" : "bg-muted-foreground/20"
                }`}>
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : step.id}
                </span>
                {step.label}
              </button>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-1 transition-colors duration-300 ${
                  currentStep > step.id ? "bg-success" : "bg-border"
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Form */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {currentStep === 1 && <StepIdentity data={formData} onChange={updateField} />}
              {currentStep === 2 && <StepFamily data={formData} onChange={updateField} />}
              {currentStep === 3 && <StepStudies data={formData} onChange={updateField} />}
              {currentStep === 4 && <StepAssignment data={formData} onChange={updateField} />}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Précédent
        </Button>
        {currentStep < 4 ? (
          <Button onClick={nextStep}>
            Suivant <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-success hover:bg-success/90 text-success-foreground">
            <Check className="h-4 w-4 mr-2" /> Enregistrer la recrue
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Step Components ────────────────────────────────────────

interface StepProps {
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

const FormField = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
  <div className="space-y-1.5">
    <Label className="text-sm font-medium">
      {label} {required && <span className="text-destructive">*</span>}
    </Label>
    {children}
  </div>
);

const StepIdentity = ({ data, onChange }: StepProps) => (
  <div className="space-y-6">
    <h3 className="text-lg font-serif text-foreground">Identité de la Recrue</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label="Type de carte">
        <Select value={data.cardType || ""} onValueChange={(v) => onChange("cardType", v)}>
          <SelectTrigger><SelectValue placeholder="Type de carte" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="carte_electeur">Carte d'électeur</SelectItem>
            <SelectItem value="passeport">Passeport</SelectItem>
            <SelectItem value="carte_identite">Carte d'identité</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Numéro de carte">
        <Input placeholder="Numéro de carte" value={data.cardNumber || ""} onChange={(e) => onChange("cardNumber", e.target.value)} />
      </FormField>
      <FormField label="Sexe" required>
        <Select value={data.gender || ""} onValueChange={(v) => onChange("gender", v)}>
          <SelectTrigger><SelectValue placeholder="Sexe" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="M">Masculin</SelectItem>
            <SelectItem value="F">Féminin</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label="Nom" required>
        <Input placeholder="Nom" value={data.lastName || ""} onChange={(e) => onChange("lastName", e.target.value)} />
      </FormField>
      <FormField label="Postnom" required>
        <Input placeholder="Postnom" value={data.postName || ""} onChange={(e) => onChange("postName", e.target.value)} />
      </FormField>
      <FormField label="Prénom" required>
        <Input placeholder="Prénom" value={data.firstName || ""} onChange={(e) => onChange("firstName", e.target.value)} />
      </FormField>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label="État civil" required>
        <Select value={data.maritalStatus || ""} onValueChange={(v) => onChange("maritalStatus", v)}>
          <SelectTrigger><SelectValue placeholder="État civil" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="celibataire">Célibataire</SelectItem>
            <SelectItem value="marie">Marié(e)</SelectItem>
            <SelectItem value="divorce">Divorcé(e)</SelectItem>
            <SelectItem value="veuf">Veuf/Veuve</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Date de naissance" required>
        <Input type="date" value={data.birthDate || ""} onChange={(e) => onChange("birthDate", e.target.value)} />
      </FormField>
      <FormField label="Lieu de naissance">
        <Input placeholder="Lieu de naissance" value={data.birthPlace || ""} onChange={(e) => onChange("birthPlace", e.target.value)} />
      </FormField>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label="Téléphone">
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 bg-muted rounded-md text-sm text-muted-foreground shrink-0">
            🇨🇩 +243
          </div>
          <Input placeholder="Numéro" value={data.phone || ""} onChange={(e) => onChange("phone", e.target.value)} />
        </div>
      </FormField>
      <FormField label="Adresse Email" required>
        <Input type="email" placeholder="Adresse Email" value={data.email || ""} onChange={(e) => onChange("email", e.target.value)} />
      </FormField>
      <FormField label="Province">
        <Select value={data.province || ""} onValueChange={(v) => onChange("province", v)}>
          <SelectTrigger><SelectValue placeholder="Choisir la province" /></SelectTrigger>
          <SelectContent>
            {provinces.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label="Ville / Territoire">
        <Input placeholder="Ville / Territoire / District" value={data.city || ""} onChange={(e) => onChange("city", e.target.value)} />
      </FormField>
      <FormField label="Commune / Chefferie">
        <Input placeholder="Commune / Chefferie / Secteur" value={data.commune || ""} onChange={(e) => onChange("commune", e.target.value)} />
      </FormField>
      <FormField label="Quartier">
        <Input placeholder="Quartier" value={data.quarter || ""} onChange={(e) => onChange("quarter", e.target.value)} />
      </FormField>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label="Avenue">
        <Input placeholder="Avenue" value={data.avenue || ""} onChange={(e) => onChange("avenue", e.target.value)} />
      </FormField>
      <FormField label="Numéro">
        <Input placeholder="Numéro" value={data.houseNumber || ""} onChange={(e) => onChange("houseNumber", e.target.value)} />
      </FormField>
    </div>
  </div>
);

const StepFamily = ({ data, onChange }: StepProps) => (
  <div className="space-y-6">
    <h3 className="text-lg font-serif text-foreground">Informations Familiales</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label="Nom du père">
        <Input placeholder="Nom complet du père" value={data.fatherName || ""} onChange={(e) => onChange("fatherName", e.target.value)} />
      </FormField>
      <FormField label="Nom de la mère">
        <Input placeholder="Nom complet de la mère" value={data.motherName || ""} onChange={(e) => onChange("motherName", e.target.value)} />
      </FormField>
      <FormField label="Nombre d'enfants">
        <Input type="number" placeholder="0" value={data.childrenCount || ""} onChange={(e) => onChange("childrenCount", e.target.value)} />
      </FormField>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label="Nom du conjoint(e)">
        <Input placeholder="Nom complet" value={data.spouseName || ""} onChange={(e) => onChange("spouseName", e.target.value)} />
      </FormField>
      <FormField label="Profession du conjoint(e)">
        <Input placeholder="Profession" value={data.spouseProfession || ""} onChange={(e) => onChange("spouseProfession", e.target.value)} />
      </FormField>
      <FormField label="Personne de contact (urgence)">
        <Input placeholder="Nom et téléphone" value={data.emergencyContact || ""} onChange={(e) => onChange("emergencyContact", e.target.value)} />
      </FormField>
    </div>
  </div>
);

const StepStudies = ({ data, onChange }: StepProps) => (
  <div className="space-y-6">
    <h3 className="text-lg font-serif text-foreground">Études Faites</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label="Niveau d'études" required>
        <Select value={data.studyLevel || ""} onValueChange={(v) => onChange("studyLevel", v)}>
          <SelectTrigger><SelectValue placeholder="Niveau d'études" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="primaire">Primaire</SelectItem>
            <SelectItem value="secondaire">Secondaire</SelectItem>
            <SelectItem value="graduat">Graduat (Bac+3)</SelectItem>
            <SelectItem value="licence">Licence (Bac+5)</SelectItem>
            <SelectItem value="master">Master</SelectItem>
            <SelectItem value="doctorat">Doctorat</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Domaine d'études" required>
        <Input placeholder="Ex: Droit, Informatique..." value={data.studyField || ""} onChange={(e) => onChange("studyField", e.target.value)} />
      </FormField>
      <FormField label="Établissement">
        <Input placeholder="Nom de l'université / institut" value={data.institution || ""} onChange={(e) => onChange("institution", e.target.value)} />
      </FormField>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label="Année d'obtention">
        <Input type="number" placeholder="Ex: 2020" value={data.graduationYear || ""} onChange={(e) => onChange("graduationYear", e.target.value)} />
      </FormField>
      <FormField label="Autres diplômes">
        <Input placeholder="Diplômes supplémentaires" value={data.otherDiplomas || ""} onChange={(e) => onChange("otherDiplomas", e.target.value)} />
      </FormField>
      <FormField label="Langues parlées">
        <Input placeholder="Ex: Français, Lingala, Anglais" value={data.languages || ""} onChange={(e) => onChange("languages", e.target.value)} />
      </FormField>
    </div>
  </div>
);

const StepAssignment = ({ data, onChange }: StepProps) => (
  <div className="space-y-6">
    <h3 className="text-lg font-serif text-foreground">Affectation</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label="Service d'affectation" required>
        <Select value={data.service || ""} onValueChange={(v) => onChange("service", v)}>
          <SelectTrigger><SelectValue placeholder="Choisir le service" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="cabinet_pr">Cabinet du Président</SelectItem>
            <SelectItem value="conseillers_speciaux">Conseillers Spéciaux</SelectItem>
            <SelectItem value="conseillers_tech">Conseillers Techniques</SelectItem>
            <SelectItem value="secretariat">Secrétariat Particulier</SelectItem>
            <SelectItem value="protocole">Protocole</SelectItem>
            <SelectItem value="presse">Attachés de Presse</SelectItem>
            <SelectItem value="comptabilite">Comptabilité</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
      <FormField label="Fonction" required>
        <Input placeholder="Ex: Conseiller, Attaché..." value={data.function || ""} onChange={(e) => onChange("function", e.target.value)} />
      </FormField>
      <FormField label="Grade">
        <Select value={data.grade || ""} onValueChange={(v) => onChange("grade", v)}>
          <SelectTrigger><SelectValue placeholder="Choisir le grade" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="directeur">Directeur</SelectItem>
            <SelectItem value="chef_division">Chef de Division</SelectItem>
            <SelectItem value="chef_bureau">Chef de Bureau</SelectItem>
            <SelectItem value="attache">Attaché de Bureau</SelectItem>
            <SelectItem value="agent">Agent</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField label="Date de prise de service" required>
        <Input type="date" value={data.startDate || ""} onChange={(e) => onChange("startDate", e.target.value)} />
      </FormField>
      <FormField label="Numéro de matricule">
        <Input placeholder="Généré automatiquement" value={data.matricule || ""} onChange={(e) => onChange("matricule", e.target.value)} disabled />
      </FormField>
      <FormField label="Observations">
        <Input placeholder="Notes supplémentaires" value={data.observations || ""} onChange={(e) => onChange("observations", e.target.value)} />
      </FormField>
    </div>
  </div>
);

export default RecruitmentWizard;
