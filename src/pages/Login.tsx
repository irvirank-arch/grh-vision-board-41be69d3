import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, User, AlertCircle, Loader2, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch {
      setError("Identifiants incorrects. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-foreground">
      {/* Left panel — immersive brand wall */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Deep blue gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(216,45%,12%)] via-[hsl(216,50%,18%)] to-[hsl(216,40%,10%)]" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-secondary/0 via-secondary/60 to-secondary/0" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full p-12">
          {/* Top: Logos */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-5"
          >
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-secondary/10 blur-xl" />
              <img src="/logos/Icon_PR_1.png" alt="Présidence RDC" className="relative h-16 w-16 object-contain" />
            </div>
            <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <img src="/logos/Logo_RH_3.png" alt="GRH" className="h-10 object-contain brightness-0 invert opacity-90" />
          </motion.div>

          {/* Center: Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-lg"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-12 bg-secondary" />
              <span className="text-secondary text-xs font-semibold uppercase tracking-[0.2em]">
                Présidence de la République
              </span>
            </div>
            <h1 className="text-5xl font-serif text-white leading-[1.1] mb-6">
              Gestion des{" "}
              <span className="italic text-secondary">Ressources</span>
              <br />
              Humaines
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Plateforme institutionnelle de gestion du personnel de la Présidence de la République Démocratique du Congo.
            </p>

            {/* Stats preview */}
            <div className="mt-10 grid grid-cols-3 gap-6">
              {[
                { label: "Services", value: "55" },
                { label: "Agents actifs", value: "342" },
                { label: "Modules", value: "6" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                >
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/40 text-xs mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom: Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center gap-2 text-white/30 text-xs"
          >
            <Shield className="h-3 w-3" />
            <span>Système sécurisé — Accès restreint au personnel autorisé</span>
          </motion.div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center bg-background relative">
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-sm px-8"
        >
          {/* Mobile logos */}
          <div className="lg:hidden flex items-center justify-center gap-4 mb-10">
            <img src="/logos/Icon_PR_1.png" alt="Présidence RDC" className="h-14 w-14 object-contain" />
            <img src="/logos/Logo_RH_1.png" alt="GRH" className="h-10 object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-serif text-foreground">Connexion</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Identifiez-vous pour accéder à votre espace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-3.5 rounded-lg bg-accent/8 border border-accent/20 text-accent text-sm"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Nom d'utilisateur
              </Label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Entrez votre identifiant"
                  className="pl-10 h-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 text-sm"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Mot de passe
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe"
                  className="pl-10 h-12 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30 text-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-sm font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          <div className="mt-12 pt-6 border-t border-border/50 text-center">
            <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
              République Démocratique du Congo
              <br />
              Présidence de la République — © {new Date().getFullYear()}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
