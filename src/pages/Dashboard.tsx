import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Copy, 
  Eye, 
  EyeOff, 
  Send, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText, 
  Wallet, 
  ChevronRight, 
  Smartphone, 
  Wifi, 
  Lightbulb, 
  Tv, 
  Gift, 
  PiggyBank, 
  CreditCard, 
  MoreHorizontal,
  CheckCircle2,
  TrendingUp,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Briefcase,
  Calendar,
  X,
  Lock,
  Zap,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [showBalance, setShowBalance] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [copied, setCopied] = useState(false);
  
  // Custom states for premium interactive dashboard experience
  const [selectedCardSkin, setSelectedCardSkin] = useState<'titanium' | 'indigo' | 'sovereign'>('titanium');
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState<'weekly' | 'monthly'>('weekly');
  const [searchQuery, setSearchQuery] = useState('');
  const [txFilter, setTxFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!profile) return;
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', profile.uid),
      where('read', '==', false)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    });
    
    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', profile.uid),
      orderBy('date', 'desc'),
      limit(10) // Fetch slightly more to support search/filter in widget
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentTransactions(txs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    return () => unsubscribe();
  }, [profile]);

  const copyAccount = () => {
    if (profile?.accountNumber) {
      navigator.clipboard.writeText(profile.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  // Quick Services list formatted precisely for the bento layout to match original path/states
  const quickServices = [
    { id: 'airtime', label: 'Airtime', icon: Smartphone, color: 'bg-[#FFF5EB] text-[#FF8A00] dark:bg-[#FF8A00]/10', path: '/services', state: { service: 'airtime' } },
    { id: 'data', label: 'Data', icon: Wifi, color: 'bg-[#EBF5FF] text-[#2563EB] dark:bg-[#2563EB]/10', path: '/services', state: { service: 'data' } },
    { id: 'electricity', label: 'Electricity', icon: Lightbulb, color: 'bg-[#FFFBEB] text-[#D97706] dark:bg-[#D97706]/10', path: '/services', state: { service: 'electricity' } },
    { id: 'bills', label: 'TV Bills', icon: Tv, color: 'bg-[#EDF2FE] text-[#2563EB] dark:bg-[#2563EB]/10', path: '/services', state: { service: 'bills' } },
    { id: 'giftcards', label: 'Gift Cards', icon: Gift, color: 'bg-[#F0FDF4] text-[#16A34A] dark:bg-[#16A34A]/10', path: '/gift-cards' },
    { id: 'loan', label: 'Loans', icon: PiggyBank, color: 'bg-[#F5F3FF] text-[#7C3AED] dark:bg-[#7C3AED]/10', path: '/loan' },
    { id: 'card', label: 'My Cards', icon: CreditCard, color: 'bg-[#EFF6FF] text-[#3B82F6] dark:bg-[#3B82F6]/10', path: '/card' },
    { id: 'more', label: 'More Services', icon: MoreHorizontal, color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', path: '/services' },
  ];

  // Premium Chart Data
  const weeklyAnalyticsData = [
    { name: 'Mon', Inflow: 25000, Outflow: 12000 },
    { name: 'Tue', Inflow: 40000, Outflow: 18000 },
    { name: 'Wed', Inflow: 15000, Outflow: 35000 },
    { name: 'Thu', Inflow: 65000, Outflow: 22000 },
    { name: 'Fri', Inflow: 35000, Outflow: 28000 },
    { name: 'Sat', Inflow: 85000, Outflow: 14000 },
    { name: 'Sun', Inflow: profile?.balance ? profile.balance * 0.15 : 45000, Outflow: 10000 },
  ];

  const monthlyAnalyticsData = [
    { name: 'Week 1', Inflow: 120000, Outflow: 80000 },
    { name: 'Week 2', Inflow: 250000, Outflow: 110000 },
    { name: 'Week 3', Inflow: 180000, Outflow: 160000 },
    { name: 'Week 4', Inflow: profile?.balance || 300000, Outflow: 140000 },
  ];

  const categorySpendingData = [
    { name: 'Savings & Vaults', value: 35, color: '#3B82F6' },
    { name: 'Airtime & Data', value: 15, color: '#FF8A00' },
    { name: 'TV & Electricity', value: 20, color: '#D97706' },
    { name: 'Transfers Out', value: 30, color: '#EF4444' },
  ];

  // Filtering Logic
  const filteredTxs = recentTransactions.filter(tx => {
    const matchesSearch = tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.amount?.toString().includes(searchQuery);
    const matchesFilter = txFilter === 'all' || tx.type === txFilter;
    return matchesSearch && matchesFilter;
  });

  const activeChartData = chartTimeframe === 'weekly' ? weeklyAnalyticsData : monthlyAnalyticsData;

  return (
    <div className="space-y-8 select-none">
      
      {/* 1. DYNAMIC WELCOME BANNER WITH THEME STATUS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-1">
            {getGreeting()}, {profile?.name || 'User'}
          </h1>
        </div>

        {/* Dynamic system stats / micro badge list */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-[#0B121F]/40 backdrop-blur-md">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-bold tracking-tight text-slate-500 dark:text-slate-400">
              Tier {profile?.tier || 1} Account
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-[#0B121F]/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] font-bold tracking-tight text-slate-500 dark:text-slate-400">
              Infinite VIP Suite
            </span>
          </div>
        </div>
      </div>

      {/* 2. CORE DASHBOARD GRID SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: WALLET CARD, ANALYTICS, CHARTS & ACTIVITY (COL-SPAN-8) */}
        <div className="lg:col-span-8 space-y-6">

          {/* A. PREMIUM MULTI-SKIN WALLET CARD */}
          <div className="relative group">
            {/* Card Theme Selector floating dots */}
            <div className="absolute right-6 top-6 z-20 flex gap-2 bg-black/40 dark:bg-black/75 p-1.5 rounded-full backdrop-blur-xl border border-white/10 shadow-lg">
              {[
                { id: 'titanium', class: 'bg-radial from-[#8E959E] to-[#4F545B]', label: 'Obsidian Matte' },
                { id: 'indigo', class: 'bg-radial from-[#3B82F6] to-[#1D4ED8]', label: 'Midnight Satin' },
                { id: 'sovereign', class: 'bg-radial from-[#F59E0B] to-[#78350F]', label: 'Brushed Gold' }
              ].map((skin) => (
                <button
                  key={skin.id}
                  onClick={() => setSelectedCardSkin(skin.id as any)}
                  className={`w-5 h-5 rounded-full border transition-all duration-300 relative cursor-pointer ${skin.class} ${
                    selectedCardSkin === skin.id 
                      ? 'border-white scale-120 shadow-[0_0_12px_rgba(255,255,255,0.4)]' 
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'
                  }`}
                  title={skin.label}
                />
              ))}
            </div>

            {/* Main Visualized Card Container */}
            <motion.div 
              layout
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden transition-all duration-500 shadow-2xl ${
                selectedCardSkin === 'titanium'
                  ? 'bg-gradient-to-br from-[#1C1D21] via-[#0D0E11] to-[#040405] border border-neutral-800/80 shadow-black/50'
                  : selectedCardSkin === 'indigo'
                    ? 'bg-gradient-to-br from-[#0F1C3F] via-[#070D21] to-[#01030B] border border-blue-950/70 shadow-blue-950/20'
                    : 'bg-gradient-to-br from-[#271E15] via-[#140F0A] to-[#050403] border border-amber-950/70 shadow-amber-950/20'
              }`}
            >
              {/* Apple-style premium organic ambient glow */}
              <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-40 -translate-y-1/4 translate-x-1/4 transition-colors duration-500 ${
                selectedCardSkin === 'titanium' ? 'bg-slate-400' : selectedCardSkin === 'indigo' ? 'bg-blue-500' : 'bg-amber-500'
              }`} />
              <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-black/40 rounded-full blur-[80px] pointer-events-none" />
              
              {/* Brushed metal/fine texture line simulation */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_4px]" />

              <div className="relative z-10 flex flex-col justify-between h-full space-y-7">
                
                {/* Brand Header & Chip Row */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center font-black text-lg italic tracking-tighter shadow-inner">
                      Z
                    </div>
                    <div>
                      <h3 className="text-xs font-black tracking-widest uppercase text-white leading-none">
                        ZERO BANK
                      </h3>
                      <p className="text-[9px] font-bold text-white/50 tracking-widest uppercase mt-1">
                        {selectedCardSkin === 'titanium' ? 'Obsidian Edition' : selectedCardSkin === 'indigo' ? 'Midnight Indigo' : 'Sovereign Club'}
                      </p>
                    </div>
                  </div>

                  {/* Sleek physical smart chip + NFC contact-less wave */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7.5 rounded-lg bg-gradient-to-br from-amber-200/35 via-yellow-100/15 to-amber-300/5 border border-white/10 relative overflow-hidden flex items-center justify-center shadow-inner">
                      <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                      <div className="absolute inset-y-0 left-1/3 w-px bg-white/10" />
                      <div className="absolute inset-y-0 right-1/3 w-px bg-white/10" />
                      <div className="absolute inset-x-2 top-1/4 h-px bg-white/5" />
                      <div className="absolute inset-x-2 bottom-1/4 h-px bg-white/5" />
                      <div className="w-3 h-2.5 rounded-xs border border-white/10 bg-black/5" />
                    </div>
                    {/* Contactless waves */}
                    <div className="flex gap-0.5 items-center opacity-40">
                      <span className="w-0.5 h-1.5 bg-white rounded-full"></span>
                      <span className="w-0.5 h-3 bg-white rounded-full"></span>
                      <span className="w-0.5 h-4.5 bg-white rounded-full"></span>
                    </div>
                  </div>
                </div>

                {/* Balance Information display */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-extrabold tracking-widest uppercase text-white/50">
                      Available Portfolio Balance
                    </span>
                    <button 
                      onClick={() => setShowBalance(!showBalance)} 
                      className="p-1 hover:bg-white/10 active:scale-90 rounded-full transition-all cursor-pointer text-white/50 hover:text-white"
                      title={showBalance ? "Hide Balance" : "Show Balance"}
                    >
                      {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  
                  <div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight flex items-baseline">
                      {showBalance ? (
                        <>
                          <span className="text-2xl sm:text-3xl font-bold mr-1 opacity-90">₦</span>
                          <span>{(profile?.balance || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </>
                      ) : (
                        '••••••••'
                      )}
                    </h2>
                  </div>
                </div>

                {/* Footer Account Details & Premium Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/10">
                  {/* Account detail pill */}
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-[8px] font-black tracking-widest text-white/40 uppercase leading-none mb-1">Account Number</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold tracking-widest text-white/90">
                          {profile?.accountNumber || '----------'}
                        </span>
                        <button 
                          onClick={copyAccount} 
                          className={`p-1 rounded-lg border transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                            copied 
                              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300' 
                              : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/60 hover:text-white'
                          }`}
                          title="Copy Account Number"
                        >
                          {copied ? <CheckCircle2 className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Premium Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <Link 
                      to="/add-funds" 
                      className="bg-white hover:bg-slate-50 text-slate-900 font-extrabold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all duration-200 group text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-blue-600 transition-transform group-hover:rotate-90" strokeWidth={3} />
                      <span>Add Funds</span>
                    </Link>
                    <Link 
                      to="/transfer" 
                      className="bg-white/10 hover:bg-white/15 active:scale-[0.98] border border-white/20 text-white font-extrabold py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all backdrop-blur-md group text-xs"
                    >
                      <Send className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.5} />
                      <span>Transfer</span>
                    </Link>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>

          {/* B. DYNAMIC & INTERACTIVE CHARTS AND ANALYTICS */}
          <section className={`rounded-[30px] p-5 sm:p-6 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#0B121F]/80 border-[#1E293B]/60 shadow-[0_8px_30px_rgba(0,0,0,0.2)]' 
              : 'bg-white border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.015)]'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 dark:text-blue-400">
                  Analytics & Visual Performance
                </span>
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight mt-0.5">
                  Financial Growth Ledgers
                </h3>
              </div>
              
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 w-fit self-start sm:self-center">
                <button
                  onClick={() => setChartTimeframe('weekly')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                    chartTimeframe === 'weekly'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartTimeframe('monthly')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-extrabold transition-all ${
                    chartTimeframe === 'monthly'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Primary Line area flow */}
              <div className="lg:col-span-8 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activeChartData} margin={isMobile ? { top: 10, right: 0, left: 0, bottom: 0 } : { top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isMobile ? 'transparent' : (isDarkMode ? '#1E293B' : '#E2E8F0')} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: isDarkMode ? '#64748B' : '#94A3B8', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: isDarkMode ? '#64748B' : '#94A3B8', fontSize: 10, fontWeight: 'bold' }} 
                      hide={isMobile}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', 
                        borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: isDarkMode ? '#F8FAFC' : '#0F172A'
                      }} 
                    />
                    <Area type="monotone" dataKey="Inflow" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorInflow)" />
                    <Area type="monotone" dataKey="Outflow" stroke="#EF4444" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorOutflow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Categorized donut metrics inside analytics */}
              <div className="lg:col-span-4 flex flex-col justify-center items-center border-t lg:border-t-0 lg:border-l border-slate-200/60 dark:border-slate-800 pt-5 lg:pt-0 lg:pl-6 w-full">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 self-start">
                  Category Shares
                </h4>
                
                {!isMobile ? (
                  <>
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categorySpendingData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={58}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {categorySpendingData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <div className="absolute flex flex-col items-center">
                        <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase leading-none">
                          Total
                        </span>
                        <span className="text-sm font-black tracking-tight mt-1 text-slate-850 dark:text-white">
                          100% Flow
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 w-full mt-3">
                      {categorySpendingData.map((cat) => (
                        <div key={cat.name} className="flex justify-between items-center text-[10px] font-bold">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                            <span className="text-slate-500 dark:text-slate-400">{cat.name}</span>
                          </div>
                          <span className="text-slate-900 dark:text-slate-100">{cat.value}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="w-full space-y-3.5">
                    {categorySpendingData.map((cat) => (
                      <div key={cat.name} className="space-y-1">
                        <div className="flex justify-between items-center text-[11px] font-bold">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                            <span className="text-slate-500 dark:text-slate-400">{cat.name}</span>
                          </div>
                          <span className="text-slate-900 dark:text-white">{cat.value}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500" 
                            style={{ backgroundColor: cat.color, width: `${cat.value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* C. INTERACTIVE TRANSACTION OVERVIEW & SEARCH */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pl-1">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Transaction Ledger History
                </span>
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight mt-0.5">
                  Recent Activities
                </h3>
              </div>
              
              <Link 
                to="/transactions" 
                className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1 transition-all px-3 py-1.5 bg-blue-500/5 hover:bg-blue-500/10 rounded-full w-fit"
              >
                See Full Ledger <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Live Client Search bar within the overview */}
            <div className="flex gap-2 items-center">
              <div className={`relative flex-1 rounded-2xl border transition-all duration-300 ${
                isDarkMode ? 'bg-[#0E1626] border-[#1E293B]/60 focus-within:border-blue-500/50' : 'bg-white border-slate-200/80 focus-within:border-blue-600/50'
              }`}>
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search local transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-xs font-bold outline-none border-none placeholder-slate-400"
                />
              </div>

              {/* Quick Type Filter Selector */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'credit', label: 'In' },
                  { id: 'debit', label: 'Out' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTxFilter(f.id as any)}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all ${
                      txFilter === f.id
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Transactions Card Grid/List */}
            <div className={`rounded-[30px] p-2 border transition-all duration-300 overflow-hidden ${
              isDarkMode 
                ? 'bg-[#0B121F]/80 border-[#1E293B]/60 shadow-[0_8px_30px_rgba(0,0,0,0.2)]' 
                : 'bg-white border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.015)]'
            }`}>
              {filteredTxs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex items-center justify-center mb-3 border border-slate-100 dark:border-slate-800">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-350">
                    No matching activity
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                    Try adjusting your keyword or flow filters
                  </p>
                </div>
              ) : (
                <div className="flex flex-col division-y division-slate-100 dark:division-slate-800">
                  {filteredTxs.slice(0, 1).map((tx) => {
                    const isCredit = tx.type === 'credit';
                    const initials = tx.description ? tx.description.charAt(0).toUpperCase() : 'T';
                    
                    return (
                      <div 
                        key={tx.id} 
                        onClick={() => setSelectedTx(tx)}
                        className="p-4 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-slate-800/30 rounded-[22px] transition-all duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-extrabold text-xs tracking-tight transition-transform group-hover:scale-105 ${
                            isCredit 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}>
                            {initials}
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-xs sm:text-[13px] font-extrabold text-slate-850 dark:text-white truncate mb-0.5">
                              {tx.description}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                              {format(new Date(tx.date), 'MMM dd, yyyy • HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-xs sm:text-[13px] font-black ${isCredit ? 'text-emerald-500' : 'text-slate-850 dark:text-white'}`}>
                            {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                          <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1 ${
                            tx.status === 'success' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : tx.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: QUICK SERVICES, SAVINGS VAULT, INVESTMENTS & BILLS PLANNER (COL-SPAN-4) */}
        <div className="lg:col-span-4 space-y-6">

          {/* D. BEN-TO QUICK SERVICES */}
          <section className={`rounded-[30px] p-5 sm:p-6 border transition-all duration-300 ${
            isDarkMode 
              ? 'bg-[#0B121F]/80 border-[#1E293B]/60 shadow-[0_8px_30px_rgba(0,0,0,0.2)]' 
              : 'bg-white border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.015)]'
          }`}>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Interactive Services
            </span>
            <h3 className="text-base font-extrabold tracking-tight mt-0.5 mb-4">
              Quick Portals
            </h3>

            <div className="grid grid-cols-4 gap-2.5">
              {quickServices.map((service) => (
                <Link 
                  key={service.id} 
                  to={service.path} 
                  state={service.state}
                  className="flex flex-col items-center gap-1.5 text-center group active:scale-[0.95] transition-all duration-200"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${service.color}`}>
                    <service.icon className="w-5 h-5 shadow-inner" strokeWidth={2.5} />
                  </div>
                  <span className="text-[9.5px] font-bold text-slate-600 dark:text-slate-300 tracking-tight leading-none truncate w-full">
                    {service.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>

        </div>

      </div>

      {/* 3. HIGH-FIDELITY GLASS TRANSACTION RECEIPT DETAIL MODAL */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTx(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className={`w-full max-w-[400px] rounded-[32px] p-6 sm:p-8 border relative overflow-hidden transition-all duration-300 text-center ${
                isDarkMode 
                  ? 'bg-slate-900/90 border-[#1E293B] shadow-[0_32px_80px_rgba(0,0,0,0.8)]' 
                  : 'bg-white border-slate-200 shadow-[0_32px_80px_rgba(0,0,0,0.15)]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Premium Glow decor */}
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <button 
                onClick={() => setSelectedTx(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 active:scale-90 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Status Circle */}
              <div className="mx-auto my-3 w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
              </div>

              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Sandbox Transfer Receipt
              </span>
              <h3 className="text-xl font-black mt-1 text-slate-850 dark:text-white">
                Transaction Completed
              </h3>
              
              <h2 className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-4 tracking-tight">
                {formatCurrency(selectedTx.amount)}
              </h2>

              <div className={`p-4 rounded-2xl text-left space-y-3 my-6 text-xs font-bold ${
                isDarkMode ? 'bg-slate-950/60' : 'bg-slate-50'
              }`}>
                <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800/40 pb-2.5">
                  <span className="text-slate-400 dark:text-slate-500">Description</span>
                  <span className="text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{selectedTx.description}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800/40 pb-2.5">
                  <span className="text-slate-400 dark:text-slate-500">Transfer Type</span>
                  <span className="text-slate-800 dark:text-slate-200 uppercase tracking-wider">{selectedTx.type}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800/40 pb-2.5">
                  <span className="text-slate-400 dark:text-slate-500">Status</span>
                  <span className="text-emerald-500 uppercase tracking-widest">{selectedTx.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 dark:text-slate-500">Date Completed</span>
                  <span className="text-slate-850 dark:text-slate-200">
                    {format(new Date(selectedTx.date), 'MMM dd, yyyy • HH:mm:ss')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    alert('Simulated PDF Download initiated for Sandbox ledger.');
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold tracking-tight cursor-pointer active:scale-95 transition-all"
                >
                  Download Receipt
                </button>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold cursor-pointer active:scale-95 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
