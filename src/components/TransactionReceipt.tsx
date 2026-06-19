import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Download, Share2, ArrowLeft, ShieldCheck, Copy, Check } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ReceiptProps {
  amount: number;
  recipientName: string;
  recipientAccount: string;
  senderName: string;
  senderAccount: string;
  reference: string;
  date: string;
  description: string;
  type?: 'credit' | 'debit';
  onBack: () => void;
}

export default function TransactionReceipt({
  amount,
  recipientName,
  recipientAccount,
  senderName,
  senderAccount,
  reference,
  date,
  description,
  type = 'debit',
  onBack
}: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState('');

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#F8FAFC',
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Zero_Bank_Receipt_${reference}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to download receipt', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setShareError('');
    if (!receiptRef.current) return;
    setIsSharing(true);

    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#F8FAFC',
      });
      
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `Receipt_${reference}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Transaction Receipt',
        });
      } else {
        setShareError('Image sharing is not supported on this device. Please use the Save button.');
        setTimeout(() => setShareError(''), 4000);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError' && !err.message?.includes('Share canceled') && !err.message?.includes('cancel')) {
        console.error('Error sharing', err);
        setShareError('Failed to share receipt.');
        setTimeout(() => setShareError(''), 3000);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(date).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center pb-12 font-sans text-neutral-text">
      {/* Header */}
      <header className="px-6 py-6 w-full max-w-md bg-[#F8FAFC]/90 backdrop-blur-md flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="w-11 h-11 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
        </button>
        <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">Receipt</h1>
      </header>

      <main className="flex-1 w-full max-w-md px-4 flex flex-col items-center justify-center">
        {/* Receipt Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-white rounded-[28px] border border-[#E2E8F0] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.02)] relative"
        >
          {/* Top color indicator bar */}
          <div className="h-2 bg-[#2563EB] w-full"></div>
          
          <div ref={receiptRef} className="p-8 bg-white space-y-6">
            {/* Bank Branding Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-sm italic">Z</div>
                <span className="text-sm font-bold text-[#0F172A] tracking-tight">Zero Bank</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100/40">
                Transaction Success
              </span>
            </div>

            {/* Checkmark icon and short status info */}
            <div className="flex flex-col items-center py-2">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100/40 shadow-sm animate-bounce">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-pulse" />
              </div>
              <h2 className="text-md font-bold text-[#0F172A]">
                {type === 'credit' ? 'Transfer Received' : 'Transfer Completed'}
              </h2>
              <p className="text-xs font-semibold text-neutral-muted mt-1">{formattedDate}</p>
            </div>

            {/* Large Amount Display */}
            <div className="text-center py-4 bg-slate-50/60 rounded-2xl border border-slate-100/60">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-muted mb-1">
                {type === 'credit' ? 'Amount Received' : 'Amount Sent'}
              </p>
              <p className="text-3xl font-black text-[#2563EB] tracking-tight">
                ₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Symmetrical Details Table */}
            <div className="space-y-3.5">
              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Recipient Name</span>
                <p className="text-sm font-bold text-[#0F172A]">{recipientName}</p>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Recipient Account</span>
                <p className="text-xs font-semibold font-mono tracking-wider text-slate-800">{recipientAccount}</p>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Sender Name</span>
                <p className="text-sm font-bold text-[#0F172A]">{senderName}</p>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Sender Account</span>
                <p className="text-xs font-semibold font-mono tracking-wider text-slate-800">{senderAccount}</p>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Transaction ID</span>
                <div className="flex items-center gap-1.5 cursor-pointer" onClick={handleCopyRef}>
                  <p className="text-xs font-mono font-bold text-[#0F172A]">{reference}</p>
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-neutral-muted" />}
                </div>
              </div>

              {description && (
                <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Narration</span>
                  <p className="text-xs font-semibold text-[#0F172A] max-w-[60%] truncate">{description}</p>
                </div>
              )}

              {/* Fee Breakdown (Requested Feature) */}
              <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-muted">Transfer Fee</span>
                <p className="text-xs font-bold text-emerald-600">₦0.00 (Free Account)</p>
              </div>
            </div>

            {/* Trust branding footer at base */}
            <div className="pt-4 flex items-center justify-center gap-2 text-[#2563EB]/40 border-t border-slate-100">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold tracking-widest uppercase">Verified Zero Bank Transaction</span>
            </div>
          </div>

          {/* Decorative invoice tooth edge cutouts */}
          <div className="relative h-4 w-full bg-slate-50 overflow-hidden select-none">
            <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-slate-200"></div>
            <div className="absolute top-1/2 -left-2 w-4 h-4 bg-[#F8FAFC] rounded-full -translate-y-1/2"></div>
            <div className="absolute top-1/2 -right-2 w-4 h-4 bg-[#F8FAFC] rounded-full -translate-y-1/2"></div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="w-full mt-6 grid grid-cols-2 gap-3.5 px-1">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center justify-center gap-2 py-3.5 bg-white border border-[#E2E8F0] text-primary font-bold rounded-2xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-75"
          >
            {isSharing ? (
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Share</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-accent shadow-md shadow-primary/10 transition-all active:scale-95 disabled:opacity-75"
          >
            {isDownloading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Download className="w-4 h-4" strokeWidth={2.5} />
                <span className="text-xs uppercase tracking-wide">Save</span>
              </>
            )}
          </button>
        </div>

        {shareError && (
          <div className="w-full mt-4 bg-status-error/10 text-status-error px-4 py-2.5 rounded-xl text-xs font-semibold text-center leading-relaxed">
            {shareError}
          </div>
        )}
        
        <button
          onClick={onBack}
          className="w-full mt-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[#64748B] hover:text-[#0F172A] transition-all"
        >
          Dismiss Receipt
        </button>
      </main>
    </div>
  );
}
