import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Search, UserCheck, AlertCircle, QrCode } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase';
import TransactionPinModal from '../components/TransactionPinModal';
import TransactionReceipt from '../components/TransactionReceipt';

import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Transfer() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const [recipient, setRecipient] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Debounce account verification
  useEffect(() => {
    if (accountNumber.length === 10) {
      verifyAccount(accountNumber);
    } else {
      setRecipient(null);
      setError('');
    }
  }, [accountNumber]);

  const verifyAccount = async (accNum: string) => {
    if (accNum === profile?.accountNumber) {
      setError("You cannot transfer to yourself");
      return;
    }

    setIsVerifying(true);
    setError('');
    
    try {
      const q = query(collection(db, 'users'), where('accountNumber', '==', accNum));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setRecipient({ id: userDoc.id, ...userDoc.data() });
      } else {
        setRecipient(null);
        setError("Account not found");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Failed to verify account");
      handleFirestoreError(err, OperationType.GET, 'users');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTransferClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !recipient) return;
    
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError("Invalid amount");
      return;
    }
    
    if (transferAmount > profile.balance) {
      setError("Insufficient funds");
      return;
    }

    setIsPinModalOpen(true);
  };

  const executeTransfer = async () => {
    if (!profile || !recipient) return;
    
    setIsPinModalOpen(false);
    const transferAmount = parseFloat(amount);
    setIsTransferring(true);
    setError('');

    try {
      const batch = writeBatch(db);
      const date = new Date().toISOString();
      const reference = 'TRF-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      // 1. Deduct from sender
      const senderRef = doc(db, 'users', profile.uid);
      batch.update(senderRef, { balance: profile.balance - transferAmount });

      // 2. Add to receiver
      const receiverRef = doc(db, 'users', recipient.id);
      batch.update(receiverRef, { balance: (recipient.balance || 0) + transferAmount });

      // 3. Create sender transaction (Debit)
      const senderTxRef = doc(collection(db, 'transactions'));
      batch.set(senderTxRef, {
        userId: profile.uid,
        type: 'debit',
        amount: transferAmount,
        category: 'transfer',
        description: description || `Transfer to ${recipient.name}`,
        date,
        status: 'success',
        reference,
        recipientName: recipient.name,
        recipientAccount: recipient.accountNumber
      });

      // 4. Create receiver transaction (Credit)
      const receiverTxRef = doc(collection(db, 'transactions'));
      batch.set(receiverTxRef, {
        userId: recipient.id,
        type: 'credit',
        amount: transferAmount,
        category: 'transfer',
        description: `Transfer from ${profile.name}`,
        date,
        status: 'success',
        reference,
        recipientName: profile.name,
        recipientAccount: profile.accountNumber
      });

      // 5. Create notification for sender
      const senderNotifRef = doc(collection(db, 'notifications'));
      batch.set(senderNotifRef, {
        userId: profile.uid,
        title: 'Transfer Sent',
        message: `You successfully sent NGN ${transferAmount.toLocaleString()} to ${recipient.name}.`,
        type: 'transaction',
        read: false,
        date,
        link: '/transactions'
      });

      // 6. Create notification for receiver
      const receiverNotifRef = doc(collection(db, 'notifications'));
      batch.set(receiverNotifRef, {
        userId: recipient.id,
        title: 'Funds Received',
        message: `You received NGN ${transferAmount.toLocaleString()} from ${profile.name}.`,
        type: 'transaction',
        read: false,
        date,
        link: '/transactions'
      });

      await batch.commit();
      
      setReceiptData({
        amount: transferAmount,
        recipientName: recipient.name,
        recipientAccount: recipient.accountNumber,
        senderName: profile.name,
        senderAccount: profile.accountNumber,
        reference,
        date,
        description: description || `Transfer to ${recipient.name}`
      });
      setSuccess(true);

    } catch (err: any) {
      console.error("Transfer error:", err);
      setError(err.message || "Transfer failed. Please try again.");
      handleFirestoreError(err, OperationType.WRITE, 'transactions/users');
    } finally {
      setIsTransferring(false);
    }
  };

  if (success && receiptData) {
    return (
      <TransactionReceipt
        {...receiptData}
        onBack={() => navigate('/')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="px-6 py-6 bg-white flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-neutral-text" />
        </button>
        <h1 className="text-xl font-bold text-neutral-text">Internal Transfer</h1>
      </header>

      <main className="flex-1 p-6">
        <div className="bg-white rounded-[24px] p-6 shadow-sm mb-6">
          <p className="text-sm text-neutral-muted mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-primary">
            ₦{profile?.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        {error && (
          <div className="bg-status-error/10 text-status-error p-4 rounded-xl mb-6 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleTransferClick} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-text">Recipient Account Number</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-muted" />
              <input
                type="text"
                maxLength={10}
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-12 pr-12 py-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-mono text-lg tracking-wider"
                placeholder="0000000000"
              />
              {isVerifying ? (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <button
                  type="button"
                  onClick={() => setError("QR Code scanning is coming soon.")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <QrCode className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {recipient && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-900">{recipient.name}</p>
                <p className="text-xs text-green-700">Verified Account</p>
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-text">Amount (₦)</label>
            <input
              type="number"
              required
              min="100"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 transition-all font-bold text-xl"
              placeholder="0.00"
              disabled={!recipient}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-text">Narration (Optional)</label>
            <input
              type="text"
              maxLength={150}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-4 bg-white border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              placeholder="What's this for?"
              disabled={!recipient}
            />
          </div>

          <button
            type="submit"
            disabled={!recipient || isTransferring || !amount}
            className="w-full bg-primary hover:bg-primary-accent text-white py-4 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-8 flex justify-center items-center shadow-lg shadow-primary/20"
          >
            {isTransferring ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Transfer'}
          </button>
        </form>
      </main>

      <TransactionPinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={executeTransfer} 
      />
    </div>
  );
}
