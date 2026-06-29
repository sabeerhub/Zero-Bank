import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  User, 
  ShieldCheck, 
  Landmark, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  CheckCircle2, 
  X,
  Lock,
  Compass,
  Coins,
  Shield,
  Clock,
  ExternalLink,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import TransactionPinModal from '../components/TransactionPinModal';

export default function Profile() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.name || 'Sabeer');
  const [isSaving, setIsSaving] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Simulated mount loader
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (profile?.name) {
      setNameInput(profile.name);
    }
  }, [profile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfileName = async () => {
    if (!profile || !nameInput.trim()) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        name: nameInput.trim()
      });
      setIsEditing(false);
      showNotification('Profile name updated successfully!');
    } catch (error) {
      console.error("Update profile name error:", error);
      showNotification('Error updating name.');
    } finally {
      setIsSaving(false);
    }
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-6 left-1/2 z-50 px-5 py-3.5 bg-slate-900 dark:bg-slate-850 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800/40"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold tracking-wider uppercase mt-0.5">Manage personal metadata & settings</p>
          </div>
        </div>
      </header>

      {/* Responsive layout containers */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <div key="skele" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 h-96 animate-pulse"></div>
            <div className="lg:col-span-7 bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 h-80 animate-pulse"></div>
          </div>
        ) : (
          <motion.div 
            key="profile-grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Column (Identity Banner & KYC Tier Meter) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Identity Banner Card */}
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-[32px] p-6 pt-8 shadow-xl relative overflow-hidden text-center flex flex-col items-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                
                {/* Large Avatar */}
                <div className="relative mb-5">
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 p-1.5 shadow-lg flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-700 to-indigo-700 flex items-center justify-center text-white text-3xl font-black">
                      {(profile?.name || 'Sabeer').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="absolute bottom-1 right-1 bg-white dark:bg-slate-850 p-2 rounded-full text-blue-600 dark:text-blue-400 shadow-md hover:scale-110 active:scale-90 transition-all border border-slate-150 dark:border-slate-800 cursor-pointer"
                    title="Edit Name"
                  >
                    <User className="w-3.5 h-3.5" strokeWidth={3} />
                  </button>
                </div>

                <h2 className="text-xl font-bold tracking-tight leading-tight">{profile?.name || 'Sabeer'}</h2>
                <p className="text-xs text-white/70 font-semibold mt-1">{profile?.email || 'sabeer@example.com'}</p>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/10 text-white font-black text-[10px] rounded-full uppercase tracking-wider mt-4">
                  <span>Silver Member</span>
                </div>
              </div>

              {/* KYC Tier verification tracker */}
              <div className="bg-white dark:bg-[#0B121F]/80 rounded-[28px] p-6 border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.01)] space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800 pb-3">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider">KYC Verification Tier</h4>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>Tier 2 (Standard account)</span>
                    <span className="text-slate-400 dark:text-slate-500">66% Completed</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-2/3" />
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
                  Upgrade to Tier 3 by submitting residential verification utility bills to expand your single transactions limits beyond ₦5,000,000.
                </p>
              </div>
            </div>

            {/* Right Column (Settings Navigation links) */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-[#0B121F]/80 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.01)] overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {/* Personal Info */}
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Personal Information</p>
                      <p className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500 font-bold tracking-wide uppercase mt-0.5">Click to update display name</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Bank Settings & Passcode */}
                <button 
                  onClick={() => setIsPinModalOpen(true)}
                  className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Landmark className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Bank Security Settings</p>
                      <p className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500 font-bold tracking-wide uppercase mt-0.5">Change card pin & limits</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Notifications setup link */}
                <button 
                  onClick={() => navigate('/notifications')}
                  className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Real-time Alert Notifications</p>
                      <p className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500 font-bold tracking-wide uppercase mt-0.5">Manage app push alerts</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Help support */}
                <button 
                  onClick={() => navigate('/support')}
                  className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-slate-50 dark:bg-slate-800/20 text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Help & Live Support</p>
                      <p className="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500 font-bold tracking-wide uppercase mt-0.5">Reach live customer desk</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Safe logout button */}
                <button 
                  onClick={handleLogout}
                  className="w-full p-5 flex items-center justify-between hover:bg-rose-50/50 dark:hover:bg-rose-950/10 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <LogOut className="w-5 h-5" strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-rose-600">Secure Sign Out</p>
                      <p className="text-[10px] leading-relaxed text-rose-400 font-bold tracking-wide uppercase mt-0.5">Leave browser session safely</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-600" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Display Name Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F172A]/45 backdrop-blur-sm"
              onClick={() => setIsEditing(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0E1626] rounded-3xl w-full max-w-sm p-6 relative z-10 border border-[#E2E8F0] dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Edit Display Name</h3>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Display Name</label>
                <input 
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 dark:text-white placeholder-slate-400"
                  placeholder="Enter full name"
                />
              </div>

              <button 
                onClick={updateProfileName}
                disabled={isSaving || !nameInput.trim()}
                className="w-full py-3.5 bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TransactionPinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
        onSuccess={() => {
          setIsPinModalOpen(false);
          showNotification('Transaction Passcode changed successfully!');
        }}
        mode="change"
      />
    </div>
  );
}
