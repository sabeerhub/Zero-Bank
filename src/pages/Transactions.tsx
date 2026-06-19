import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
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
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
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
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
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
      'bg-[#EBF5FF] text-[#2563EB]',
      'bg-[#F0FDF4] text-[#16A34A]',
      'bg-[#FFF5EB] text-[#FF8A00]',
      'bg-[#F5F3FF] text-[#7C3AED]',
      'bg-[#EFF6FF] text-[#3B82F6]'
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
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans w-full max-w-md mx-auto px-6">
      {/* Header */}
      <header className="pt-8 pb-4 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')} 
          className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
        </button>
        
        <button 
          onClick={downloadStatement} 
          className="p-2.5 bg-[#EBF5FF] text-[#2563EB] rounded-xl hover:bg-blue-100 active:scale-95 transition-all font-bold text-xs flex items-center gap-1.5"
          title="Export CSV / PDF"
        >
          <Download className="w-4 h-4" strokeWidth={2.5} />
          <span>Statement</span>
        </button>
      </header>

      {/* Main Title Section */}
      <div className="mt-2 mb-6">
        <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">History</h1>
      </div>

      <main className="space-y-5">
        {/* Money Flows Category Pills - exactly like image design */}
        <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
          <button 
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              typeFilter === 'all' 
                ? 'bg-[#2563EB] text-white shadow-sm' 
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            All
          </button>
          <button 
            type="button"
            onClick={() => setTypeFilter('credit')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              typeFilter === 'credit' 
                ? 'bg-[#2563EB] text-white shadow-sm' 
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Money In
          </button>
          <button 
            type="button"
            onClick={() => setTypeFilter('debit')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              typeFilter === 'debit' 
                ? 'bg-[#2563EB] text-white shadow-sm' 
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            Money Out
          </button>
        </div>

        {/* Beautiful Pristine Search Input - directly matching design */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#94A3B8]" />
          <input 
            type="text"
            placeholder="Search transactions"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E2E8F0] rounded-2xl text-xs font-semibold placeholder-[#94A3B8] focus:border-primary outline-none transition-all shadow-sm"
          />
        </div>

        {/* Ledger list */}
        <div className="space-y-6 pt-2">
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-[28px] p-12 text-center border border-[#E2E8F0] flex flex-col items-center shadow-sm">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-xs font-bold text-[#0F172A]">No transfers found</h3>
              <p className="text-[10px] text-neutral-muted mt-1 leading-relaxed">
                We couldn't locate any transactions matching your parameters.
              </p>
            </div>
          ) : (
            groupedTransactions.map(([date, txs]) => {
              const txDate = new Date(date);
              let heading = format(txDate, 'MMMM dd, yyyy');
              if (isSameDay(txDate, new Date())) {
                heading = 'Today';
              } else if (isYesterday(txDate)) {
                heading = 'Yesterday';
              }

              return (
                <div key={date} className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase text-neutral-muted tracking-wider pl-1">
                    {heading}
                  </h3>
                  
                  <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden p-1 shadow-sm divide-y divide-[#F1F5F9]">
                    {txs.map((tx) => {
                      const isCredit = tx.type === 'credit';
                      const details = getTxIconDetails(tx);
                      
                      return (
                        <div 
                          key={tx.id} 
                          onClick={() => setSelectedTransaction(tx)}
                          className="p-3.5 flex items-center justify-between hover:bg-[#F8FAFC] rounded-[22px] transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-4.5 flex-1 min-w-0 pr-4">
                            {/* Colorful responsive avatar representation exactly like mockup */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-xs tracking-tight ${details.style}`}>
                              {details.icon ? (
                                <details.icon className="w-5 h-5" strokeWidth={2.2} />
                              ) : (
                                <span>{details.initials}</span>
                              )}
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-[#0F172A] truncate group-hover:text-primary transition-colors leading-snug">
                                {tx.description}
                              </p>
                              <p className="text-[10px] font-semibold text-neutral-muted leading-relaxed mt-0.5">
                                {isCredit ? 'Money In' : tx.category || 'Transfer'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <p className={`text-xs font-extrabold ${isCredit ? 'text-[#16A34A]' : 'text-[#0F172A]'}`}>
                              {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                            </p>
                            <p className="text-[9px] font-semibold text-neutral-muted mt-0.5 leading-snug">
                              {format(new Date(tx.date), 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
