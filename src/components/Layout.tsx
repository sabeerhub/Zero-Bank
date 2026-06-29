import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Send, 
  Grid, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Bell, 
  Menu, 
  X, 
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Settings as SettingsIcon,
  HelpCircle,
  PiggyBank
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout, profile } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications for badge counts
  React.useEffect(() => {
    if (!profile) return;
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', profile.uid),
      where('read', '==', false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    });
    return () => unsubscribe();
  }, [profile]);

  const navItems = [
    { icon: Home, label: 'Overview', path: '/' },
    { icon: Send, label: 'Transfers', path: '/transfer' },
    { icon: Grid, label: 'Services', path: '/services' },
    { icon: CreditCard, label: 'My Cards', path: '/card' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const secondaryNavItems = [
    { icon: PiggyBank, label: 'Loans', path: '/loan' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
    { icon: HelpCircle, label: 'Support', path: '/support' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col md:flex-row font-sans text-slate-850 dark:text-slate-100 ${
      isDarkMode ? 'bg-[#090D16] text-[#E2E8F0]' : 'bg-[#FAFCFF] text-[#1E293B]'
    }`}>
      
      {/* SIDEBAR - DESKTOP & TABLET */}
      <aside className={`hidden md:flex flex-col w-64 lg:w-72 fixed h-full z-40 transition-all duration-300 border-r ${
        isDarkMode 
          ? 'bg-[#0B121F]/90 backdrop-blur-xl border-[#1E293B]/60' 
          : 'bg-white border-slate-200/80 shadow-[4px_0_30px_rgba(0,0,0,0.01)]'
      }`}>
        {/* Brand Header */}
        <div className="px-6 py-6 lg:px-8 lg:py-8 flex items-center justify-between border-b border-transparent">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-blue-600 dark:bg-blue-500 rounded-xl flex items-center justify-center text-white font-black text-lg italic tracking-tighter shadow-md shadow-blue-500/20 active:scale-95 transition-all">
              Z
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight">Zero Bank</span>
              <span className="text-[9px] font-bold text-blue-500 dark:text-blue-400 tracking-wider uppercase">Premium Core</span>
            </div>
          </div>
          
          {/* Subtle VIP indicator */}
          {profile?.tier && profile.tier > 1 && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Tier {profile.tier}
            </span>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase px-4 block mb-2">
              Main Menu
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                      isActive 
                        ? 'bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-white font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className="absolute left-0 w-1 h-6 bg-blue-600 dark:bg-blue-500 rounded-r-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <item.icon className={`w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-105 ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-xs lg:text-[13px] tracking-tight">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-slate-400 dark:text-slate-500 uppercase px-4 block mb-2">
              Tools & Settings
            </span>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                      isActive 
                        ? 'bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-white font-medium'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className="absolute left-0 w-1 h-6 bg-blue-600 dark:bg-blue-500 rounded-r-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <item.icon className={`w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-105 ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                      }`} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-xs lg:text-[13px] tracking-tight">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer Sidebar Widgets */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-[#1E293B]/60' : 'border-slate-100'}`}>
          {/* Interactive Light/Dark Toggle */}
          <div className={`flex items-center justify-between p-2 rounded-xl mb-3 ${
            isDarkMode ? 'bg-[#0E1626]' : 'bg-slate-50'
          }`}>
            <span className="text-[10px] font-bold tracking-tight text-slate-400 pl-2">Theme Mode</span>
            <button
              onClick={toggleDarkMode}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95 ${
                isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-blue-600 shadow-sm'
              }`}
            >
              {isDarkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span className="text-[10px] font-black uppercase tracking-wider pr-1">
                {isDarkMode ? 'Dark' : 'Light'}
              </span>
            </button>
          </div>

          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-bold text-xs lg:text-[13px] tracking-tight"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE & TABLET HEADER */}
      <header className={`md:hidden sticky top-0 z-30 w-full px-4 py-3.5 flex items-center justify-between border-b backdrop-blur-md transition-all duration-300 ${
        isDarkMode 
          ? 'bg-[#090D16]/90 border-[#1E293B]/60 text-white' 
          : 'bg-white/90 border-slate-200/80 shadow-[0_4px_30px_rgba(0,0,0,0.015)] text-slate-900'
      }`}>
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8.5 h-8.5 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-base italic tracking-tighter">
            Z
          </div>
          <span className="text-base font-extrabold tracking-tight">Zero Bank</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggler */}
          <button 
            onClick={toggleDarkMode}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isDarkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Notifications */}
          <button 
            onClick={() => navigate('/notifications')}
            className={`w-9 h-9 rounded-xl flex items-center justify-center relative transition-all ${
              isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
            )}
          </button>

          {/* Hamburger Menu (Sub-navigation support) */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </header>

      {/* MOBILE EXTENDED NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 md:hidden"
            />
            
            {/* Sliding Sidebar Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] h-full z-50 md:hidden flex flex-col p-6 shadow-2xl transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-[#0B121F] text-white border-r border-[#1E293B]/60' 
                  : 'bg-white text-slate-900 border-r border-slate-200'
              }`}
            >
              {/* Sidebar Header with Brand & Close Button */}
              <div className="flex items-center justify-between pb-5 mb-4 border-b border-slate-150 dark:border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-8.5 h-8.5 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white font-black text-base italic tracking-tighter">
                    Z
                  </div>
                  <span className="text-base font-extrabold tracking-tight">Zero Bank</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar Profile Info Banner */}
              {profile && (
                <div className="mb-6 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-150/40 dark:border-slate-800/40 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600/10 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-xs uppercase shrink-0">
                    {profile.name?.slice(0, 2) || 'US'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold truncate text-slate-900 dark:text-white">{profile.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-tight truncate mt-0.5">{profile.email}</p>
                  </div>
                </div>
              )}

              {/* Sidebar Navigation Links */}
              <div className="flex-1 space-y-6 overflow-y-auto pr-1">
                <div>
                  <span className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block mb-3">
                    Menu Sections
                  </span>
                  <nav className="space-y-1">
                    {[...navItems, ...secondaryNavItems].map((item) => {
                      const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/10'
                              : isDarkMode
                                ? 'text-slate-300 hover:bg-slate-800/40 hover:text-white font-medium'
                                : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
                          }`}
                        >
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Sidebar Footer Controls */}
              <div className="pt-4 border-t border-slate-150 dark:border-slate-800/60 space-y-3">
                <div className={`flex items-center justify-between p-2 rounded-xl ${
                  isDarkMode ? 'bg-[#0E1626]' : 'bg-slate-50'
                }`}>
                  <span className="text-[10px] font-bold tracking-tight text-slate-400 pl-2">Theme Mode</span>
                  <button
                    onClick={toggleDarkMode}
                    className={`p-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-300 hover:scale-105 active:scale-95 ${
                      isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-blue-600 shadow-xs'
                    }`}
                  >
                    {isDarkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-black uppercase tracking-wider pr-1">
                      {isDarkMode ? 'Dark' : 'Light'}
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-500 text-xs font-bold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <main className={`flex-1 transition-all duration-300 md:ml-64 lg:ml-72 pb-24 md:pb-8 min-h-screen flex flex-col`}>
        <div className="w-full max-w-7xl mx-auto flex-1 relative px-4 py-4 md:px-8 md:py-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>

      {/* BOTTOM NAV FOR MOBILE */}
      <div className="md:hidden">
        <div className="fixed bottom-5 left-4 right-4 z-40 max-w-sm mx-auto">
          <div className={`px-4 py-2 rounded-[24px] border backdrop-blur-xl flex justify-between items-center transition-all duration-300 shadow-xl ${
            isDarkMode 
              ? 'bg-[#0B121F]/95 border-slate-800/80 text-white shadow-black/45' 
              : 'bg-white/95 border-slate-200/80 shadow-slate-200/30 text-slate-700'
          }`}>
            <div className="flex justify-around items-center w-full">
              {[
                { icon: Home, label: 'Home', path: '/' },
                { icon: Send, label: 'Transfer', path: '/transfer' },
                { icon: Grid, label: 'Services', path: '/services' },
                { icon: User, label: 'Profile', path: '/profile' },
              ].map((item) => {
                const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '');
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-center transition-all duration-300 select-none ${
                      isActive 
                        ? 'bg-blue-600 dark:bg-blue-500 text-white px-3.5 py-1.5 rounded-full shadow-md shadow-blue-500/20 font-black' 
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 p-2 rounded-full'
                    }`}
                  >
                    <item.icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && (
                      <span className="text-[10px] font-black tracking-tight ml-1.5 whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
