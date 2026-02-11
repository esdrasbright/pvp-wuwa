import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type MatchResponse } from "@shared/routes";
import { insertMatchSchema } from "@shared/schema";
import { z } from "zod";

type CreateMatchInput = z.infer<typeof insertMatchSchema>;

export function useMatches() {
  return useQuery<MatchResponse[]>({
    queryKey: [api.matches.list.path],
    queryFn: async () => {
      const res = await fetch(api.matches.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch matches");
      return await res.json();
    },
  });
}

export function useMatch(id: number) {
  return useQuery<MatchResponse>({
    queryKey: [api.matches.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.matches.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch match");
      return await res.json();
    },
    enabled: !!id,
    refetchInterval: 1000, // Poll every second for updates if socket fails or as backup
  });
}

export function useCreateMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMatchInput) => {
      const res = await fetch(api.matches.create.path, {
        method: api.matches.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create match");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.matches.list.path] });
    },
  });
}

export function useJoinMatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.matches.join.path, { id });
      const res = await fetch(url, {
        method: api.matches.join.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to join match");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.matches.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.matches.get.path, data.id] });
    },
  });
}
