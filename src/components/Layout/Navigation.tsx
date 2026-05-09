import { BookOpen, UserCheck, FileText, Users, Shield, Award } from 'lucide-react';
import type { TabType } from '../../types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs = [
  { key: 'home' as TabType, icon: BookOpen, label: 'Главная & F.A.Q.' },
  { key: 'guide' as TabType, icon: UserCheck, label: 'Как вступить' },
  { key: 'statutes' as TabType, icon: FileText, label: 'База Уставов' },
  { key: 'roster' as TabType, icon: Users, label: 'Личный состав' },
  { key: 'divisions' as TabType, icon: Shield, label: 'Подразделения' },
  { key: 'test' as TabType, icon: Award, label: 'РП-Тренажер' },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="max-w-7xl mx-auto px-4 mt-6">
      <div className="bg-slate-900/90 border border-emerald-900/40 p-1.5 rounded-xl flex flex-wrap gap-1.5">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button 
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-oswald font-medium tracking-wider uppercase text-xs transition-all ${
                activeTab === t.key 
                  ? 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-white shadow-md border-t border-emerald-400/30' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
