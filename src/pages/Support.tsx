import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MessageSquare, Phone, Mail, ChevronDown, ChevronUp, Send, CheckCircle2, ShieldAlert, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Support() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated skeletal mount loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const faqs = [
    {
      question: 'How do I transfer money?',
      answer: 'Go to the Home tab, tap on "Transfer", enter the recipient\'s 10-digit account number, verify their name, enter the amount, and confirm with your secure 4-digit PIN.'
    },
    {
      question: 'What is my account limit?',
      answer: 'Under Silver Membership, your single transfer cap is ₦1,000,000.00 and daily cumulative limit is ₦2,500,000.00. Upgrade your tier in the Profile settings to expand.'
    },
    {
      question: 'How do I reset my transaction PIN?',
      answer: 'Navigate to Settings -> Password & Security PIN, and click transaction PIN to reset or choose a new 4-digit PIN instantly after confirming credentials.'
    },
    {
      question: 'Are there charges for transfers?',
      answer: 'Zero Bank charges absolutely NGN 0.00 for all internal and inter-bank transfers. Enjoy completely free banking without hidden utility charges.'
    }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSending(true);
    
    // Simulate sending message
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      setMessage('');
      
      setTimeout(() => setSent(false), 3500);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="pb-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="w-10 h-10 rounded-xl bg-white dark:bg-[#0B121F]/80 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-xs group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-900 dark:text-slate-100 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Help & Support</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase mt-0.5">24/7 SUPPORT & HELP DESK</p>
          </div>
        </div>

        {profile && (
          <div className="hidden sm:flex items-center gap-3 bg-white dark:bg-[#0B121F]/80 border border-slate-200 dark:border-slate-800 p-2.5 px-4 rounded-2xl shadow-xs">
            <Coins className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider uppercase">Zero Wallet</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">₦••••••</p>
            </div>
          </div>
        )}
      </header>

      {/* Main Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div key="skel" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 h-80 animate-pulse"></div>
            <div className="lg:col-span-8 bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 h-96 animate-pulse"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Contact hotline cards and support overview) */}
            <div className="lg:col-span-4 space-y-6">
              <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">Helpline Channels</span>
              
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <a href="tel:+2348000000000" className="bg-white dark:bg-[#0B121F]/80 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col items-start gap-4 hover:border-blue-500/30 dark:hover:border-blue-400/30 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Call toll-free</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">24/7 Direct Line</p>
                  </div>
                </a>

                <a href="mailto:support@zerobank.com" className="bg-white dark:bg-[#0B121F]/80 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-[0_8px_30px_rgba(0,0,0,0.01)] flex flex-col items-start gap-4 hover:border-blue-500/30 dark:hover:border-blue-400/30 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Email support</h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">support@zerobank.com</p>
                  </div>
                </a>
              </div>

              {/* Security safeguard tips */}
              <div className="bg-slate-50 dark:bg-[#0B121F]/40 border border-slate-200/80 dark:border-slate-800/80 rounded-[28px] p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Anti-fraud warning</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed mt-1.5">
                    Zero Bank help agents will **never** request your 4-digit transaction authorization PIN or password. Keep security items confidential.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (Secure Chat submission and FAQ Accordions) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Send message form */}
              <div className="bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.01)] space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-4">
                  <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">Secure Support Message</h2>
                </div>

                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div 
                      key="sent-success"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/40 dark:border-emerald-850 text-emerald-800 dark:text-emerald-300 p-4.5 rounded-2xl text-xs font-semibold flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <p>Your ticket has been logged successfully! An expert will reach back to your email shortly.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="space-y-4">
                      <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={4}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/40 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all text-xs font-bold leading-relaxed resize-none outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                        placeholder="How can our customer desk support you today?"
                      />
                      <button
                        type="submit"
                        disabled={isSending || !message.trim()}
                        className="w-full bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2 cursor-pointer"
                      >
                        {isSending ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Log Support Ticket</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </AnimatePresence>
              </div>

              {/* Expandable FAQs Accordion */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider pl-1">Frequently Asked Questions</h3>
                <div className="bg-white dark:bg-[#0B121F]/80 rounded-[28px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.01)] divide-y divide-slate-100 dark:divide-slate-800">
                  {faqs.map((faq, index) => (
                    <div key={index} className="p-1">
                      <button
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="w-full p-4.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-all"
                      >
                        <span className="text-xs font-bold text-slate-900 dark:text-white pr-4">{faq.question}</span>
                        {openFaq === index ? (
                          <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" strokeWidth={2.5} />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" strokeWidth={2.5} />
                        )}
                      </button>
                      <AnimatePresence>
                        {openFaq === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4.5 pb-4.5 pt-1 text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed border-t border-slate-100 dark:border-slate-800/40">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
