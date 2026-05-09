import { LockIcon, XCircle } from 'lucide-react';
import type { DiscordUser } from '../../types';

interface LoginModalProps {
  discordUser: DiscordUser | null;
  onClose: () => void;
  onLogin: () => void;
}

export function LoginModal({ discordUser, onClose, onLogin }: LoginModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-white transition"
          title="Закрыть"
        >
          <XCircle className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl">
            <LockIcon className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-oswald font-bold text-lg text-white uppercase tracking-wide">
              ЕИС МО РФ
            </h3>
            <p className="text-[11px] font-mono-military text-slate-400 uppercase">
              Единая Информационная Система МО
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Доступ к ЕИС МО РФ открыт только военнослужащим В/Ч 7863. Войдите через свой Discord-аккаунт — мы автоматически проверим, состоите ли вы в нашем Discord-сервере.
        </p>

        {discordUser && !discordUser.isMember ? (
          <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-3 mb-3">
            <p className="text-xs text-red-300 font-mono-military leading-relaxed">
              ❌ Вы вошли как <strong>{discordUser.displayName}</strong>, но не состоите в Discord-сервере В/Ч 7863. Обратитесь к командованию для добавления.
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onLogin}
          className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-oswald font-bold py-3 rounded-lg text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Войти через Discord
        </button>

        <p className="text-[10px] text-slate-500 font-mono-military text-center pt-3 leading-relaxed">
          При входе мы запрашиваем: имя, аватар и список ваших ролей на сервере. Discord-пароль остаётся у вас — мы его не видим.
        </p>
      </div>
    </div>
  );
}
