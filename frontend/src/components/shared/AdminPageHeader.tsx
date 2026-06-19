import React from 'react';

interface AdminPageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
}

export function AdminPageHeader({ title, subtitle, icon, action }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#10355f] dark:bg-[#1e3a5f] flex items-center justify-center shadow-sm flex-shrink-0">
            {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5 text-white' })}
          </div>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
