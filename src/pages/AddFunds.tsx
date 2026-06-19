import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Copy, Info, Share2, Download, Building2, 
  CreditCard, QrCode, ClipboardCheck, AlertCircle, X, CheckSquare
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AddFunds() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Use natural account format or original mockup account
  const rawAccount = profile?.accountNumber || '0123456789';
  const displayAccount = rawAccount.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');

  const copyAccountNum = () => {
    navigator.clipboard.writeText(rawAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans w-full max-w-md mx-auto px-4">
      {/* Precision Apple-style Header */}
      <header className="pt-8 pb-6 bg-[#F8FAFC]/90 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          id="back-btn"
        >
          <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
        </button>
        <h1 className="text-sm font-bold text-[#0F172A] tracking-tight">Add Funds</h1>
        <button 
          onClick={() => alert("Funding Info: Transferred amounts will reflect instantly. This account supports local bank wires via NIBSS.")}
          className="w-10 h-10 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all shadow-sm text-neutral-muted"
        >
          <Info className="w-5 h-5" />
        </button>
      </header>

      <main className="space-y-6">
        {/* Section 1: Account Card Details */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-muted pl-1">Bank Account Details</label>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#1D4ED8] rounded-[28px] p-6 text-white shadow-[0_12px_30px_rgba(37,99,235,0.18)] relative overflow-hidden"
          >
            {/* Soft decorative background gradient meshes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-8 -left-8 w-44 h-44 bg-blue-300/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* Zero Bank Branding */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center font-black text-primary text-sm italic tracking-tighter">
                  Z
                </div>
                <span className="text-sm font-extrabold tracking-tight">Zero Bank</span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Primary</span>
            </div>

            {/* Account Digit Display */}
            <div className="mb-6 flex justify-between items-center">
              <div>
                <p className="text-[26px] font-bold font-mono tracking-widest">{rawAccount}</p>
                <p className="text-[11px] text-white/70 font-semibold tracking-wide uppercase mt-1">Wema Bank</p>
              </div>
              <button 
                onClick={copyAccountNum}
                className="px-4 py-2 bg-white/15 hover:bg-white/25 active:scale-95 rounded-full border border-white/10 text-xs font-bold transition-all flex items-center gap-1.5 backdrop-blur-md"
              >
                {copied ? (
                  <>
                    <ClipboardCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-white/90" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Premium action rows at bottom */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
              <button 
                onClick={() => setShowShareModal(true)}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 active:scale-95 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/5"
              >
                <Share2 className="w-3.5 h-3.5 opacity-90" />
                <span>Share</span>
              </button>
              <button 
                onClick={() => {
                  alert("Details downloaded securely as PDF card image.");
                }}
                className="w-full py-2.5 bg-white/10 hover:bg-white/15 active:scale-95 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/5"
              >
                <Download className="w-3.5 h-3.5 opacity-90" />
                <span>Save</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Section 2: Funding Methods */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-muted pl-1">Funding Methods</label>
          
          <div className="space-y-3">
            {/* Bank Transfer Box */}
            <div className="bg-white border border-[#E2E8F0] p-4.5 rounded-[22px] shadow-sm flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Building2 className="w-5.5 h-5.5" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] tracking-tight">Bank Transfer</h4>
                  <p className="text-xs text-neutral-muted font-medium mt-0.5">Transfer from other banks</p>
                </div>
              </div>
              <div className="w-7 h-7 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 group-hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 text-neutral-muted rotate-180" strokeWidth={3} />
              </div>
            </div>

            {/* Card top-up Box */}
            <div 
              onClick={() => alert("Card payment gateway integration: Setup card details via direct debit options.")}
              className="bg-white border border-[#E2E8F0] p-4.5 rounded-[22px] shadow-sm flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                  <CreditCard className="w-5.5 h-5.5" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] tracking-tight">Card Top-up</h4>
                  <p className="text-xs text-neutral-muted font-medium mt-0.5">Fund with debit/credit card</p>
                </div>
              </div>
              <div className="w-7 h-7 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 group-hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 text-neutral-muted rotate-180" strokeWidth={3} />
              </div>
            </div>

            {/* QR deposit Box */}
            <div 
              onClick={() => setShowQrModal(true)}
              className="bg-white border border-[#E2E8F0] p-4.5 rounded-[22px] shadow-sm flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                  <QrCode className="w-5.5 h-5.5" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A] tracking-tight">QR Deposit</h4>
                  <p className="text-xs text-neutral-muted font-medium mt-0.5">Scan QR code to deposit</p>
                </div>
              </div>
              <div className="w-7 h-7 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 group-hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5 text-neutral-muted rotate-180" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Share account details sheet Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-sm bg-white rounded-t-[32px] border-t border-[#E2E8F0] pb-8 shadow-2xl relative"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-4" />
              <div className="p-6 pt-0 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#0F172A]">Share Options</span>
                  <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                    <X className="w-5 h-5 text-neutral-muted" />
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                  <p className="text-xs text-neutral-muted font-bold">Transfer details text format:</p>
                  <p className="text-xs font-mono text-neutral-text font-medium select-all">
                    Zero Bank Details:<br/>
                    Bank: Wema Bank (Partner)<br/>
                    Number: {rawAccount}<br/>
                    Name: {profile?.name}
                  </p>
                </div>

                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`Zero Bank Details - Wema Bank - Account: ${rawAccount} - Name: ${profile?.name}`);
                    alert("Copied to clipboard. Share with your contacts.");
                    setShowShareModal(false);
                  }}
                  className="w-full bg-[#0F172A] hover:bg-black text-white py-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
                >
                  Copy Raw Text
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal Overlay */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xs overflow-hidden shadow-2xl p-6 relative border border-slate-100 text-center space-y-5"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-[#0F172A]">Zero QR Code</span>
                <button onClick={() => setShowQrModal(false)} className="p-1 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-neutral-muted" />
                </button>
              </div>

              <div className="bg-slate-100 p-8 rounded-2xl border border-slate-200/50 inline-block mx-auto relative shadow-inner">
                {/* Simulated geometric QR pattern */}
                <div className="w-36 h-36 border-4 border-slate-800 rounded-lg flex flex-col justify-between p-1.5 bg-white relative">
                  {/* Outer edge squares */}
                  <div className="flex justify-between">
                    <div className="w-8 h-8 bg-slate-900 border-2 border-white rounded"></div>
                    <div className="w-8 h-8 bg-slate-900 border-2 border-white rounded"></div>
                  </div>
                  {/* Center branding tag */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-md flex items-center justify-center text-white font-extrabold text-[10px] italic">
                    Z
                  </div>
                  {/* Bottom remaining edge squares */}
                  <div className="flex justify-between items-end">
                    <div className="w-8 h-8 bg-slate-900 border-2 border-white rounded"></div>
                    {/* Simulated visual bits */}
                    <div className="w-8 h-8 grid grid-cols-2 gap-0.5">
                      <div className="bg-slate-800"></div>
                      <div className="bg-transparent"></div>
                      <div className="bg-transparent"></div>
                      <div className="bg-slate-800"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-[#0F172A]">Unique Banking QR Barcode</p>
                <p className="text-[11px] text-neutral-muted leading-relaxed">Let other Zero Bank app users scan this to send you money instantly.</p>
              </div>

              <button 
                onClick={() => setShowQrModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-[#0F172A] py-3 rounded-xl font-bold text-xs"
              >
                Close QR Code
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
