import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Bell, Copy, Eye, EyeOff, Send, Plus, MoreHorizontal, ArrowUpRight, ArrowDownLeft, FileText, Wallet, ChevronRight, Building2 } from 'lucide-react';
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

  const primaryActions = [
    { icon: Send, label: 'Send', path: '/transfer', color: 'bg-primary text-white shadow-md shadow-primary/20' },
    { icon: Building2, label: 'To Bank', path: '/interbank', color: 'bg-white text-primary shadow-sm border border-gray-100' },
    { icon: Plus, label: 'Add Money', path: '/add-funds', color: 'bg-white text-primary shadow-sm border border-gray-100' },
    { icon: MoreHorizontal, label: 'More', path: '/services', color: 'bg-white text-primary shadow-sm border border-gray-100' },
  ];

  return (
    <div className="min-h-screen bg-neutral-bg pb-24 font-sans w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-center sticky top-0 z-10 bg-neutral-bg/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-neutral-text font-bold text-lg">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="text-xs text-neutral-muted font-medium mb-0.5">{getGreeting()},</p>
            <h2 className="text-sm font-bold text-neutral-text">{profile?.name?.split(' ')[0]}</h2>
          </div>
        </div>
        <button 
          onClick={() => navigate('/notifications')}
          className="w-11 h-11 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center relative hover:bg-gray-50 transition-colors"
        >
          <Bell className="w-5 h-5 text-neutral-text" />
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-status-error rounded-full border-2 border-white"></span>
          )}
        </button>
      </header>

      <main className="px-6 py-4 space-y-8">
        {/* Premium Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary to-primary-accent rounded-[32px] p-7 text-white shadow-xl shadow-primary/20 relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                <Wallet className="w-4 h-4 text-white/90" />
                <span className="text-xs font-semibold text-white/90 tracking-wide">Available Balance</span>
              </div>
              <button onClick={() => setShowBalance(!showBalance)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                {showBalance ? <EyeOff className="w-4 h-4 text-white/80" /> : <Eye className="w-4 h-4 text-white/80" />}
              </button>
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight mb-3">
                {showBalance ? formatCurrency(profile?.balance || 0) : '••••••••'}
              </h1>
              <div className="flex items-center gap-3 text-white/70">
                <p className="font-mono text-sm tracking-widest">{profile?.accountNumber || '----------'}</p>
                <button onClick={copyAccount} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Primary Actions */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          {primaryActions.map((action, index) => (
            <Link key={index} to={action.path} className="flex flex-col items-center gap-3 group">
              <div className={`w-[60px] h-[60px] rounded-[20px] flex items-center justify-center transition-all duration-300 group-hover:scale-95 group-active:scale-90 shadow-sm ${action.color}`}>
                <action.icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <span className="text-[12px] font-semibold text-neutral-text">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-5">
            <div>
              <h3 className="text-lg font-bold text-neutral-text">Recent Activity</h3>
              <p className="text-xs text-neutral-muted mt-1 font-medium">Your latest transactions</p>
            </div>
            <Link to="/transactions" className="text-sm font-semibold text-primary hover:text-primary-accent flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="bg-white rounded-[28px] p-3 shadow-sm border border-gray-100">
            {recentTransactions.length === 0 ? (
              <div className="p-10 text-center text-neutral-muted flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 opacity-40" />
                </div>
                <p className="text-sm font-semibold text-neutral-text">No recent activity</p>
                <p className="text-xs mt-1">Your transactions will appear here</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50 rounded-[20px] transition-colors cursor-pointer">
                    <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                        tx.type === 'credit' ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'
                      }`}>
                        {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-neutral-text mb-1 truncate">{tx.description}</p>
                        <p className="text-[11px] font-semibold text-neutral-muted">{format(new Date(tx.date), 'MMM dd, yyyy • HH:mm')}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-status-success' : 'text-neutral-text'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <p className="text-[10px] font-bold text-neutral-muted uppercase tracking-wider mt-1.5">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
