import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const REFRESH_INTERVAL = 60; // seconds

export interface RefreshState {
  secondsLeft: number;
  isRefreshing: boolean;
  lastRefreshed: Date | null;
  refreshNow: () => void;
}

export function useRefreshManager(): RefreshState {
  const queryClient = useQueryClient();
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_INTERVAL);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Use a ref for the in-progress guard so it's always current
  const refreshingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setIsRefreshing(true);
    setSecondsLeft(REFRESH_INTERVAL);

    try {
      await queryClient.invalidateQueries();
      // Wait for all active queries to finish refetching
      await queryClient.refetchQueries({ type: "active" });
    } finally {
      refreshingRef.current = false;
      setIsRefreshing(false);
      setLastRefreshed(new Date());
    }
  }, [queryClient]);

  useEffect(() => {
    // Countdown tick every second
    const tick = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Trigger refresh without blocking the interval
          refresh();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, [refresh]);

  return { secondsLeft, isRefreshing, lastRefreshed, refreshNow: refresh };
}
