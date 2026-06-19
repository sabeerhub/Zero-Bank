import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
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
  MoreHorizontal 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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
      limit(5)
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

  // Quick Services list formatted precisely for the bento layout to match screenshot
  const quickServices = [
    { id: 'airtime', label: 'Airtime', icon: Smartphone, color: 'bg-[#FFF5EB] text-[#FF8A00]', path: '/services', state: { service: 'airtime' } },
    { id: 'data', label: 'Data', icon: Wifi, color: 'bg-[#EBF5FF] text-[#2563EB]', path: '/services', state: { service: 'data' } },
    { id: 'electricity', label: 'Electricity', icon: Lightbulb, color: 'bg-[#FFFBEB] text-[#D97706]', path: '/services', state: { service: 'electricity' } },
    { id: 'bills', label: 'TV Bills', icon: Tv, color: 'bg-[#EDF2FE] text-[#2563EB]', path: '/services', state: { service: 'bills' } },
    { id: 'giftcards', label: 'Gift Cards', icon: Gift, color: 'bg-[#F0FDF4] text-[#16A34A]', path: '/gift-cards' },
    { id: 'loan', label: 'Loan', icon: PiggyBank, color: 'bg-[#F5F3FF] text-[#7C3AED]', path: '/loan' },
    { id: 'card', label: 'My Card', icon: CreditCard, color: 'bg-[#EFF6FF] text-[#3B82F6]', path: '/card' },
    { id: 'more', label: 'More', icon: MoreHorizontal, color: 'bg-[#F1F5F9] text-[#64748B]', path: '/services' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans w-full max-w-4xl mx-auto px-4">
      {/* Greeting Header */}
      <header className="pt-8 pb-6 flex justify-between items-center bg-[#F8FAFC]/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full border border-slate-200/60 bg-gradient-to-tr from-primary to-primary-accent flex items-center justify-center text-white font-bold text-base shadow-sm">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-[10px] text-neutral-muted font-bold tracking-wide uppercase mb-0.5">{getGreeting()},</p>
            <h2 className="text-lg font-extrabold text-[#0F172A] tracking-tight leading-none">{profile?.name || 'Sabeer'}</h2>
          </div>
        </div>
        <button 
          onClick={() => navigate('/notifications')}
          className="w-11 h-11 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center relative hover:bg-slate-50 active:scale-95 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
        >
          <Bell className="w-4.5 h-4.5 text-[#0F172A]" />
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-status-error rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
      </header>

      <main className="space-y-6">
        {/* Main Wallet Card (CENTERPIECE) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-[24px] xs:rounded-[32px] p-6 xs:p-8 text-white shadow-[0_16px_40px_rgba(37,99,235,0.15)] relative overflow-hidden"
        >
          {/* Ambient light glow graphics */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute -bottom-8 -left-8 w-60 h-60 bg-black/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-inner">
                <Wallet className="w-3.5 h-3.5 text-white/90" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-white/90">Available Balance</span>
              </div>
              <button 
                onClick={() => setShowBalance(!showBalance)} 
                className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full backdrop-blur-md border border-white/10 transition-all"
              >
                {showBalance ? <EyeOff className="w-3.5 h-3.5 text-white/90" /> : <Eye className="w-3.5 h-3.5 text-white/90" />}
              </button>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl xs:text-3xl md:text-4xl font-extrabold tracking-tight mb-2.5 flex items-baseline">
                {showBalance ? formatCurrency(profile?.balance || 0) : '••••••••'}
              </h1>
              
              <div className="flex items-center gap-2 text-white/80">
                <p className="font-mono text-[11px] tracking-widest bg-white/5 py-0.5 px-2 rounded-lg border border-white/5 shadow-sm">
                  {profile?.accountNumber || '----------'}
                </p>
                <button 
                  onClick={copyAccount} 
                  className="p-1.5 bg-white/5 hover:bg-white/15 active:scale-95 rounded-lg transition-all border border-white/5"
                  title="Copy Account Number"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Side-by-Side CTAs */}
            <div className="grid grid-cols-2 gap-3.5 mt-2">
              <Link 
                to="/add-funds" 
                className="bg-white text-primary font-bold py-3 px-4 rounded-xl xs:rounded-2xl flex items-center justify-center gap-1.5 hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm group text-xs xs:text-sm"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:scale-110" strokeWidth={3} />
                <span>Add Funds</span>
              </Link>
              <Link 
                to="/transfer" 
                className="bg-white/10 hover:bg-white/20 active:scale-[0.98] border border-white/20 text-white font-bold py-3 px-4 rounded-xl xs:rounded-2xl flex items-center justify-center gap-1.5 transition-all backdrop-blur-md group text-xs xs:text-sm"
              >
                <Send className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2.5} />
                <span>Transfer</span>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Services Grid */}
        <section className="space-y-3">
          <div className="flex justify-between items-center pl-1">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted">Quick Services</h3>
          </div>
          
          <div className="grid grid-cols-4 gap-2.5 xs:gap-3.5 px-0.5">
            {quickServices.map((service) => (
              <Link 
                key={service.id} 
                to={service.path} 
                state={service.state}
                className="bg-white border border-[#E2E8F0] p-2.5 xs:p-4 rounded-[18px] xs:rounded-[22px] flex flex-col items-center gap-2 xs:gap-3 group hover:border-[#CBD5E1] hover:shadow-xs active:scale-[0.96] transition-all duration-200 text-center"
              >
                <div className={`w-9 h-9 xs:w-11 xs:h-11 rounded-xl xs:rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${service.color}`}>
                  <service.icon className="w-4 h-4 xs:w-5 xs:h-5 shadow-inner" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] xs:text-[11px] font-bold text-[#0F172A] tracking-tight leading-none truncate w-full">{service.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Transactions Preview */}
        <section className="space-y-4">
          <div className="flex justify-between items-end pl-1">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-muted">Recent Activity</h3>
            </div>
            <Link 
              to="/transactions" 
              className="text-[11px] font-bold text-primary hover:text-primary-accent flex items-center gap-1 transition-colors px-2.5 py-1 bg-primary/5 rounded-full"
            >
              See All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="bg-white rounded-[26px] p-2 shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-[#E2E8F0] overflow-hidden">
            {recentTransactions.length === 0 ? (
              <div className="py-12 text-center text-neutral-muted flex flex-col items-center">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 border border-slate-100">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-bold text-neutral-text">No recent activity</p>
                <p className="text-xs text-neutral-muted mt-1 font-medium">Your transactions will show up here</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {recentTransactions.map((tx) => {
                  const isCredit = tx.type === 'credit';
                  const initials = tx.description ? tx.description.charAt(0).toUpperCase() : 'T';
                  
                  return (
                    <div 
                      key={tx.id} 
                      onClick={() => navigate('/transactions', { state: { selectedTx: tx } })}
                      className="p-4 flex items-center justify-between hover:bg-[#F8FAFC] rounded-[20px] transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold text-sm tracking-tight ${
                          isCredit ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'
                        }`}>
                          {initials}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-[#0F172A] truncate mb-0.5">{tx.description}</p>
                          <p className="text-[11px] font-semibold text-neutral-muted">{format(new Date(tx.date), 'MMM dd, yyyy • HH:mm')}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${isCredit ? 'text-[#22C55E]' : 'text-[#0F172A]'}`}>
                          {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 ${
                          tx.status === 'success' 
                            ? 'bg-[#22C55E]/10 text-[#22C55E]' 
                            : tx.status === 'pending'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
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
      </main>
    </div>
  );
}
