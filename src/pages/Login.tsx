import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(216,45%,12%)] via-[hsl(216,50%,18%)] to-[hsl(216,40%,10%)]" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-secondary/8 blur-[100px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent/6 blur-[120px]" />
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-secondary/0 via-secondary/50 to-secondary/0" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-12"
        >
          <div className="flex items-center justify-center gap-6 mb-10">
            <div className="relative">
              <div className="absolute -inset-3 rounded-2xl bg-secondary/10 blur-xl" />
              <img src="/logos/Icon_PR_1.png" alt="Présidence RDC" className="relative h-24 w-24 object-contain" />
            </div>
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            <img src="/logos/Logo_RH_3.png" alt="GRH Logo" className="h-16 object-contain" style={{ mixBlendMode: 'lighten' }} />
          </div>
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="h-px w-10 bg-secondary" />
            <span className="text-secondary text-[10px] font-semibold uppercase tracking-[0.2em]">
              Présidence de la République
            </span>
            <div className="h-px w-10 bg-secondary" />
          </div>
          <h1 className="text-4xl font-serif text-white mb-4 leading-tight">
            Gestion des{" "}
            <span className="italic text-secondary">Ressources</span>
            <br />
            Humaines
          </h1>
          <p className="text-white/50 text-base max-w-md mx-auto leading-relaxed">
            Plateforme institutionnelle de gestion du personnel de la Présidence de la République Démocratique du Congo
          </p>
          <div className="mt-10 flex items-center justify-center gap-2">
            <div className="h-1 w-10 rounded-full bg-secondary" />
            <div className="h-1 w-5 rounded-full bg-accent" />
            <div className="h-1 w-5 rounded-full bg-white/20" />
          </div>
          <div className="mt-8 flex items-center justify-center gap-1.5 text-white/25 text-[10px]">
            <Shield className="h-3 w-3" />
            <span>Accès restreint au personnel autorisé</span>
          </div>
        </motion.div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center justify-center gap-4 mb-8">
            <img src="/logos/Icon_PR_1.png" alt="Présidence RDC" className="h-16 w-16 object-contain" />
            <img src="/logos/Logo_RH_1.png" alt="GRH Logo" className="h-12 object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-serif text-foreground">Connexion</h2>
            <p className="text-muted-foreground mt-2">
              Accédez à votre espace de gestion
            </p>
          </div>

          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Entrez votre identifiant"
                      className="pl-10"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20"
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
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-8">
            © {new Date().getFullYear()} Présidence de la République Démocratique du Congo
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
