import { useState, useEffect, useCallback } from 'react';

export interface SoldierFromAPI {
  id: string;
  name: string;
  rankId: number | null;
  division: string;
  position: string | null;
  discord: string | null;
  status: string;
  warnings: number;
  medalsCount: number;
  joinDate: string;
  avatar: string;
  userId: string | null;
  isMember: boolean;
}

export function useSoldiers() {
  const [soldiers, setSoldiers] = useState<SoldierFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSoldiers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/soldiers');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch soldiers');
      }
      setSoldiers(data.soldiers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSoldiers();
  }, [fetchSoldiers]);

  return {
    soldiers,
    loading,
    error,
    refetch: fetchSoldiers,
  };
}
