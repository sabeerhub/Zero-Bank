import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Download, Share2, ArrowLeft, ShieldCheck } from 'lucide-react';
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

  const [shareError, setShareError] = useState('');

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Receipt_${reference}.png`;
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
        backgroundColor: '#ffffff',
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

  const formattedDate = new Date(date).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col">
      <header className="px-6 py-6 bg-white flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-neutral-text" />
        </button>
        <h1 className="text-xl font-bold text-neutral-text">Transaction Receipt</h1>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center">
        {/* Receipt Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-[24px] shadow-xl overflow-hidden relative"
        >
          {/* Top colored bar */}
          <div className="h-2 bg-primary w-full"></div>
          
          <div ref={receiptRef} className="p-6 bg-white">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-status-success/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-status-success" />
              </div>
              <h2 className="text-xl font-bold text-neutral-text">
                {type === 'credit' ? 'Transfer Received' : 'Transfer Successful'}
              </h2>
              <p className="text-sm text-neutral-muted mt-1">{formattedDate}</p>
            </div>

            <div className="text-center mb-8">
              <p className="text-sm text-neutral-muted mb-1">
                {type === 'credit' ? 'Amount Received' : 'Amount Sent'}
              </p>
              <p className="text-4xl font-black text-primary">
                ₦{amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-muted">To</span>
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-text">{recipientName}</p>
                  <p className="text-xs text-neutral-muted">{recipientAccount}</p>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-muted">From</span>
                <div className="text-right">
                  <p className="text-sm font-bold text-neutral-text">{senderName}</p>
                  <p className="text-xs text-neutral-muted">{senderAccount}</p>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-neutral-muted">Reference</span>
                <p className="text-sm font-mono font-medium text-neutral-text">{reference}</p>
              </div>

              {description && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm text-neutral-muted">Narration</span>
                  <p className="text-sm font-medium text-neutral-text text-right max-w-[60%] truncate">
                    {description}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 text-primary/40">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-semibold tracking-wider uppercase">Zero Bank Secure</span>
            </div>
          </div>

          {/* Decorative dashed line at bottom */}
          <div className="relative h-4 w-full overflow-hidden">
            <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-gray-200"></div>
            <div className="absolute top-1/2 -left-2 w-4 h-4 bg-neutral-bg rounded-full -translate-y-1/2"></div>
            <div className="absolute top-1/2 -right-2 w-4 h-4 bg-neutral-bg rounded-full -translate-y-1/2"></div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="w-full max-w-md mt-8 grid grid-cols-2 gap-4">
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center justify-center gap-2 py-4 bg-white text-primary font-semibold rounded-xl shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-70"
          >
            {isSharing ? (
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                Share
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 py-4 bg-primary text-white font-semibold rounded-xl shadow-sm hover:bg-primary-accent transition-colors disabled:opacity-70"
          >
            {isDownloading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Download className="w-5 h-5" />
                Save
              </>
            )}
          </button>
        </div>
        
        {shareError && (
          <div className="w-full max-w-md mt-4 bg-status-error/10 text-status-error p-3 rounded-xl text-sm text-center">
            {shareError}
          </div>
        )}
        
        <button
          onClick={onBack}
          className="w-full max-w-md mt-4 py-4 text-neutral-muted font-semibold hover:text-neutral-text transition-colors"
        >
          Back to Dashboard
        </button>
      </main>
    </div>
  );
}
