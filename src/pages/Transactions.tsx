import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText, 
  Download, 
  Check, 
  X, 
  Search,
  Smartphone,
  Wifi,
  Lightbulb,
  Tv,
  Gift,
  PiggyBank,
  CreditCard,
  User,
  Filter,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format, isSameDay, isYesterday, startOfMonth, isWithinInterval, subDays } from 'date-fns';
import jsPDF from 'jspdf';
import TransactionReceipt from '../components/TransactionReceipt';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Transactions() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    location.state?.selectedTx || null
  );

  useEffect(() => {
    if (!profile) return;
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', profile.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txs);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      
      // Date Filter
      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = isSameDay(txDate, now);
      } else if (dateFilter === 'week') {
        const sevenDaysAgo = subDays(now, 7);
        matchesDate = txDate >= sevenDaysAgo;
      } else if (dateFilter === 'month') {
        matchesDate = isWithinInterval(txDate, {
          start: startOfMonth(now),
          end: now
        });
      }

      // Type Filter
      const matchesType = typeFilter === 'all' || tx.type === typeFilter;

      // Search text
      const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tx.category?.toLowerCase().includes(searchQuery.toLowerCase());
                           
      return matchesDate && matchesType && matchesSearch;
    });
  }, [transactions, dateFilter, typeFilter, searchQuery]);

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredTransactions.forEach(tx => {
      const dateKey = format(new Date(tx.date), 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(tx);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getTxIconDetails = (tx: any) => {
    const desc = tx.description.toLowerCase();
    
    if (desc.includes('airtime')) {
      return {
        icon: Smartphone,
        style: 'bg-[#FFF5EB] text-[#FF8A00]'
      };
    }
    if (desc.includes('data') || desc.includes('internet') || desc.includes('bundle')) {
      return {
        icon: Wifi,
        style: 'bg-[#EBF5FF] text-[#2563EB]'
      };
    }
    if (desc.includes('electricity') || desc.includes('power') || desc.includes('nepa') || desc.includes('aedc')) {
      return {
        icon: Lightbulb,
        style: 'bg-[#FFFBEB] text-[#D97706]'
      };
    }
    if (desc.includes('tv') || desc.includes('gotv') || desc.includes('dstv') || desc.includes('startimes') || desc.includes('cable')) {
      return {
        icon: Tv,
        style: 'bg-[#EDF2FE] text-[#2563EB]'
      };
    }
    if (desc.includes('gift') || desc.includes('card')) {
      return {
        icon: Gift,
        style: 'bg-[#F0FDF4] text-[#16A34A]'
      };
    }
    if (desc.includes('loan') || desc.includes('credit')) {
      return {
        icon: PiggyBank,
        style: 'bg-[#F5F3FF] text-[#7C3AED]'
      };
    }
    
    // Name Initials Helper for Transfer to/from persons
    const cleanName = tx.description.replace(/Transfer to|Transfer from|From|To/gi, '').trim();
    const nameParts = cleanName.split(' ');
    let initials = '';
    
    if (nameParts.length > 0 && nameParts[0]) {
      initials += nameParts[0].charAt(0).toUpperCase();
      if (nameParts.length > 1 && nameParts[nameParts.length - 1]) {
        initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
      }
    }
    if (!initials) initials = 'TX';
    
    const colors = [
      'bg-blue-50 text-[#2563EB]',
      'bg-emerald-50 text-[#16A34A]',
      'bg-amber-50 text-[#FF8A00]',
      'bg-purple-50 text-[#7C3AED]',
      'bg-sky-50 text-[#0284C7]'
    ];
    
    const hash = tx.description.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const style = colors[hash % colors.length];

    return {
      initials,
      style
    };
  };

  const downloadStatement = () => {
    if (!profile) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text('ZERO BANK STATEMENT', 20, 20);
    
    doc.setFontSize(11);
    doc.text(`Account Holder: ${profile.name}`, 20, 32);
    doc.text(`Account Number: ${profile.accountNumber}`, 20, 39);
    doc.text(`Date Exported: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 20, 46);
    
    doc.line(20, 52, 190, 52);
    
    let y = 62;
    doc.setFontSize(10);
    doc.text('Date', 20, y);
    doc.text('Description', 60, y);
    doc.text('Type', 140, y);
    doc.text('Amount', 170, y);
    
    doc.line(20, y + 2, 190, y + 2);
    y += 10;
    
    filteredTransactions.forEach(tx => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      
      const dateStr = format(new Date(tx.date), 'dd/MM/yyyy');
      const descStr = tx.description.substring(0, 30) + (tx.description.length > 30 ? '...' : '');
      const typeStr = tx.type.toUpperCase();
      const amountStr = `${tx.type === 'credit' ? '+' : '-'}N ${tx.amount.toLocaleString()}`;
      
      doc.text(dateStr, 20, y);
      doc.text(descStr, 60, y);
      doc.text(typeStr, 140, y);
      doc.text(amountStr, 170, y);
      
      y += 10;
    });
    
    doc.save(`Statement_${profile.accountNumber}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  };

  if (selectedTransaction) {
    const isDebit = selectedTransaction.type === 'debit';
    
    const senderName = isDebit 
      ? profile?.name 
      : (selectedTransaction.senderName || selectedTransaction.recipientName || 'Zero Bank User');
      
    const senderAccount = isDebit 
      ? profile?.accountNumber 
      : (selectedTransaction.senderAccount || selectedTransaction.recipientAccount || '----------');
      
    const recipientName = isDebit 
      ? (selectedTransaction.recipientName || 'Receiver Account') 
      : profile?.name;
      
    const recipientAccount = isDebit 
      ? (selectedTransaction.recipientAccount || '----------') 
      : profile?.accountNumber;

    return (
      <TransactionReceipt
        amount={selectedTransaction.amount}
        recipientName={recipientName || 'Receiver'}
        recipientAccount={recipientAccount || '----------'}
        senderName={senderName || 'Sender'}
        senderAccount={senderAccount || '----------'}
        reference={selectedTransaction.reference || selectedTransaction.id}
        date={selectedTransaction.date}
        description={selectedTransaction.description}
        type={selectedTransaction.type}
        onBack={() => setSelectedTransaction(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-[#0F172A] w-full max-w-7xl mx-auto px-4 md:px-8">
      {/* Premium Header */}
      <header className="pt-8 pb-6 flex items-center justify-between border-b border-slate-100/80 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="w-11 h-11 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-sm group"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A] group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Ledger Statement</h1>
            <p className="text-[11px] text-neutral-muted font-bold tracking-wide uppercase mt-0.5">Comprehensive transaction history</p>
          </div>
        </div>
        
        <button 
          onClick={downloadStatement} 
          disabled={filteredTransactions.length === 0}
          className="p-3 bg-[#2563EB] text-white hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 rounded-2xl shadow-md active:scale-95 transition-all font-bold text-xs flex items-center gap-2 border border-blue-600/20"
          title="Export PDF Statement"
        >
          <Download className="w-4 h-4" strokeWidth={2.5} />
          <span>Download PDF</span>
        </button>
      </header>

      {/* Main Responsive Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Interactive Filter Toolbar Sidebar) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Filter className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-muted">Filters & Search</h3>
            </div>

            {/* Premium Pristine Search Bar */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-muted">Search Description</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 focus:bg-white border-none focus:ring-2 focus:ring-primary/25 rounded-2xl text-xs font-bold text-[#0F172A] outline-none transition-all placeholder-slate-400"
                />
              </div>
            </div>

            {/* Money flows filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-muted">Money Flow Category</label>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'credit', 'debit'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setTypeFilter(f)}
                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all text-center ${
                      typeFilter === f 
                        ? 'bg-[#0F172A] border-slate-900 text-white shadow-sm' 
                        : 'bg-slate-50 hover:bg-slate-100 border-transparent text-[#64748B]'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'credit' ? 'In' : 'Out'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date period filters */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-muted">Statement Period</label>
              <div className="grid grid-cols-2 gap-2">
                {(['all', 'today', 'week', 'month'] as const).map(d => (
                  <button 
                    key={d}
                    onClick={() => setDateFilter(d)}
                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all text-center ${
                      dateFilter === d 
                        ? 'bg-[#0F172A] border-slate-900 text-white shadow-sm' 
                        : 'bg-slate-50 hover:bg-slate-100 border-transparent text-[#64748B]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Ledger Records lists) */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div key="shimmer" className="space-y-6">
                {[1, 2].map(g => (
                  <div key={g} className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-24 animate-pulse"></div>
                    <div className="bg-white border border-slate-100 rounded-3xl p-2 space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-14 bg-slate-100 rounded-2xl animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <motion.div 
                key="empty-ledger"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[28px] p-12 text-center border border-slate-100 flex flex-col items-center justify-center shadow-sm"
              >
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                  <FileText className="w-7 h-7 text-slate-300" />
                </div>
                <h3 className="text-sm font-black text-[#0F172A]">No Ledger records found</h3>
                <p className="text-xs text-neutral-muted mt-1.5 leading-relaxed max-w-sm">
                  We couldn't locate any transaction history matching the selected search query or statement parameters.
                </p>
                <button 
                  onClick={() => { setTypeFilter('all'); setDateFilter('all'); setSearchQuery(''); }}
                  className="mt-6 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-extrabold text-xs rounded-xl transition-all"
                >
                  Clear Active Filters
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="ledger-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {groupedTransactions.map(([date, txs]) => {
                  const txDate = new Date(date);
                  let heading = format(txDate, 'MMMM dd, yyyy');
                  if (isSameDay(txDate, new Date())) {
                    heading = 'Today';
                  } else if (isYesterday(txDate)) {
                    heading = 'Yesterday';
                  }

                  return (
                    <div key={date} className="space-y-3.5">
                      <h3 className="text-[10px] font-black uppercase text-neutral-muted tracking-wider pl-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{heading}</span>
                      </h3>
                      
                      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden p-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.01)] divide-y divide-slate-100/50">
                        {txs.map((tx) => {
                          const isCredit = tx.type === 'credit';
                          const details = getTxIconDetails(tx);
                          
                          return (
                            <div 
                              key={tx.id} 
                              onClick={() => setSelectedTransaction(tx)}
                              className="p-4 flex items-center justify-between hover:bg-[#F8FAFC] rounded-[22px] transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-4.5 flex-1 min-w-0 pr-4">
                                {/* Category Avatar Badge Representation */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-xs tracking-tight ${details.style} shadow-inner`}>
                                  {details.icon ? (
                                    <details.icon className="w-5 h-5" strokeWidth={2.2} />
                                  ) : (
                                    <span>{details.initials}</span>
                                  )}
                                </div>
                                
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-[#0F172A] truncate group-hover:text-[#2563EB] transition-colors leading-snug">
                                    {tx.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[9px] font-bold text-neutral-muted leading-relaxed uppercase tracking-wider">
                                      {isCredit ? 'Credit In' : tx.category || 'De-bit'}
                                    </span>
                                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                    <span className="text-[9px] font-mono font-medium text-slate-400">
                                      Ref: {tx.reference ? tx.reference.substring(0, 10) : tx.id.substring(0, 6)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <p className={`text-xs font-black ${isCredit ? 'text-emerald-600' : 'text-[#0F172A]'}`}>
                                  {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                                </p>
                                <p className="text-[9px] font-bold text-neutral-muted mt-0.5 leading-snug">
                                  {format(new Date(tx.date), 'h:mm a')}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
