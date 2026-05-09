import { UserCheck, CheckCircle, AlertTriangle } from 'lucide-react';

interface RecruitFormProps {
  newbieName: string;
  setNewbieName: (name: string) => void;
  applied: boolean;
  applicationCode: string | null;
  isApplying: boolean;
  applyError: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function RecruitForm({
  newbieName,
  setNewbieName,
  applied,
  applicationCode,
  isApplying,
  applyError,
  onSubmit,
}: RecruitFormProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
      <div className="flex items-center gap-2">
        <UserCheck className="h-5 w-5 text-emerald-500" />
        <h3 className="text-base font-oswald font-bold uppercase tracking-wider text-slate-100">
          Экспресс-Заявка на контракт
        </h3>
      </div>

      {applied ? (
        <div className="bg-emerald-950/40 border border-emerald-500/20 p-4 rounded-xl text-center space-y-2">
          <CheckCircle className="h-8 w-8 text-emerald-400 mx-auto" />
          <h4 className="font-oswald font-bold text-sm text-slate-200">Заявка зарегистрирована!</h4>
          <p className="text-[10px] text-slate-400 font-mono-military leading-relaxed">
            Прибудьте на ближайший призыв в игре и назовите офицеру код:
            <strong className="ml-1 text-emerald-400">#{applicationCode ?? 'РФ-7863-XXXX'}</strong>
          </p>
          <p className="text-[10px] text-slate-500 font-mono-military leading-relaxed">
            Повторная отправка с тем же именем в течение 24 часов вернёт тот же код, чтобы не плодить дубликаты.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <p className="text-xs text-slate-400 font-mono-military leading-normal">
            Заполните предварительную заявку, чтобы получить уникальный код призывника для быстрого приема на призыве.
          </p>

          <div>
            <label className="text-[10px] font-mono-military text-slate-500 block mb-1 uppercase font-bold">
              Имя и Фамилия (RP-Ник):
            </label>
            <input 
              type="text" 
              value={newbieName}
              onChange={(e) => setNewbieName(e.target.value)}
              placeholder="Например: Алексей Воронов"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="req-confirm" 
                className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0" 
                required 
              />
              <label htmlFor="req-confirm" className="text-[10px] text-slate-400 leading-normal">
                Я полностью соответствую минимальным требованиям фракции.
              </label>
            </div>
          </div>

          {applyError && (
            <div className="rounded-lg border border-red-500/30 bg-red-950/30 px-3 py-2 text-[10px] font-mono-military text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              {applyError}
            </div>
          )}

          <button 
            type="submit"
            disabled={isApplying}
            className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono-military font-bold py-2.5 rounded-lg text-xs transition uppercase"
          >
            {isApplying ? 'Отправка…' : 'Отправить заявку'}
          </button>
        </form>
      )}
    </div>
  );
}
