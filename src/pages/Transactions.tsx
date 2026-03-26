import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText, 
  Download, 
  Tag, 
  Check, 
  X, 
  ChevronDown,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Search
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format, isSameDay, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import jsPDF from 'jspdf';
import TransactionReceipt from '../components/TransactionReceipt';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

const CATEGORIES = [
  'Groceries',
  'Transport',
  'Utilities',
  'Entertainment',
  'Transfer',
  'Salary',
  'Shopping',
  'Dining',
  'Health',
  'Education',
  'Other'
];

export default function Transactions() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

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
    return transactions.filter(tx => {
      const matchesFilter = filter === 'all' || tx.type === filter;
      const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tx.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, searchQuery]);

  const stats = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    return transactions.reduce((acc, tx) => {
      const txDate = new Date(tx.date);
      if (isWithinInterval(txDate, { start, end })) {
        if (tx.type === 'credit') acc.income += tx.amount;
        else acc.expense += tx.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [transactions]);

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredTransactions.forEach(tx => {
      const date = format(new Date(tx.date), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredTransactions]);

  const handleUpdateCategory = async (txId: string) => {
    if (!selectedCategory) return;
    setIsUpdating(true);
    try {
      const txRef = doc(db, 'transactions', txId);
      await updateDoc(txRef, { category: selectedCategory });
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      handleFirestoreError(error, OperationType.UPDATE, `transactions/${txId}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { 
      style: 'currency', 
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const downloadStatement = () => {
    if (!profile) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Account Statement', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Name: ${profile.name}`, 20, 30);
    doc.text(`Account Number: ${profile.accountNumber}`, 20, 40);
    doc.text(`Date Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 20, 50);
    
    doc.line(20, 55, 190, 55);
    
    let y = 65;
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
      const amountStr = `${tx.type === 'credit' ? '+' : '-'}NGN ${tx.amount.toLocaleString()}`;
      
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
      : (selectedTransaction.senderName || selectedTransaction.recipientName || 'Unknown');
      
    const senderAccount = isDebit 
      ? profile?.accountNumber 
      : (selectedTransaction.senderAccount || selectedTransaction.recipientAccount || 'Unknown');
      
    const recipientName = isDebit 
      ? (selectedTransaction.recipientName || 'Unknown') 
      : profile?.name;
      
    const recipientAccount = isDebit 
      ? (selectedTransaction.recipientAccount || 'Unknown') 
      : profile?.accountNumber;

    return (
      <TransactionReceipt
        amount={selectedTransaction.amount}
        recipientName={recipientName || 'Unknown'}
        recipientAccount={recipientAccount || 'Unknown'}
        senderName={senderName || 'Unknown'}
        senderAccount={senderAccount || 'Unknown'}
        reference={selectedTransaction.reference || selectedTransaction.id}
        date={selectedTransaction.date}
        description={selectedTransaction.description}
        type={selectedTransaction.type}
        onBack={() => setSelectedTransaction(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col w-full max-w-5xl mx-auto">
      <header className="px-6 py-6 bg-white flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-neutral-text" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-neutral-text">Transactions</h1>
            <p className="text-xs text-neutral-muted font-medium">Manage your spending</p>
          </div>
        </div>
        <button 
          onClick={downloadStatement} 
          className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 transition-all font-bold text-sm"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Statement</span>
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-6 space-y-6">
        {/* Monthly Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-muted uppercase tracking-wider">Income (This Month)</p>
              <p className="text-xl font-black text-green-600">{formatCurrency(stats.income)}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-muted uppercase tracking-wider">Expense (This Month)</p>
              <p className="text-xl font-black text-red-600">{formatCurrency(stats.expense)}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 w-full sm:w-auto">
              {['all', 'credit', 'debit'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    filter === f 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-neutral-muted hover:text-neutral-text'
                  }`}
                >
                  {f === 'all' ? 'All Activity' : f === 'credit' ? 'Money In' : 'Money Out'}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-muted" />
              <input 
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-8">
          {filteredTransactions.length === 0 ? (
            <div className="bg-white rounded-[32px] p-16 text-center shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-lg font-bold text-neutral-text">No transactions found</h3>
              <p className="text-sm text-neutral-muted mt-2 max-w-xs mx-auto">
                Try adjusting your filters or search query to find what you're looking for.
              </p>
            </div>
          ) : (
            groupedTransactions.map(([date, txs]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-4 px-2 pt-4 pb-2">
                  <span className="text-sm font-black text-neutral-text uppercase tracking-wider">
                    {isSameDay(new Date(date), new Date()) ? 'Today' : format(new Date(date), 'EEEE, MMM dd')}
                  </span>
                  <div className="h-[2px] flex-1 bg-gray-100 rounded-full"></div>
                </div>
                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                  <div className="divide-y divide-gray-50">
                    {txs.map((tx) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={tx.id} 
                        onClick={() => setSelectedTransaction(tx)}
                        className="group p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-all cursor-pointer relative"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                            tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {tx.type === 'credit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-[15px] font-bold text-neutral-text truncate">{tx.description}</p>
                              <span className={`text-[9px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider ${
                                tx.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {tx.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              {/* Category Badge */}
                              <div onClick={(e) => e.stopPropagation()} className="relative">
                                {editingCategory === tx.id ? (
                                  <div className="flex items-center gap-1">
                                    <select
                                      autoFocus
                                      value={selectedCategory}
                                      onChange={(e) => setSelectedCategory(e.target.value)}
                                      className="appearance-none bg-white border border-gray-200 text-[10px] font-bold text-neutral-text py-1 pl-2 pr-6 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                      {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => handleUpdateCategory(tx.id)}
                                      className="p-1 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => setEditingCategory(null)}
                                      className="p-1 bg-gray-100 text-neutral-muted rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingCategory(tx.id);
                                      setSelectedCategory(tx.category || 'Other');
                                    }}
                                    className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-bg rounded-md text-[10px] font-black text-neutral-muted hover:text-primary transition-colors"
                                  >
                                    <Tag className="w-3 h-3" />
                                    <span className="uppercase tracking-widest">{tx.category || 'Uncategorized'}</span>
                                  </button>
                                )}
                              </div>
                              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                              <p className="text-[11px] text-neutral-muted font-medium">{format(new Date(tx.date), 'HH:mm')}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 sm:mt-0 text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                          <p className={`text-xl font-black tracking-tight ${tx.type === 'credit' ? 'text-green-600' : 'text-neutral-text'}`}>
                            {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </p>
                          <p className="text-[10px] text-neutral-muted font-mono uppercase tracking-tighter opacity-60">
                            {tx.reference?.substring(0, 12) || tx.id.substring(0, 12)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
