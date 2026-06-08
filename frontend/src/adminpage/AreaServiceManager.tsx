import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, AlertCircle, X, RefreshCw } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { useTheme } from '../context/ThemeContext';
import api from '../services/apiService';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ServiceAvailability {
  id: string;
  label: string;
  available: boolean;
}

interface AreaOption {
  id: string;
  label: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'error' | 'success';
}

// ─── Static Data ────────────────────────────────────────────────────────────

const DEFAULT_SERVICES = [
  'CoolFix', 'SaniFix', 'HomeFix',
  'MoveFix', 'GreenFix', 'HealthFix',
  'SpaceFix', 'PoolFix', 'TechFix',
];

const AREAS: AreaOption[] = [
  { id: 'valenzuela', label: 'Valenzuela' },
  { id: 'north-caloocan', label: 'North Caloocan' },
  { id: 'south-caloocan', label: 'South Caloocan' },
  { id: 'navotas', label: 'Navotas' },
  { id: 'malabon', label: 'Malabon' },
  { id: 'quezon-city', label: 'Quezon City' },
  { id: 'marikina', label: 'Marikina' },
  { id: 'manila', label: 'Manila' },
  { id: 'san-juan', label: 'San Juan' },
  { id: 'mandaluyong', label: 'Mandaluyong' },
  { id: 'pasig', label: 'Pasig' },
  { id: 'makati', label: 'Makati' },
  { id: 'pasay', label: 'Pasay' },
  { id: 'taguig', label: 'Taguig' },
  { id: 'paranaque', label: 'Parañaque' },
  { id: 'las-pinas', label: 'Las Piñas' },
  { id: 'muntinlupa', label: 'Muntinlupa' },
];

// Seed defaults matching LandingPage cityDetails
const AREA_DEFAULTS: Record<string, string[]> = {
  'valenzuela': ['CoolFix', 'SaniFix', 'HomeFix', 'TechFix'],
  'north-caloocan': ['CoolFix', 'SaniFix', 'HomeFix', 'HealthFix', 'TechFix', 'SpaceFix'],
  'south-caloocan': ['CoolFix', 'SaniFix', 'HomeFix', 'HealthFix', 'TechFix'],
  'navotas': ['SaniFix', 'CoolFix', 'HealthFix'],
  'malabon': ['CoolFix', 'HomeFix', 'SaniFix', 'MoveFix'],
  'quezon-city': ['CoolFix', 'SaniFix', 'HomeFix', 'MoveFix', 'GreenFix', 'HealthFix', 'SpaceFix', 'PoolFix', 'TechFix'],
  'marikina': ['CoolFix', 'SaniFix', 'HomeFix', 'SpaceFix', 'TechFix', 'HealthFix'],
  'manila': ['CoolFix', 'SaniFix', 'HomeFix', 'MoveFix', 'TechFix'],
  'san-juan': ['CoolFix', 'HomeFix', 'SaniFix', 'TechFix'],
  'mandaluyong': ['CoolFix', 'SaniFix', 'HomeFix', 'HealthFix', 'SpaceFix', 'TechFix'],
  'pasig': ['CoolFix', 'SaniFix', 'HomeFix', 'MoveFix', 'TechFix', 'HealthFix', 'SpaceFix'],
  'makati': ['CoolFix', 'SaniFix', 'HomeFix', 'SpaceFix', 'HealthFix', 'TechFix', 'PoolFix'],
  'pasay': ['CoolFix', 'SaniFix', 'TechFix', 'HomeFix'],
  'taguig': ['CoolFix', 'SaniFix', 'HomeFix', 'SpaceFix', 'TechFix', 'HealthFix', 'PoolFix'],
  'paranaque': ['CoolFix', 'SaniFix', 'HomeFix', 'MoveFix', 'GreenFix', 'TechFix'],
  'las-pinas': ['CoolFix', 'HomeFix', 'SaniFix', 'MoveFix'],
  'muntinlupa': ['CoolFix', 'HomeFix', 'SaniFix'],
};

function getDefaultAvailability(areaId: string): Record<string, boolean> {
  const active = AREA_DEFAULTS[areaId] || [];
  const map: Record<string, boolean> = {};
  DEFAULT_SERVICES.forEach(s => { map[s] = active.includes(s); });
  return map;
}

// ─── Toast Component ────────────────────────────────────────────────────────

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [toast.show, onClose]);

  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-md ${
            toast.type === 'error'
              ? 'bg-red-50/95 dark:bg-red-950/90 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
              : 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
          <span className="text-sm font-bold tracking-tight">{toast.message}</span>
          <button onClick={onClose} className="ml-2 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Service Card ───────────────────────────────────────────────────────────

function ServiceToggleCard({
  service,
  available,
  onToggle,
  onDelete,
  index,
}: {
  service: string;
  available: boolean;
  onToggle: () => void;
  onDelete: (e: React.MouseEvent) => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      onClick={onToggle}
      className={`
        relative flex flex-col items-center justify-center gap-2.5 py-6 px-4 rounded-2xl
        border-2 transition-all duration-300 cursor-pointer select-none group
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-navy/30 dark:focus:ring-brand-green/30
        ${available
          ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/60 shadow-sm hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-600 hover:-translate-y-0.5'
          : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-100/60 dark:border-slate-800/40 opacity-50 hover:opacity-65'
        }
      `}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Delete button (only visible on hover) */}
      <div 
        onClick={onDelete}
        className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-all z-10"
        title="Delete this service card"
      >
        <X className="w-3.5 h-3.5" />
      </div>

      {/* Active indicator dot */}
      <div className={`
        w-2.5 h-2.5 rounded-full transition-all duration-300
        ${available
          ? 'bg-[#10355f] dark:bg-[#60a5fa] shadow-[0_0_8px_rgba(16,53,95,0.3)] dark:shadow-[0_0_8px_rgba(96,165,250,0.4)]'
          : 'bg-slate-300 dark:bg-slate-600'
        }
      `} />

      {/* Service name */}
      <span className={`
        text-sm font-bold tracking-tight transition-colors duration-300
        ${available
          ? 'text-[#10355f] dark:text-white'
          : 'text-slate-400 dark:text-slate-500'
        }
      `}>
        {service}
      </span>

      {/* COMING SOON badge — inactive overlay */}
      <AnimatePresence>
        {!available && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center rounded-2xl pointer-events-none"
          >
            <div className="px-3 py-1.5 rounded-lg bg-red-500/85 dark:bg-red-600/80 backdrop-blur-sm shadow-lg shadow-red-500/20">
              <span className="text-[10px] font-black tracking-widest text-white uppercase">
                Coming Soon
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover pulse ring for active cards */}
      {available && (
        <div className="absolute inset-0 rounded-2xl border-2 border-[#10355f]/0 dark:border-[#60a5fa]/0 group-hover:border-[#10355f]/15 dark:group-hover:border-[#60a5fa]/15 transition-all duration-300 pointer-events-none" />
      )}
    </motion.button>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AreaServiceManager() {
  const { isDark } = useTheme();

  const [selectedArea, setSelectedArea] = useState<string>(AREAS[0].id);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [customServices, setCustomServices] = useState<string[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'error' });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedLabel = AREAS.find(a => a.id === selectedArea)?.label || '';
  
  // Combine defaults with custom services (deduplicated)
  const allServicesList = Array.from(new Set([...DEFAULT_SERVICES, ...customServices]));

  // Load custom services on mount
  useEffect(() => {
    try {
      const savedCustom = localStorage.getItem('global_custom_services');
      if (savedCustom) {
        setCustomServices(JSON.parse(savedCustom));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // ── Fetch availability for an area ──
  const fetchAvailability = useCallback((areaId: string) => {
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      try {
        const saved = localStorage.getItem(`area_services_${areaId}`);
        if (saved) {
          setAvailability(JSON.parse(saved));
        } else {
          setAvailability(getDefaultAvailability(areaId));
        }
      } catch {
        setAvailability(getDefaultAvailability(areaId));
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  useEffect(() => {
    fetchAvailability(selectedArea);
  }, [selectedArea, fetchAvailability]);

  // ── Add New Service ──
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newServiceName.trim();
    if (!name) return;
    
    // Check if it already exists
    if (allServicesList.some(s => s.toLowerCase() === name.toLowerCase())) {
      setToast({ show: true, message: `${name} already exists.`, type: 'error' });
      return;
    }
    
    const updatedCustom = [...customServices, name];
    setCustomServices(updatedCustom);
    localStorage.setItem('global_custom_services', JSON.stringify(updatedCustom));
    
    // Auto-enable it for the current area
    const newState = { ...availability, [name]: true };
    setAvailability(newState);
    localStorage.setItem(`area_services_${selectedArea}`, JSON.stringify(newState));
    
    setNewServiceName('');
    setToast({ show: true, message: `Added new service card: ${name}`, type: 'success' });
  };
  
  // ── Delete Service ──
  const handleDeleteService = (e: React.MouseEvent, serviceToRemove: string) => {
    e.stopPropagation(); // prevent toggling
    
    if (window.confirm(`Are you sure you want to completely remove "${serviceToRemove}" from all areas?`)) {
      // Remove from customServices if it's a custom service
      if (customServices.includes(serviceToRemove)) {
        const updatedCustom = customServices.filter(s => s !== serviceToRemove);
        setCustomServices(updatedCustom);
        localStorage.setItem('global_custom_services', JSON.stringify(updatedCustom));
      } else {
        // If they try to delete a default one, just hide it from this area by toggling off, 
        // or actually allow deleting defaults by moving it to a "deleted_defaults" list. 
        // For simplicity, let's just allow removing defaults from the view for this area.
        const newState = { ...availability, [serviceToRemove]: false };
        setAvailability(newState);
        localStorage.setItem(`area_services_${selectedArea}`, JSON.stringify(newState));
        setToast({ show: true, message: `Default service ${serviceToRemove} hidden (cannot permanently delete defaults).`, type: 'success' });
        return;
      }
      
      setToast({ show: true, message: `Removed ${serviceToRemove}.`, type: 'success' });
    }
  };

  // ── Optimistic toggle ──
  const handleToggle = (serviceId: string) => {
    const prev = availability[serviceId];
    
    // Ask for confirmation first before toggling!
    const actionStr = prev ? 'DISABLE' : 'ENABLE';
    if (!window.confirm(`Are you sure you want to ${actionStr} ${serviceId} in ${selectedLabel}?`)) {
      return; // Cancelled
    }

    const newState = { ...availability, [serviceId]: !prev };
    
    // Update local state and persist to localStorage
    setAvailability(newState);
    localStorage.setItem(`area_services_${selectedArea}`, JSON.stringify(newState));
    
    setToast({ 
      show: true, 
      message: `${serviceId} ${!prev ? 'enabled' : 'disabled'} in ${selectedLabel}`, 
      type: 'success' 
    });
  };

  // ── Area select ──
  const handleAreaSelect = (areaId: string) => {
    setSelectedArea(areaId);
    setDropdownOpen(false);
  };

  const activeCount = Object.values(availability).filter(Boolean).length;

  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#10355f] dark:bg-[#1e3a5f] flex items-center justify-center shadow-sm">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            Area Service Availability
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Toggle which AllFix services are available in each Metro Manila area.
          </p>
        </div>

        {/* Stats pill */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {activeCount}/{allServicesList.length} active
            </span>
          </div>
          <button
            onClick={() => fetchAvailability(selectedArea)}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition-all shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Area Selector Card ── */}
      <Card>
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">
              Service Area
            </label>

            {/* Custom dropdown */}
            <div className="relative flex-1 max-w-sm">
              <button
                onClick={() => setDropdownOpen(o => !o)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold tracking-tight hover:border-slate-300 dark:hover:border-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-[#10355f]/20 dark:focus:ring-[#60a5fa]/20"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#10355f] dark:text-[#60a5fa]" />
                  <span>{selectedLabel}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-64 overflow-y-auto"
                    >
                      {AREAS.map(area => (
                        <button
                          key={area.id}
                          onClick={() => handleAreaSelect(area.id)}
                          className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors first:rounded-t-xl last:rounded-b-xl ${
                            selectedArea === area.id
                              ? 'bg-[#10355f] text-white'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          {area.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Services Grid ── */}
      <Card>
        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Manage Available Services
              </h2>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg mt-1 inline-block">
                Click to toggle • Hover to delete
              </span>
            </div>
            
            {/* Add Service Form */}
            <form onSubmit={handleAddService} className="flex items-center gap-2 max-w-xs w-full sm:w-auto">
              <input
                type="text"
                placeholder="New service (e.g. AutoFix)"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#10355f]/20 focus:border-[#10355f] dark:focus:ring-[#60a5fa]/20 transition-all"
              />
              <button
                type="submit"
                disabled={!newServiceName.trim()}
                className="px-4 py-2 rounded-xl bg-[#10355f] dark:bg-[#60a5fa] text-white dark:text-slate-900 text-xs font-bold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0a2540] dark:hover:bg-[#3b82f6] transition-colors"
              >
                Add
              </button>
            </form>
          </div>

          {loading ? (
            /* Skeleton loader */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {Array(8).fill(0).map((_, i) => (
                <div
                  key={i}
                  className="h-24 sm:h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {allServicesList.map((service, idx) => (
                <ServiceToggleCard
                  key={service}
                  service={service}
                  available={availability[service] ?? false}
                  onToggle={() => handleToggle(service)}
                  onDelete={(e) => handleDeleteService(e, service)}
                  index={idx}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* ── Toast ── */}
      <Toast toast={toast} onClose={() => setToast(t => ({ ...t, show: false }))} />
    </div>
  );
}
