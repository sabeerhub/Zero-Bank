import { NavLink } from 'react-router-dom';
import { Home, Send, Grid, User } from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Send, label: 'Transfer', path: '/transfer' },
    { icon: Grid, label: 'Services', path: '/services' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 px-6 py-3 pb-safe z-50 md:hidden">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-neutral-muted hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-6 h-6" strokeWidth={2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
