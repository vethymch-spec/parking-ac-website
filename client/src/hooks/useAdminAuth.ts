import { trpc } from "@/lib/trpc";
import { useCallback } from "react";

export function useAdminAuth() {
  const utils = trpc.useUtils();
  const meQuery = trpc.adminAuth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const logoutMutation = trpc.adminAuth.logout.useMutation({
    onSuccess: async () => {
      utils.adminAuth.me.setData(undefined, null);
      await utils.adminAuth.me.invalidate();
    },
  });

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  return {
    admin: meQuery.data ?? null,
    isAdmin: Boolean(meQuery.data),
    loading: meQuery.isLoading,
    logout,
  };
}
