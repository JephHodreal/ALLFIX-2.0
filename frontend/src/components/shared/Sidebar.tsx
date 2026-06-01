import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CalendarDays, Star, ClipboardList,
  CreditCard, RefreshCcw, LifeBuoy, Settings, LogOut, ChevronLeft, ChevronRight,
  Home, Wrench, UserCog, Building2, ShoppingCart, User, MapPin, ChevronDown,
  Eye, BarChart3, History, Truck, BookOpen, Receipt,
  Ticket, Tag, Package, UserCheck
} from 'lucide-react';
import { logoutUser } from '../../services/firebaseService';
import { UserRole } from '../../context/AuthContext';

interface SidebarItem { label: string; path: string; icon: React.ReactNode; }
interface SidebarSection { title?: string; items: SidebarItem[]; }
interface SidebarProps { role: UserRole; collapsed: boolean; onToggle: () => void; }

const menuSections: Record<UserRole, SidebarSection[]> = {
  admin: [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Calendar', path: '/admin/calendar', icon: <CalendarDays className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Communications',
      items: [
        { label: 'Reviews', path: '/admin/reviews', icon: <Star className="w-5 h-5" /> },
      ],
    },
    {
      title: 'People',
      items: [
        { label: 'Customers', path: '/admin/customers', icon: <Users className="w-5 h-5" /> },
        { label: 'Service Providers', path: '/admin/vendors', icon: <Building2 className="w-5 h-5" /> },
        { label: 'Service Personnel', path: '/admin/personnel', icon: <UserCog className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Bookings', path: '/admin/bookings', icon: <ClipboardList className="w-5 h-5" /> },
        { label: 'Services Management', path: '/admin/services', icon: <Wrench className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Finance & Promos',
      items: [
        { label: 'Transactions', path: '/admin/transactions', icon: <Receipt className="w-5 h-5" /> },
        { label: 'Payouts', path: '/admin/payouts', icon: <CreditCard className="w-5 h-5" /> },
        { label: 'Refunds', path: '/admin/refunds', icon: <RefreshCcw className="w-5 h-5" /> },
        { label: 'Vouchers', path: '/admin/vouchers', icon: <Ticket className="w-5 h-5" /> },
        { label: 'Assigned Vouchers', path: '/admin/assigned-vouchers', icon: <Tag className="w-5 h-5" /> },
      ],
    },
  ],
  customer: [
    {
      items: [
        { label: 'Home', path: '/customer', icon: <Home className="w-5 h-5" /> },
        { label: 'Bookings', path: '/customer/bookings', icon: <ClipboardList className="w-5 h-5" /> },
        { label: 'Cart', path: '/customer/cart', icon: <ShoppingCart className="w-5 h-5" /> },
        { label: 'Vouchers', path: '/customer/vouchers', icon: <Ticket className="w-5 h-5" /> },
        { label: 'Refunds', path: '/customer/refunds', icon: <RefreshCcw className="w-5 h-5" /> },
        { label: 'Profile', path: '/customer/profile', icon: <User className="w-5 h-5" /> },
      ],
    },
  ],
  vendor: [
    {
      items: [
        { label: 'Dashboard', path: '/vendor', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Schedule & Area', path: '/vendor/schedule', icon: <CalendarDays className="w-5 h-5" /> },
        { label: 'Bookings', path: '/vendor/bookings', icon: <ClipboardList className="w-5 h-5" /> },
        { label: 'Services', path: '/vendor/services', icon: <Wrench className="w-5 h-5" /> },
        { label: 'Personnels', path: '/vendor/personnel', icon: <UserCheck className="w-5 h-5" /> },
      ],
    },
  ],
  personnel: [
    {
      items: [
        { label: 'Dashboard', path: '/personnel', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'My Bookings', path: '/personnel/bookings', icon: <ClipboardList className="w-5 h-5" /> },
        { label: 'Profile', path: '/personnel/profile', icon: <User className="w-5 h-5" /> },
      ],
    },
  ],
};

function SidebarSectionGroup({ section, role, collapsed }: { section: SidebarSection; role: UserRole; collapsed: boolean }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-1">
      {section.title && !collapsed && (
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full px-3 py-1.5 mb-0.5 group"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
            {section.title}
          </span>
          <motion.span
            animate={{ rotate: open ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </motion.span>
        </button>
      )}
      {section.title && collapsed && (
        <div className="mx-auto my-2 w-6 border-t border-slate-200 dark:border-slate-700" />
      )}
      <AnimatePresence initial={false}>
        {(open || collapsed) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-0.5"
          >
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === `/${role}`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-navy text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const sections = menuSections[role] || [];
  const handleLogout = async () => { await logoutUser(); navigate('/login'); };

  const effectiveCollapsed = !isHovered;

  return (
    <motion.aside
      initial={false}
      animate={{ width: effectiveCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 z-40 flex flex-col"
    >
      <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src="/ALLFIXLOGO.png" alt="AllFix Logo" className="w-8 h-8 object-contain" />
          </div>
          <AnimatePresence>
            {!effectiveCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-bold text-brand-navy dark:text-white whitespace-nowrap overflow-hidden flex items-center"
              >
                <span>All</span>
                <span className="text-brand-green">F</span>
                <span className="text-brand-yellow">i</span>
                <span className="text-brand-red">x</span>
                <span>.ph</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {sections.map((section, i) => (
          <SidebarSectionGroup key={i} section={section} role={role} collapsed={effectiveCollapsed} />
        ))}
      </nav>
      <div className="border-t border-slate-200 dark:border-slate-700 p-2 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-brand-red transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!effectiveCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
