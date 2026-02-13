import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// Dashboard Summary
export function useDashboardSummary() {
  return useQuery({
    queryKey: [api.dashboard.summary.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.summary.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard summary");
      return api.dashboard.summary.responses[200].parse(await res.json());
    },
    refetchInterval: 30000, // Refresh every 30s to simulate real-time
  });
}

// Campaigns
export function useCampaigns() {
  return useQuery({
    queryKey: [api.campaigns.list.path],
    queryFn: async () => {
      const res = await fetch(api.campaigns.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      return api.campaigns.list.responses[200].parse(await res.json());
    },
  });
}

export function useCampaignHealth() {
  return useQuery({
    queryKey: [api.campaigns.health.path],
    queryFn: async () => {
      const res = await fetch(api.campaigns.health.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch campaign health");
      return api.campaigns.health.responses[200].parse(await res.json());
    },
    refetchInterval: 15000,
  });
}

// Anomalies
export function useAnomalies() {
  return useQuery({
    queryKey: [api.anomalies.list.path],
    queryFn: async () => {
      const res = await fetch(api.anomalies.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch anomalies");
      return api.anomalies.list.responses[200].parse(await res.json());
    },
  });
}

// Recommendations
export function useRecommendations() {
  return useQuery({
    queryKey: [api.recommendations.list.path],
    queryFn: async () => {
      const res = await fetch(api.recommendations.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch recommendations");
      return api.recommendations.list.responses[200].parse(await res.json());
    },
  });
}

// Budget Simulator
export function useBudgetSimulation() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.simulation.run.path, {
        method: api.simulation.run.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to run simulation");
      return api.simulation.run.responses[200].parse(await res.json());
    },
  });
}

// AI Reports
export function useGenerateReport() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.reports.generate.path, {
        method: api.reports.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate report");
      return api.reports.generate.responses[200].parse(await res.json());
    },
  });
}
