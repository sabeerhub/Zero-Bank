import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Send, Grid, User, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BottomNav from './BottomNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const location = useLocation();

  // Hide bottom nav on certain pages if needed, but on desktop sidebar is always visible
  const hideBottomNavPages = ['/transfer', '/services', '/interbank', '/add-funds', '/loan', '/card'];
  const shouldHideBottomNav = hideBottomNavPages.some(path => location.pathname.startsWith(path));

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Send, label: 'Transfer', path: '/transfer' },
    { icon: Grid, label: 'Services', path: '/services' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col md:flex-row font-sans text-neutral-text">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full z-50 shadow-sm">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-xl font-black text-primary tracking-tight">Zero Bank</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-bold' 
                    : 'text-neutral-muted hover:bg-gray-50 hover:text-neutral-text font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-status-error hover:bg-status-error/10 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0 min-h-screen flex flex-col">
        <div className="w-full max-w-5xl mx-auto flex-1 relative">
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
