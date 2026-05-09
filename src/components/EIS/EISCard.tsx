import { KeyRound, LockIcon, ExternalLink, FileText, GraduationCap, Award } from 'lucide-react';

interface EISCardProps {
  onOpenPortal: () => void;
}

export function EISCard({ onOpenPortal }: EISCardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 rounded-2xl relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-emerald-500/10 rounded-full filter blur-2xl" />
      <div className="absolute top-3 right-3 text-[9px] font-mono-military bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded uppercase font-bold flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Доступ открыт
      </div>

      <div className="flex items-center gap-2 mb-3 relative">
        <div className="p-2 bg-emerald-500/15 border border-emerald-500/30 rounded-lg">
          <KeyRound className="h-5 w-5 text-emerald-400" />
        </div>
        <h3 className="text-base font-oswald font-bold uppercase tracking-wider text-white">
          ЕИС МО РФ
        </h3>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-4 relative">
        Единая Информационная Система Министерства Обороны. Здесь хранятся:
      </p>

      <ul className="text-xs text-slate-300 space-y-1.5 mb-4 relative">
        <li className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          Личные дела военнослужащих
        </li>
        <li className="flex items-center gap-2">
          <GraduationCap className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          Дипломы и сертификаты Академии
        </li>
        <li className="flex items-center gap-2">
          <Award className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          Награды, выговоры, приказы
        </li>
      </ul>

      <button
        type="button"
        onClick={onOpenPortal}
        className="w-full font-oswald font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg border relative bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-emerald-400/40"
      >
        <LockIcon className="h-4 w-4" />
        Войти в ЕИС
        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
      </button>

      <p className="text-[10px] text-emerald-400/70 font-mono-military mt-3 leading-relaxed text-center relative">
        ✓ Авторизация подтверждена. Доступ открыт.
      </p>
    </div>
  );
}
