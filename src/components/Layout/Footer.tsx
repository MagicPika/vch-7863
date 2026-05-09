const emblemUrl = 'https://raw.githubusercontent.com/MagicPika/vch-7863/main/src/assets/emblem.png';

export function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-4 mt-12 border-t border-emerald-900/40 pt-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono-military text-slate-500">
        <div className="flex items-center gap-3">
          <img src={emblemUrl} alt="" className="h-10 w-10 object-contain opacity-70" />
          <div>
            <p className="text-slate-400">© 2026 МИНИСТЕРСТВО ОБОРОНЫ РЕГИОНАЛЬНОЙ ФЕДЕРАЦИИ</p>
            <p className="text-[10px] mt-0.5">Воинская часть №7863 • Информационный портал для призывников и новобранцев</p>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end gap-1">
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20 uppercase font-bold">
            Справочная служба • В/Ч №7863
          </span>
          <span className="text-[9px] text-slate-600 italic">«Служу Региональной Федерации!»</span>
        </div>
      </div>
    </footer>
  );
}
