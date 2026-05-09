import { useState, useCallback } from 'react';

export function useProfile(triggerSound: (type: 'click') => void) {
  const [profileSoldierId, setProfileSoldierId] = useState<string | null>(null);
  const [profileMode, setProfileMode] = useState<'soldier' | 'me'>('soldier');

  const openSoldierProfile = useCallback((soldierId: string) => {
    setProfileSoldierId(soldierId);
    setProfileMode('soldier');
    triggerSound('click');
  }, [triggerSound]);

  const openMyProfile = useCallback(() => {
    setProfileMode('me');
    setProfileSoldierId(null);
    triggerSound('click');
  }, [triggerSound]);

  const closeProfile = useCallback(() => {
    setProfileSoldierId(null);
    setProfileMode('soldier');
  }, []);

  return {
    profileSoldierId,
    profileMode,
    openSoldierProfile,
    openMyProfile,
    closeProfile,
  };
}
