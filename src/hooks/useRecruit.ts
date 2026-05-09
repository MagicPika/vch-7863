import { useState, useCallback } from 'react';

export function useRecruit(triggerSound: (type: 'success' | 'alert') => void) {
  const [newbieName, setNewbieName] = useState('');
  const [applied, setApplied] = useState(false);
  const [applicationCode, setApplicationCode] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const handleApplyForm = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newbieName.trim() || isApplying) return;

    setApplyError(null);
    setIsApplying(true);

    try {
      const res = await fetch('/api/recruit/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newbieName.trim(),
          confirmed: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Не удалось отправить заявку.');
      }

      setApplicationCode(data.application?.code || null);
      setApplied(true);
      triggerSound('success');
    } catch (error) {
      setApplyError(error instanceof Error ? error.message : 'Не удалось отправить заявку.');
      triggerSound('alert');
    } finally {
      setIsApplying(false);
    }
  }, [newbieName, isApplying, triggerSound]);

  const resetApplication = useCallback(() => {
    setApplied(false);
    setApplicationCode(null);
    setApplyError(null);
    setNewbieName('');
  }, []);

  return {
    newbieName,
    setNewbieName,
    applied,
    applicationCode,
    isApplying,
    applyError,
    handleApplyForm,
    resetApplication,
  };
}
