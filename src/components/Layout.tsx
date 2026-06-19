import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Send, Grid, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from './BottomNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const location = useLocation();

  // Bottom nav is shown on the 4 main tab pages; we only hide on tertiary sub-screens
  const hideBottomNavPages = ['/add-funds', '/interbank', '/notifications', '/upgrade'];
  const shouldHideBottomNav = hideBottomNavPages.some(path => location.pathname.startsWith(path));

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Send, label: 'Transfer', path: '/transfer' },
    { icon: Grid, label: 'Services', path: '/services' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-neutral-text antialiased">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-[#E2E8F0] fixed h-full z-50">
        <div className="px-8 py-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl italic tracking-tighter shadow-sm shadow-primary/10">
            Z
          </div>
          <span className="text-xl font-bold text-neutral-text tracking-tight">Zero Bank</span>
        </div>
        
        <nav className="flex-1 px-5 space-y-2.5 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-5 py-4 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/5 text-primary font-bold shadow-[0_4px_12px_rgba(37,99,235,0.03)]' 
                    : 'text-neutral-muted hover:bg-neutral-bg hover:text-neutral-text font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[14px] tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-6 border-t border-[#E2E8F0]">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-5 py-4 w-full rounded-2xl text-status-error hover:bg-status-error/5 transition-colors font-semibold text-[14px] tracking-tight"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 pb-24 md:pb-8 min-h-screen flex flex-col">
        <div className="w-full max-w-5xl mx-auto flex-1 relative px-4 md:px-8">
          {children}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      {!shouldHideBottomNav && (
        <div className="md:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
