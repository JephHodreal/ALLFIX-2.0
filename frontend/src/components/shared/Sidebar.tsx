import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, CalendarDays, Star, ClipboardList,
  CreditCard, RefreshCcw, LogOut, PanelLeftClose, PanelLeftOpen,
  Home, Wrench, UserCog, Building2, User,
  History, ArrowRightLeft, Ticket, Tag, UserCheck, Wallet, MessageSquare,
  Bell, HelpCircle, ChevronDown, MapPin, Image, TrendingUp, LifeBuoy
} from 'lucide-react';
import { logoutUser } from '../../services/firebaseService';
import { useConfirm } from '../../hooks/useConfirm';
import { UserRole } from '../../context/AuthContext';

interface SidebarItem { label: string; path: string; icon: React.ReactNode; end?: boolean; }
interface SidebarSection { title?: string; items: SidebarItem[]; }
interface SidebarProps { role: UserRole; collapsed: boolean; onToggle: () => void; }

const menuSections: Record<UserRole, SidebarSection[]> = {
  admin: [
    {
      title: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
        { label: 'Calendar', path: '/admin/calendar', icon: <CalendarDays className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Bookings', path: '/admin/bookings', icon: <ClipboardList className="w-5 h-5" /> },
        { label: 'Service Management', path: '/admin/services', icon: <Wrench className="w-5 h-5" /> },
        { label: 'Area Services', path: '/admin/area-services', icon: <MapPin className="w-5 h-5" /> },
        { label: 'Partner Logos', path: '/admin/partner-logos', icon: <Image className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Finance',
      items: [
        { label: 'Transactions', path: '/admin/transactions', icon: <ArrowRightLeft className="w-5 h-5" /> },
        { label: 'Payouts', path: '/admin/payouts', icon: <CreditCard className="w-5 h-5" /> },
        { label: 'Refunds', path: '/admin/refunds', icon: <RefreshCcw className="w-5 h-5" /> },
        { label: 'Payment Methods', path: '/admin/payments', icon: <Wallet className="w-5 h-5" /> },
        { label: 'Vouchers', path: '/admin/vouchers', icon: <Ticket className="w-5 h-5" /> },
        { label: 'Assigned Vouchers', path: '/admin/assigned-vouchers', icon: <Tag className="w-5 h-5" /> },
      ],
    },
    {
      title: 'People',
      items: [
        { label: 'Service Providers', path: '/admin/vendors', icon: <Building2 className="w-5 h-5" /> },
        { label: 'Service Personnel', path: '/admin/personnel', icon: <UserCog className="w-5 h-5" /> },
        { label: 'Customers', path: '/admin/customers', icon: <Users className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Communications & Support',
      items: [
        { label: 'Support Desk', path: '/admin/support', icon: <LifeBuoy className="w-5 h-5" /> },
        { label: 'Notifications', path: '/admin/notifications', icon: <Bell className="w-5 h-5" /> },
        { label: 'Reviews', path: '/admin/reviews', icon: <Star className="w-5 h-5" /> },
      ],
    },
  ],
  customer: [
    {
      title: 'Main',
      items: [
        { label: 'Home', path: '/customer', icon: <Home className="w-5 h-5" />, end: true },
      ],
    },
    {
      title: 'Activity',
      items: [
        { label: 'Bookings', path: '/customer/cart', icon: <ClipboardList className="w-5 h-5" /> },
        { label: 'Booking History', path: '/customer/bookings', icon: <History className="w-5 h-5" /> },
        { label: 'Refunds', path: '/customer/refunds', icon: <RefreshCcw className="w-5 h-5" /> },
        { label: 'Vouchers', path: '/customer/vouchers', icon: <Ticket className="w-5 h-5" /> },
        { label: 'Messages', path: '/customer/messages', icon: <MessageSquare className="w-5 h-5" /> },
        { label: 'Notifications', path: '/customer/notifications', icon: <Bell className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Account & Care',
      items: [
        { label: 'Profile', path: '/customer/profile', icon: <User className="w-5 h-5" /> },
        { label: 'Get Help/Support', path: '/customer/support', icon: <HelpCircle className="w-5 h-5" /> },
      ],
    },
  ],
  vendor: [
    {
      title: 'Main',
      items: [
        { label: 'Overview', path: '/vendor', icon: <TrendingUp className="w-5 h-5" />, end: true },
      ],
    },
    {
      title: 'Operations',
      items: [
        { label: 'Bookings', path: '/vendor/bookings', icon: <ClipboardList className="w-5 h-5" /> },
        { label: 'Schedule & Area', path: '/vendor/schedule', icon: <CalendarDays className="w-5 h-5" /> },
        { label: 'Services', path: '/vendor/services', icon: <Wrench className="w-5 h-5" /> },
      ],
    },
    {
      title: 'People & Communication',
      items: [
        { label: 'Personnels', path: '/vendor/personnel', icon: <UserCheck className="w-5 h-5" /> },
        { label: 'Messages', path: '/vendor/messages', icon: <MessageSquare className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Account & Support',
      items: [
        { label: 'Notifications', path: '/vendor/notifications', icon: <Bell className="w-5 h-5" /> },
        { label: 'Get Help/Support', path: '/vendor/support', icon: <HelpCircle className="w-5 h-5" /> },
      ],
    },
  ],
  personnel: [
    {
      title: 'Personnel Menu',
      items: [
        { label: 'Dashboard', path: '/personnel', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
        { label: 'My Bookings', path: '/personnel/bookings', icon: <ClipboardList className="w-5 h-5" /> },
        { label: 'Profile', path: '/personnel/profile', icon: <User className="w-5 h-5" /> },
        { label: 'Get Help/Support', path: '/personnel/support', icon: <HelpCircle className="w-5 h-5" /> },
      ],
    },
  ],
};

const mobileTabs = [
  { label: 'Home', path: '/customer', icon: <Home className="w-5 h-5" />, end: true },
  { label: 'Bookings', path: '/customer/cart', icon: <ClipboardList className="w-5 h-5" />, end: false },
  { label: 'Booking History', path: '/customer/bookings', icon: <History className="w-5 h-5" />, end: false },
  { label: 'Messages', path: '/customer/messages', icon: <MessageSquare className="w-5 h-5" />, end: false },
];

function SidebarTooltip({
  text,
  children,
  fullWidth = true,
  disabled = false,
}: {
  text: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) setRect(ref.current.getBoundingClientRect());
    setIsHovered(true);
  };

  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
      {!disabled && isHovered && rect && createPortal(
        <div
          className="
            fixed pointer-events-none opacity-100
            animate-fade-in-fast scale-100
            bg-[#1c2434] dark:bg-slate-800 text-white font-medium tracking-wide shadow-xl rounded-lg px-3 py-1.5 whitespace-nowrap text-[12px] z-[9999]
          "
          style={{ top: rect.top + rect.height / 2, left: 80, transform: 'translateY(-50%)' }}
        >
          {text}
        </div>,
        document.body
      )}
    </div>
  );
}

export function LogoutButton({ showText = true }: { showText?: boolean }) {
  const navigate = useNavigate();
  const { confirm, ConfirmComponent } = useConfirm();

  const handleLogout = () => {
    confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of your account?',
      confirmText: 'Sign Out',
      type: 'warning',
      onConfirm: async () => {
        try {
          await logoutUser();
          navigate('/login');
        } catch (error) {
          console.error('Logout failed:', error);
        }
      }
    });
  };

  const buttonContent = (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 active:scale-[0.98] focus:outline-none"
    >
      <LogOut className="w-5 h-5 text-slate-400 flex-shrink-0 transition-colors" />
      {showText && (
        <span className="text-xs font-bold tracking-tight whitespace-nowrap">Logout</span>
      )}
    </button>
  );

  return (
    <div className="relative w-full overflow-visible">
      <>
        {!showText ? (
          <SidebarTooltip text="Logout">{buttonContent}</SidebarTooltip>
        ) : (
          buttonContent
        )}
        <ConfirmComponent />
      </>
    </div>
  );
}

// ─── Admin-only: collapsible section (works in both collapsed & expanded sidebar) ───
function AdminSidebarSectionGroup({
  section,
  collapsed,
}: {
  section: SidebarSection;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(
    section.title === 'Overview' || section.title === 'Operations'
  );

  useEffect(() => {
    if (collapsed && (section.title === 'Finance' || section.title === 'People & Communication')) {
      setOpen(false);
    }
  }, [collapsed, section.title]);

  return (
    <div className="mb-2 overflow-visible">

      {/* ── Section header ── */}
      {section.title && (
        collapsed ? (
          // Collapsed sidebar → clickable divider line as toggle
          <div className="flex justify-center my-3 px-3 overflow-visible">
            <SidebarTooltip
              text={`${section.title} — ${open ? 'Click to collapse' : 'Click to expand'}`}
              fullWidth={false}
            >
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center justify-center w-8 focus:outline-none"
              >
                <div
                  className={`w-8 border-t-2 rounded-full transition-colors duration-150 ${open
                      ? 'border-white/10 hover:border-white/30'
                      : 'border-brand-green/50 hover:border-brand-green'
                    }`}
                />
              </button>
            </SidebarTooltip>
          </div>
        ) : (
          // Expanded sidebar → section title button with chevron
          <button
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-1.5 mb-1 rounded-lg group hover:bg-white/5 transition-colors duration-150 focus:outline-none"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green group-hover:text-white transition-colors whitespace-nowrap">
              {section.title}
            </span>
            <motion.div
              animate={{ rotate: open ? 0 : -90 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="flex-shrink-0"
            >
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </motion.div>
          </button>
        )
      )}

      {/* ── Items — single shared path, gated by `open` ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="section-items"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pb-2">
              {section.items.map((item) => {
                const linkContent = (
                  <NavLink
                    to={item.path}
                    end={item.end ?? false}
                    className={({ isActive }) => `
                      group/item flex items-center gap-3 px-3 py-2.5 rounded-xl relative transition-all duration-200 active:scale-[0.98] w-full
                      ${isActive
                        ? 'bg-brand-green/15 text-white shadow-sm shadow-black/20'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div
                            className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-brand-green"
                          />
                        )}
                        <span
                          className={`flex-shrink-0 transition-colors ${isActive
                              ? 'text-brand-green'
                              : 'text-slate-500 group-hover/item:text-slate-300'
                            }`}
                        >
                          {item.icon}
                        </span>
                        <AnimatePresence mode="wait">
                          {!collapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -4 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -4 }}
                              transition={{ duration: 0.15 }}
                              className="text-xs font-bold tracking-tight whitespace-nowrap"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </NavLink>
                );

                return (
                  <SidebarTooltip key={item.path} text={item.label} disabled={!collapsed}>
                    <div className="w-full">{linkContent}</div>
                  </SidebarTooltip>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Non-admin: standard section (unchanged) ───
function SidebarSectionGroup({
  section,
  role,
  collapsed,
}: {
  section: SidebarSection;
  role: UserRole;
  collapsed: boolean;
}) {
  const location = useLocation();

  return (
    <div className="mb-4 overflow-visible">
      {section.title && (
        collapsed ? (
          <div className="flex justify-center my-3 px-3 overflow-visible">
            <SidebarTooltip text={`${section.title} Section`} fullWidth={false}>
              <div className="w-8 border-t-2 border-white/10 rounded-full cursor-help transition-colors hover:border-white/30" />
            </SidebarTooltip>
          </div>
        ) : (
          <div className="px-3 py-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green whitespace-nowrap">
              {section.title}
            </span>
          </div>
        )
      )}

      <div className="space-y-1 overflow-visible">
        {section.items.map((item) => {
          const isHomeOnBook = item.path === '/customer' && (location.pathname === '/customer/book' || location.pathname.startsWith('/customer/book/'));
          const linkContent = (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end ?? false}
              className={({ isActive }) => {
                const forcedActive = isActive || isHomeOnBook;
                return `
                group/item flex items-center gap-3 px-3 py-2.5 rounded-xl relative transition-all duration-200 active:scale-[0.98] w-full
                ${forcedActive
                  ? 'bg-brand-green/15 text-white shadow-sm shadow-black/20'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }
              `}}
            >
              {({ isActive }) => {
                const forcedActive = isActive || isHomeOnBook;
                return (
                <>
                  {forcedActive && (
                    <div
                      className="absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-brand-green"
                    />
                  )}
                  <span
                    className={`flex-shrink-0 transition-colors ${forcedActive
                        ? 'text-brand-green'
                        : 'text-slate-500 group-hover/item:text-slate-300'
                      }`}
                  >
                    {item.icon}
                  </span>
                  <AnimatePresence mode="wait">
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -4 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs font-bold tracking-tight whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}}
            </NavLink>
          );

          return (
            <SidebarTooltip key={item.path} text={item.label} disabled={!collapsed}>
              <div className="w-full">{linkContent}</div>
            </SidebarTooltip>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Sidebar ───
export function Sidebar({ role, collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const sections = menuSections[role] || [];

  const logoContent = (
    <div
      onClick={collapsed ? onToggle : undefined}
      className={`flex items-center gap-2.5 select-none relative h-[45px] transition-all duration-200 overflow-visible ${collapsed ? 'w-[45px] justify-center cursor-pointer' : 'w-full justify-start cursor-default'
        }`}
    >
      <img
        src="/ALLFIXLOGO.png"
        alt="AllFix.ph Logo"
        className={`w-[45px] h-[45px] object-contain rounded-full flex-shrink-0 transition-all duration-200 ${collapsed ? 'group-hover/logo-btn:opacity-0 group-hover/logo-btn:scale-85' : 'opacity-100'
          }`}
      />
      {collapsed && (
        <div className="absolute inset-0 flex items-center justify-center rounded-full text-white opacity-0 group-hover/logo-btn:opacity-100 bg-white/10 transition-all duration-200 scale-90 group-hover/logo-btn:scale-100 z-10">
          <PanelLeftOpen className="w-[22px] h-[22px]" />
        </div>
      )}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col overflow-hidden text-left"
          >
            <span className="text-[1.15rem] font-bold tracking-normal leading-none mb-0.5 text-white transition-colors duration-300">
              All<span className="text-brand-green">F</span>
              <span className="text-brand-yellow">i</span>
              <span className="text-brand-red">x</span>.ph
            </span>
            <span className="text-[0.58rem] font-bold tracking-wider leading-none text-slate-400 uppercase whitespace-nowrap">
              YOUR PERSONAL CONCIERGE
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed left-0 top-0 h-screen bg-brand-navy dark:bg-[#020617] border-r border-white/10 dark:border-[#1E293B] z-40 hidden md:flex flex-col transition-colors duration-300 ${collapsed ? 'overflow-visible' : 'overflow-hidden md:overflow-visible'
          }`}
      >
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-3.5 border-b border-white/10 flex-shrink-0 overflow-visible relative">
          <div className="group/logo-btn flex items-center overflow-visible w-full">
            {collapsed ? (
              <SidebarTooltip text="Open Sidebar" fullWidth={false}>
                {logoContent}
              </SidebarTooltip>
            ) : (
              logoContent
            )}
          </div>
          {!collapsed && (
            <div className="flex-shrink-0 ml-1 overflow-visible absolute right-3.5 top-1/2 -translate-y-1/2 z-20">
              <SidebarTooltip text="Close Sidebar" fullWidth={false}>
                <button
                  onClick={onToggle}
                  className="w-9 h-9 rounded-full text-slate-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all active:scale-95 focus:outline-none"
                >
                  <PanelLeftClose className="w-[22px] h-[22px]" />
                </button>
              </SidebarTooltip>
            </div>
          )}
        </div>

        <nav
          className="flex-1 py-4 px-3 custom-scrollbar overflow-y-auto overflow-x-hidden"
        >
          {sections.map((section, i) =>
            role === 'admin' ? (
              <AdminSidebarSectionGroup key={i} section={section} collapsed={collapsed} />
            ) : (
              <SidebarSectionGroup key={i} section={section} role={role} collapsed={collapsed} />
            )
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-3 flex-shrink-0 bg-transparent overflow-visible">
          <LogoutButton showText={!collapsed} />
        </div>
      </motion.aside>

      {/* ── Mobile Bottom Tab Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-brand-navy/95 dark:bg-[#020617]/95 backdrop-blur-md border-t border-white/10 z-40 flex items-center justify-around px-2 pb-safe md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.2)] transition-colors duration-300">
        {mobileTabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) => `
              flex flex-col items-center justify-center flex-1 h-full py-1 gap-1 relative group select-none transition-all duration-150 active:scale-95
              ${isActive ? 'text-white font-bold' : 'text-slate-400'}
            `}
          >
            {({ isActive }) => (
              <>
                <span
                  className={`transition-transform duration-200 ${isActive ? 'text-brand-green scale-110' : 'group-hover:scale-105'
                    }`}
                >
                  {tab.icon}
                </span>
                <span className="text-[10px] tracking-tight font-bold transition-colors">
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeMobileTabIndicator"
                    className="absolute top-0 left-4 right-4 h-[3px] rounded-b-md bg-brand-green"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </>
  );
}