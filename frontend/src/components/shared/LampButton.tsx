import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const LampButton: React.FC<{ className?: string }> = ({ className }) => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="relative group/tooltip flex items-center justify-center">
      <button onClick={toggleTheme} aria-label="Toggle theme" className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 ${className || ''}`}>
        {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
      </button>
      <div
        className="
          absolute pointer-events-none opacity-0 group-hover/tooltip:opacity-100
          transition-all duration-150 ease-out scale-95 group-hover/tooltip:scale-100
          bg-[#1c2434] dark:bg-slate-800 text-white font-medium tracking-wide shadow-xl rounded-lg px-3 py-1.5 whitespace-nowrap text-[12px] z-[9999]
          top-full mt-2 left-1/2 -translate-x-1/2
        "
      >
        {isDark ? 'Light mode' : 'Dark mode'}
      </div>
    </div>
  );
};

export default LampButton;
