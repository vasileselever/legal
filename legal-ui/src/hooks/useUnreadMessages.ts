import { useState, useEffect, useCallback } from 'react';
import { leadService } from '../api/leadService';

const POLL_INTERVAL_MS = 30_000;

export function useUnreadMessages() {
  const [count, setCount] = useState(0);

  const fetch = useCallback(async () => {
    try {
      const n = await leadService.getUnreadCount();
      setCount(n);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetch]);

  return { count, refresh: fetch };
}
