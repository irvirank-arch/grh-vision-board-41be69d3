import {
  LayoutDashboard, Users, UserPlus, CalendarDays, Plane, FileText, Settings, LogOut,
  ChevronDown, Search, Bell,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainNav = [
  { title: "Tableau de Bord", url: "/dashboard", icon: LayoutDashboard },
  { title: "Agents", url: "/agents", icon: Users },
  { title: "Congés", url: "/leave", icon: CalendarDays },
  { title: "Missions", url: "/missions", icon: Plane },
  { title: "Attestations", url: "/attestations", icon: FileText },
  { title: "Recrutement", url: "/recruitment", icon: UserPlus },
];

const adminNav = [
  { title: "Configuration", url: "/settings/services", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));
  const isAdmin = user?.role === "SUPERADMIN" || user?.role === "ADMIN_SYSTEM";

  const initials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || user.username[0].toUpperCase()
    : "AD";

  const roleLabels: Record<string, string> = {
    SUPERADMIN: "Super Admin",
    SERVICE_ADMIN: "Admin Service",
    ADMIN_SYSTEM: "Admin Système",
    HR_MANAGER: "Responsable RH",
    AGENT: "Agent",
  };

  return (
    <Sidebar collapsible="icon" className="backdrop-blur-xl bg-sidebar/95 border-r border-white/[0.06]">
      <SidebarHeader className="p-5 pb-6">
        <div className="flex items-center gap-3">
          <img src="/logos/Logo_RH_2.png" alt="GRH" className="h-9 w-9 object-contain shrink-0" />
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-bold text-sm text-sidebar-foreground block tracking-wide">
                GRH
              </span>
              <span className="text-[10px] text-sidebar-foreground/40 block">
                Présidence RDC
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-sidebar-foreground/30 text-[10px] font-semibold uppercase tracking-[0.15em] px-3 mb-1">
              Menu
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink
                        to={item.url}
                        className={`relative text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 ${
                          active ? "bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/30" : ""
                        }`}
                        activeClassName=""
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/30 text-[10px] font-semibold uppercase tracking-[0.15em] px-3 mb-1">
                Admin
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active}>
                        <NavLink
                          to={item.url}
                          className={`text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 ${
                            active ? "bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/30" : ""
                          }`}
                          activeClassName=""
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full rounded-lg p-2.5 hover:bg-sidebar-accent transition-colors text-left">
              <Avatar className="h-8 w-8 shrink-0 ring-2 ring-sidebar-primary/30">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-sidebar-foreground truncate">
                      {user?.first_name || "Admin"} {user?.last_name || ""}
                    </p>
                    <p className="text-[10px] text-sidebar-foreground/40 truncate">
                      {roleLabels[user?.role || "SUPERADMIN"]}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-sidebar-foreground/30 shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
