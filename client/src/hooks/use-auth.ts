import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type UserResponse, type UpdateBoxInput } from "@shared/routes";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<UserResponse>({
    queryKey: [api.auth.me.path],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return { user, isLoading, error, isAuthenticated: !!user };
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, { 
        method: api.auth.logout.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      window.location.href = "/";
    },
  });
}

export function useUpdateBox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateBoxInput) => {
      const res = await fetch(api.users.updateBox.path, {
        method: api.users.updateBox.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update box");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.auth.me.path], data);
    },
  });
}
