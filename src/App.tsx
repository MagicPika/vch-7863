import React, { useState } from 'react';
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
  ArrowRight
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

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'statutes' | 'roster' | 'divisions' | 'test' | 'guide'>('home');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatute, setSelectedStatute] = useState<string>('general');
  const [divisionFilter, setDivisionFilter] = useState<string>('ALL');

  const divisionsList = ['ALL', 'Штаб В/Ч', 'ВП', '9-я рота', '12-й бат.', 'Военкомат', 'МТО', 'Академия'];
  const divisionEntries = Object.entries(DIVISIONS);
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
                src="./emblem.png" 
                alt="Герб ВС Региональной Федерации" 
                className="h-20 w-20 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
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
            <span className="text-xs font-mono-military text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ПРИЗЫВ ОТКРЫТ • НАБОР АКТИВЕН
            </span>
            <span className="text-[10px] font-mono-military text-slate-500 uppercase tracking-wider">
              «Служу Региональной Федерации!»
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
                  src="./emblem.png" 
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
              <h3 className="text-xs font-mono-military text-slate-500 uppercase tracking-widest px-2 mb-3">Содержание уставов</h3>
              {STATUTES.map((stat) => (
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {divisionEntries.map(([code, division]) => {
                const members = INITIAL_SOLDIERS.filter(soldier => soldier.division === code);
                const commander = members.length
                  ? members.reduce((highest, soldier) => soldier.rankId > highest.rankId ? soldier : highest, members[0])
                  : null;
                const commanderRank = commander ? RANKS.find(rank => rank.id === commander.rankId)?.name : null;

                return (
                  <div key={code} className="bg-slate-900/90 border border-slate-800 hover:border-emerald-600/40 transition rounded-2xl overflow-hidden">
                    {division.image && (
                      <div className="relative h-64 border-b border-slate-800 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12),rgba(2,6,23,0.95)_62%)]">
                        <img
                          src={division.image}
                          alt={division.name}
                          className="mx-auto h-full w-full object-contain p-5 drop-shadow-[0_0_22px_rgba(0,0,0,0.65)]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20 pointer-events-none" />
                        <div className="absolute bottom-3 left-4 text-[10px] font-mono-military uppercase tracking-widest text-emerald-300/90">
                          В/Ч №7863 • {code}
                        </div>
                      </div>
                    )}
                    <div className="p-5 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <span className="font-oswald font-bold text-emerald-400 text-sm">{code}</span>
                        </div>
                        <div>
                          <h4 className="font-oswald font-bold text-base text-white uppercase tracking-wide leading-tight">
                            {division.name}
                          </h4>
                          <p className="text-xs text-slate-400 leading-relaxed mt-1">
                            {division.desc}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono-military text-slate-400 bg-slate-950 border border-slate-800 px-2 py-1 rounded shrink-0">
                        {members.length} чел.
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-slate-950 border border-slate-850 rounded-xl p-3">
                        <div className="text-[10px] font-mono-military text-slate-500 uppercase mb-2">Основные задачи</div>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {(divisionTasks[code] ?? []).map(task => (
                            <li key={task} className="flex gap-2">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 space-y-3">
                        <div>
                          <div className="text-[10px] font-mono-military text-slate-500 uppercase mb-1">Куратор / старший</div>
                          {commander ? (
                            <div>
                              <div className="text-xs font-oswald font-bold text-slate-200 uppercase">{commander.name}</div>
                              <div className="text-[10px] font-mono-military text-emerald-400">{commanderRank}</div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500">Не назначен</div>
                          )}
                        </div>

                        <div className="border-t border-slate-850 pt-3">
                          <div className="text-[10px] font-mono-military text-slate-500 uppercase mb-1">Для новичка</div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            После прохождения КМБ можно попросить распределение в это подразделение через рапорт или на собеседовании у офицера.
                          </p>
                        </div>
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

      </main>

      {/* --- FOOTER --- */}
      <footer className="max-w-7xl mx-auto px-4 mt-12 border-t border-emerald-900/40 pt-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono-military text-slate-500">
          <div className="flex items-center gap-3">
            <img src="./emblem.png" alt="" className="h-10 w-10 object-contain opacity-70" />
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
