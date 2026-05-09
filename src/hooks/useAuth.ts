import { useState, useEffect, useCallback } from 'react';
import { buildDiscordUser } from '../config/discord';
import type { DiscordUser } from '../types';

export function useAuth(triggerSound: (type: 'click' | 'success' | 'alert') => void) {
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [staffAuthorized, setStaffAuthorized] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Загрузка пользователя при старте
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) {
          const user = buildDiscordUser(data.user);
          setDiscordUser(user);
          setStaffAuthorized(user.isMember);
          // Авто-синхронизация при старте
          if (user.isMember) {
            syncWithDiscord();
          }
        }
      })
      .catch(() => {});
  }, []);

  // Проверка результата входа
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    if (auth === 'success') {
      triggerSound('success');
      window.history.replaceState({}, '', window.location.pathname);
      // Перезагружаем данные после успешного входа
      fetch('/api/auth/me')
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.user) {
            const user = buildDiscordUser(data.user);
            setDiscordUser(user);
            setStaffAuthorized(user.isMember);
            syncWithDiscord();
          }
        });
    } else if (auth === 'error' || auth === 'cancelled') {
      triggerSound('alert');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [triggerSound]);

  // Синхронизация с Discord
  const syncWithDiscord = useCallback(async () => {
    if (!staffAuthorized) return;
    
    setIsSyncing(true);
    try {
      await fetch('/api/soldier/sync', { method: 'POST' });
      // Можно добавить обновление данных после синхронизации
    } catch (e) {
      console.error('Sync failed', e);
    } finally {
      setIsSyncing(false);
    }
  }, [staffAuthorized]);

  const handleDiscordLogin = useCallback(() => {
    triggerSound('click');
    window.location.href = '/api/auth/login';
  }, [triggerSound]);

  const handleLogout = useCallback(() => {
    triggerSound('click');
    window.location.href = '/api/auth/logout';
  }, [triggerSound]);

  // Горячая клавиша Ctrl+Shift+L
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l' || e.key === 'д' || e.key === 'Д')) {
        e.preventDefault();
        if (staffAuthorized) {
          window.open('https://netd08800-commits.github.io/vooruzhennye-sily/', '_blank', 'noopener,noreferrer');
        } else {
          setShowLoginModal(true);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [staffAuthorized]);

  return {
    discordUser,
    staffAuthorized,
    showLoginModal,
    setShowLoginModal,
    isSyncing,
    handleDiscordLogin,
    handleLogout,
    syncWithDiscord,
  };
}
