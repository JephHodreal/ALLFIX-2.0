import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'md',
}: CardProps) {
  const Component = hover ? motion.div : 'div';
  const motionProps = hover
    ? {
        whileHover: { y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' },
        transition: { duration: 0.2 },
      }
    : {};

  return (
    <Component
      className={`
        bg-white dark:bg-slate-800
        border border-slate-200 dark:border-slate-700
        rounded-2xl shadow-card
        ${paddingClasses[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...(motionProps as any)}
    >
      {children}
    </Component>
  );
}

// Stat card sub-component for dashboard metrics
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'navy' | 'green' | 'yellow' | 'red';
}

const colorClasses = {
  navy: 'bg-brand-navy/15 text-brand-navy dark:bg-brand-navy/20 dark:text-blue-400',
  green: 'bg-brand-green/15 text-green-700 dark:bg-brand-green/20 dark:text-green-400',
  yellow: 'bg-brand-yellow/15 text-amber-700 dark:bg-brand-yellow/20 dark:text-amber-400',
  red: 'bg-brand-red/15 text-red-700 dark:bg-brand-red/20 dark:text-red-400',
};

export function StatCard({ title, value, icon, trend, color = 'navy' }: StatCardProps) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  trend.value >= 0 ? 'text-brand-green' : 'text-brand-red'
                }`}
              >
                {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
