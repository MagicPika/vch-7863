import { useState, useCallback } from 'react';
import {
  Header, Navigation, Footer,
  RecruitForm, EISCard, DiscordCard, LoginModal
} from './components';
import { useSound, useAuth, useRecruit, useSoldiers } from './hooks';
import {
  JOIN_REQUIREMENTS, JOIN_STEPS, STATUTES, DIVISIONS,
  RANKS, PRACTICE_QUESTIONS
} from './data/mockData';
import type { TabType, DivisionCode } from './types';
import {
  Shield, CheckCircle, HelpCircle, BookOpen,
  ArrowRight, UserCheck, Award, XCircle,
  MessageSquare, Search, Users
} from 'lucide-react';

const STAFF_PORTAL_URL = 'https://netd08800-commits.github.io/vooruzhennye-sily/';
const emblemUrl = 'https://raw.githubusercontent.com/MagicPika/vch-7863/main/src/assets/emblem.png';

const divisionTheme: Record<DivisionCode, { accent: string; bg: string; ring: string; glow: string; label: string; motto: string }> = {
  'Штаб В/Ч': { accent: 'text-amber-300', bg: 'from-amber-950/80 via-slate-950 to-slate-950', ring: 'border-amber-500/40', glow: 'shadow-amber-500/20', label: 'bg-amber-500/15 text-amber-300 border-amber-500/30', motto: '«Командование решает всё»' },
  'ВП': { accent: 'text-red-300', bg: 'from-red-950/80 via-slate-950 to-slate-950', ring: 'border-red-500/40', glow: 'shadow-red-500/20', label: 'bg-red-500/15 text-red-300 border-red-500/30', motto: '«Закон. Порядок. Дисциплина»' },
  '9-я рота': { accent: 'text-blue-300', bg: 'from-blue-950/80 via-slate-950 to-slate-950', ring: 'border-blue-500/40', glow: 'shadow-blue-500/20', label: 'bg-blue-500/15 text-blue-300 border-blue-500/30', motto: '«Никто, кроме нас!»' },
  '12-й бат.': { accent: 'text-emerald-300', bg: 'from-emerald-950/80 via-slate-950 to-slate-950', ring: 'border-emerald-500/40', glow: 'shadow-emerald-500/20', label: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', motto: '«Вперёд, на врага!»' },
  'Военкомат': { accent: 'text-cyan-300', bg: 'from-cyan-950/80 via-slate-950 to-slate-950', ring: 'border-cyan-500/40', glow: 'shadow-cyan-500/20', label: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30', motto: '«Долг каждого — служить Отечеству»' },
  'МТО': { accent: 'text-orange-300', bg: 'from-orange-950/80 via-slate-950 to-slate-950', ring: 'border-orange-500/40', glow: 'shadow-orange-500/20', label: 'bg-orange-500/15 text-orange-300 border-orange-500/30', motto: '«Без снабжения нет победы»' },
  'Академия': { accent: 'text-yellow-300', bg: 'from-yellow-950/80 via-slate-950 to-slate-950', ring: 'border-yellow-500/40', glow: 'shadow-yellow-500/20', label: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', motto: '«Знание — сила воина»' }
};

const divisionTasks: Record<DivisionCode, string[]> = {
  'Штаб В/Ч': ['Управление всеми подразделениями В/Ч', 'Координация действий формирований', 'Принятие стратегических решений', 'Контроль состояния внутренней службы'],
  'ВП': ['Патрулирование территории части и гарнизона', 'Пресечение самоволок и нарушений устава', 'Контроль пропускного режима на КПП', 'Гарнизонная и караульная служба'],
  '9-я рота': ['Выполнение особо важных и высокорисковых задач', 'Проведение специальных и контртеррористических операций', 'Обеспечение режима ЧП и военного положения'],
  '12-й бат.': ['Боевые задачи на суше', 'Управление БМП-3, Patriot, УАЗ-452 «Буханка»', 'Артиллерийская поддержка', 'Средства ПВО ближнего действия'],
  'Военкомат': ['Проведение призывов и набора личного состава', 'Работа медицинской комиссии', 'Категоризация граждан', 'Постановка на воинский учёт'],
  'МТО': ['Поставки боеприпасов и материальных средств', 'Межведомственное взаимодействие с гос. органами', 'Обеспечение непрерывного функционирования части'],
  'Академия': ['Подготовка офицерских кадров', 'Обучение специалистов для ВС', 'Проведение курсов повышения квалификации']
};

export default function App() {
  // Состояния
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState<DivisionCode | 'ALL'>('ALL');
  const [selectedStatute, setSelectedStatute] = useState('general');
  const [emblemClicks, setEmblemClicks] = useState(0);
  
  // Тест
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  // Хуки
  const { soundEnabled, toggleSound, triggerSound } = useSound();
  const { discordUser, staffAuthorized, showLoginModal, setShowLoginModal, handleDiscordLogin, handleLogout } = useAuth(triggerSound);
  const { newbieName, setNewbieName, applied, applicationCode, isApplying, applyError, handleApplyForm } = useRecruit(triggerSound);
  const { soldiers } = useSoldiers();

  // Заглушки для профиля (добавить полную реализацию позже)
  const openMyProfile = useCallback(() => {
    triggerSound('click');
  }, [triggerSound]);

  const openSoldierProfile = useCallback(() => {
    triggerSound('click');
  }, [triggerSound]);

  // Секретная активация (5 кликов по гербу)
  const handleEmblemClick = useCallback(() => {
    const next = emblemClicks + 1;
    setEmblemClicks(next);
    if (next >= 5) {
      setEmblemClicks(0);
      if (staffAuthorized) {
        window.open(STAFF_PORTAL_URL, '_blank', 'noopener,noreferrer');
        triggerSound('success');
      } else {
        setShowLoginModal(true);
        triggerSound('click');
      }
    }
    setTimeout(() => setEmblemClicks(0), 2000);
  }, [emblemClicks, staffAuthorized, setShowLoginModal, triggerSound]);

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    triggerSound('click');
  }, [triggerSound]);

  // Quiz handlers
  const handleStartPractice = useCallback(() => {
    setQuizActive(true);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
    triggerSound('click');
  }, [triggerSound]);

  const handleAnswerSelect = useCallback((idx: number) => {
    setSelectedAnswer(idx);
    triggerSound('click');
  }, [triggerSound]);

  const handleNextQuestion = useCallback(() => {
    if (selectedAnswer === null) return;
    let newScore = score;
    if (selectedAnswer === PRACTICE_QUESTIONS[currentQuestionIdx].correctIdx) {
      newScore = score + 1;
      setScore(newScore);
    }
    setSelectedAnswer(null);
    if (currentQuestionIdx < PRACTICE_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      setQuizFinished(true);
      const passed = newScore >= 4;
      setQuizPassed(passed);
      triggerSound(passed ? 'success' : 'alert');
    }
  }, [selectedAnswer, currentQuestionIdx, score, triggerSound]);

  // Открытие портала ЕИС
  const openStaffPortal = useCallback(() => {
    if (staffAuthorized) {
      window.open(STAFF_PORTAL_URL, '_blank', 'noopener,noreferrer');
      triggerSound('click');
    } else {
      setShowLoginModal(true);
      triggerSound('click');
    }
  }, [staffAuthorized, setShowLoginModal, triggerSound]);

  // Фильтрованный состав (из API)
  const filteredSoldiers = soldiers.filter((s: { name: string; rankId: number | null; division: string }) => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.rankId && RANKS.find(r => r.id === s.rankId)?.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDiv = divisionFilter === 'ALL' ? true : s.division === divisionFilter;
    return matchesSearch && matchesDiv;
  });

  const divisionsList: (DivisionCode | 'ALL')[] = ['ALL', 'Штаб В/Ч', 'ВП', '9-я рота', '12-й бат.', 'Военкомат', 'МТО', 'Академия'];
  const divisionEntries = Object.entries(DIVISIONS) as [DivisionCode, typeof DIVISIONS[DivisionCode]][];

  return (
    <div className="min-h-screen bg-[#090e15] text-slate-100 font-sans-alt pb-12">
      {/* TOP BAR */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 border-b border-emerald-700/30 px-4 py-2 relative z-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-emerald-600/80 text-white font-mono-military font-bold text-[10px] rounded">
              МО РФ • ОФИЦИАЛЬНО
            </span>
            <span className="text-[11px] font-mono-military text-emerald-300/80">
              Министерство обороны Региональной Федерации
            </span>
          </div>
        </div>
      </div>

      {/* WELCOME TICKER */}
      <div className="bg-amber-950/40 border-b border-amber-500/20 px-4 py-2 relative z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="px-2 py-0.5 bg-amber-600 text-white font-mono-military font-bold text-[10px] rounded animate-pulse">
            НОВИЧКАМ
          </span>
          <span className="text-[11px] font-mono-military text-amber-300/90 text-center">
            ⚡ Информация по призыву, уставные документы и подготовка к собеседованию • Без авторизации
          </span>
        </div>
      </div>

      {/* HEADER */}
      <Header
        discordUser={discordUser}
        staffAuthorized={staffAuthorized}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenMyProfile={openMyProfile}
        onOpenStaffPortal={openStaffPortal}
        onLogout={handleLogout}
        onEmblemClick={handleEmblemClick}
        emblemClicks={emblemClicks}
      />

      {/* NAVIGATION */}
      <Navigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 mt-6">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Promo Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full filter blur-3xl" />
                <img src={emblemUrl} alt="" className="absolute -right-8 top-1/2 -translate-y-1/2 h-48 w-48 object-contain opacity-10" />
                <div className="relative">
                  <h2 className="text-xl md:text-2xl font-oswald font-bold tracking-wide text-white mb-2 uppercase">
                    Добро пожаловать на службу по контракту в В/Ч №7863!
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans-alt max-w-2xl mb-4">
                    Вооружённые Силы Региональной Федерации — это не просто фракция, это дружный коллектив, регулярные тренировки, боевые выезды, патрули, спец-операции и отличная возможность карьерного роста. На этой странице собраны все материалы, необходимые для быстрого вступления и успешного прохождения КМБ.
                  </p>
                  <button 
                    onClick={() => handleTabChange('guide')}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-mono-military font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5"
                  >
                    Инструкция по вступлению <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-oswald font-bold uppercase tracking-wider text-slate-100">
                    Критерии для вступления (Минимальные требования)
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {JOIN_REQUIREMENTS.map((req) => (
                    <div key={req.id} className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex items-start gap-3">
                      <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-oswald font-bold text-sm tracking-wide text-slate-200 uppercase">{req.title}</h4>
                        <p className="text-xs text-slate-400 leading-normal">{req.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-oswald font-bold uppercase tracking-wider text-slate-100">
                    Часто задаваемые вопросы (F.A.Q.)
                  </h3>
                </div>
                <div className="space-y-3">
                  {[
                    { q: 'Как попасть на службу?', a: 'Два способа: 1) Прийти на призыв к Военкомату (следите за гос. новостями в игре); 2) Подать электронное заявление на форуме forum.region.game в разделе «ВС РФ». Требования: 18+ лет, 2+ Lvl, нет судимостей.' },
                    { q: 'Можно ли восстановиться после увольнения?', a: 'Да, в течение 30 дней после увольнения вы можете восстановиться в звании на порядок ниже по решению командования. После 30 дней — только через повторный призыв.' },
                    { q: 'Нужен ли военный билет?', a: 'Для контрактной службы — да, военный билет обязателен. Без него контрактная служба невозможна. Призывная служба доступна без военного билета.' },
                    { q: 'Какие воинские звания существуют в ВС РФ?', a: 'Солдаты: рядовой, сержант, старшина. Младшие офицеры: лейтенант. Старшие офицеры: капитан, майор. Высшие офицеры: подполковник, полковник, генерал-полковник, генерал армии.' },
                    { q: 'Кто командует В/Ч №7863?', a: 'Командир — генерал армии Рублев А.С. Заместители командира — генерал-полковники Кирсанов К.О. и Градский А.Д.' }
                  ].map((faq, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-1.5">
                      <h4 className="font-oswald font-bold text-sm text-emerald-400 uppercase">❓ {faq.q}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans-alt">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {staffAuthorized && <EISCard onOpenPortal={openStaffPortal} />}
              <DiscordCard />
              <RecruitForm
                newbieName={newbieName}
                setNewbieName={setNewbieName}
                applied={applied}
                applicationCode={applicationCode}
                isApplying={isApplying}
                applyError={applyError}
                onSubmit={handleApplyForm}
              />
            </div>
          </div>
        )}

        {/* GUIDE TAB */}
        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h3 className="text-2xl font-oswald font-bold text-white uppercase tracking-wider">
                Пошаговый курс молодого бойца
              </h3>
              <p className="text-xs text-slate-400 font-mono-military leading-relaxed">
                Следуйте этой простой инструкции, чтобы беспрепятственно вступить в ряды Вооруженных Сил и получить свои первые погоны без лишней мороки и долгих ожиданий.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {JOIN_STEPS.map((step) => (
                <div key={step.id} className="bg-slate-900/90 border border-slate-800 hover:border-emerald-700/40 transition p-5 rounded-2xl relative flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-700 text-white font-oswald font-bold text-xs w-7 h-7 rounded-full flex items-center justify-center">
                        {step.id}
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono-military font-semibold uppercase">
                        {step.badge}
                      </span>
                    </div>
                    <h4 className="font-oswald font-bold text-base tracking-wide text-slate-200 uppercase">{step.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans-alt">{step.desc}</p>
                  </div>
                  {step.id < 4 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-emerald-700">➔</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATUTES TAB */}
        {activeTab === 'statutes' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h3 className="text-xs font-mono-military text-emerald-400 uppercase tracking-widest px-2 mb-2 flex items-center gap-2">
                <span className="h-px flex-1 bg-emerald-500/30" />
                Устав внутренней службы
                <span className="h-px flex-1 bg-emerald-500/30" />
              </h3>
              {STATUTES.filter(s => !s.id.startsWith('disc-')).map((stat) => (
                <button 
                  key={stat.id}
                  onClick={() => { setSelectedStatute(stat.id); triggerSound('click'); }}
                  className={`w-full text-left py-3 px-4 rounded-xl border font-oswald font-semibold uppercase text-xs tracking-wider transition ${
                    selectedStatute === stat.id 
                      ? 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-white border-emerald-500/30' 
                      : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  {stat.title}
                </button>
              ))}
            </div>
            <div className="lg:col-span-3 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-6">
              {STATUTES.filter(s => s.id === selectedStatute).map((stat) => (
                <div key={stat.id} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-oswald font-bold text-white uppercase tracking-wider">{stat.title}</h3>
                    <p className="text-xs text-slate-400 font-mono-military">{stat.description}</p>
                  </div>
                  <div className="space-y-3 border-t border-slate-800 pt-4">
                    {stat.articles.map((art, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-850 hover:border-emerald-700/30 transition p-4 rounded-xl flex gap-3">
                        <span className="text-emerald-400 font-bold font-mono-military shrink-0">{art.num}</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans-alt">{art.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROSTER TAB */}
        {activeTab === 'roster' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col lg:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-oswald font-bold text-white uppercase tracking-wider">
                  Открытый реестр личного состава воинской части
                </h3>
                <p className="text-[11px] text-slate-400 font-mono-military uppercase tracking-wide">
                  Здесь отображаются все активные офицеры и бойцы. Познакомьтесь с командованием до прохождения призыва!
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex flex-wrap gap-1">
                  {divisionsList.map(div => (
                    <button
                      key={div}
                      onClick={() => { setDivisionFilter(div); triggerSound('click'); }}
                      className={`px-2.5 py-1.5 rounded text-[10px] font-mono-military font-bold uppercase transition ${
                        divisionFilter === div 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-950 border border-slate-850 text-slate-400 hover:bg-slate-850'
                      }`}
                    >
                      {div === 'ALL' ? 'ВСЕ' : div}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 grow lg:grow-0">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по имени..."
                    className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-xs w-full lg:w-[180px] focus:outline-none focus:border-emerald-500 text-slate-200"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredSoldiers.map((soldier) => {
                const rankObj = RANKS.find(r => r.id === soldier.rankId);
                const isCommander = (soldier.rankId ?? 0) >= 12;
                return (
                  <button 
                    key={soldier.id}
                    type="button"
                    onClick={() => openSoldierProfile()}
                    className={`text-left bg-slate-900/90 border rounded-2xl p-4 flex flex-col justify-between transition relative overflow-hidden hover:border-emerald-500/60 hover:scale-[1.02] hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer group ${
                      isCommander ? 'border-emerald-500/30' : 'border-slate-800/80'
                    }`}
                  >
                    {isCommander && (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white font-mono-military text-[8px] font-bold px-2 py-0.5 rounded-bl uppercase">
                        КОМАНДОВАНИЕ
                      </div>
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] bg-slate-800 border border-slate-700 text-slate-400 px-2 py-0.5 rounded uppercase font-mono-military">
                          {soldier.division}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono-military">{soldier.joinDate}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-850 shrink-0">
                          <img src={soldier.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="font-oswald font-bold text-xs text-slate-200 leading-tight uppercase truncate">{soldier.name}</h4>
                          <p className="text-[10px] font-mono-military text-emerald-400">{rankObj?.name}</p>
                          {soldier.position && (
                            <p className="text-[9px] text-indigo-400 font-mono-military truncate" title={soldier.position}>
                              {soldier.position}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-850 space-y-2">
                      {soldier.discord && (
                        <div className="flex items-center gap-1.5 text-[9px]">
                          <MessageSquare className="h-3 w-3 text-indigo-400 shrink-0" />
                          <span className="text-indigo-400/80 font-mono-military truncate">{soldier.discord}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-[10px] font-mono-military">
                        <span className="text-slate-500">Статус:</span>
                        <span className={`font-bold ${soldier.status === 'В СТРОЮ' ? 'text-emerald-400' : soldier.status === 'ОТПУСК' ? 'text-amber-400' : 'text-slate-400'}`}>
                          {soldier.status}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* DIVISIONS TAB */}
        {activeTab === 'divisions' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                  <h3 className="text-xl font-oswald font-bold text-white uppercase tracking-wider">
                    Подразделения В/Ч №7863
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono-military uppercase tracking-wide mt-1">
                    Краткая структура части для новобранцев: чем занимается каждый отдел и куда можно попасть после КМБ.
                  </p>
                </div>
                <div className="text-[10px] font-mono-military text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-lg uppercase">
                  Всего подразделений: {divisionEntries.length}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {divisionEntries.map(([code, division]) => {
                type SoldierType = typeof soldiers[0];
                const members = soldiers.filter((s: { division: string }) => s.division === code);
                const commander = members.length
                  ? members.reduce((highest: SoldierType, s: SoldierType) => (s.rankId ?? 0) > (highest.rankId ?? 0) ? s : highest, members[0])
                  : null;
                const commanderRank = commander?.rankId ? RANKS.find(rank => rank.id === commander.rankId)?.name : null;
                const theme = divisionTheme[code];
                return (
                  <div key={code} className={`group relative bg-gradient-to-br ${theme.bg} border ${theme.ring} rounded-2xl overflow-hidden shadow-2xl ${theme.glow} hover:scale-[1.01] transition-transform duration-300`}>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-current opacity-[0.04]" />
                      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-current opacity-[0.03]" />
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50`} />
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30`} />
                    </div>
                    <div className="relative flex items-center justify-between px-6 pt-5">
                      <span className={`text-[10px] font-mono-military uppercase tracking-[0.3em] ${theme.accent} font-bold`}>В/Ч №7863</span>
                      <span className={`text-[10px] font-mono-military uppercase tracking-widest px-2.5 py-1 rounded-md border ${theme.label} font-bold`}>{code}</span>
                    </div>
                    <div className="relative px-6 pt-6 pb-4 flex flex-col items-center text-center">
                      <div className={`relative w-36 h-44 mb-3 flex items-center justify-center`}>
                        <div className={`absolute inset-0 rounded-full bg-current opacity-20 blur-2xl ${theme.accent}`} />
                        <img src={division.image} alt={division.name} className="relative max-h-full max-w-full object-contain drop-shadow-2xl" />
                      </div>
                      <h3 className="font-oswald font-black text-base md:text-lg text-white uppercase tracking-wider leading-tight max-w-md">{division.name}</h3>
                      {theme.motto && (
                        <div className={`mt-3 flex items-center gap-3 ${theme.accent}`}>
                          <span className="h-px w-8 bg-current opacity-50" />
                          <span className="font-oswald italic text-sm tracking-wider">{theme.motto}</span>
                          <span className="h-px w-8 bg-current opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="relative px-6 pb-5">
                      <p className="text-[13px] text-slate-300 leading-relaxed text-center">{division.desc}</p>
                    </div>
                    <div className="relative bg-slate-950/70 border-t border-slate-800/80 backdrop-blur-sm">
                      <div className="grid grid-cols-3 divide-x divide-slate-800/80">
                        <div className="p-4 text-center">
                          <Users className={`h-4 w-4 ${theme.accent} mx-auto mb-1`} />
                          <div className={`font-oswald font-black text-2xl ${theme.accent}`}>{members.length}</div>
                          <div className="text-[9px] text-slate-500 font-mono-military uppercase tracking-wider mt-0.5">военнослужащих</div>
                        </div>
                        <div className="p-4 text-center">
                          <Award className={`h-4 w-4 ${theme.accent} mx-auto mb-1`} />
                          {commander ? (
                            <>
                              <div className="font-oswald font-bold text-[11px] text-white uppercase leading-tight truncate">{commander.name.split(' ').slice(0, 2).join(' ')}</div>
                              <div className={`text-[9px] font-mono-military ${theme.accent} mt-0.5 truncate`}>{commanderRank}</div>
                            </>
                          ) : (
                            <div className="text-[10px] text-slate-500 font-mono-military mt-1">ВАКАНТНО</div>
                          )}
                          <div className="text-[9px] text-slate-500 font-mono-military uppercase tracking-wider mt-0.5">командование</div>
                        </div>
                        <div className="p-4 text-center">
                          <CheckCircle className={`h-4 w-4 ${theme.accent} mx-auto mb-1`} />
                          <div className={`font-oswald font-black text-sm ${theme.accent} flex items-center justify-center gap-1.5`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            ДЕЙСТВУЕТ
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono-military uppercase tracking-wider mt-0.5">боеготовность</div>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-px bg-slate-800/80">
                        <div className="bg-slate-950/80 p-4">
                          <div className={`text-[10px] font-mono-military uppercase tracking-widest font-bold mb-2.5 ${theme.accent}`}>▸ Основные задачи</div>
                          <ul className="space-y-1.5 text-[11px] text-slate-300">
                            {(divisionTasks[code] ?? []).map(task => (
                              <li key={task} className="flex gap-2 leading-snug">
                                <span className={`${theme.accent} font-bold shrink-0`}>•</span>
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-slate-950/80 p-4">
                          <div className={`text-[10px] font-mono-military uppercase tracking-widest font-bold mb-2.5 ${theme.accent}`}>▸ Для новобранца</div>
                          <p className="text-[11px] text-slate-300 leading-snug">
                            После прохождения КМБ вы можете подать рапорт о распределении в это подразделение через своего непосредственного начальника или на собеседовании у офицера.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TEST TAB */}
        {activeTab === 'test' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-lg font-oswald font-bold uppercase tracking-wider text-slate-100">
                    Тренажер по приёму в В/Ч №7863
                  </h3>
                </div>
              </div>
              {!quizActive ? (
                <div className="space-y-6 text-center py-8">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                    <UserCheck className="h-8 w-8 text-emerald-400" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h4 className="font-oswald font-bold text-lg text-slate-100 uppercase">Потренируйтесь сдавать тест</h4>
                    <p className="text-xs text-slate-400 font-mono-military leading-relaxed">
                      Этот симулятор содержит реальные вопросы, которые вам могут задать проверяющие офицеры на призыве в В/Ч №7863. Попробуйте сдать его без ошибок!
                    </p>
                  </div>
                  <button 
                    onClick={handleStartPractice}
                    className="bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 text-slate-100 font-oswald font-bold py-3 px-8 rounded-xl tracking-wider uppercase transition shadow-lg"
                  >
                    Запустить тренажер
                  </button>
                </div>
              ) : quizFinished ? (
                <div className="space-y-6 text-center py-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${quizPassed ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400' : 'bg-amber-500/10 border-amber-400 text-amber-400'}`}>
                    {quizPassed ? <CheckCircle className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h4 className="font-oswald font-bold text-xl text-slate-100 uppercase">{quizPassed ? 'Отличный результат!' : 'Тест не сдан'}</h4>
                    <p className="text-xs font-mono-military text-slate-400">
                      Вы ответили верно на <strong className="text-emerald-400">{score} из {PRACTICE_QUESTIONS.length}</strong> вопросов.
                      {quizPassed ? ' Вы отлично ориентируетесь в уставных нормах и правилах! Вы полностью готовы к призыву.' : ' Вам нужно подтянуть знания устава во вкладке «База Уставов» перед прохождением реального собеседования.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setQuizActive(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono-military py-2 px-6 rounded-lg text-xs transition uppercase border border-slate-700"
                  >
                    Вернуться назад
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex justify-between items-center text-xs font-mono-military text-slate-400">
                    <span>Вопрос {currentQuestionIdx + 1} из {PRACTICE_QUESTIONS.length}</span>
                    <span>Верно: {score}</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${(currentQuestionIdx / PRACTICE_QUESTIONS.length) * 100}%` }} />
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl">
                    <h4 className="font-oswald font-medium text-sm text-slate-200">{PRACTICE_QUESTIONS[currentQuestionIdx].question}</h4>
                  </div>
                  <div className="space-y-2">
                    {PRACTICE_QUESTIONS[currentQuestionIdx].options.map((opt, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleAnswerSelect(idx)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer text-xs font-mono-military transition ${
                          selectedAnswer === idx 
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400' 
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:bg-slate-850'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selectedAnswer === idx ? 'border-emerald-400 bg-emerald-500' : 'border-slate-700'
                        }`}>
                          {selectedAnswer === idx && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={handleNextQuestion}
                    disabled={selectedAnswer === null}
                    className="w-full bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono-military font-bold py-2.5 rounded-lg text-xs transition uppercase"
                  >
                    {currentQuestionIdx < PRACTICE_QUESTIONS.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-oswald font-bold uppercase tracking-wider text-slate-100">Шпаргалка</h3>
                </div>
                <div className="space-y-3 text-xs font-mono-military text-slate-300">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-emerald-400 font-bold block mb-1">ОБЩЕНИЕ И СУБОРДИНАЦИЯ</span>
                    Забудьте слова «Привет», «Окей», «Да». Вместо них используйте уставные аналоги: «Здравия желаю!», «Так точно!», «Есть!».
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-emerald-400 font-bold block mb-1">ЧТО ТАКОЕ META GAMING (МГ)?</span>
                    Использование в игровой вселенной (IC) информации из реальной жизни (OOC). Например, упоминание «Discord» или «форум» в игровом чате запрещено и наказывается.
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-emerald-400 font-bold block mb-1">ЧТО ТАКОЕ POWER GAMING (ПГ)?</span>
                    Совершение нереалистичных действий, которые невозможны в реальной жизни (например, прыгать с крыши без последствий или стрелять из автомата на бегу с двух рук).
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <Footer />

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <LoginModal
          discordUser={discordUser}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleDiscordLogin}
        />
      )}
    </div>
  );
}
