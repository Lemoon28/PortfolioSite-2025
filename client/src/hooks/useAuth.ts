import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logout = async () => {
    try {
      // Clear auth cache first
      queryClient.setQueryData(["/api/auth/user"], null);
      
      // Call logout endpoint
      const response = await fetch("/api/logout", {
        method: "GET",
        credentials: "include",
      });
      
      // Force redirect to home page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if logout fails
      window.location.href = "/";
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    logout,
  };
}
