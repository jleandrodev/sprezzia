"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/app/_lib/api";

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
}

export function useProjectStats() {
  const { data: stats, isLoading } = useQuery<ProjectStats>({
    queryKey: ["project-stats"],
    queryFn: async () => {
      const response = await api.get("/api/projects/stats");
      return response.data;
    },
  });

  return {
    stats: stats || { totalProjects: 0, activeProjects: 0 },
    isLoading,
  };
}
