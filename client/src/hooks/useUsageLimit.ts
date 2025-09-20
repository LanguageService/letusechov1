import { useQuery } from "@tanstack/react-query";
import type { UsageLimitResponse } from "@shared/schema";

export function useUsageLimit() {
  const { data: usageInfo, isLoading, refetch } = useQuery<UsageLimitResponse>({
    queryKey: ["/api/usage-limit"],
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    usageInfo,
    isLoading,
    refetch,
    canTranslate: usageInfo?.canTranslate ?? true,
    remainingTranslations: usageInfo?.remainingTranslations ?? -1,
    isAuthenticated: usageInfo?.isAuthenticated ?? false,
    limitMessage: usageInfo?.limitMessage,
  };
}