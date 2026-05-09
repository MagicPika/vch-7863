import { Volume2, VolumeX, ExternalLink, Lock as LockIcon } from 'lucide-react';
import type { DiscordUser } from '../../types';

const emblemUrl = 'https://raw.githubusercontent.com/MagicPika/vch-7863/main/src/assets/emblem.png';

interface HeaderProps {
  discordUser: DiscordUser | null;
  staffAuthorized: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenMyProfile: () => void;
  onOpenStaffPortal: () => void;
  onLogout: () => void;
  onEmblemClick: () => void;
  emblemClicks: number;
}

export function Header({
  discordUser,
  staffAuthorized,
  soundEnabled,
  onToggleSound,
  onOpenMyProfile,
  onOpenStaffPortal,
  onLogout,
  onEmblemClick,
  emblemClicks,
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-b from-slate-950 to-[#0a1410] border-b-2 border-emerald-700/40 backdrop-blur sticky top-0 z-15 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img 
              src={emblemUrl} 
              alt="Герб ВС Региональной Федерации" 
              onClick={onEmblemClick}
              className="h-20 w-20 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer select-none"
              draggable={false}
            />
            {emblemClicks > 0 && emblemClicks < 5 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950">
                {emblemClicks}
              </div>
            )}
          </div>
          <div className="text-center md:text-left">
            <div className="text-[10px] font-mono-military text-emerald-400/80 tracking-[0.2em] uppercase mb-0.5">
              Министерство Обороны • Региональная Федерация
            </div>
            <h1 className="text-xl md:text-2xl font-oswald font-bold tracking-wider text-white uppercase leading-tight">
              Воинская Часть №7863
            </h1>
            <p className="text-[11px] font-mono-military text-slate-400 tracking-wider uppercase mt-0.5">
              Вооружённые Силы Региональной Федерации • Информационный портал
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
          {staffAuthorized && discordUser && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenMyProfile}
                className="flex items-center gap-2 bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-800 rounded-lg pl-1 pr-3 py-1 transition cursor-pointer"
                title="Открыть мой профиль"
              >
                <img
                  src={discordUser.avatarUrl}
                  alt={discordUser.displayName}
                  className="h-7 w-7 rounded-md object-cover border border-emerald-500/30"
                />
                <div className="text-left">
                  <div className="text-[11px] font-oswald font-bold text-white leading-tight uppercase">
                    {discordUser.displayName}
                  </div>
                  <div className="text-[9px] font-mono-military text-emerald-400 leading-tight">
                    {discordUser.rank?.name ?? 'Военнослужащий'}
                    {discordUser.division ? ` • ${discordUser.division.code}` : ''}
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={onOpenStaffPortal}
                className="group flex items-center gap-2 font-oswald font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-lg border transition bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-emerald-400/40"
                title="Открыть закрытый портал ЕИС МО РФ"
              >
                <LockIcon className="h-4 w-4" />
                ЕИС МО
                <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100" />
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="text-[10px] font-mono-military text-slate-500 hover:text-red-400 transition px-2 py-2 border border-slate-800 rounded-lg hover:border-red-500/40"
                title="Выйти из аккаунта"
              >
                Выйти
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onToggleSound}
              className="flex items-center gap-1.5 text-[11px] font-mono-military text-slate-400 hover:text-emerald-400 transition"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4" />}
              {soundEnabled ? "Звук вкл." : "Без звука"}
            </button>
            <span className="text-xs font-mono-military text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ПРИЗЫВ ОТКРЫТ • НАБОР АКТИВЕН
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
