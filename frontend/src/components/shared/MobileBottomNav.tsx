import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, History, RefreshCcw, MessageSquare, LayoutDashboard, ClipboardList, CalendarDays, TrendingUp } from 'lucide-react';

interface MobileBottomNavProps {
  role: 'customer' | 'vendor' | 'personnel' | 'admin';
}

export function MobileBottomNav({ role }: MobileBottomNavProps) {
  const location = useLocation();

  if (role !== 'customer' && role !== 'vendor') {
    return null; // For now, only customer and vendor roles are supported
  }

  const navItems = role === 'vendor' ? [
    { label: 'Overview', path: '/vendor', icon: <TrendingUp className="w-[22px] h-[22px]" />, end: true },
    { label: 'Bookings', path: '/vendor/bookings', icon: <ClipboardList className="w-[22px] h-[22px]" />, end: false },
    { label: 'Schedule', path: '/vendor/schedule', icon: <CalendarDays className="w-[22px] h-[22px]" />, end: false },
    { label: 'Messages', path: '/vendor/messages', icon: <MessageSquare className="w-[22px] h-[22px]" />, end: false },
  ] : [
    { label: 'Home', path: '/customer', icon: <Home className="w-[22px] h-[22px]" />, end: true },
    { label: 'Bookings', path: '/customer/bookings', icon: <History className="w-[22px] h-[22px]" />, end: false },
    { label: 'Refunds', path: '/customer/refunds', icon: <RefreshCcw className="w-[22px] h-[22px]" />, end: false },
    { label: 'Messages', path: '/customer/messages', icon: <MessageSquare className="w-[22px] h-[22px]" />, end: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 lg:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe pt-2 px-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          // Special active handling for Home to ensure it covers /customer but not /customer/bookings etc unless end: true handles it natively. 
          // NavLink end={true} handles exact matches perfectly.
          // However, for /customer/book/... we might want Home to still be active. Let's do a custom check.
          const isHomeOnBook = item.path === '/customer' && (location.pathname === '/customer/book' || location.pathname.startsWith('/customer/book/'));
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className={({ isActive }) => {
                const forcedActive = isActive || isHomeOnBook;
                return `flex flex-col items-center justify-center py-2 px-3 min-w-[70px] transition-all duration-200 relative ${
                  forcedActive
                    ? 'text-brand-green font-bold'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
                }`;
              }}
            >
              {({ isActive }) => {
                const forcedActive = isActive || isHomeOnBook;
                return (
                  <>
                    <div className={`relative flex items-center justify-center p-1 rounded-full mb-1 transition-all ${
                      forcedActive ? 'bg-brand-green/10' : ''
                    }`}>
                      {item.icon}
                    </div>
                    <span className="text-[11px] leading-none tracking-tight">{item.label}</span>
                  </>
                );
              }}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
