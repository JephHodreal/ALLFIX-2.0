import React from 'react';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuToggle?: () => void;
  title?: string;
}

export function Header({ onMenuToggle, title }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { profile } = useAuth();
  const [notifCount] = React.useState(0);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        )}
        {title && <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Toggle theme">
          {isDark ? <Sun className="w-5 h-5 text-brand-yellow" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>
        <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative" aria-label="Notifications">
          <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">{notifCount}</span>
          )}
        </button>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-navy to-brand-green flex items-center justify-center text-white text-sm font-bold">
          {profile?.first_name?.[0] || profile?.email?.[0]?.toUpperCase() || '?'}
        </div>
      </div>
    </header>
  );
}
