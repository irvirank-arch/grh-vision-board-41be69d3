import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="hidden sm:block">
                <span className="text-sm font-medium text-foreground">
                  Bienvenue, {user?.first_name || user?.username}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {roleLabels[user?.role || ""] || ""}
                  {user?.service ? ` — ${user.service.name}` : ""}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <img src="/logos/Icon_PR_2.png" alt="RDC" className="h-8 w-8 object-contain opacity-60" />
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
