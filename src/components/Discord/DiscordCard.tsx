import { MessageSquare, ExternalLink } from 'lucide-react';

export function DiscordCard() {
  return (
    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl" />
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-5 w-5 text-emerald-500" />
        <h3 className="text-base font-oswald font-bold uppercase tracking-wider text-slate-100">
          Спец. Связь Discord
        </h3>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Синхронизация личного дела происходит через официальный Discord В/Ч №7863. Присоединяйтесь, чтобы получить роль рекрута и доступ к закрытым чатам подразделений.
      </p>

      <a 
        href="https://discord.gg/AVuJDHHemW" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-mono-military font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg"
      >
        Войти в Discord В/Ч №7863 <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}
