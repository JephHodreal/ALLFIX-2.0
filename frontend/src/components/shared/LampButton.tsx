import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const LampButton: React.FC<{ className?: string }> = ({ className }) => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} aria-label="Toggle theme" className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 ${className || ''}`}>
      {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
    </button>
  );
};

export default LampButton;
