import client from "@/lib/api-client";

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "SUPERADMIN" | "SERVICE_ADMIN" | "ADMIN_SYSTEM" | "HR_MANAGER" | "AGENT";
  service?: { id: number; name: string } | null;
}

export const authApi = {
  login: async (username: string, password: string): Promise<AuthTokens> => {
    const { data } = await client.post("/auth/token/", { username, password });
    return data;
  },

  getMe: async (): Promise<UserProfile> => {
    const { data } = await client.get("/auth/me/");
    return data;
  },

  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    const { data } = await client.post("/auth/token/refresh/", { refresh });
    return data;
  },
};
