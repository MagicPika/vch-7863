import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FileText,
  Award,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
  UserCheck,
  BookOpen,
  MessageSquare,
  Search,
  ExternalLink,
  HelpCircle,
  ArrowRight,
  Lock as LockIcon,
  KeyRound,
  GraduationCap
} from 'lucide-react';
import {
  JOIN_REQUIREMENTS,
  JOIN_STEPS,
  STATUTES,
  DIVISIONS,
  INITIAL_SOLDIERS,
  RANKS,
  PRACTICE_QUESTIONS
} from './data/mockData';
import { playTacticalSound } from './utils/sound';
import emblemUrl from './assets/emblem.png';
import { buildDiscordUser, type DiscordUser } from './config/discord';

// 🔗 Ссылка на закрытый портал ЕИС МО РФ
const STAFF_PORTAL_URL = 'https://netd08800-commits.github.io/vooruzhennye-sily/';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'statutes' | 'roster' | 'divisions' | 'test' | 'guide' | 'profile'>('home');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // 🔐 Discord-авторизация
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Флаг "пользователь авторизован и состоит в нашем сервере"
  const staffAuthorized = !!discordUser?.isMember;

  // 🕵️ Секретная активация: 5 кликов по гербу или комбинация Ctrl+Shift+L
  const [emblemClicks, setEmblemClicks] = useState(0);

  // Загружаем данные пользователя при старте
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setDiscordUser(buildDiscordUser(data.user));
        }
      })
      .catch(() => {});
  }, []);

  // Показ уведомления о результате входа
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    if (auth === 'success') {
      triggerSound('success');
      // Чистим query
      window.history.replaceState({}, '', window.location.pathname);
    } else if (auth === 'error' || auth === 'cancelled') {
      triggerSound('alert');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleEmblemClick = () => {
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
  };

  // Горячая клавиша для входа: Ctrl+Shift+L
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l' || e.key === 'д' || e.key === 'Д')) {
        e.preventDefault();
        if (staffAuthorized) {
          window.open(STAFF_PORTAL_URL, '_blank', 'noopener,noreferrer');
        } else {
          setShowLoginModal(true);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [staffAuthorized]);

  // Старт OAuth-входа через Discord
  const handleDiscordLogin = () => {
    triggerSound('click');
    window.location.href = '/api/auth/login';
  };

  // Выход
  const handleLogout = () => {
    triggerSound('click');
    window.location.href = '/api/auth/logout';
  };

  // Открыть портал ЕИС
  const openStaffPortal = () => {
    if (staffAuthorized) {
      window.open(STAFF_PORTAL_URL, '_blank', 'noopener,noreferrer');
      triggerSound('click');
    } else {
      setShowLoginModal(true);
      triggerSound('click');
    }
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatute, setSelectedStatute] = useState<string>('general');
  const [divisionFilter, setDivisionFilter] = useState<string>('ALL');

  const divisionsList = ['ALL', 'Штаб В/Ч', 'ВП', '9-я рота', '12-й бат.', 'Военкомат', 'МТО', 'Академия'];
  const divisionEntries = Object.entries(DIVISIONS);
  // Цветовая палитра каждого подразделения (как в реальных войсках)
  const divisionTheme: Record<string, { accent: string; bg: string; ring: string; glow: string; label: string; motto: string }> = {
    'Штаб В/Ч':  { accent: 'text-amber-300',   bg: 'from-amber-950/80 via-slate-950 to-slate-950',   ring: 'border-amber-500/40',   glow: 'shadow-amber-500/20',   label: 'bg-amber-500/15 text-amber-300 border-amber-500/30',   motto: '«Командование решает всё»' },
    'ВП':        { accent: 'text-red-300',     bg: 'from-red-950/80 via-slate-950 to-slate-950',     ring: 'border-red-500/40',     glow: 'shadow-red-500/20',     label: 'bg-red-500/15 text-red-300 border-red-500/30',         motto: '«Закон. Порядок. Дисциплина»' },
    '9-я рота':  { accent: 'text-blue-300',    bg: 'from-blue-950/80 via-slate-950 to-slate-950',    ring: 'border-blue-500/40',    glow: 'shadow-blue-500/20',    label: 'bg-blue-500/15 text-blue-300 border-blue-500/30',       motto: '«Никто, кроме нас!»' },
    '12-й бат.': { accent: 'text-emerald-300', bg: 'from-emerald-950/80 via-slate-950 to-slate-950', ring: 'border-emerald-500/40', glow: 'shadow-emerald-500/20', label: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', motto: '«Вперёд, на врага!»' },
    'Военкомат': { accent: 'text-cyan-300',    bg: 'from-cyan-950/80 via-slate-950 to-slate-950',    ring: 'border-cyan-500/40',    glow: 'shadow-cyan-500/20',    label: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',       motto: '«Долг каждого — служить Отечеству»' },
    'МТО':       { accent: 'text-orange-300',  bg: 'from-orange-950/80 via-slate-950 to-slate-950',  ring: 'border-orange-500/40',  glow: 'shadow-orange-500/20',  label: 'bg-orange-500/15 text-orange-300 border-orange-500/30', motto: '«Без снабжения нет победы»' },
    'Академия':  { accent: 'text-yellow-300',  bg: 'from-yellow-950/80 via-slate-950 to-slate-950',  ring: 'border-yellow-500/40',  glow: 'shadow-yellow-500/20',  label: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', motto: '«Знание — сила воина»' }
  };

  const divisionTasks: Record<string, string[]> = {
    'Штаб В/Ч': ['Управление всеми подразделениями В/Ч', 'Координация действий формирований', 'Принятие стратегических решений', 'Контроль состояния внутренней службы'],
    'ВП': ['Патрулирование территории части и гарнизона', 'Пресечение самоволок и нарушений устава', 'Контроль пропускного режима на КПП', 'Гарнизонная и караульная служба'],
    '9-я рота': ['Выполнение особо важных и высокорисковых задач', 'Проведение специальных и контртеррористических операций', 'Обеспечение режима ЧП и военного положения'],
    '12-й бат.': ['Боевые задачи на суше', 'Управление БМП-3, Patriot, УАЗ-452 «Буханка»', 'Артиллерийская поддержка', 'Средства ПВО ближнего действия'],
    'Военкомат': ['Проведение призывов и набора личного состава', 'Работа медицинской комиссии', 'Категоризация граждан', 'Постановка на воинский учёт'],
    'МТО': ['Поставки боеприпасов и материальных средств', 'Межведомственное взаимодействие с гос. органами', 'Обеспечение непрерывного функционирования части'],
    'Академия': ['Подготовка офицерских кадров', 'Обучение специалистов для ВС', 'Проведение курсов повышения квалификации']
  };

  // Interactive practice test state for newbies
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  // Newbie simulation report submission
  const [newbieName, setNewbieName] = useState('');
  const [applied, setApplied] = useState(false);

  const triggerSound = (type: 'click' | 'radar' | 'alarm' | 'success' | 'alert') => {
    if (soundEnabled) {
      playTacticalSound(type);
    }
  };

  const handleStartPractice = () => {
    setQuizActive(true);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
    triggerSound('click');
  };

  const handleAnswerSelect = (idx: number) => {
    setSelectedAnswer(idx);
    triggerSound('click');
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;
    
    let newScore = score;
    if (selectedAnswer === PRACTICE_QUESTIONS[currentQuestionIdx].correctIdx) {
      newScore += 1;
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
  };

  const handleApplyForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newbieName.trim()) return;
    setApplied(true);
    triggerSound('success');
  };

  // Filtered Roster
  const filteredSoldiers = INITIAL_SOLDIERS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          RANKS.find(r => r.id === s.rankId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiv = divisionFilter === 'ALL' ? true : s.division === divisionFilter;
    return matchesSearch && matchesDiv;
  });

  return (
    <div className="min-h-screen bg-[#090e15] text-slate-100 font-sans-alt pb-12">
      
      {/* --- TOP MINISTRY BAR --- */}
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
          
          <button 
            onClick={() => { setSoundEnabled(!soundEnabled); triggerSound('click'); }}
            className="flex items-center gap-1.5 text-[11px] font-mono-military text-slate-400 hover:text-emerald-400 transition"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4" />}
            {soundEnabled ? "Звук вкл." : "Без звука"}
          </button>
        </div>
      </div>

      {/* --- WELCOME TICKER FOR NOVICE --- */}
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

      {/* --- HEADER WITH EMBLEM --- */}
      <header className="bg-gradient-to-b from-slate-950 to-[#0a1410] border-b-2 border-emerald-700/40 backdrop-blur sticky top-0 z-15 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img 
                src={emblemUrl} 
                alt="Герб ВС Региональной Федерации" 
                onClick={handleEmblemClick}
                className="h-20 w-20 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer select-none"
                draggable={false}
              />
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
            {/* Виджет авторизованного пользователя — видим только своим */}
            {staffAuthorized && discordUser && (
              <div className="flex items-center gap-2">
                {/* Информация о пользователе с аватаром Discord */}
                <div className="flex items-center gap-2 bg-slate-900 border border-emerald-500/30 rounded-lg pl-1 pr-3 py-1">
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
                </div>
                <button
                  type="button"
                  onClick={openStaffPortal}
                  className="group flex items-center gap-2 font-oswald font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-lg border transition bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border-emerald-400/40"
                  title="Открыть закрытый портал ЕИС МО РФ"
                >
                  <LockIcon className="h-4 w-4" />
                  ЕИС МО
                  <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[10px] font-mono-military text-slate-500 hover:text-red-400 transition px-2 py-2 border border-slate-800 rounded-lg hover:border-red-500/40"
                  title="Выйти из аккаунта"
                >
                  Выйти
                </button>
              </div>
            )}
            <span className="text-xs font-mono-military text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ПРИЗЫВ ОТКРЫТ • НАБОР АКТИВЕН
            </span>
          </div>
        </div>
      </header>

      {/* --- BEGINNER NAV TABS --- */}
      <nav className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-slate-900/90 border border-emerald-900/40 p-1.5 rounded-xl flex flex-wrap gap-1.5">
          {[
            { key: 'home', icon: <BookOpen className="h-4 w-4" />, label: 'Главная & F.A.Q.' },
            { key: 'guide', icon: <UserCheck className="h-4 w-4" />, label: 'Как вступить' },
            { key: 'statutes', icon: <FileText className="h-4 w-4" />, label: 'База Уставов' },
            { key: 'roster', icon: <Users className="h-4 w-4" />, label: 'Личный состав' },
            { key: 'divisions', icon: <Shield className="h-4 w-4" />, label: 'Подразделения' },
            { key: 'test', icon: <Award className="h-4 w-4" />, label: 'РП-Тренажер' },
            ...(staffAuthorized ? [{ key: 'profile', icon: <UserCheck className="h-4 w-4" />, label: 'Личный кабинет' }] : []),
          ].map(t => (
            <button 
              key={t.key}
              onClick={() => { setActiveTab(t.key as any); triggerSound('click'); }}
              className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-oswald font-medium tracking-wider uppercase text-xs transition-all ${
                activeTab === t.key 
                  ? 'bg-gradient-to-r from-emerald-700 to-emerald-900 text-white shadow-md border-t border-emerald-400/30' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* --- CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 mt-6">

        {/* ======================================= */}
        {/*          1. TAB: HOME (BEGINNER STATS)  */}
        {/* ======================================= */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Middle Column (General Info & Requirements) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Promo Banner */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/10 rounded-full filter blur-3xl" />
                <img 
                  src={emblemUrl} 
                  alt="" 
                  className="absolute -right-8 top-1/2 -translate-y-1/2 h-48 w-48 object-contain opacity-10"
                />
                <div className="relative">
                  <h2 className="text-xl md:text-2xl font-oswald font-bold tracking-wide text-white mb-2 uppercase">
                    Добро пожаловать на службу по контракту в В/Ч №7863!
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans-alt max-w-2xl mb-4">
                    Вооружённые Силы Региональной Федерации — это не просто фракция, это дружный коллектив, регулярные тренировки, боевые выезды, патрули, спец-операции и отличная возможность карьерного роста. На этой странице собраны все материалы, необходимые для быстрого вступления и успешного прохождения КМБ (Курса Молодого Бойца).
                  </p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setActiveTab('guide'); triggerSound('click'); }}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white font-mono-military font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5"
                    >
                      Инструкция по вступлению <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Requirements Grid */}
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

              {/* FAQ Section */}
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

            {/* Right Column (Discord & Simulated Quick Apply) */}
            <div className="space-y-6">
              
              {/* ЕИС МО — карточка видна ТОЛЬКО авторизованным военнослужащим. */}
              {/* Посторонние этот блок не видят вообще. Свои входят через 5 кликов на герб или Ctrl+Shift+L. */}
              {staffAuthorized && (
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
                    onClick={openStaffPortal}
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
              )}

              {/* DISCORD SYNC CARD */}
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

              {/* QUICK RECRUIT FORM (Simulates applying or showing interest) */}
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
                    <h4 className="font-oswald font-bold text-sm text-slate-200">Заявка предварительно одобрена!</h4>
                    <p className="text-[10px] text-slate-400 font-mono-military">
                      Прибудьте на ближайший призыв в игре и назовите офицеру код: <strong className="text-emerald-400">#РФ-7863-{Math.floor(Math.random() * 9000 + 1000)}</strong>
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleApplyForm} className="space-y-3">
                    <p className="text-xs text-slate-400 font-mono-military leading-normal">
                      Заполните предварительную заявку, чтобы получить уникальный код призывника для быстрого приема на призыве.
                    </p>

                    <div>
                      <label className="text-[10px] font-mono-military text-slate-500 block mb-1 uppercase font-bold">Имя и Фамилия (RP-Ник):</label>
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
                        <input type="checkbox" id="req-confirm" className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0" required />
                        <label htmlFor="req-confirm" className="text-[10px] text-slate-400 leading-normal">Я полностью соответствую минимальным требованиям фракции.</label>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-mono-military font-bold py-2.5 rounded-lg text-xs transition uppercase"
                    >
                      Отправить заявку
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ======================================= */}
        {/*          2. TAB: GUIDE (HOW TO JOIN)     */}
        {/* ======================================= */}
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
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-emerald-700">
                      ➔
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Practical Advice */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl max-w-4xl mx-auto space-y-4">
              <h4 className="font-oswald font-bold text-sm text-emerald-400 uppercase">Советы от Старших Офицеров:</h4>
              <ul className="space-y-2 text-xs text-slate-300 font-mono-military list-disc pl-5 leading-relaxed">
                <li>Будьте вежливы и используйте субординацию (вместо «привет» говорите «Здравия желаю!», вместо «да» — «Так точно!», вместо «нет» — «Никак нет!»).</li>
                <li>Не перебивайте офицера во время проверки и не бегайте по военкомату. Спокойствие и адекватность — ваш главный билет во фракцию.</li>
                <li>Заранее сдайте наш РП-Тест во вкладке «РП-Тренажер», это гарантированно поможет вам избежать глупых ошибок при реальном собеседовании.</li>
              </ul>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/*          3. TAB: STATUTES (DOCS VIEW)   */}
        {/* ======================================= */}
        {activeTab === 'statutes' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Statute sidebar selection */}
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

              <h3 className="text-xs font-mono-military text-amber-400 uppercase tracking-widest px-2 mb-2 mt-6 flex items-center gap-2">
                <span className="h-px flex-1 bg-amber-500/30" />
                Дисциплинарный устав
                <span className="h-px flex-1 bg-amber-500/30" />
              </h3>
              {STATUTES.filter(s => s.id.startsWith('disc-')).map((stat) => (
                <button 
                  key={stat.id}
                  onClick={() => { setSelectedStatute(stat.id); triggerSound('click'); }}
                  className={`w-full text-left py-3 px-4 rounded-xl border font-oswald font-semibold uppercase text-xs tracking-wider transition ${
                    selectedStatute === stat.id 
                      ? 'bg-gradient-to-r from-amber-700 to-amber-900 text-white border-amber-500/40' 
                      : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  {stat.title}
                </button>
              ))}
            </div>

            {/* Detailed statute document view */}
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

        {/* ======================================= */}
        {/*          4. TAB: ROSTER (PUBLIC VIEW)    */}
        {/* ======================================= */}
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
                {/* Division Filter */}
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

            {/* Soldiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredSoldiers.map((soldier) => {
                const rankObj = RANKS.find(r => r.id === soldier.rankId);
                const isCommander = soldier.rankId >= 12;

                return (
                  <div 
                    key={soldier.id}
                    className={`bg-slate-900/90 border rounded-2xl p-4 flex flex-col justify-between transition relative overflow-hidden hover:border-emerald-500/30 ${
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
                        <span className="text-[9px] text-slate-500 font-mono-military">
                          {soldier.joinDate}
                        </span>
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
                          <span className="text-indigo-400/80 font-mono-military truncate" title={soldier.discord}>
                            {soldier.discord}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-[10px] font-mono-military">
                        <span className="text-slate-500">Статус:</span>
                        <span className={`font-bold ${soldier.status === 'В СТРОЮ' ? 'text-emerald-400' : soldier.status === 'ОТПУСК' ? 'text-amber-400' : 'text-slate-400'}`}>
                          {soldier.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/*          5. TAB: DIVISIONS              */}
        {/* ======================================= */}
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
                const members = INITIAL_SOLDIERS.filter(soldier => soldier.division === code);
                const commander = members.length
                  ? members.reduce((highest, soldier) => soldier.rankId > highest.rankId ? soldier : highest, members[0])
                  : null;
                const commanderRank = commander ? RANKS.find(rank => rank.id === commander.rankId)?.name : null;
                const theme = divisionTheme[code] ?? { accent: 'text-emerald-300', bg: 'from-emerald-950/80 via-slate-950 to-slate-950', ring: 'border-emerald-500/40', glow: 'shadow-emerald-500/20', label: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', motto: '' };

                return (
                  <div
                    key={code}
                    className={`group relative bg-gradient-to-br ${theme.bg} border ${theme.ring} rounded-2xl overflow-hidden shadow-2xl ${theme.glow} hover:scale-[1.01] transition-transform duration-300`}
                  >
                    {/* Декоративные геральдические элементы */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-current opacity-[0.04]" />
                      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-current opacity-[0.03]" />
                      {/* Декоративные «лампасы» по краям */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50`} />
                      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-30`} />
                    </div>

                    {/* Бейдж "В/Ч 7863 • КОД" сверху */}
                    <div className="relative flex items-center justify-between px-6 pt-5">
                      <span className={`text-[10px] font-mono-military uppercase tracking-[0.3em] ${theme.accent} font-bold`}>
                        В/Ч №7863
                      </span>
                      <span className={`text-[10px] font-mono-military uppercase tracking-widest px-2.5 py-1 rounded-md border ${theme.label} font-bold`}>
                        {code}
                      </span>
                    </div>

                    {/* Главная зона: эмблема по центру */}
                    <div className="relative px-6 pt-6 pb-4 flex flex-col items-center text-center">
                      {division.image ? (
                        <div className={`relative w-36 h-44 mb-3 flex items-center justify-center`}>
                          {/* Световое пятно за эмблемой */}
                          <div className={`absolute inset-0 rounded-full bg-current opacity-20 blur-2xl ${theme.accent}`} />
                          <img
                            src={division.image}
                            alt={division.name}
                            className="relative max-h-full max-w-full object-contain drop-shadow-2xl"
                          />
                        </div>
                      ) : (
                        <div className={`w-36 h-44 mb-3 rounded-2xl bg-slate-900/60 border-2 ${theme.ring} flex items-center justify-center`}>
                          <span className={`font-oswald font-black text-5xl ${theme.accent}`}>{code}</span>
                        </div>
                      )}

                      {/* Название подразделения */}
                      <h3 className="font-oswald font-black text-base md:text-lg text-white uppercase tracking-wider leading-tight max-w-md">
                        {division.name}
                      </h3>

                      {/* Девиз */}
                      {theme.motto && (
                        <div className={`mt-3 flex items-center gap-3 ${theme.accent}`}>
                          <span className="h-px w-8 bg-current opacity-50" />
                          <span className="font-oswald italic text-sm tracking-wider">{theme.motto}</span>
                          <span className="h-px w-8 bg-current opacity-50" />
                        </div>
                      )}
                    </div>

                    {/* Описание */}
                    <div className="relative px-6 pb-5">
                      <p className="text-[13px] text-slate-300 leading-relaxed text-center">
                        {division.desc}
                      </p>
                    </div>

                    {/* Информационная панель */}
                    <div className="relative bg-slate-950/70 border-t border-slate-800/80 backdrop-blur-sm">
                      <div className="grid grid-cols-3 divide-x divide-slate-800/80">
                        {/* Личный состав */}
                        <div className="p-4 text-center">
                          <Users className={`h-4 w-4 ${theme.accent} mx-auto mb-1`} />
                          <div className={`font-oswald font-black text-2xl ${theme.accent}`}>{members.length}</div>
                          <div className="text-[9px] text-slate-500 font-mono-military uppercase tracking-wider mt-0.5">
                            военнослужащих
                          </div>
                        </div>

                        {/* Командир */}
                        <div className="p-4 text-center">
                          <Award className={`h-4 w-4 ${theme.accent} mx-auto mb-1`} />
                          {commander ? (
                            <>
                              <div className="font-oswald font-bold text-[11px] text-white uppercase leading-tight truncate" title={commander.name}>
                                {commander.name.split(' ').slice(0, 2).join(' ')}
                              </div>
                              <div className={`text-[9px] font-mono-military ${theme.accent} mt-0.5 truncate`}>
                                {commanderRank}
                              </div>
                            </>
                          ) : (
                            <div className="text-[10px] text-slate-500 font-mono-military mt-1">
                              ВАКАНТНО
                            </div>
                          )}
                          <div className="text-[9px] text-slate-500 font-mono-military uppercase tracking-wider mt-0.5">
                            командование
                          </div>
                        </div>

                        {/* Статус */}
                        <div className="p-4 text-center">
                          <CheckCircle className={`h-4 w-4 ${theme.accent} mx-auto mb-1`} />
                          <div className={`font-oswald font-black text-sm ${theme.accent} flex items-center justify-center gap-1.5`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            ДЕЙСТВУЕТ
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono-military uppercase tracking-wider mt-0.5">
                            боеготовность
                          </div>
                        </div>
                      </div>

                      {/* Задачи и инфо для новичка */}
                      <div className="grid md:grid-cols-2 gap-px bg-slate-800/80">
                        <div className="bg-slate-950/80 p-4">
                          <div className={`text-[10px] font-mono-military uppercase tracking-widest font-bold mb-2.5 ${theme.accent}`}>
                            ▸ Основные задачи
                          </div>
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
                          <div className={`text-[10px] font-mono-military uppercase tracking-widest font-bold mb-2.5 ${theme.accent}`}>
                            ▸ Для новобранца
                          </div>
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

        {/* ======================================= */}
        {/*          6. TAB: TEST (RP PRACTICE)     */}
        {/* ======================================= */}
        {activeTab === 'test' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Practice Quiz */}
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
                    className="bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 text-slate-100 font-oswald font-bold py-3 px-8 rounded-xl tracking-wider uppercase transition shadow-lg glow-green"
                  >
                    Запустить тренажер
                  </button>
                </div>
              ) : quizFinished ? (
                <div className="space-y-6 text-center py-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
                    quizPassed ? 'bg-emerald-500/10 border-emerald-400 text-emerald-400 glow-green' : 'bg-amber-500/10 border-amber-400 text-amber-400'
                  }`}>
                    {quizPassed ? <CheckCircle className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
                  </div>

                  <div className="max-w-md mx-auto space-y-2">
                    <h4 className="font-oswald font-bold text-xl text-slate-100 uppercase">
                      {quizPassed ? 'Отличный результат!' : 'Тест не сдан'}
                    </h4>
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

            {/* Practice Helper */}
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

        {/* ======================================= */}
        {/*       7. TAB: PROFILE (личный кабинет)  */}
        {/* ======================================= */}
        {activeTab === 'profile' && discordUser && staffAuthorized && (
          <div className="space-y-6">
            {/* Главная карточка профиля */}
            <div className="relative bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/10">
              {/* Декоративный фон */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
                <img src={emblemUrl} alt="" className="absolute -right-16 top-1/2 -translate-y-1/2 h-80 w-80 object-contain opacity-[0.04]" />
              </div>

              <div className="relative p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  {/* Аватар */}
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-2xl" />
                    <img
                      src={discordUser.avatarUrl}
                      alt={discordUser.displayName}
                      className="relative w-32 h-32 md:w-36 md:h-36 rounded-2xl border-2 border-emerald-400/60 object-cover shadow-2xl"
                    />
                    {discordUser.isCommander && (
                      <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-[9px] font-mono-military font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-wider">
                        ⭐ Командир
                      </div>
                    )}
                  </div>

                  {/* Основная информация */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="text-[10px] font-mono-military text-emerald-300/80 uppercase tracking-[0.3em] mb-1">
                      Личное дело военнослужащего
                    </div>
                    <h1 className="font-oswald font-black text-2xl md:text-4xl text-white uppercase leading-tight">
                      {discordUser.displayName}
                    </h1>
                    {discordUser.rank && (
                      <div className="mt-2 inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                        <Award className="h-4 w-4 text-emerald-400" />
                        <span className="font-oswald font-bold text-base text-emerald-300 uppercase tracking-wider">
                          {discordUser.rank.name}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                      {/* Подразделение */}
                      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                        <div className="text-[9px] font-mono-military text-slate-500 uppercase tracking-widest mb-1">
                          Подразделение
                        </div>
                        <div className="font-oswald font-bold text-sm text-white">
                          {discordUser.division?.name ?? 'Не назначено'}
                        </div>
                      </div>

                      {/* Личный номер */}
                      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                        <div className="text-[9px] font-mono-military text-slate-500 uppercase tracking-widest mb-1">
                          Личный номер
                        </div>
                        <div className="font-mono-military font-bold text-sm text-emerald-400">
                          7863-{discordUser.id.slice(-6)}
                        </div>
                      </div>

                      {/* Discord */}
                      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                        <div className="text-[9px] font-mono-military text-slate-500 uppercase tracking-widest mb-1">
                          Discord
                        </div>
                        <div className="font-mono-military text-sm text-slate-300 truncate" title={`@${discordUser.username}`}>
                          @{discordUser.username}
                        </div>
                      </div>
                    </div>

                    {/* Кнопки действий */}
                    <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                      <button
                        onClick={openStaffPortal}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-oswald font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-lg"
                      >
                        <LockIcon className="h-4 w-4" />
                        Открыть ЕИС МО
                      </button>
                      <button
                        onClick={handleLogout}
                        className="bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white font-mono-military px-4 py-2 rounded-lg text-xs uppercase transition border border-slate-700 hover:border-red-500"
                      >
                        Выйти
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Статистические карточки */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-center">
                <Award className="h-6 w-6 text-amber-400 mx-auto mb-1" />
                <div className="font-oswald font-black text-3xl text-white">0</div>
                <div className="text-[10px] font-mono-military text-slate-500 uppercase tracking-wider">Награды</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-center">
                <FileText className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
                <div className="font-oswald font-black text-3xl text-white">0</div>
                <div className="text-[10px] font-mono-military text-slate-500 uppercase tracking-wider">Дипломы</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-center">
                <XCircle className="h-6 w-6 text-red-400 mx-auto mb-1" />
                <div className="font-oswald font-black text-3xl text-white">0</div>
                <div className="text-[10px] font-mono-military text-slate-500 uppercase tracking-wider">Выговоры</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-center">
                <CheckCircle className="h-6 w-6 text-blue-400 mx-auto mb-1" />
                <div className="font-oswald font-black text-3xl text-white">—</div>
                <div className="text-[10px] font-mono-military text-slate-500 uppercase tracking-wider">Дней службы</div>
              </div>
            </div>

            {/* Награды и дипломы */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5 text-amber-400" />
                  <h3 className="font-oswald font-bold text-base text-white uppercase tracking-wider">Мои награды</h3>
                </div>
                <div className="bg-slate-950/60 border border-dashed border-slate-700 rounded-xl p-6 text-center">
                  <Award className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-mono-military">
                    У вас пока нет наград.<br />
                    Награды выдаёт командование за заслуги в службе.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-oswald font-bold text-base text-white uppercase tracking-wider">Мои дипломы</h3>
                </div>
                <div className="bg-slate-950/60 border border-dashed border-slate-700 rounded-xl p-6 text-center">
                  <FileText className="h-10 w-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-mono-military">
                    У вас пока нет дипломов.<br />
                    Дипломы выдаёт Военная Академия после прохождения курсов.
                  </p>
                </div>
              </div>
            </div>

            {/* История службы */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-emerald-400" />
                <h3 className="font-oswald font-bold text-base text-white uppercase tracking-wider">История службы</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-slate-950/60 border border-emerald-500/20 rounded-xl p-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <div className="flex-1">
                    <div className="font-oswald font-bold text-sm text-white">
                      {discordUser.rank?.name ?? 'Военнослужащий'} {discordUser.division ? `• ${discordUser.division.name}` : ''}
                    </div>
                    <div className="text-[10px] font-mono-military text-emerald-400">Текущее звание и подразделение</div>
                  </div>
                </div>
                <div className="text-center text-[11px] text-slate-500 font-mono-military py-3">
                  История повышений и переводов появится здесь по мере службы
                </div>
              </div>
            </div>

            {/* Список ваших Discord-ролей (для прозрачности) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-5 w-5 text-indigo-400" />
                <h3 className="font-oswald font-bold text-base text-white uppercase tracking-wider">Ваши роли в Discord</h3>
              </div>
              <p className="text-[11px] text-slate-400 font-mono-military mb-3">
                Звание и подразделение определяются по этим ролям. Если хотите изменить — обратитесь к командованию.
              </p>
              <div className="flex flex-wrap gap-2">
                {discordUser.roleIds.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">Ролей нет</span>
                ) : (
                  discordUser.roleIds.map(rid => (
                    <span key={rid} className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono-military px-2.5 py-1 rounded">
                      {rid}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- LOGIN MODAL --- */}
      {showLoginModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowLoginModal(false)}
        >
          <div
            className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowLoginModal(false)}
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
              onClick={handleDiscordLogin}
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
      )}

      {/* --- FOOTER --- */}
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

    </div>
  );
}
