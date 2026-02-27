import client from "@/lib/api-client";

export interface DashboardStats {
  total_agents: number;
  active_agents: number;
  inactive_agents: number;
  total_recruits: number;
  pending_recruits: number;
  pending_leave_requests: number;
  active_missions: number;
  services_count: number;
  agents_by_service?: Array<{ service: string; count: number }>;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await client.get("/dashboard/");
    return data;
  },
};
