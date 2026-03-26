import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, MessageSquare, Phone, Mail, ChevronDown, ChevronUp, Send } from 'lucide-react';

export default function Support() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const faqs = [
    {
      question: 'How do I transfer money?',
      answer: 'Go to the Home tab, tap on "Transfer", enter the recipient\'s 10-digit account number, verify their name, enter the amount, and confirm.'
    },
    {
      question: 'What is my account limit?',
      answer: 'Your current daily transfer limit is ₦500,000. To increase this limit, please visit any of our branches with a valid ID.'
    },
    {
      question: 'How do I reset my PIN?',
      answer: 'Currently, PIN reset is handled via our customer support. Please send us a message or call our hotline.'
    },
    {
      question: 'Are there charges for transfers?',
      answer: 'Internal transfers are completely free. Interbank transfers (coming soon) will attract a standard NIBSS fee of ₦10 - ₦50 depending on the amount.'
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
      
      setTimeout(() => setSent(false), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="px-6 py-6 bg-white flex items-center gap-4 shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-neutral-text" />
        </button>
        <h1 className="text-xl font-bold text-neutral-text">Help & Support</h1>
      </header>

      <main className="flex-1 p-6 space-y-8">
        {/* Contact Options */}
        <div className="grid grid-cols-2 gap-4">
          <a href="tel:+2348000000000" className="bg-white p-4 rounded-[20px] shadow-sm flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-neutral-text">Call Us</p>
              <p className="text-[10px] text-neutral-muted mt-0.5">24/7 Available</p>
            </div>
          </a>
          
          <a href="mailto:support@zerobank.com" className="bg-white p-4 rounded-[20px] shadow-sm flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-neutral-text">Email Us</p>
              <p className="text-[10px] text-neutral-muted mt-0.5">support@zerobank.com</p>
            </div>
          </a>
        </div>

        {/* Send Message Form */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm">
          <h2 className="text-lg font-bold text-neutral-text mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Send a Message
          </h2>
          
          {sent ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-status-success/10 text-status-success p-4 rounded-xl text-sm font-medium text-center"
            >
              Message sent successfully! We'll get back to you shortly.
            </motion.div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full p-4 bg-neutral-bg border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none"
                placeholder="How can we help you today?"
              />
              <button
                type="submit"
                disabled={isSending || !message.trim()}
                className="w-full bg-primary hover:bg-primary-accent text-white py-3.5 rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-2"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-lg font-bold text-neutral-text mb-4">Frequently Asked Questions</h2>
          <div className="bg-white rounded-[24px] overflow-hidden shadow-sm divide-y divide-gray-50">
            {faqs.map((faq, index) => (
              <div key={index} className="p-1">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <span className="text-sm font-semibold text-neutral-text pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-neutral-muted shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 pt-1 text-sm text-neutral-muted leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
