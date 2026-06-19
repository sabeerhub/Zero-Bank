import { NavLink } from 'react-router-dom';
import { Home, ArrowLeftRight, LayoutGrid, User } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: ArrowLeftRight, label: 'Transfer', path: '/transfer' },
    { icon: LayoutGrid, label: 'Services', path: '/services' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[#E2E8F0] px-8 py-2 pb-safe z-50 md:hidden shadow-[0_-4px_24px_rgba(0,0,0,0.015)]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-all duration-200 py-1.5 px-3 ${
                isActive 
                  ? 'text-primary scale-105 font-bold' 
                  : 'text-[#94A3B8] hover:text-[#0F172A]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className="w-5 h-5 transition-transform duration-200" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-tight mt-0.5">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
