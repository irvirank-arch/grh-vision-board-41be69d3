import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();

  const roleLabels: Record<string, string> = {
    SUPERADMIN: "Super Admin",
    SERVICE_ADMIN: "Admin Service",
    ADMIN_SYSTEM: "Admin Système",
    HR_MANAGER: "Responsable RH",
    AGENT: "Agent",
  };

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : "Admin Cabinet PR";
  const displayRole = roleLabels[user?.role || "SUPERADMIN"];

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || "AD"
    : "AD";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 flex items-center justify-between border-b bg-card px-5 shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground" />
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                <Input
                  placeholder="Rechercher…"
                  className="pl-9 h-9 w-56 bg-muted/50 border-0 text-sm focus-visible:ring-1 focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-card" />
              </button>

              {/* User info */}
              <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-border">
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="text-[10px] text-muted-foreground">{displayRole}</p>
                </div>
                <Avatar className="h-9 w-9 ring-2 ring-primary/10">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
              </div>

              {/* PR icon */}
              <img src="/logos/Icon_PR_2.png" alt="RDC" className="h-9 w-9 object-contain hidden lg:block opacity-40" />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
