import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, useSearchParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { NotificationsTab } from '../components/shared/NotificationsTab';
import { ClipboardList, Wrench, Calendar, Search, Star, Plus, Minus, Trash2, Edit, ShoppingBag, ArrowRight, AlertCircle, CheckCircle2, Clock, MapPin, CreditCard, ArrowLeft, User, ShieldAlert, Eye, X, Ticket, RefreshCcw, Receipt, Bell, PlusCircle, ShoppingCart, Check, History, MessageSquare, HelpCircle } from 'lucide-react';
import { AdminPageHeader } from '../components/shared/AdminPageHeader';
import { formatBookingId } from '../utils/formatters';
import { Sidebar } from '../components/shared/Sidebar';
import { Header } from '../components/shared/Header';
import { Card, StatCard } from '../components/shared/Card';
import { DataTable } from '../components/shared/DataTable';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../hooks/useConfirm';
import api from '../services/apiService';
import { updateEmail } from 'firebase/auth';
import { auth } from '../config/firebase';
import { changePassword } from '../services/firebaseService';



// --- Mui components & icons ---
import { Box, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// --- Centralized Service Data Source ---
import { servicesData } from '../constants/servicesData';

type NavigationPillsProps = {
  services: Array<any>;
  activeServiceIdx: number;
  setActiveServiceIdx: (idx: number) => void;
};

const NavigationPills: React.FC<NavigationPillsProps> = ({ services, activeServiceIdx, setActiveServiceIdx }) => {
  return (
    <Box
      id="services-scroll-navbar"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1.5,
        width: '100%',
        mt: 2,
        mb: 1,
        px: 1
      }}
    >
      {services.map((svc, idx) => {
        const ServiceIcon = svc.icon;
        const isActive = activeServiceIdx === idx;

        return (
          <Box
            key={svc.brand}
            onClick={() => {
              setActiveServiceIdx(idx);
            }}
            sx={{
              minWidth: 0,
              px: 1.2,
              py: 1,
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '8px',
              color: isActive ? '#fff' : '#23406e',
              backgroundColor: isActive ? '#23406e' : 'rgba(35, 64, 110, 0.04)',
              border: isActive ? '1px solid #23406e' : '1px solid rgba(35, 64, 110, 0.15)',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.8,
              '&:hover': {
                bgcolor: isActive ? '#23406e' : 'rgba(35, 64, 110, 0.1)',
                borderColor: isActive ? '#23406e' : 'rgba(35, 64, 110, 0.25)'
              }
            }}
          >
            <ServiceIcon sx={{ fontSize: '1rem', color: isActive ? '#fff' : '#23406e' }} />
            <span>{svc.brand}</span>
          </Box>
        );
      })}
    </Box>
  );
};

const ServiceCard = ({ service, isSubService = false, onServiceClick }: { service: any; isSubService?: boolean; onServiceClick: (service: any) => void }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = service.icon;

  return (
    <div
      onClick={() => onServiceClick(service)}
      className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-880 transition-all duration-300 bg-white dark:bg-slate-900 flex flex-col h-full cursor-pointer"
      style={{
        borderTop: isSubService ? `4px solid ${service.accent}` : undefined,
        boxShadow: hovered ? '0 25px 50px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image showcase */}
      <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <img
          src={service.image}
          alt={service.brand}
          className="w-full h-full object-cover transition-opacity duration-500 absolute top-0 left-0"
          style={{
            objectPosition: 'center 10%',
            opacity: hovered ? 0.3 : 1,
          }}
        />
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundColor: service.accent,
            opacity: hovered ? 0.6 : 0
          }}
        />

        {!isSubService && (
          <>
            {/* Floating Top Left Tag */}
            <div className="absolute top-4 left-4 z-20">
              <div className="text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white shadow-sm border border-white/10">
                {service.brand}
              </div>
            </div>

            {/* Floating Top Right Actions */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-sm">
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </>
        )}

        {isSubService && (
          <div className="absolute top-4 right-4 z-20">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md" style={{ backgroundColor: service.accent }}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
        )}

        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          >
            {isSubService ? (
              <div className="text-white font-black text-lg tracking-wide uppercase border-2 border-white px-6 py-2 rounded-full shadow-lg bg-white/15 backdrop-blur-sm">
                Book Now
              </div>
            ) : (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg animate-pulse"
                style={{
                  backgroundColor: service.accent,
                  boxShadow: `0 0 20px ${service.accent}80, 0 0 40px ${service.accent}40`,
                }}
              >
                <Icon className="w-7 h-7 text-white" />
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 sm:p-7 flex flex-col flex-grow bg-white dark:bg-slate-900 relative z-30">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-0.5">{service.brand}</h3>
        <p className="text-xs font-bold mb-3" style={{ color: service.accent }}>{service.tagline}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 flex-grow">{service.description}</p>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4">
          {service.services.map((tag: string) => (
            <div key={tag} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: service.accent }} />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{tag}</span>
            </div>
          ))}
        </div>

        <div
          className="inline-flex items-center gap-1.5 text-xs font-bold transition-colors duration-200 mt-auto"
          style={{ color: hovered ? (service.accentDark || service.accent) : service.accent }}
        >
          <span>Book {service.brand}</span>
          <ArrowRight
            className="w-3.5 h-3.5 transition-transform duration-200"
            style={{ transform: hovered ? 'translateX(4px)' : 'translateX(0)' }}
          />
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 h-0.5 transition-all duration-300"
        style={{
          backgroundColor: service.accent,
          width: hovered ? '100%' : '0%'
        }}
      />
    </div>
  );
};

// ─── Home Tab ───────────────────────────────────────────────────────────────
function CustomerHome() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<any[]>(servicesData);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [activeServiceIdx, setActiveServiceIdx] = useState(0);
  const location = useLocation();
  const [selectedBrandService, setSelectedBrandService] = useState<any>(() => {
    // Check if we came back from booking form
    const stateRestoreBrand = location.state?.restoreBrand || localStorage.getItem('restoreBrand');
    if (stateRestoreBrand && servicesData.length > 0) {
      const svc = servicesData.find(s => s.brand?.toLowerCase() === stateRestoreBrand.toLowerCase());
      if (svc) return svc;
    }
    return null;
  });

  useEffect(() => {
    if (profile?.id) {
      api.get(`/api/bookings/customer/${profile.id}`).then(r => setRecentBookings((r.data || []).slice(0, 5))).catch(() => { }).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [profile]);

  const initialRestoreHandled = useRef(false);

  useEffect(() => {
    const stateRestoreBrand = location.state?.restoreBrand || localStorage.getItem('restoreBrand');
    if (stateRestoreBrand && services.length > 0 && !initialRestoreHandled.current) {
      const svc = services.find(s => s.brand?.toLowerCase() === stateRestoreBrand.toLowerCase());
      if (svc) {
        setSelectedBrandService(svc);
        initialRestoreHandled.current = true;
        localStorage.removeItem('restoreBrand');
      } else if (!servicesLoading) {
        // If loading is finished and service still not found, consume it to prevent infinite loop
        initialRestoreHandled.current = true;
        localStorage.removeItem('restoreBrand');
      }
    }
  }, [services, location.state?.restoreBrand, servicesLoading]);

  // Keep selectedBrandService updated with the latest backend data when services fetch completes
  useEffect(() => {
    if (services.length > 0 && selectedBrandService) {
      const freshSvc = services.find(s => s.id === selectedBrandService.id || s.brand === selectedBrandService.brand);
      if (freshSvc && freshSvc !== selectedBrandService) {
        setSelectedBrandService(freshSvc);
      }
    }
  }, [services]);

  useEffect(() => {
    setServicesLoading(true);
    api.get('/api/services')
      .then(res => {
        const backendServices = res.data;
        const merged: any[] = [];

        backendServices.forEach((backendService: any) => {
          const id = backendService.id || backendService.name.toLowerCase().replace(/\s+/g, '');
          const frontendMatch = servicesData.find(
            svc => svc.id.toLowerCase() === id.toLowerCase() || svc.brand.toLowerCase() === backendService.name.toLowerCase()
          );
          if (frontendMatch) {
            merged.push({
              ...frontendMatch,
              id,
              description: backendService.description,
              tagline: backendService.tagline || frontendMatch.tagline,
              image: backendService.imageUrl || backendService.image || frontendMatch.image,
              subServices: backendService.subServices && backendService.subServices.length > 0
                ? backendService.subServices.map((bsSub: any) => {
                  const fsSub: any = (frontendMatch.subServices || []).find((fs: any) => fs.name.toLowerCase() === bsSub.name.toLowerCase());
                  return {
                    ...fsSub,
                    ...bsSub,
                    workTypes: (bsSub.workTypes && bsSub.workTypes.length > 0) ? bsSub.workTypes : (fsSub?.workTypes || []),
                    image: bsSub.imageUrl || bsSub.image || fsSub?.image || fsSub?.imageUrl,
                    prices: (bsSub.prices && Object.keys(bsSub.prices).length > 0) ? bsSub.prices : (fsSub?.prices || {})
                  } as any;
                })
                : frontendMatch.subServices || [],
            });
          } else {
            // Backend-only service (dynamically added via admin)
            merged.push({
              id,
              icon: AutoAwesomeIcon,
              brand: backendService.name,
              tagline: backendService.tagline || 'Specialized Services',
              description: backendService.description,
              image: backendService.imageUrl || backendService.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
              accent: '#2E5BA8',
              accentDark: '#10355f',
              headerBg: '#10355f',
              headerBgLight: '#2E5BA8',
              pillText: '#2E5BA8',
              services: backendService.subServices ? backendService.subServices.map((sub: any) => sub.name) : [],
              subServices: backendService.subServices || [],
            });
          }
        });

        // Add remaining frontend services not in backend
        servicesData.forEach((fs) => {
          if (!merged.find(m => m.id.toLowerCase() === fs.id.toLowerCase() || m.brand.toLowerCase() === fs.brand.toLowerCase())) {
            merged.push(fs);
          }
        });

        const desiredOrder = [
          'coolfix', 'sanifix', 'homefix', 'techfix', 'movefix',
          'spacefix', 'poolfix', 'healthfix', 'greenfix'
        ];
        merged.sort((a, b) => {
          const brandA = (a.brand || '').toLowerCase();
          const brandB = (b.brand || '').toLowerCase();
          const indexA = desiredOrder.indexOf(brandA);
          const indexB = desiredOrder.indexOf(brandB);
          return (indexA !== -1 ? indexA : 999) - (indexB !== -1 ? indexB : 999);
        });

        if (merged.length > 0) {
          setServices(merged);
        } else {
          setServices(servicesData);
        }
      })
      .catch(err => {
        console.error("Failed to load services", err);
        setServices(servicesData);
      })
      .finally(() => setServicesLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {(!selectedBrandService && !((location.state?.restoreBrand || localStorage.getItem('restoreBrand')) && !initialRestoreHandled.current)) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-brand-navy to-[#0a2d5c] text-white border-none">
            <h2 className="text-2xl font-bold mb-1">Welcome back, {profile?.first_name || 'there'}!</h2>
            <p className="text-white/70">Ready to book your next service?</p>
          </Card>
        </motion.div>
      )}

      {/* ─── Services Grid (Imitates Landing Page UI & Behavior) ─── */}
      <div className={selectedBrandService ? "-mt-2" : "mt-8"}>
        {!selectedBrandService ? (
          (location.state?.restoreBrand || localStorage.getItem('restoreBrand')) && !initialRestoreHandled.current ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="skeleton h-[450px] rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Our Services</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Select a specialized brand to view custom care services and secure immediate bookings.
                </p>
              </div>

              {servicesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="skeleton h-[450px] rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="w-full mt-4">
                  {/* Mobile only: single card display with tab selector (xs) */}
                  <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    {/* Single active service card */}
                    <Box sx={{ width: '100%', px: 1.5, mb: 1.5 }}>
                      {services.length > 0 && (
                        <ServiceCard
                          service={services[activeServiceIdx] || services[0]}
                          onServiceClick={(svc) => {
                            setSelectedBrandService(svc);
                            window.scrollTo(0, 0);
                          }}
                        />
                      )}
                    </Box>
                    {/* Selector pills at the bottom */}
                    <NavigationPills
                      services={services.slice(0, 9)}
                      activeServiceIdx={activeServiceIdx}
                      setActiveServiceIdx={setActiveServiceIdx}
                    />
                  </Box>

                  {/* Tablet (sm–md): 2-column grid | Desktop (lg+): 3-column grid */}
                  <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {services.slice(0, 9).map((service, index) => (
                      <div key={index} className="h-full w-full flex">
                        <ServiceCard
                          service={service}
                          onServiceClick={(svc) => {
                            setSelectedBrandService(svc);
                            window.scrollTo(0, 0);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )
        ) : (
          <motion.div id="sub-services-section" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mt-1">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-brand-navy dark:text-white shadow-sm">
                    {React.createElement(selectedBrandService.icon, { className: "w-6 h-6" })}
                  </div>
                  {selectedBrandService.brand} Sub-Services
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Select a specific {selectedBrandService.brand} service below to proceed with your booking.
                </p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedBrandService(null)} className="w-fit hover:bg-transparent text-slate-500 hover:text-brand-navy h-auto py-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Brands
              </Button>
            </div>

            <Grid container rowSpacing={3} columnSpacing={1.5} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              {selectedBrandService.subServices?.map((sub: any, idx: number) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={idx} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ width: '100%', maxWidth: '420px', display: 'flex' }}>
                    <ServiceCard
                      service={{
                        ...selectedBrandService,
                        brand: sub.name,
                        tagline: selectedBrandService.brand,
                        description: sub.description || `Professional ${sub.name.toLowerCase()} services tailored to your needs.`,
                        services: sub.workTypes && sub.workTypes.length > 0 ? sub.workTypes : [sub.name],
                        image: sub.imageUrl || sub.image || selectedBrandService.image
                      }}
                      isSubService={true}
                      onServiceClick={() => navigate(`/customer/book?subservice=${encodeURIComponent(sub.name)}&brand=${encodeURIComponent(selectedBrandService.brand)}`, { state: { fromBrand: selectedBrandService.brand } })}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Bookings</h3>
      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : recentBookings.length === 0 ? (
        <EmptyState title="No bookings yet" description="Book your first service to get started." />
      ) : (
        <div className="space-y-3">
          {recentBookings.map(b => (
            <Card key={b.id} hover padding="sm">
              <div className="flex items-center justify-between">
                <div><p className="font-medium text-slate-900 dark:text-white">{b.service_type}</p>
                  <p className="text-xs text-slate-500">{b.scheduled_date}</p></div>
                <span className={b.status === 'completed' ? 'badge-completed' : b.status === 'job_done' ? 'badge-in-progress bg-blue-100 text-blue-800' : b.status === 'in_progress' ? 'badge-in-progress' : b.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'}>{b.status?.replace('_', ' ')}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Book a Service Tab ─────────────────────────────────────────────────────
interface BookingFormTabProps {
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  onCheckout: (items: any[], onSuccess: (bookings: any[]) => void) => void;
}

function BookingFormTab({ cart, setCart, onCheckout }: BookingFormTabProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const subserviceParam = searchParams.get('subservice') || '';
  const editParam = searchParams.get('edit') || '';
  const brandParam = searchParams.get('brand') || location.state?.fromBrand;
  const navigate = useNavigate();
  const { profile } = useAuth();

  // [CAVEMAN] Helper to check if a booking slot has already passed
  const isSlotPassed = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return false;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    let passed = false;
    if (dateStr < todayStr) {
      passed = true;
    } else if (dateStr === todayStr) {
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const [selHour, selMin] = timeStr.split(':').map(Number);
      if (selHour < currentHour || (selHour === currentHour && selMin <= currentMin)) {
        passed = true;
      }
    }
    console.log(`[CAVEMAN] Slot check for ${dateStr} ${timeStr} against today ${todayStr} ${now.getHours()}:${now.getMinutes()} -> passed: ${passed}`);
    return passed;
  };

  const [services, setServices] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [serviceId, setServiceId] = useState('');
  const [subServiceId, setSubServiceId] = useState('');
  const [workType, setWorkType] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');

  const [scheduleAvailableVendors, setScheduleAvailableVendors] = useState<any[]>([]);
  const [fetchingAvailableVendors, setFetchingAvailableVendors] = useState(false);
  const [timeError, setTimeError] = useState('');

  // Edit / Status state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [successBookings, setSuccessBookings] = useState<any[] | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/api/services'),
      api.get('/api/vendors/approved')
    ]).then(([svcRes, venRes]) => {
      setServices(svcRes.data || []);
      setVendors(venRes.data || []);
    }).catch(err => {
      console.error("Failed to load booking form data", err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  // Pre-fill selection based on query params or dynamic changes (editing existing cart item)
  useEffect(() => {
    if (editParam && cart.length > 0 && services.length > 0) {
      const itemToEdit = cart.find(item => item.id === editParam);
      if (itemToEdit) {
        console.log('[CAVEMAN] Loading edit item from URL parameter:', itemToEdit);
        setEditingId(itemToEdit.id);
        setServiceId(itemToEdit.serviceId);
        setSubServiceId(itemToEdit.subServiceId);
        setWorkType(itemToEdit.workType);
        setDescription(itemToEdit.description || '');
        setVendorId(itemToEdit.vendorId);
        setScheduledDate(itemToEdit.scheduledDate);
        setScheduledTime(itemToEdit.scheduledTime);
        setQuantity(itemToEdit.quantity);

        // Clear search params so reloading doesn't reset changes and user can edit freely
        setSearchParams({});
      }
    }
  }, [editParam, cart, services, setSearchParams]);

  // Pre-fill selection based on query params or dynamic changes
  useEffect(() => {
    if (editParam) return;

    if (services.length > 0 && subserviceParam && !editingId) {
      const matchedSvc = services.find((s: any) =>
        s.subServices?.some((sub: any) => sub.name?.toLowerCase() === subserviceParam.toLowerCase())
      );
      const matchedSub = matchedSvc?.subServices?.find((sub: any) => sub.name?.toLowerCase() === subserviceParam.toLowerCase());

      if (matchedSvc && matchedSub) {
        setServiceId(matchedSvc.id || matchedSvc.name?.toLowerCase()?.replace(/\s+/g, ''));
        setSubServiceId(matchedSub.id || matchedSub.name);

        const subWorkTypes = matchedSub.workTypes || [];
        if (subWorkTypes.length > 0) {
          setWorkType(subWorkTypes[0]);
        } else {
          setWorkType(matchedSub.name);
        }
      }
    }
  }, [services, subserviceParam, editingId, editParam]);

  // Find active selections
  const activeServiceCategory = services.find((s: any) => s.id === serviceId || s.name?.toLowerCase()?.replace(/\s+/g, '') === serviceId);
  const subServicesOptions = activeServiceCategory?.subServices || [];
  const activeSubService = subServicesOptions.find((sub: any) => sub.id === subServiceId || sub.name === subServiceId);

  // Available Work Types
  const workTypeOptions = activeSubService?.workTypes && activeSubService.workTypes.length > 0
    ? activeSubService.workTypes
    : activeSubService ? [activeSubService.name] : [];

  // Validate preferred start time is not in the past for today's date
  useEffect(() => {
    if (scheduledDate && scheduledTime) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      if (scheduledDate === todayStr) {
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const [selHour, selMin] = scheduledTime.split(':').map(Number);
        if (selHour < currentHour || (selHour === currentHour && selMin <= currentMin)) {
          setTimeError('This time has already passed today. Please select a future time.');
          return;
        }
      }
      setTimeError('');
    } else {
      setTimeError('');
    }
  }, [scheduledDate, scheduledTime]);

  // Fetch schedule-available vendors from database
  useEffect(() => {
    console.log('[CAVEMAN] === VENDOR FETCH TRIGGER ===');
    console.log('[CAVEMAN] serviceId:', serviceId, '| workType:', workType);
    console.log('[CAVEMAN] scheduledDate:', scheduledDate, '| scheduledTime:', scheduledTime);
    console.log('[CAVEMAN] timeError:', timeError, '| activeSubService:', activeSubService?.name);

    if (serviceId && workType && scheduledDate && scheduledTime && !timeError) {
      setFetchingAvailableVendors(true);
      const activeSvc = services.find((s: any) => s.id === serviceId || s.name?.toLowerCase()?.replace(/\s+/g, '') === serviceId);
      const params = {
        service_name: activeSvc?.name || '',
        service_brand: activeSvc?.brand || '',
        sub_service: activeSubService?.name || '',
        work_type: workType,
        date: scheduledDate,
        time: scheduledTime
      };
      console.log('[CAVEMAN] activeSvc:', activeSvc ? { id: activeSvc.id, name: activeSvc.name, brand: activeSvc.brand } : 'NOT FOUND');
      console.log('[CAVEMAN] REQUEST PARAMS:', JSON.stringify(params));

      api.get('/api/slots/available-vendors-schedule', { params })
        .then(res => {
          console.log('[CAVEMAN] RESPONSE:', res.status, JSON.stringify(res.data));
          console.log('[CAVEMAN] VENDOR COUNT:', (res.data || []).length);
          setScheduleAvailableVendors(res.data || []);
        }).catch(err => {
          console.error('[CAVEMAN] FETCH ERROR:', err);
          console.error('[CAVEMAN] Error response:', err.response?.data);
          setScheduleAvailableVendors([]);
        }).finally(() => {
          setFetchingAvailableVendors(false);
        });
    } else {
      console.log('[CAVEMAN] SKIPPING fetch - missing fields or timeError');
      setScheduleAvailableVendors([]);
    }
  }, [serviceId, workType, scheduledDate, scheduledTime, services, activeSubService?.name, timeError]);

  // [CAVEMAN] Derived list: only vendors with available_slots > 0 are displayed and selectable
  const selectableVendors = scheduleAvailableVendors.filter((v: any) => {
    const avail = v.available_slots !== undefined && v.available_slots !== null ? v.available_slots : v.total_slots;
    const isSelectable = avail === undefined || avail === null || avail > 0;
    console.log(`[CAVEMAN] Vendor ${v.company_name || v.name || v.username} remaining slots: ${avail} -> Displayable/Selectable: ${isSelectable}`);
    return isSelectable;
  });

  // [CAVEMAN] Automatically deselect vendor if they have 0 slots remaining (are not in selectable list)
  useEffect(() => {
    if (vendorId && scheduleAvailableVendors.length > 0) {
      const isSelectable = selectableVendors.some(v => v.id === vendorId);
      if (!isSelectable) {
        console.log(`[CAVEMAN] Auto-resetting vendorId because selected vendor is no longer selectable`);
        setVendorId('');
      }
    }
  }, [scheduleAvailableVendors, vendorId]);

  // Filter vendors by capability
  const availableVendors = vendors.filter((v: any) => {
    if (!activeServiceCategory || !workType) return false;
    if (!v.services || !Array.isArray(v.services)) return false;
    return v.services.some((vs: any) => {
      if (vs.service?.toLowerCase() !== activeServiceCategory.brand?.toLowerCase() && vs.service?.toLowerCase() !== activeServiceCategory.name?.toLowerCase()) return false;
      if (vs.work_types && Array.isArray(vs.work_types)) {
        return vs.work_types.some((wt: any) =>
          wt.name?.toLowerCase() === workType?.toLowerCase() &&
          wt.status === 'approved'
        );
      }
      return false;
    });
  });

  // Fetch unit price
  const price = Number(activeSubService?.prices?.[workType] || activeSubService?.prices?.[activeSubService?.name] || activeSubService?.prices?.['Base Price'] || 0);
  const itemTotal = price * quantity;

  // Add or edit item in cart
  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();

    // [CAVEMAN] Prevent multi-service booking by restricting cart length to 1
    if (cart.length >= 1 && !editingId) {
      console.log(`[CAVEMAN] Multi-service booking blocked: Cart already contains 1 item`);
      alert("Only one service booking is allowed at a time. Please remove the existing service from your Selected Services cart or complete the current booking before adding another service.");
      return;
    }

    if (!serviceId || !subServiceId || !workType || !vendorId || !scheduledDate || !scheduledTime || quantity < 1) {
      alert("Please fill all booking details");
      return;
    }

    // Validate preferred start time if date is today
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    if (scheduledDate === todayStr) {
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const [selHour, selMin] = scheduledTime.split(':').map(Number);
      if (selHour < currentHour || (selHour === currentHour && selMin <= currentMin)) {
        alert("The selected preferred start time has already passed for today. Please select a future time.");
        return;
      }
    }

    const selectedVendor = selectableVendors.find(v => v.id === vendorId) || vendors.find(v => v.id === vendorId);

    // [CAVEMAN] Prevent booking if selected vendor is not selectable
    const isVendorSelectable = selectableVendors.some(v => v.id === vendorId);
    if (!isVendorSelectable) {
      console.log(`[CAVEMAN] Booking blocked: selected vendor ${vendorId} is not in selectableVendors list.`);
      alert("The selected vendor is not available for the chosen schedule.");
      return;
    }

    const avail = selectedVendor ? (selectedVendor.available_slots !== undefined && selectedVendor.available_slots !== null ? selectedVendor.available_slots : selectedVendor.total_slots) : undefined;
    if (selectedVendor && avail !== undefined && avail !== null && avail <= 0) {
      console.log(`[CAVEMAN] Booking blocked: ${selectedVendor.company_name || selectedVendor.name} has remaining slots = ${avail}`);
      alert("The selected vendor has no remaining available slots.");
      return;
    }

    const cartItem = {
      id: editingId || Math.random().toString(36).substring(2, 9),
      serviceId,
      serviceName: activeServiceCategory?.brand || activeServiceCategory?.name || serviceId,
      subServiceId,
      subServiceName: activeSubService?.name || subServiceId,
      workType,
      description,
      vendorId,
      vendorName: selectedVendor?.company_name || selectedVendor?.name || selectedVendor?.username || 'Vendor',
      scheduledDate,
      scheduledTime,
      quantity,
      price,
      total: itemTotal,
      slotId: selectedVendor?.slot_id || null
    };

    if (editingId) {
      setCart(prev => prev.map(item => item.id === editingId ? cartItem : item));
      setEditingId(null);
    } else {
      setCart(prev => [...prev, cartItem]);
    }

    // Reset fields not locked by search param
    if (!subserviceParam) {
      setServiceId('');
      setSubServiceId('');
      setWorkType('');
      setVendorId('');
    }
    setDescription('');
    setScheduledDate('');
    setScheduledTime('');
    setQuantity(1);
  };

  const handleEditCartItem = (item: any) => {
    setEditingId(item.id);
    setServiceId(item.serviceId);
    setSubServiceId(item.subServiceId);
    setWorkType(item.workType);
    setDescription(item.description || '');
    setVendorId(item.vendorId);
    setScheduledDate(item.scheduledDate);
    setScheduledTime(item.scheduledTime);
    setQuantity(item.quantity);

    // Clear URL param so user can edit freely
    setSearchParams({});
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    if (editingId === itemId) {
      setEditingId(null);
      setServiceId('');
      setSubServiceId('');
      setWorkType('');
      setDescription('');
      setVendorId('');
      setScheduledDate('');
      setScheduledTime('');
      setQuantity(1);
    }
  };

  // Submit all bookings in cart
  const handleCheckout = () => {
    if (cart.length === 0) return;

    // [CAVEMAN] Validate slots of all selected services in cart before checkout
    console.log('[CAVEMAN] Verifying all slots in cart for checkout');
    for (const item of cart) {
      if (isSlotPassed(item.scheduledDate, item.scheduledTime)) {
        console.log('[CAVEMAN] Checkout blocked: expired slot found in cart:', item);
        alert(`The booking for "${item.subServiceName}" - "${item.workType}" has a preferred slot that has already passed (${item.scheduledDate} ${item.scheduledTime}). Please edit or remove this item to proceed.`);
        return;
      }
    }

    onCheckout(cart, (bookingsCreated: any[]) => {
      setSuccessBookings(bookingsCreated);
      setCart([]); // Clear cart on success
    });
  };

  if (successBookings) {
    return (
      <Card className="max-w-2xl mx-auto p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl">
        <div className="w-20 h-20 mx-auto mb-6 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Booking Confirmed!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Your orders have been successfully placed with our verified service partners. You can track progress in your Bookings tab.
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-left mb-8 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Summary</p>
          {successBookings.map((b, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{b.service_type}</p>
                <p className="text-xs text-slate-400">{b.vendor_name} • {b.scheduled_date} • {b.scheduled_time}</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-slate-900 dark:text-white">₱{b.total_price}</p>
                <p className="text-[10px] text-slate-400">Qty: {b.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Button variant="ghost" className="flex-1 py-3 text-sm font-semibold rounded-xl" onClick={() => setSuccessBookings(null)}>
            Book Another Service
          </Button>
          <Button variant="primary" className="flex-1 py-3 text-sm font-semibold rounded-xl bg-slate-900 dark:bg-white hover:bg-[#0a2d5c]" onClick={() => navigate('/customer/bookings')}>
            View My Bookings
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Book a Service"
        subtitle="Configure services, choose your preferred vendor, and bundle them in a single booking cart."
        icon={<PlusCircle />}
        action={
          <Button variant="ghost" onClick={() => {
            const rBrand = brandParam || activeServiceCategory?.brand || activeServiceCategory?.name;
            if (rBrand) {
              localStorage.setItem('restoreBrand', rBrand);
            }
            console.log('[DEBUG] Navigating back with restoreBrand:', rBrand, 'brandParam:', brandParam, 'activeSvc:', activeServiceCategory);
            navigate('/customer', { state: { restoreBrand: rBrand } });
          }} className="w-fit px-0 hover:bg-transparent text-slate-500 hover:text-brand-navy h-auto py-1">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sub-services
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-7 h-96 bg-white dark:bg-slate-900 rounded-3xl" />
          <div className="lg:col-span-5 h-96 bg-white dark:bg-slate-900 rounded-3xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Builder */}
          <div className="lg:col-span-7">
            <Card className="p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-3xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                  {editingId ? 'Edit Selected Service' : 'Add Service to Booking'}
                </h3>
                {editingId && (
                  <span className="text-xs px-3 py-1 font-bold text-orange-500 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50 rounded-full">
                    Editing Mode
                  </span>
                )}
              </div>

              <form onSubmit={handleAddToCart} className="space-y-6">
                {/* Service Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Service Category</label>
                    {subserviceParam ? (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                          {activeServiceCategory?.brand || activeServiceCategory?.name || 'Loading...'}
                        </span>
                        <span className="text-[10px] bg-brand-green/20 text-brand-green font-bold px-2 py-0.5 rounded-full">Prefilled</span>
                      </div>
                    ) : (
                      <select
                        value={serviceId}
                        onChange={(e) => {
                          setServiceId(e.target.value);
                          setSubServiceId('');
                          setWorkType('');
                          setVendorId('');
                        }}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                        required
                      >
                        <option value="">Choose service...</option>
                        {services.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.brand || s.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Sub-Service</label>
                    {subserviceParam ? (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                          {activeSubService?.name || 'Loading...'}
                        </span>
                        <span className="text-[10px] bg-brand-green/20 text-brand-green font-bold px-2 py-0.5 rounded-full">Prefilled</span>
                      </div>
                    ) : (
                      <select
                        value={subServiceId}
                        onChange={(e) => {
                          setSubServiceId(e.target.value);
                          setWorkType('');
                          setVendorId('');
                        }}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                        disabled={!serviceId}
                        required
                      >
                        <option value="">Choose sub-service...</option>
                        {subServicesOptions.map((sub: any) => (
                          <option key={sub.id || sub.name} value={sub.id || sub.name}>{sub.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Work Type Selection */}
                {subServiceId && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Work Type</label>
                    <select
                      value={workType}
                      onChange={(e) => {
                        setWorkType(e.target.value);
                        setVendorId('');
                      }}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                      required
                    >
                      <option value="">Choose specific work type...</option>
                      {workTypeOptions.map((wt: string) => (
                        <option key={wt} value={wt}>{wt}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Description Field (Optional) */}
                {workType && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        console.log(`[CAVEMAN] Description updated: ${e.target.value}`);
                        setDescription(e.target.value);
                      }}
                      placeholder="Enter additional details about the work or service request (optional)"
                      rows={3}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white resize-none"
                    />
                  </div>
                )}

                {/* Booking details section (Date & Time) */}
                {workType && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Preferred Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => {
                            setScheduledDate(e.target.value);
                            setVendorId('');
                          }}
                          min={(() => {
                            const now = new Date();
                            const y = now.getFullYear();
                            const m = String(now.getMonth() + 1).padStart(2, '0');
                            const d = String(now.getDate()).padStart(2, '0');
                            const formatted = `${y}-${m}-${d}`;
                            console.log('[CAVEMAN] Date picker min date local =', formatted);
                            return formatted;
                          })()}
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Preferred Start Time</label>
                      <div className="relative">
                        <Clock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${timeError ? 'text-red-400' : 'text-slate-400'}`} />
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => {
                            setScheduledTime(e.target.value);
                            setVendorId('');
                            setTimeError('');
                          }}
                          className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border rounded-2xl text-sm focus:outline-none focus:ring-2 ${timeError
                            ? 'border-red-400 dark:border-red-500 text-red-600 dark:text-red-400 focus:ring-red-400'
                            : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:ring-slate-900 dark:focus:ring-white'
                            }`}
                          required
                        />
                      </div>
                      {timeError && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-red-500 text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{timeError}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Vendor selection */}
                {workType && scheduledDate && scheduledTime && !timeError && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Preferred Partner / Vendor</label>
                    {fetchingAvailableVendors ? (
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 text-sm animate-pulse">
                        Checking vendor availability...
                      </div>
                    ) : selectableVendors.length === 0 ? (
                      <div className="p-4 bg-red-500/5 border border-red-500/10 text-red-500 rounded-2xl text-sm flex gap-2 items-center">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>No available vendors for the selected schedule.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectableVendors.map((v: any) => {
                          const isSelected = vendorId === v.id;
                          return (
                            <div
                              key={v.id}
                              onClick={() => {
                                console.log(`[CAVEMAN] Vendor selected: ID=${v.id}, Name=${v.company_name || v.name || v.username}, City=${v.city || 'N/A'}`);
                                setVendorId(v.id);
                              }}
                              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left ${isSelected
                                ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/80 shadow-sm'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-800'
                                }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex items-center gap-3">
                                  {v.avatar_url ? (
                                    <img src={v.avatar_url} alt="Vendor Logo" className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700 bg-white" />
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                                        {(v.company_name || v.name || v.username || 'V').charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                  )}
                                  <div className="space-y-0.5">
                                    <p className={`font-bold text-sm leading-tight ${isSelected ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-900 dark:text-white'}`}>
                                      {v.company_name || v.name || v.username}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {v.city || 'Location not specified'}
                                    </p>
                                  </div>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'border-slate-900 bg-slate-900 dark:border-white dark:bg-white' : 'border-slate-300 dark:border-slate-600'
                                  }`}>
                                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Booking details confirmation (Quantity & Price) */}
                {vendorId && selectableVendors.length > 0 && (
                  <>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Quantity</p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-extrabold text-sm text-slate-800 dark:text-white w-6 text-center">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(q => q + 1)}
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Price Estimation</p>
                        <div className="flex items-baseline justify-end gap-1.5">
                          <span className="text-2xl font-black text-brand-green">₱{itemTotal}</span>
                          <span className="text-[10px] text-slate-400 font-bold">(₱{price} each)</span>
                        </div>
                      </div>
                    </div>

                    <Button type="submit" variant="primary" className="w-full py-3.5 text-sm font-extrabold rounded-2xl shadow-sm transition-transform hover:scale-[1.01] bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900">
                      {editingId ? 'Save Changes' : 'Add to Booking Cart'}
                    </Button>
                  </>
                )}
              </form>
            </Card>
          </div>

          {/* Right Column: Checkout Cart Summary */}
          <div className="lg:col-span-5">
            <Card className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-slate-900 dark:text-white" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Selected Services</h3>
                </div>
                <span className="text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2.5 py-1 rounded-full shadow-sm">{cart.length} items</span>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="font-bold text-slate-400">Cart is empty</p>
                  <p className="text-xs text-slate-500 max-w-[200px] mx-auto">Fill in details on the left to add your first service request.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    {cart.map((item) => {
                      const isPassed = isSlotPassed(item.scheduledDate, item.scheduledTime);
                      return (
                        <div
                          key={item.id}
                          className={`p-4 bg-white dark:bg-slate-800 rounded-2xl border shadow-sm relative group transition-colors ${isPassed
                            ? 'border-red-500 dark:border-red-500 bg-red-50/5 dark:bg-red-950/5'
                            : 'border-slate-100 dark:border-slate-800'
                            }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className="font-extrabold text-sm text-slate-950 dark:text-white">{item.workType}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-300 font-medium mb-2">{item.serviceName} • {item.subServiceName}</p>
                              {item.description && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl mb-2 italic border border-slate-100 dark:border-slate-800/80">
                                  "{item.description}"
                                </p>
                              )}
                              <p className="text-xs text-slate-500 dark:text-slate-300 font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg inline-block">{item.vendorName}</p>
                              <div className="flex gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-semibold">
                                <span className={isPassed ? 'text-red-500 dark:text-red-400 font-bold' : ''}>📅 {item.scheduledDate}</span>
                                <span>•</span>
                                <span className={isPassed ? 'text-red-500 dark:text-red-400 font-bold' : ''}>⏰ {item.scheduledTime}</span>
                              </div>
                              {isPassed && (
                                <div className="mt-2 text-xs font-bold text-red-500 dark:text-red-400 bg-red-500/10 dark:bg-red-500/25 p-2 rounded-xl border border-red-500/20 flex items-center gap-1.5 animate-pulse">
                                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500 dark:text-red-400" />
                                  <span>Time slot has passed / Invalid</span>
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-black text-sm text-brand-green">₱{item.total}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Qty: {item.quantity}</p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-1.5 justify-end mt-3 pt-3 border-t border-slate-50 dark:border-slate-800/80">
                            <button
                              onClick={() => handleEditCartItem(item)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-orange-500 hover:border-orange-200 dark:hover:border-orange-900 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveCartItem(item.id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Billing Details */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-sm">
                    {cart.some(item => isSlotPassed(item.scheduledDate, item.scheduledTime)) && (
                      <div className="p-3 bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 text-red-500 dark:text-red-400 text-xs font-bold rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500 dark:text-red-400" />
                        <span>Some selected services have expired slots. Please edit or remove them to proceed.</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-900 dark:text-white pt-2 text-lg font-black">
                      <span>Total Amount</span>
                      <span className="text-brand-green">₱{cart.reduce((sum, item) => sum + item.total, 0)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    loading={checkoutLoading}
                    disabled={cart.some(item => isSlotPassed(item.scheduledDate, item.scheduledTime))}
                    variant="success"
                    className="w-full py-4 text-sm font-extrabold rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
                  >
                    <span>Complete Booking</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Rating & Review Section for Completed Bookings ────────────────────────
function ReviewSection({ booking, profile, onReviewSubmitted }: { booking: any; profile: any; onReviewSubmitted: (updatedBooking: any) => void }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (booking.reviewed) {
    return (
      <Card className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Thank You For Your Review!</h4>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">Your feedback helps us keep AllFix premium and reliable.</p>
          </div>
        </div>
      </Card>
    );
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[CAVEMAN] Submitting rating and review for booking:', booking.id);
    setError('');

    if (!feedback.trim()) {
      setError('Please write a brief feedback review.');
      return;
    }

    setSubmitting(true);
    try {
      const reviewPayload = {
        booking_id: booking.id,
        customer_id: profile?.id,
        customer_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Valued Customer',
        vendor_id: booking.vendor_id || null,
        vendor_name: booking.vendor_name || 'AllFix Partner',
        service_type: booking.sub_service || booking.service_type || 'General Service',
        rating: rating,
        feedback: feedback.trim(),
        featured: false
      };

      await api.post('/api/reviews', reviewPayload);
      console.log('[CAVEMAN] Review submitted successfully!');

      onReviewSubmitted({
        ...booking,
        reviewed: true
      });
    } catch (err: any) {
      console.error('[CAVEMAN] Review submission failed:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-md space-y-6">
      <div className="flex items-center gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
          <Star className="w-5 h-5 fill-yellow-500" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">Rate & Review AllFix</h4>
          <p className="text-xs text-slate-500">Share your experience to help others choose the best services.</p>
        </div>
      </div>

      <form onSubmit={handleSubmitReview} className="space-y-4">
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">Overall Rating *</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = hoverRating !== null ? star <= hoverRating : star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 transition-transform active:scale-95 text-yellow-450 hover:text-yellow-500"
                >
                  <Star className={`w-8 h-8 ${active ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300 dark:text-slate-700'}`} />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Your Feedback Review *</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Write your review about the technician, work quality, or overall service..."
            rows={4}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none placeholder:text-slate-400"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="success"
            className="bg-brand-green hover:bg-emerald-600 text-white font-extrabold px-8 py-3 rounded-xl shadow-lg shadow-brand-green/20"
            loading={submitting}
            disabled={!feedback.trim()}
          >
            Submit Review
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ─── My Bookings Tab ────────────────────────────────────────────────────────

function MyBookingsTab() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Cancel / Refund flow state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundError, setRefundError] = useState('');

  // Add-on Payment flow state
  const [showAddonPaymentModal, setShowAddonPaymentModal] = useState<string | null>(null);
  const [addonPaymentMethod, setAddonPaymentMethod] = useState('');
  const [addonReferenceNumber, setAddonReferenceNumber] = useState('');
  const [addonPaymentSubmitting, setAddonPaymentSubmitting] = useState(false);

  const location = useLocation();

  const fetchBookings = () => {
    if (profile?.id) {
      setLoading(true);
      api.get(`/api/bookings/customer/${profile.id}`)
        .then(r => {
          const fetchedBookings = r.data || [];
          setBookings(fetchedBookings);
          
          // Auto-open booking and addon based on navigation state
          if (location.state?.bookingId && fetchedBookings.length > 0) {
            const b = fetchedBookings.find((bk: any) => bk.id === location.state.bookingId || bk.uid === location.state.bookingId);
            if (b) {
              setSelectedBooking(b);
              if (location.state.openAddon) {
                const pendingAddon = b.add_ons?.find((a: any) => a.status === 'pending_approval');
                if (pendingAddon) {
                  setShowAddonPaymentModal(pendingAddon.id);
                }
              }
            }
          }
        })
        .catch(() => { })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [profile, location.state?.bookingId]);

  const statusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    const isCompleted = statusLower === 'completed' || statusLower === 'confirmed';
    const isPending = statusLower === 'pending' || statusLower === 'in_progress';
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${isCompleted ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' : isPending ? 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
        {status?.replace('_', ' ')}
      </span>
    );
  };

  const handleSubmitRefundRequest = async () => {
    console.log('[CAVEMAN] Customer submitting refund/cancellation request for booking:', selectedBooking?.id);
    setRefundError('');
    if (!refundReason.trim()) {
      setRefundError('Please provide a reason for cancellation.');
      return;
    }
    setRefundSubmitting(true);
    try {
      // Step 1: Create a refund record in the refunds collection for admin review
      const refundPayload = {
        booking_id: selectedBooking.id,
        customer_id: profile?.id,
        customer_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Customer',
        reason: refundReason.trim(),
        refund_amount: selectedBooking.total_price || (selectedBooking.price * (selectedBooking.quantity || 1)) || 0,
        payment_method: selectedBooking.payment_method || '',
        payment_reference: selectedBooking.payment_reference || '',
        status: 'pending',
        cancelled_by: 'customer',
        status_at_cancellation: selectedBooking.status || 'pending',
      };
      console.log('[CAVEMAN] Submitting refund request payload:', refundPayload);
      await api.post('/api/refunds', refundPayload);

      // Step 2: Mark booking as cancellation_requested
      await api.patch(`/api/bookings/${selectedBooking.id}/cancel`);

      console.log('[CAVEMAN] Refund request submitted. Booking marked as cancellation_requested.');

      // Step 3: Update local state — backend sets status to 'cancelled'
      const updatedBooking = { ...selectedBooking, status: 'cancelled', cancellation_requested: true };
      setSelectedBooking(updatedBooking);
      setBookings(prev => prev.map(b => b.id === selectedBooking.id ? updatedBooking : b));

      setShowRefundForm(false);
      setRefundReason('');
    } catch (err: any) {
      console.error('[CAVEMAN] Refund request failed:', err);
      setRefundError(err.response?.data?.message || 'Failed to submit refund request. Please try again.');
    } finally {
      setRefundSubmitting(false);
    }
  };

  const handlePayAddon = async (addonId: string) => {
    if (!addonPaymentMethod || !addonReferenceNumber.trim()) return;
    setAddonPaymentSubmitting(true);
    try {
      await api.patch(`/api/bookings/${selectedBooking.id}/addons/${addonId}/pay`, {
        payment_method: addonPaymentMethod,
        reference_number: addonReferenceNumber
      });
      // Refresh
      fetchBookings();
      if (!profile?.id) return;
      const r = await api.get(`/api/bookings/customer/${profile.id}`);
      const updatedBooking = (r.data || []).find((b: any) => b.id === selectedBooking.id);
      if (updatedBooking) setSelectedBooking(updatedBooking);
      
      setShowAddonPaymentModal(null);
      setAddonPaymentMethod('');
      setAddonReferenceNumber('');
    } catch (err: any) {
      console.error('Failed to submit addon payment', err);
    } finally {
      setAddonPaymentSubmitting(false);
    }
  };

  // ── Booking Details View ──
  if (selectedBooking) {
    const isCancellable = selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && !selectedBooking.cancellation_requested;
    const hasRefundInfo = selectedBooking.refund_reference_number || selectedBooking.refund_method || selectedBooking.cancelled_by;

    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedBooking(null);
                setShowCancelConfirm(false);
                setShowRefundForm(false);
                setRefundReason('');
                setRefundError('');
              }}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Booking Details</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">ID: {formatBookingId(selectedBooking.id)}</p>
            </div>
          </div>
          <div>
            {statusBadge(selectedBooking.status)}
          </div>
        </div>

        {/* Cancellation Notice Banner (if requested) */}
        {selectedBooking.cancellation_requested && selectedBooking.status !== 'cancelled' && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Cancellation Requested</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Your cancellation and refund request has been submitted and is pending admin review.
              </p>
            </div>
          </div>
        )}

        {/* Two-column info layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Service Information */}
          <Card className="p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Service Information</h4>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Service Category:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.sub_service || selectedBooking.service_type}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Work Type:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.service_type}</span>
              </div>
              {selectedBooking.description && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Description:</span>
                  <span className="col-span-2 text-slate-600 dark:text-slate-350 italic leading-tight">"{selectedBooking.description}"</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Vendor:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.vendor_name || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Date & Time:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">📅 {selectedBooking.scheduled_date} at ⏰ {selectedBooking.scheduled_time}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Address:</span>
                <span className="col-span-2 text-slate-800 dark:text-slate-200 leading-tight">{selectedBooking.address || selectedBooking.service_address || '—'}</span>
              </div>
              {selectedBooking.personnel_id && (
                <div className="grid grid-cols-3 gap-2 pt-2 mt-1 border-t border-slate-100 dark:border-slate-800/60 items-center">
                  <span className="text-slate-400 font-medium">Assigned To:</span>
                  <span className="col-span-2 text-slate-900 dark:text-white font-bold flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-brand-green flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                    {selectedBooking.personnel_name || 'Assigned'}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Info Card & Additional Charges */}
          <Card className="p-4 sm:p-5 space-y-3 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm relative">
            <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Payment & Pricing</h4>
            <div className="space-y-1.5 text-[13px] sm:text-sm pt-1">
              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="text-slate-400 font-medium">Unit Price:</span>
                <div className="col-span-2">
                  <span className="text-slate-900 dark:text-white font-semibold">₱{Number(selectedBooking.price || 0).toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400 font-medium">Quantity:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.quantity || 1}</span>
              </div>
              {/* Voucher Discount Info */}
              {selectedBooking.discount_amount > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                    <span className="text-slate-400 font-medium">Subtotal:</span>
                    <span className="col-span-2 text-slate-500 dark:text-slate-400 font-semibold line-through">₱{selectedBooking.original_price || (selectedBooking.price * (selectedBooking.quantity || 1))}</span>
                    <span className="col-span-2 text-slate-500 dark:text-slate-400 font-medium line-through">₱{selectedBooking.original_price || (selectedBooking.price * (selectedBooking.quantity || 1))}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="text-slate-400 font-medium">Voucher:</span>
                    <span className="col-span-2 flex items-center gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded-lg bg-brand-green/10 text-brand-green border border-brand-green/20 font-bold">{selectedBooking.voucher_code}</span>
                      <span className="text-brand-green font-bold text-xs">-₱{Number(selectedBooking.discount_amount).toFixed(2)}</span>
                    </span>
                  </div>
                </>
              )}
              <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 items-center">
                <span className="text-slate-900 dark:text-white font-black">Total Payment:</span>
                <div className="col-span-2">
                  <span className="text-lg font-black text-brand-green">₱{Number(selectedBooking.total_price || (selectedBooking.price * (selectedBooking.quantity || 1)) || 0).toFixed(2)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400 font-medium">Payment Method:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.payment_method || '—'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Reference No:</span>
                <span className="col-span-2 font-mono text-slate-900 dark:text-white font-semibold">{selectedBooking.payment_reference || '—'}</span>
              </div>
              {selectedBooking.account_name && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Account Name:</span>
                  <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.account_name}</span>
                </div>
              )}
              {selectedBooking.account_number && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Account Number:</span>
                  <span className="col-span-2 font-mono text-slate-900 dark:text-white font-semibold">{selectedBooking.account_number}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400 font-medium">Payment Status:</span>
                <span className="col-span-2">
                  {statusBadge(selectedBooking.payment_confirmed ? 'confirmed' : 'pending')}
                </span>
              </div>
              {hasRefundInfo && (
                <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-955/20 border border-rose-200/50 dark:border-rose-900/40 rounded-xl space-y-1 text-xs text-rose-800 dark:text-rose-300">
                  <p className="font-extrabold uppercase tracking-wide mb-1">Refund Information</p>
                  {selectedBooking.cancelled_by && <p><span className="font-bold">Cancelled By:</span> {selectedBooking.cancelled_by}</p>}
                  {selectedBooking.refund_amount && <p><span className="font-bold">Refunded Amount:</span> ₱{selectedBooking.refund_amount}</p>}
                  {selectedBooking.refund_method && <p><span className="font-bold">Method:</span> {selectedBooking.refund_method}</p>}
                  {selectedBooking.refund_reference_number && <p><span className="font-bold">Refund Ref No:</span> {selectedBooking.refund_reference_number}</p>}
                </div>
              )}
            </div>

            {/* Additional Charges / Add-ons Section */}
            {selectedBooking.add_ons && selectedBooking.add_ons.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-brand-navy dark:text-blue-400" />
                    Additional Charges
                  </h4>
                </div>
                
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {selectedBooking.add_ons.map((addon: any) => (
                    <div key={addon.id} className="flex flex-col sm:flex-row sm:items-center px-2.5 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800 text-[13px] sm:text-sm gap-2">
                      <div className="font-medium text-slate-700 dark:text-slate-300 flex-1 min-w-0 pr-2">
                        {addon.description}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-slate-900 dark:text-white shrink-0">₱{Number(addon.amount).toFixed(2)}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {addon.status === 'pending_approval' && <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider bg-amber-100 text-amber-700 rounded whitespace-nowrap">Action Required</span>}
                          {addon.status === 'pending_verification' && <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider bg-blue-100 text-blue-700 rounded whitespace-nowrap">Verifying Payment</span>}
                          {addon.status === 'confirmed' && <span className="text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider bg-emerald-100 text-emerald-700 rounded whitespace-nowrap">Confirmed</span>}
                          
                          {addon.status === 'pending_approval' && (
                            <button className="text-[10px] font-bold px-3 py-1 bg-brand-green text-white rounded-md uppercase tracking-wider hover:bg-brand-green/90 transition-colors shadow-sm ml-1" onClick={() => setShowAddonPaymentModal(addon.id)}>Approve</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Action Buttons */}
        {!showRefundForm && !showCancelConfirm && isCancellable && (
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-4">
            <button
              className="flex-1 py-3 text-sm font-semibold rounded-xl border-2 border-rose-500 text-rose-600 bg-transparent hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shadow-none"
              onClick={() => {
                console.log('[CAVEMAN] Customer clicked Cancel Booking for booking:', selectedBooking.id);
                setShowCancelConfirm(true);
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Completed Rating and Review section */}
        {selectedBooking.status === 'completed' && (
          <ReviewSection
            booking={selectedBooking}
            profile={profile}
            onReviewSubmitted={(updatedBooking) => {
              setSelectedBooking(updatedBooking);
              setBookings(prev => prev.map(b => b.id === updatedBooking.id ? updatedBooking : b));
            }}
          />
        )}

        {/* Addon Payment Modal */}
        {showAddonPaymentModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 space-y-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Pay Additional Charge</h3>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Payment Method</label>
                  <select
                    value={addonPaymentMethod}
                    onChange={(e) => setAddonPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-navy"
                  >
                    <option value="">Select method...</option>
                    <option value="GCash">GCash</option>
                    <option value="Maya">Maya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Reference Number</label>
                  <input
                    type="text"
                    value={addonReferenceNumber}
                    onChange={(e) => setAddonReferenceNumber(e.target.value)}
                    placeholder="Enter reference number"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-navy"
                  />
                </div>
              </div>
              <div className="flex border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setShowAddonPaymentModal(null)} className="flex-1 px-4 py-4 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50">Cancel</button>
                <div className="w-px bg-slate-100 dark:bg-slate-800"></div>
                <button
                  onClick={() => handlePayAddon(showAddonPaymentModal as string)}
                  disabled={addonPaymentSubmitting || !addonPaymentMethod || !addonReferenceNumber.trim()}
                  className="flex-1 px-4 py-4 text-sm font-bold text-brand-navy dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addonPaymentSubmitting ? 'Submitting...' : 'Submit Payment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        {showCancelConfirm && !showRefundForm && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Booking</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-350">
              Are you sure you want to cancel this booking? A refund request will be automatically submitted to the administrator for review.
            </p>
            <div className="bg-white/50 dark:bg-black/20 p-4 rounded-xl border border-amber-200/50 dark:border-amber-900/50 space-y-2 text-xs text-amber-900 dark:text-amber-300">
              <p className="font-bold uppercase tracking-wider">Cancellation Policy</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Cancellations made 24 hours before the schedule are eligible for a full refund.</li>
                <li>Cancellations within 24 hours may incur a processing or cancellation fee depending on the vendor's policy.</li>
                <li>Once a technician is en route or the booking is in-progress, cancellations may not be permitted.</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowCancelConfirm(false)}>No, Keep Booking</Button>
              <Button
                variant="danger"
                onClick={() => {
                  console.log('[CAVEMAN] Customer confirmed cancellation, showing refund form.');
                  setShowCancelConfirm(false);
                  setRefundReason('');
                  setRefundError('');
                  setShowRefundForm(true);
                }}
              >
                Yes, Proceed
              </Button>
            </div>
          </div>
        )}

        {/* Customer Refund Request Form */}
        {showRefundForm && (
          <Card className="p-6 bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-900/30 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center gap-3 border-b pb-4 border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">Cancellation & Refund Request</h4>
                <p className="text-xs text-slate-500">Your request will be reviewed by an administrator.</p>
              </div>
            </div>

            {/* Booking Summary (read-only) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Booking Summary</p>
              <div className="flex justify-between">
                <span className="text-slate-500">Service</span>
                <span className="font-semibold text-slate-800 dark:text-white">{selectedBooking.service_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor</span>
                <span className="font-semibold text-slate-800 dark:text-white">{selectedBooking.vendor_name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled</span>
                <span className="font-semibold text-slate-800 dark:text-white">{selectedBooking.scheduled_date} at {selectedBooking.scheduled_time}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 font-bold">Refund Amount</span>
                <span className="font-black text-brand-green text-base">₱{selectedBooking.total_price || (selectedBooking.price * (selectedBooking.quantity || 1)) || '0.00'}</span>
              </div>
            </div>

            {/* Reason Field */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">Reason for Cancellation *</label>
              <textarea
                value={refundReason}
                onChange={(e) => {
                  console.log('[CAVEMAN] Refund reason updated:', e.target.value);
                  setRefundReason(e.target.value);
                }}
                placeholder="Please describe why you need to cancel this booking..."
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none placeholder:text-slate-400"
              />
            </div>

            {refundError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {refundError}
              </div>
            )}

            {/* Notice */}
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-3 flex items-start gap-2 text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs font-semibold leading-normal">
                Refunds are subject to administrator review. A deduction fee may apply depending on the booking status.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowRefundForm(false);
                  setRefundReason('');
                  setRefundError('');
                }}
                disabled={refundSubmitting}
              >
                Back to Details
              </Button>
              <Button
                variant="danger"
                className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-semibold px-6 shadow-sm transition-colors"
                onClick={handleSubmitRefundRequest}
                loading={refundSubmitting}
                disabled={!refundReason.trim()}
              >
                Submit Refund Request
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // ── Bookings List View ──
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="My Bookings"
        subtitle="Track and manage your service requests, appointments, and past jobs."
        icon={<History />}
      />

      <DataTable
        columns={[
          {
            key: 'id',
            label: 'Booking ID',
            sortable: true,
            render: (item: any) => <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{formatBookingId(item.id)}</span>
          },
          { key: 'service_type', label: 'Service', sortable: true },
          { key: 'scheduled_date', label: 'Date', sortable: true },
          { key: 'scheduled_time', label: 'Time' },
          {
            key: 'status', label: 'Status', render: (item: any) => {
              const statusLower = item.status?.toLowerCase() || '';
              const isCompleted = statusLower === 'completed' || statusLower === 'confirmed';
              const isPending = statusLower === 'pending' || statusLower === 'in_progress';
              return <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${isCompleted ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' : isPending ? 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>{item.status?.replace('_', ' ')}</span>;
            }
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (item: any) => (
              <Button
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 shadow-sm transition-colors flex items-center gap-1.5"
                onClick={(e: any) => {
                  e.stopPropagation();
                  console.log('[CAVEMAN] Customer viewing booking details for:', item.id);
                  setSelectedBooking(item);
                }}
                icon={<Eye className="w-4 h-4" />}
              >
                View Details
              </Button>
            )
          },
        ]}
        data={bookings}
        loading={loading}
        searchPlaceholder="Search bookings..."
        emptyTitle="No bookings yet"
        emptyDescription="Book a service to see your bookings here."
      />
    </div>
  );
}



// ─── Cart Tab ───────────────────────────────────────────────────────────────
interface CartTabProps {
  cart: any[];
  setCart: React.Dispatch<React.SetStateAction<any[]>>;
  onCheckout: (items: any[], onSuccess: (bookings: any[]) => void) => void;
}

function CartTab({ cart, setCart, onCheckout }: CartTabProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [successBookings, setSuccessBookings] = useState<any[] | null>(null);

  const handleRemoveCartItem = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Validate preferred start time if date is today
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    for (const item of cart) {
      if (item.scheduledDate === todayStr) {
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const [selHour, selMin] = item.scheduledTime.split(':').map(Number);
        if (selHour < currentHour || (selHour === currentHour && selMin <= currentMin)) {
          return;
        }
      }
    }

    onCheckout(cart, (bookingsCreated: any[]) => {
      setSuccessBookings(bookingsCreated);
      setCart([]); // Clear cart on success
    });
  };

  if (successBookings) {
    return (
      <Card className="max-w-2xl mx-auto p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl">
        <div className="w-20 h-20 mx-auto mb-6 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Booking Confirmed!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Your orders have been successfully placed with our verified service partners. You can track progress in your Bookings tab.
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-left mb-8 shadow-inner relative overflow-hidden">
          {/* Receipt Top Zigzag Decor */}
          <div className="absolute top-0 left-0 w-full h-2 bg-repeat-x flex items-center justify-center opacity-20 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 2px, transparent 2.5px)', backgroundSize: '10px 10px' }}></div>

          <div className="text-center mb-6 pt-2 border-b border-dashed border-slate-300 dark:border-slate-700 pb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Official Receipt</p>
            <p className="text-[10px] text-slate-400">{new Date().toLocaleString()}</p>
          </div>

          <div className="space-y-6">
            {successBookings.map((b, idx) => (
              <div key={idx} className="pb-6 border-b border-dashed border-slate-300 dark:border-slate-700 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-base text-slate-800 dark:text-slate-200">{b.service_type}</p>
                  <p className="font-extrabold text-slate-900 dark:text-white">₱{b.total_price}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col">
                    <span className="font-semibold text-[10px] uppercase text-slate-400">Booking ID</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{formatBookingId(b.id)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-semibold text-[10px] uppercase text-slate-400">Vendor</span>
                    <span className="text-slate-700 dark:text-slate-300">{b.vendor_name || '—'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[10px] uppercase text-slate-400">Date & Time</span>
                    <span className="text-slate-700 dark:text-slate-300">{b.scheduled_date} at {b.scheduled_time}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-semibold text-[10px] uppercase text-slate-400">Rate</span>
                    <span className="text-slate-700 dark:text-slate-300">₱{b.price} x {b.quantity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t-2 border-slate-800 dark:border-white flex justify-between items-center">
            <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Total Amount</span>
            <span className="text-xl font-black text-brand-navy dark:text-white">
              ₱{successBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0).toFixed(2)}
            </span>
          </div>

          {/* Receipt Bottom Zigzag Decor */}
          <div className="absolute bottom-0 left-0 w-full h-2 bg-repeat-x flex items-center justify-center opacity-20 dark:opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #0f172a 2px, transparent 2.5px)', backgroundSize: '10px 10px', backgroundPosition: 'bottom' }}></div>
        </div>

        <div className="flex gap-4">
          <Button variant="ghost" className="flex-1 py-3 text-sm font-semibold rounded-xl" onClick={() => setSuccessBookings(null)}>
            Book Another Service
          </Button>
          <Button variant="primary" className="flex-1 py-3 text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors shadow-sm" onClick={() => navigate('/customer/bookings')}>
            View My Bookings
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Your Booking Cart"
        subtitle="Review selected services and schedule details before completing the booking."
        icon={<ClipboardList />}
      />

      <div className="max-w-3xl mx-auto">
        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl p-8 space-y-4">
            <ClipboardList className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">No Pending Bookings</h2>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">You haven't added any services to your booking queue yet. Browse our specialized care solutions to get started.</p>
            <Button variant="primary" className="py-2.5 px-6 text-sm font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors shadow-sm" onClick={() => navigate('/customer')}>
              Browse Services
            </Button>
          </div>
        ) : (

      <Card className="p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl space-y-6">
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative group">
              <div>
                <p className="font-extrabold text-base text-slate-950 dark:text-white">{item.workType}</p>
                <p className="text-xs text-slate-400 dark:text-slate-300 font-semibold mb-2">{item.serviceName} • {item.subServiceName}</p>
                {item.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-xl mb-2 italic border border-slate-100 dark:border-slate-800/80 max-w-md">
                    "{item.description}"
                  </p>
                )}
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">{item.vendorName}</span>
                  <span>📅 {item.scheduledDate}</span>
                  <span>⏰ {item.scheduledTime}</span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-6">
                <div className="text-right">
                  <p className="font-black text-base text-brand-green">₱{item.total}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300 font-bold">Qty: {item.quantity} (₱{item.price} each)</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { navigate(`/customer/book?edit=${item.id}&subservice=${encodeURIComponent(item.subServiceName)}&brand=${encodeURIComponent(item.brand)}`); }}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-orange-500 hover:border-orange-200 dark:hover:border-orange-900 transition-colors bg-white dark:bg-slate-800 shadow-sm"
                    title="Edit Item details"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemoveCartItem(item.id)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-colors bg-white dark:bg-slate-800 shadow-sm"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Billing Details */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3 text-sm">
          <div className="flex justify-between text-slate-900 dark:text-white pt-3 text-xl font-black">
            <span>Total Amount</span>
            <span className="text-brand-green">₱{cart.reduce((sum, item) => sum + item.total, 0)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button variant="ghost" className="flex-1 py-3.5 text-sm font-bold rounded-2xl" onClick={() => navigate('/customer/book')}>
            Add Another Service
          </Button>
          <Button
            onClick={handleCheckout}
            loading={false}
            variant="success"
            className="flex-1 py-3.5 text-sm font-extrabold rounded-2xl shadow-sm transition-transform hover:scale-[1.01] flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900"
          >
            <span>Complete Booking</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
        )}
      </div>
    </div>
  );
}

interface CustomerAddress {
  id?: string;
  uid?: string;
  user_id: string;
  label: string;
  address_line: string;
  city: string;
  barangay: string;
  is_default: boolean;
}

// ─── Profile Tab ────────────────────────────────────────────────────────────
function ProfileTab() {
  const { profile, refreshProfile } = useAuth();

  // ─── State Management ───
  const [addresses, setAddresses] = React.useState<CustomerAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<CustomerAddress | null>(null);
  const [addressData, setAddressData] = React.useState({
    label: '', address_line: '', city: '', barangay: '', is_default: false
  });
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [isEditingEmail, setIsEditingEmail] = React.useState(false);
  const [isEditingPassword, setIsEditingPassword] = React.useState(false);

  const [formData, setFormData] = React.useState({
    first_name: '', last_name: '', phone: '', city: '', barangay: ''
  });
  const [emailData, setEmailData] = React.useState('');
  const [passwordData, setPasswordData] = React.useState({ newPassword: '', confirmPassword: '' });

  // Avatar State
  const [avatarUrl, setAvatarUrl] = React.useState('');
  const [selectedAvatar, setSelectedAvatar] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { confirm: showAlert, ConfirmComponent } = useConfirm();

  const syncData = React.useCallback(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: (profile as any).phone || '',
        city: (profile as any).city || '',
        barangay: (profile as any).barangay || '',
      });
      setEmailData(profile.email || '');
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setAvatarUrl((profile as any).avatar_url || '');
      setSelectedAvatar(null);
    }
  }, [profile]);

  const fetchAddresses = React.useCallback(async () => {
    if (profile?.id) {
      try {
        const res = await api.get(`/api/addresses/customer/${profile.id}`);
        setAddresses(res.data || []);
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      }
    }
  }, [profile?.id]);

  React.useEffect(() => {
    syncData();
    fetchAddresses();
  }, [syncData, fetchAddresses]);

  if (!profile) return <EmptyState title="Profile not loaded" />;

  // ─── Handlers ───
  const cancelEdit = (section: 'profile' | 'email' | 'password' | 'avatar') => {
    if (section === 'avatar') {
      setAvatarUrl((profile as any).avatar_url || '');
      setSelectedAvatar(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      syncData();
      if (section === 'profile') setIsEditingProfile(false);
      if (section === 'email') setIsEditingEmail(false);
      if (section === 'password') setIsEditingPassword(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/api/customers/${profile?.id}`, formData);
      showAlert({ title: 'Notice', message: "Profile updated successfully!", type: 'info', hideCancel: true });
      setIsEditingProfile(false);
      await refreshProfile();
    } catch (err) {
      console.error("Failed to update profile", err);
      showAlert({ title: 'Notice', message: "Failed to update profile", type: 'info', hideCancel: true });
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    try {
      await updateEmail(auth.currentUser, emailData);
      await api.put(`/api/customers/${profile?.id}`, { email: emailData });
      showAlert({ title: 'Notice', message: "Email updated successfully!", type: 'info', hideCancel: true });
      setIsEditingEmail(false);
      await refreshProfile();
    } catch (err: any) {
      console.error("Failed to update email", err);
      showAlert({ title: 'Error', message: err.message || "Failed to update email. You may need to log out and log back in to verify your identity.", type: 'danger', hideCancel: true });
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert({ title: 'Notice', message: "Passwords do not match!", type: 'info', hideCancel: true });
      return;
    }
    try {
      await changePassword(passwordData.newPassword);
      showAlert({ title: 'Notice', message: "Password updated successfully!", type: 'info', hideCancel: true });
      setIsEditingPassword(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      console.error("Failed to update password", err);
      showAlert({ title: 'Error', message: err.message || "Failed to update password. You may need to log out and log back in to verify your identity.", type: 'danger', hideCancel: true });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);
      setSelectedAvatar(file);
    }
  };

  const handleSaveAvatar = async () => {
    if (!selectedAvatar) return;
    showAlert({
      title: 'Confirm Photo Upload',
      message: 'Are you sure you want to update your profile photo?',
      type: 'info',
      confirmText: 'Yes, Upload',
      onConfirm: () => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64data = reader.result;
            const res = await api.post('/api/upload/image', {
              image: base64data,
              folder: 'customer/avatar',
            });
            const url = res.data.url;
            await api.put(`/api/customers/${profile?.id}`, { avatar_url: url });
            showAlert({ title: 'Success', message: 'Avatar updated successfully!', type: 'success', hideCancel: true });
            setSelectedAvatar(null);
            await refreshProfile();
          } catch (err) {
            console.error("Failed to upload avatar", err);
            showAlert({ title: 'Error', message: 'Failed to upload avatar', type: 'danger', hideCancel: true });
          }
        };
        reader.readAsDataURL(selectedAvatar);
      }
    });
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;

    try {
      if (editingAddress) {
        const id = editingAddress.id || editingAddress.uid;
        await api.put(`/api/addresses/${id}`, {
          ...addressData,
          user_id: profile.id
        });
        if (addressData.is_default && !editingAddress.is_default) {
          await api.put(`/api/addresses/${id}/set-default`, {});
          refreshProfile();
        }
      } else {
        if (addresses.length >= 3) {
           showAlert({ title: 'Notice', message: "Maximum of 3 addresses allowed.", type: 'info', hideCancel: true });
           return;
        }
        await api.post(`/api/addresses`, {
          ...addressData,
          user_id: profile.id
        });
        refreshProfile();
      }
      setIsAddressModalOpen(false);
      fetchAddresses();
    } catch (err: any) {
      showAlert({ title: 'Error', message: err.response?.data?.message || "Failed to save address", type: 'danger', hideCancel: true });
    }
  };

  const handleDeleteAddress = async (id: string | undefined) => {
    if (!id) return;
    if (!window.confirm("Delete this address?")) return;
    try {
      await api.delete(`/api/addresses/${id}`);
      fetchAddresses();
      refreshProfile();
    } catch (err: any) {
      showAlert({ title: 'Error', message: err.response?.data?.message || "Failed to delete address", type: 'danger', hideCancel: true });
    }
  };

  const handleSetDefaultAddress = async (id: string | undefined) => {
    if (!id) return;
    try {
      await api.put(`/api/addresses/${id}/set-default`, {});
      fetchAddresses();
      refreshProfile();
    } catch (err: any) {
      showAlert({ title: 'Error', message: err.response?.data?.message || "Failed to set default address", type: 'danger', hideCancel: true });
    }
  };

  const openAddressModal = (address?: CustomerAddress) => {
    if (address) {
      setEditingAddress(address);
      setAddressData({
        label: address.label || '',
        address_line: address.address_line || '',
        city: address.city || '',
        barangay: address.barangay || '',
        is_default: address.is_default || false
      });
    } else {
      if (addresses.length >= 3) {
        showAlert({ title: 'Notice', message: "Maximum of 3 addresses allowed.", type: 'info', hideCancel: true });
        return;
      }
      setEditingAddress(null);
      setAddressData({
        label: '', address_line: '', city: '', barangay: '', is_default: addresses.length === 0
      });
    }
    setIsAddressModalOpen(true);
  };

  // ─── Uniform Styles ───
  const btnBase = "inline-flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto";
  const btnPrimary = `${btnBase} text-white bg-slate-900 hover:bg-slate-800 focus:ring-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100`;
  const btnSuccess = `${btnBase} text-white bg-brand-green hover:bg-[#005e3f] focus:ring-brand-green dark:bg-brand-green dark:hover:bg-[#005e3f]`;
  const btnGhost = `${btnBase} text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 focus:ring-slate-900 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700`;
  const inputClass = "w-full mt-1.5 px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:focus:border-white dark:focus:ring-white transition-all shadow-sm";

  const EditButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className={btnGhost}>
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
      Edit
    </button>
  );

  return (
    <div className="space-y-3 h-full flex flex-col">
      <AdminPageHeader
        title="My Profile"
        subtitle="Manage your personal information and account security settings."
        icon={<User />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch flex-1 pb-2">

        {/* ─── LEFT COLUMN ──────────────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          {/* Profile Photo Card */}
          <Card className="flex flex-col items-center justify-center text-center p-4">
            <div className="relative group mb-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-slate-400 dark:text-slate-500">
                    {profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}
                  </span>
                )}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-xs font-semibold">Change</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
              />
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white break-words w-full">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate w-full mb-3">
              {profile.email}
            </p>

            <div className="w-full flex flex-col gap-2">
              {!selectedAvatar ? (
                <button onClick={() => fileInputRef.current?.click()} className={`${btnGhost} w-full`}>
                  Upload Photo
                </button>
              ) : (
                <div className="flex gap-2 w-full">
                  <button onClick={() => cancelEdit('avatar')} className={`${btnGhost} flex-1`}>
                    Cancel
                  </button>
                  <button onClick={handleSaveAvatar} className={`${btnSuccess} flex-1`}>
                    Save
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Account Security Card */}
          <Card className="p-4 flex flex-col flex-1">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white mb-3">Account Security</h2>

            <div className="space-y-2.5">
              {/* Email Block */}
              {!isEditingEmail ? (
                <div className="flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Email Address</span>
                    <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{profile.email}</span>
                  </div>
                  <EditButton onClick={() => setIsEditingEmail(true)} />
                </div>
              ) : (
                <form onSubmit={handleSaveEmail} className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl animate-in fade-in duration-200">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">New Email Address</label>
                  <input type="email" value={emailData} onChange={(e) => setEmailData(e.target.value)} className={inputClass} autoFocus />
                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                     <button type="button" onClick={() => cancelEdit('email')} className={btnGhost}>Cancel</button>
                    <button type="submit" className={btnSuccess}>Save Changes</button>
                  </div>
                </form>
              )}

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Password Block */}
              {!isEditingPassword ? (
                <div className="flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex flex-col flex-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Password</span>
                    <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">••••••••••••</span>
                  </div>
                  <EditButton onClick={() => setIsEditingPassword(true)} />
                </div>
              ) : (
                <form onSubmit={handleSavePassword} className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">New Password</label>
                      <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className={inputClass} autoFocus />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Confirm Password</label>
                      <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className={inputClass} />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                    <button type="button" onClick={() => cancelEdit('password')} className={btnGhost}>Cancel</button>
                    <button type="submit" className={btnSuccess}>Save Changes</button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>

        {/* ─── RIGHT COLUMN ──────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          
          {/* General Information Card */}
          <Card className="flex flex-col p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">General Information</h2>
              {!isEditingProfile && <EditButton onClick={() => setIsEditingProfile(true)} />}
            </div>

            {!isEditingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 animate-in fade-in duration-200">
                {[
                  ['First Name', profile.first_name], ['Last Name', profile.last_name],
                  ['Phone', (profile as any).phone || '—'], ['City', (profile as any).city || '—'],
                  ['Barangay', (profile as any).barangay || '—'],
                ].map(([label, val]) => (
                  <div key={label as string} className={`flex flex-col py-1 ${label === 'Barangay' ? 'sm:col-span-2' : ''}`}>
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white break-words">{val as string}</p>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-3 animate-in fade-in duration-200 bg-slate-50 p-4 rounded-xl border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">First Name</label>
                    <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className={inputClass} autoFocus />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Last Name</label>
                    <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">City</label>
                    <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Barangay</label>
                    <input type="text" value={formData.barangay} onChange={(e) => setFormData({ ...formData, barangay: e.target.value })} className={inputClass} />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                  <button type="button" onClick={() => cancelEdit('profile')} className={btnGhost}>Cancel</button>
                  <button type="submit" className={btnSuccess}>Save Changes</button>
                </div>
              </form>
            )}
          </Card>

          {/* Saved Addresses / Address Book */}
          <Card className="flex flex-col p-4 flex-1 relative">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">Saved Addresses</h2>
              {addresses.length < 3 && (
                <button onClick={() => openAddressModal()} className={btnGhost}>
                  <Plus className="w-4 h-4 shrink-0" />
                  Add New Address
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <MapPin className="w-8 h-8 mb-2 text-slate-400 dark:text-slate-500 opacity-50" />
                  <p className="text-sm font-medium text-slate-900 dark:text-white">No addresses saved yet.</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Add a default location for faster booking.</p>
                </div>
              ) : (
                addresses.map((addr, idx) => (
                  <div key={addr.id || addr.uid || idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-shadow hover:shadow-sm group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">{addr.label}</span>
                            {addr.is_default && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-green/10 text-brand-green uppercase tracking-wider">Default</span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {addr.address_line}<br />
                            {addr.barangay && `${addr.barangay}, `}{addr.city}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        {!addr.is_default && (
                          <button onClick={() => handleSetDefaultAddress(addr.id || addr.uid)} className="text-slate-400 hover:text-brand-green transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Set as Default">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => openAddressModal(addr)} className="text-slate-400 hover:text-brand-green transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteAddress(addr.id || addr.uid)} className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

        </div>
      </div>

      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="p-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Label (e.g. Home, Work)</label>
                <input required type="text" value={addressData.label} onChange={(e) => setAddressData({...addressData, label: e.target.value})} className={inputClass} autoFocus />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Address Line (Street, Unit, Bldg)</label>
                <input required type="text" value={addressData.address_line} onChange={(e) => setAddressData({...addressData, address_line: e.target.value})} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Barangay</label>
                  <input required type="text" value={addressData.barangay} onChange={(e) => setAddressData({...addressData, barangay: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">City</label>
                  <input required type="text" value={addressData.city} onChange={(e) => setAddressData({...addressData, city: e.target.value})} className={inputClass} />
                </div>
              </div>
              {!addressData.is_default && (
                <div className="flex items-center gap-2 pt-2 cursor-pointer" onClick={() => setAddressData({...addressData, is_default: !addressData.is_default})}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${addressData.is_default ? 'bg-brand-green border-brand-green' : 'border-slate-300 dark:border-slate-600'}`}>
                    {addressData.is_default && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Set as default address</span>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddressModalOpen(false)} className={`${btnGhost} flex-1`}>Cancel</button>
                <button type="submit" className={`${btnSuccess} flex-1`}>Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmComponent />
    </div>
  );
}

// ─── Vouchers Tab ────────────────────────────────────────────────────────────
function VouchersTab() {
  const { profile } = useAuth();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'unused' | 'used' | 'expired'>('unused');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    const fetchVouchers = async () => {
      try {
        setError(null);
        const res = await api.get(`/api/vouchers/customer/${profile.id}`);
        const fetched = res.data || [];
        // Filter out temp_deleted vouchers (belt-and-suspenders; backend already filters)
        const active = fetched.filter((v: any) => v.temp_delete !== 1);
        setVouchers(active);
      } catch (err: any) {
        console.error('[CAVEMAN] Error fetching vouchers:', err);
        setError('Failed to fetch vouchers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchVouchers();

    // Poll every 15 seconds for near-realtime updates
    const interval = setInterval(fetchVouchers, 15000);
    return () => clearInterval(interval);
  }, [profile]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredVouchers = vouchers.filter(v => v.status === filter);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="My Vouchers"
        subtitle="View and manage all your discount vouchers assigned by AllFix administrators."
        icon={<Ticket />}
        action={
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 self-stretch sm:self-auto">
            {(['unused', 'used', 'expired'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all duration-200 ${
                  filter === status
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-600'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                {status === 'unused' ? 'Active' : status === 'used' ? 'Redeemed' : 'Expired'}
              </button>
            ))}
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-navy dark:border-brand-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No vouchers available.</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            {filter === 'unused'
              ? "You don't have any active discount vouchers right now. Keep booking services for a chance to receive special promos!"
              : filter === 'used'
                ? "You haven't used any vouchers yet."
                : "You don't have any expired vouchers."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVouchers.map((v) => {
            const isUnused = v.status === 'unused';
            const isExpired = v.status === 'expired';
            return (
              <div
                key={v.id}
                className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${isUnused
                  ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:shadow-md text-slate-900 dark:text-white shadow-sm'
                  : isExpired
                    ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/50 text-slate-400 dark:text-slate-500 opacity-60'
                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 opacity-75'
                  }`}
              >
                {/* Left & Right punch holes for the "ticket" look */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 -translate-y-1/2 z-10"></div>
                <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-surface-light dark:bg-surface-dark border-l border-slate-200 dark:border-slate-800 -translate-y-1/2 z-10"></div>

                <div className="p-6 flex flex-col justify-between h-full min-h-[180px]">
                  <div>
                    {/* Header: Badge & Status */}
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${isUnused
                        ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        : isExpired
                          ? 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50'
                          : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}>
                        {isUnused ? 'Available' : isExpired ? 'Expired' : 'Redeemed'}
                      </span>
                      {isUnused && (
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Available
                        </span>
                      )}
                    </div>

                    {/* Discount Value */}
                    <h3 className={`text-3xl font-black ${isUnused ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                      {v.discount_type === 'percentage' ? `${v.discount_value}%` : `₱${v.discount_value}`} OFF
                    </h3>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
                      Applicable for any service booking in checkout.
                    </p>
                  </div>

                  {/* Dashed Separator Line */}
                  <div className="border-t-2 border-dashed border-slate-250/20 dark:border-slate-800/60 my-5 relative"></div>

                  {/* Footer: Voucher Code Copy Button */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Voucher Code</p>
                      <p className={`font-mono font-black text-base tracking-wider truncate mt-0.5 ${isUnused ? 'text-slate-900 dark:text-white' : 'text-slate-450 line-through'
                        }`}>
                        {v.code}
                      </p>
                    </div>

                    {isUnused && (
                      <button
                        onClick={() => handleCopy(v.code)}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 transition-colors shadow-sm flex items-center gap-1"
                      >
                        {copiedCode === v.code ? 'Copied!' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RefundsTab() {
  const { profile } = useAuth();
  const [refunds, setRefunds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'Processed' | 'pending' | 'rejected'>('all');
  const [selectedRefund, setSelectedRefund] = useState<any | null>(null);

  const fetchRefunds = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const res = await api.get(`/api/refunds/customer/${profile.id}`);
      setRefunds(res.data || []);
    } catch (err: any) {
      console.error('[CAVEMAN] Error fetching refunds:', err);
      setError('Failed to load refund transactions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
    // Poll every 15 seconds for updates
    const interval = setInterval(fetchRefunds, 15000);
    return () => clearInterval(interval);
  }, [profile]);

  const filteredRefunds = refunds.filter(r => {
    if (filter === 'all') return true;
    return r.status?.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Refund Center"
        subtitle="Track the status of your cancellations and automatic GCash refund transactions."
        icon={<RefreshCcw />}
        action={
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 self-stretch sm:self-auto">
            {(['all', 'Processed', 'pending', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 capitalize ${filter === status
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
              >
                {status === 'all' ? 'All Transactions' : status === 'Processed' ? 'Completed' : status}
              </button>
            ))}
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-brand-navy dark:border-brand-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredRefunds.length === 0 ? (
        <Card className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4">
            <RefreshCcw className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">No refund records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            {filter === 'all'
              ? "You don't have any refund transactions yet."
              : `You don't have any ${filter} refunds right now.`}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRefunds.map((r) => {
            const isProcessed = r.status?.toLowerCase() === 'processed';
            const isPending = r.status?.toLowerCase() === 'pending';
            const isRejected = r.status?.toLowerCase() === 'rejected';

            // Format date helper
            let dateStr = '—';
            if (r.processed_at) {
              try {
                const date = r.processed_at.seconds
                  ? new Date(r.processed_at.seconds * 1000)
                  : new Date(r.processed_at);
                dateStr = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              } catch (e) {
                console.error(e);
              }
            } else if (r.created_at) {
              try {
                const date = r.created_at.seconds
                  ? new Date(r.created_at.seconds * 1000)
                  : new Date(r.created_at);
                dateStr = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
              } catch (e) { }
            }

            return (
              <div
                key={r.id}
                onClick={() => setSelectedRefund(r)}
                className="group p-5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer relative overflow-hidden"
              >

                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${isProcessed
                      ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      : isPending
                        ? 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                      }`}>
                      {isProcessed ? 'Completed' : r.status || 'Pending'}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{dateStr}</span>
                  </div>

                  {/* Refund Amount */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Refund Amount</p>
                    <h3 className="text-2xl font-black text-slate-955 dark:text-white mt-0.5">
                      ₱{Number(r.refund_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                  </div>

                  {/* Additional details */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Refund Method</p>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                        {r.refund_method || r.payment_method || 'GCash'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">GCash Ref No.</p>
                      <p className="text-xs font-mono font-bold text-slate-850 dark:text-slate-200 truncate mt-0.5">
                        {r.reference_number || r.payment_reference || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-slate-700 dark:text-slate-300 transition-colors duration-300">
                  <span className="text-xs font-semibold">View Transaction Details</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice / Transaction Details Modal */}
      {selectedRefund && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 max-w-lg w-full relative space-y-6"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedRefund(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 dark:text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Invoice Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-brand-navy/5 text-brand-navy dark:text-brand-green rounded-full flex items-center justify-center mx-auto">
                <Receipt className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Transaction Invoice</h3>
              <p className="text-xs text-slate-450 dark:text-slate-500">Refund reference document and transaction details</p>
            </div>

            {/* Invoice Breakdown */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800/80 space-y-3.5">
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-150/40 dark:border-slate-800/40">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Refund Transaction ID</span>
                <span className="font-mono font-bold text-slate-850 dark:text-slate-250"><code>{selectedRefund.id}</code></span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-150/40 dark:border-slate-800/40">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Booking ID Link</span>
                <span className="font-mono font-bold text-slate-850 dark:text-slate-250"><code>{selectedRefund.booking_id || '—'}</code></span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-150/40 dark:border-slate-800/40">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Payment Channel</span>
                <span className="font-bold text-slate-850 dark:text-slate-250">{selectedRefund.refund_method || selectedRefund.payment_method || 'GCash'}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-150/40 dark:border-slate-800/40">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Receiver Mobile No.</span>
                <span className="font-bold text-slate-850 dark:text-slate-250">{selectedRefund.receiver_gcash_number || selectedRefund.account_number || '—'}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5 border-b border-slate-150/40 dark:border-slate-800/40">
                <span className="font-bold text-slate-400 uppercase tracking-wider">GCash Reference No.</span>
                <span className="font-mono font-black text-brand-navy dark:text-brand-green">{selectedRefund.reference_number || selectedRefund.payment_reference || '—'}</span>
              </div>
              <div className="flex justify-between items-start text-xs py-1.5 border-b border-slate-150/40 dark:border-slate-800/40">
                <span className="font-bold text-slate-400 uppercase tracking-wider mt-0.5">Cancellation Reason</span>
                <span className="font-semibold text-slate-850 dark:text-slate-250 text-right max-w-[200px] leading-relaxed">{selectedRefund.reason || 'Customer-initiated cancellation'}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1.5">
                <span className="font-bold text-slate-400 uppercase tracking-wider">Processing Status</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${selectedRefund.status?.toLowerCase() === 'processed'
                  ? 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  : selectedRefund.status?.toLowerCase() === 'pending'
                    ? 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}>
                  {selectedRefund.status?.toLowerCase() === 'processed' ? 'Completed' : selectedRefund.status || 'Pending'}
                </span>
              </div>
            </div>

            {/* Total Amount Block */}
            <div className="flex justify-between items-center px-4 py-3 bg-brand-navy text-white dark:bg-slate-950 dark:border dark:border-slate-800 rounded-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-white/70">Total Amount Refunded</span>
              <span className="text-xl font-black text-brand-green">
                ₱{Number(selectedRefund.refund_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Action buttons */}
            <button
              onClick={() => setSelectedRefund(null)}
              className="w-full py-3.5 text-sm font-black rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors"
            >
              Close Invoice
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  onSuccess: (bookings: any[]) => void;
}

function CheckoutModal({ isOpen, onClose, cart, onSuccess }: CheckoutModalProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState(2); // Step 1 is cart, checkout modal starts at step 2 (Address)
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false); // Mobile-friendly accordion!

  // Address Form States
  const [unitNo, setUnitNo] = useState('');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Payment Selection States
  const [methods, setMethods] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('GCash');

  // Load payment methods from backend
  useEffect(() => {
    if (isOpen) {
      const fetchMethods = async () => {
        const defaultMethod = {
          id: 'default-gcash',
          paymentMethod: 'GCash',
          accountName: 'ALLFIX.PH',
          accountNumber: '0917-123-4567',
          qrImageUrl: '/images/sample-gcash-qr.png'
        };
        try {
          const res = await api.get('/api/payments/methods');
          const data = res.data || [];
          if (data.length > 0) {
            setMethods(data);
            setPaymentMethod(data[0].paymentMethod);
          } else {
            setMethods([defaultMethod]);
            setPaymentMethod(defaultMethod.paymentMethod);
          }
        } catch (err) {
          console.error('[CAVEMAN] Failed to load payment methods', err);
          setMethods([defaultMethod]);
          setPaymentMethod(defaultMethod.paymentMethod);
        }
      };
      fetchMethods();
    }
  }, [isOpen]);

  // Payment Details Form States
  const [referenceNumber, setReferenceNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [voucherCode, setVoucherCode] = useState('');

  // Voucher States
  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedVoucherId, setAppliedVoucherId] = useState('');
  const [voucherValidationMsg, setVoucherValidationMsg] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' });
  const [voucherValidating, setVoucherValidating] = useState(false);

  // Calculate Cart Subtotals
  const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);
  const finalAmount = Math.max(0, totalAmount - appliedDiscount);

  // Fetch available vouchers for this customer (for quick-select pills)
  useEffect(() => {
    if (isOpen && profile?.id) {
      const fetchCheckoutVouchers = async () => {
        try {
          const res = await api.get(`/api/vouchers/customer/${profile.id}`);
          const fetched = res.data || [];
          // Only show unused, non-deleted vouchers for checkout
          const active = fetched.filter((v: any) => v.status === 'unused' && v.temp_delete !== 1);
          setAvailableVouchers(active);
        } catch (err: any) {
          console.error('[CAVEMAN] Failed to load customer vouchers for checkout', err);
        }
      };
      fetchCheckoutVouchers();
    }
  }, [isOpen, profile]);

  // [CAVEMAN] Validate voucher code via backend /api/vouchers/validate with debounce
  useEffect(() => {
    if (!voucherCode.trim()) {
      console.log('[CAVEMAN] Voucher code cleared, resetting validation state.');
      setAppliedDiscount(0);
      setAppliedVoucherId('');
      setVoucherValidationMsg({ type: '', message: '' });
      setVoucherValidating(false);
      return;
    }

    if (!profile?.id) {
      console.log('[CAVEMAN] No profile ID available, skipping voucher validation.');
      return;
    }

    setVoucherValidating(true);
    console.log(`[CAVEMAN] Voucher validation debounce started for code='${voucherCode.trim()}'`);

    const debounceTimer = setTimeout(async () => {
      const trimmedCode = voucherCode.trim();
      console.log(`[CAVEMAN] Calling /api/vouchers/validate?code=${trimmedCode}&customerId=${profile.id}`);

      try {
        const res = await api.get('/api/vouchers/validate', {
          params: { code: trimmedCode, customerId: profile.id }
        });
        const data = res.data;
        console.log('[CAVEMAN] Voucher validate response:', JSON.stringify(data));

        if (data.valid) {
          // Voucher is valid and assigned to this customer
          let discount = 0;
          if (data.discount_type === 'percentage') {
            discount = (totalAmount * Number(data.discount_value)) / 100;
          } else {
            discount = Number(data.discount_value);
          }
          setAppliedDiscount(discount);
          setAppliedVoucherId(data.voucher_id);
          setVoucherValidationMsg({ type: 'success', message: data.message || 'Voucher applied successfully!' });
          console.log(`[CAVEMAN] Voucher VALID: discount=${discount}, voucherId=${data.voucher_id}`);
        } else {
          // Voucher validation failed (code not found, customer mismatch, already used)
          setAppliedDiscount(0);
          setAppliedVoucherId('');
          setVoucherValidationMsg({ type: 'error', message: data.message || 'Invalid voucher code.' });
          console.log(`[CAVEMAN] Voucher INVALID: message='${data.message}'`);
        }
      } catch (err: any) {
        console.error('[CAVEMAN] Voucher validation API error:', err);
        setAppliedDiscount(0);
        setAppliedVoucherId('');
        setVoucherValidationMsg({ type: 'error', message: 'Failed to validate voucher. Please try again.' });
      } finally {
        setVoucherValidating(false);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(debounceTimer);
      setVoucherValidating(false);
    };
  }, [voucherCode, profile?.id, totalAmount]);

  // Prefill Address from Profile if available
  useEffect(() => {
    if (isOpen && profile) {
      console.log("[CAVEMAN] Prefilling address from profile:", profile);
      setCity((profile as any).city || '');
      setBarangay((profile as any).barangay || '');
      if ((profile as any).street) setStreet((profile as any).street);
      setUnitNo((profile as any).unit_house_no || '');
      setPostalCode((profile as any).postal_code || '');
    }
  }, [isOpen, profile]);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 2) {
      if (!unitNo.trim() || !street.trim() || !barangay.trim() || !city.trim()) {
        alert("Please complete all required address fields.");
        return;
      }
      console.log(`[CAVEMAN] Address Step complete. Data:`, { unitNo, street, barangay, city, postalCode });
      setStep(3);
    }
  };

  const handlePaymentMethodNext = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`[CAVEMAN] Payment selection complete: ${paymentMethod}`);
    setStep(4);
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referenceNumber.trim()) {
      alert("Please provide the reference number to complete your transaction.");
      return;
    }
    if (!accountName.trim()) {
      alert("Please provide the account name to complete your transaction.");
      return;
    }
    if (!accountNumber.trim()) {
      alert("Please provide the account number to complete your transaction.");
      return;
    }
    console.log(`[CAVEMAN] Step 4 Payment Details complete. Reference: ${referenceNumber}, Account Name: ${accountName}, Account Number: ${accountNumber}, Voucher: ${voucherCode}`);
    setShowConfirmation(true);
  };

  const handleFinalizeBooking = async () => {
    console.log("[CAVEMAN] Finalizing checkout. Creating bookings...");
    setLoading(true);
    try {
      const addressParts = [
        unitNo.trim(),
        street.trim(),
        `Brgy. ${barangay.trim()}`,
        city.trim()
      ];
      if (postalCode.trim()) {
        addressParts.push(postalCode.trim());
      }
      const fullAddress = addressParts.join(', ');
      console.log("[CAVEMAN] Constructed fullAddress:", fullAddress);

      const bookingsCreated = [];

      // Distribute voucher discount proportionally across cart items
      const hasDiscount = appliedDiscount > 0 && appliedVoucherId;
      for (const item of cart) {
        let itemDiscount = 0;
        if (hasDiscount) {
          // Proportional share: (item.total / totalAmount) * appliedDiscount
          itemDiscount = totalAmount > 0 ? Math.round(((item.total / totalAmount) * appliedDiscount) * 100) / 100 : 0;
        }
        const discountedTotal = Math.max(0, item.total - itemDiscount);

        const bookingData: any = {
          customer_id: profile?.id || 'guest',
          customer_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Customer',
          vendor_id: item.vendorId,
          vendor_name: item.vendorName,
          service_type: item.workType || item.subServiceName,
          sub_service: item.subServiceName,
          description: item.description || null,
          scheduled_date: item.scheduledDate,
          scheduled_time: item.scheduledTime,
          price: item.price,
          quantity: item.quantity,
          total_price: hasDiscount ? discountedTotal : item.total,
          address: fullAddress,
          service_address: fullAddress,
          unit_house_no: unitNo,
          postal_code: postalCode,
          payment_method: paymentMethod,
          payment_reference: referenceNumber,
          account_name: accountName.trim(),
          account_number: accountNumber.trim(),
          voucher_code: voucherCode || null,
          slot_id: item.slotId || null
        };

        // Attach discount metadata if voucher was applied
        if (hasDiscount) {
          bookingData.original_price = item.total;
          bookingData.discount_amount = itemDiscount;
          bookingData.voucher_id = appliedVoucherId;
        }

        console.log("[CAVEMAN] Sending booking request to backend:", bookingData);
        const res = await api.post('/api/bookings', bookingData);
        bookingsCreated.push({
          id: res.data?.id,
          ...bookingData
        });
      }

      if (appliedVoucherId) {
        console.log(`[CAVEMAN] Redeeming voucher ID: ${appliedVoucherId}`);
        await api.patch(`/api/vouchers/${appliedVoucherId}/use`);
      }

      console.log(`[CAVEMAN] Booking creation successful! Total bookings created: ${bookingsCreated.length}`);
      onSuccess(bookingsCreated);
      onClose();
    } catch (err: any) {
      console.error('[CAVEMAN] Failed to finalize bookings:', err);
      alert(err.response?.data?.message || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
      setShowConfirmation(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Box */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl w-full max-w-6xl max-h-[96vh] sm:max-h-[90vh] overflow-y-auto z-10 flex flex-col pt-3 sm:pt-4 md:pt-5 pb-4 sm:pb-6 md:pb-8 px-4 sm:px-6 md:px-8"
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">Complete Booking</h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-bold">Multi-step Booking Checkout</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-base"
          >
            ✕
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2.5 sm:gap-4 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800/80 mb-5 text-[10px] sm:text-xs md:text-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 sm:w-7 h-7 rounded-full bg-brand-green/20 text-brand-green font-bold flex items-center justify-center text-xs">✓</span>
            <span className="font-extrabold text-slate-400">Cart</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 text-xs hidden sm:inline">➔</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 sm:w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${step >= 2 ? 'bg-brand-navy text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>2</span>
            <span className={`font-extrabold ${step >= 2 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>Address</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 text-xs hidden sm:inline">➔</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 sm:w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${step >= 3 ? 'bg-brand-navy text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>3</span>
            <span className={`font-extrabold ${step >= 3 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>Payment</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700 text-xs hidden sm:inline">➔</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-6 h-6 sm:w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${step >= 4 ? 'bg-brand-navy text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>4</span>
            <span className={`font-extrabold ${step >= 4 ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>Details</span>
          </div>
        </div>

        {/* 2-Column Split Rectangular Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch flex-grow min-h-0">
          {/* Left Column: Order Summary (1/3 scale, compact & collapsible on mobile) */}
          <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/30 p-4 sm:p-5 rounded-2xl border border-slate-150 dark:border-slate-800/80 flex flex-col justify-between h-auto lg:h-full transition-all duration-300">
            <div>
              {/* Mobile Collapsible Header */}
              <div
                onClick={() => setSummaryExpanded(!summaryExpanded)}
                className="lg:hidden flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer shadow-sm"
              >
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  📋 Show Booking Summary ({cart.length})
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-brand-green">
                    {appliedDiscount > 0 ? (
                      <span className="flex items-center gap-1">
                        <span className="line-through text-slate-400 text-[10px]">₱{totalAmount}</span>
                        <span>₱{finalAmount}</span>
                      </span>
                    ) : (
                      `₱${totalAmount}`
                    )}
                  </span>
                  <span className="text-slate-455 text-[10px] transition-transform duration-300">{summaryExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Desktop Header */}
              <h4 className="hidden lg:block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">Booking Summary</h4>

              {/* Item List (Collapsible on Mobile, always visible on Desktop) */}
              <div className={`${summaryExpanded ? 'block' : 'hidden lg:block'} mt-3 lg:mt-0 space-y-3 max-h-[160px] lg:max-h-[320px] overflow-y-auto pr-1`}>
                {cart.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/80 rounded-xl flex justify-between gap-3 shadow-sm">
                    <div className="min-w-0 flex-grow">
                      <p className="font-black text-xs md:text-sm text-slate-950 dark:text-white truncate">{item.workType}</p>
                      <p className="text-[11px] md:text-xs text-slate-455 dark:text-slate-400 font-semibold truncate mt-0.5">{item.subServiceName}</p>
                      {item.description && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-300 italic truncate mt-0.5">
                          "{item.description}"
                        </p>
                      )}
                      <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">Provider: {item.vendorName}</p>
                      <div className="flex gap-2 text-[10px] text-slate-500 dark:text-slate-450 mt-1.5 font-semibold">
                        <span>📅 {item.scheduledDate}</span>
                        <span>•</span>
                        <span>⏰ {item.scheduledTime}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col justify-between">
                      <p className="font-black text-xs md:text-sm text-brand-green">₱{item.total}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Section (Visible on Desktop) */}
            <div className="hidden lg:block pt-4 mt-4 border-t border-slate-200 dark:border-slate-700/80">
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm font-bold text-slate-455 uppercase tracking-widest">Total Amount</span>
                <span className="text-xl font-black text-brand-green">
                  {appliedDiscount > 0 ? (
                    <span className="flex items-center gap-2">
                      <span className="line-through text-slate-400 text-sm">₱{totalAmount}</span>
                      <span>₱{finalAmount}</span>
                    </span>
                  ) : (
                    `₱${totalAmount}`
                  )}
                </span>
              </div>
            </div>

            {/* Address Review (Visible on Desktop when step >= 3) */}
            {step >= 3 && (
              <div className="hidden lg:block pt-4 mt-4 border-t border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Service Location</p>
                <div className="text-slate-700 dark:text-slate-350 bg-white/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 leading-relaxed">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {unitNo}
                  </p>
                  <p>
                    {street}, Brgy. {barangay}
                  </p>
                  <p>
                    {city}
                  </p>
                  {postalCode && (
                    <p className="text-[11px] text-slate-400 font-medium mt-1">
                      Postal Code: {postalCode}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Step Wizard Forms (2/3 scale) */}
          <div className="lg:col-span-8 flex flex-col justify-between min-h-[360px] lg:min-h-[400px]">
            {/* Step 2 Address Wizard Form */}
            {step === 2 && (
              <form onSubmit={handleNextStep} className="flex flex-col justify-between h-full">
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-2.5 mb-1 sm:mb-2">
                    <MapPin className="w-5 h-5 text-brand-navy" />
                    <h4 className="font-black text-base md:text-lg text-slate-900 dark:text-white">Step 2: Service Location</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Unit / House No. / Building *</label>
                      <input
                        type="text"
                        value={unitNo}
                        onChange={(e) => setUnitNo(e.target.value)}
                        placeholder="e.g. Unit 5B, Building A"
                        required
                        className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Street Address *</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Street name & number"
                        required
                        className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Barangay *</label>
                      <input
                        type="text"
                        value={barangay}
                        onChange={(e) => setBarangay(e.target.value)}
                        placeholder="Barangay / District"
                        required
                        className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">City / Municipality *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        required
                        className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Postal Code / ZIP (Optional)</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="e.g. 1000"
                        className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 2 Navigation Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3 sm:gap-4 mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="py-2.5 sm:py-3 px-5 sm:px-6 text-xs sm:text-sm font-extrabold rounded-2xl bg-brand-navy hover:bg-[#0a2d5c] text-white shadow-lg flex items-center gap-1.5 transition-transform hover:scale-[1.01]"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3 Wizard Form */}
            {/* Step 3 Wizard Form */}
            {step === 3 && (() => {
              const selectedMethodObj = methods.find(m => m.paymentMethod === paymentMethod);
              return (
                <form onSubmit={handlePaymentMethodNext} className="flex flex-col justify-between h-full">
                  <div className="space-y-3.5 sm:space-y-4">
                    <div className="flex items-center gap-2.5 mb-1">
                      <CreditCard className="w-5 h-5 text-brand-navy" />
                      <h4 className="font-black text-base md:text-lg text-slate-900 dark:text-white">Step 3: Payment Method</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center">
                      {/* Left Column: payment method options */}
                      <div className="sm:col-span-4 space-y-2.5 sm:space-y-3.5">
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-455 uppercase tracking-widest">Select Gateway</p>

                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {methods.map((m) => {
                            const isSelected = paymentMethod === m.paymentMethod;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setPaymentMethod(m.paymentMethod)}
                                className={`w-full p-2.5 rounded-2xl border transition-all flex items-center gap-3 text-left font-bold ${isSelected
                                  ? 'border-brand-navy bg-brand-navy/5 dark:bg-brand-navy/20 text-brand-navy dark:text-blue-400 border-2 shadow-sm'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800'
                                  }`}
                              >
                                <div className="flex-1">
                                  <p className="text-[11px] sm:text-xs font-extrabold">{m.paymentMethod}</p>
                                </div>
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-brand-navy dark:border-blue-400' : 'border-slate-300 dark:border-slate-600'
                                  }`}>
                                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-brand-navy dark:bg-blue-400" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Column: QR & Details Display Box */}
                      <div className="sm:col-span-8 bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-6 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col items-center gap-3 text-center min-h-[280px] justify-center">
                        {selectedMethodObj ? (
                          <>
                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-455 uppercase tracking-widest">
                              Send Payment to:
                            </p>

                            {/* Account details */}
                            <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl space-y-2 text-left shadow-sm">
                              <div className="flex justify-between text-[10px] sm:text-[11px]">
                                <span className="text-slate-400 font-semibold">Account Name:</span>
                                <span className="font-extrabold text-slate-900 dark:text-white">{selectedMethodObj.accountName}</span>
                              </div>
                              <div className="flex justify-between text-[10px] sm:text-[11px] items-center">
                                <span className="text-slate-400 font-semibold">Account Number:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                  {selectedMethodObj.accountNumber}
                                </span>
                              </div>
                            </div>

                            {/* QR Image Display */}
                            {selectedMethodObj.qrImageUrl ? (
                              <div className="flex flex-col items-center gap-2 mt-2">
                                <p className="text-[9px] sm:text-[10px] font-bold text-slate-455 uppercase tracking-widest">Scan QR Code to Pay</p>
                                <div className="bg-white p-2.5 rounded-2xl shadow-md border border-slate-200/40">
                                  <img
                                    src={selectedMethodObj.qrImageUrl}
                                    alt={`${selectedMethodObj.paymentMethod} QR Code`}
                                    className="w-48 h-48 xs:w-56 xs:h-56 sm:w-64 sm:h-64 object-contain transition-all"
                                  />
                                </div>
                                <p className="text-[10px] text-slate-550 leading-normal font-semibold">
                                  Scan or save QR code with your app.
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 dark:border-slate-700/80 rounded-2xl w-full text-slate-400 mt-2 text-xs font-semibold italic">
                                No QR Code provided. Please use the account details above.
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-slate-400 font-semibold italic">Select a payment gateway to view details</p>
                        )}
                      </div>
                    </div>

                    {/* Cancellation Warning Notice */}
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-2.5 flex items-start gap-2 text-amber-800 dark:text-amber-300">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                      <p className="text-[10px] sm:text-xs font-semibold leading-normal text-left">
                        “Cancellations are subject to a deduction fee.”
                      </p>
                    </div>
                  </div>

                  {/* Step 3 Navigation Buttons */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between gap-3 sm:gap-4 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        console.log("[CAVEMAN] Back to Step 2");
                        setStep(2);
                      }}
                      className="py-2.5 sm:py-3 px-4 sm:px-5 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <Button
                      type="submit"
                      variant="primary"
                      className="py-2.5 sm:py-3 px-5 sm:px-6 text-xs sm:text-sm font-extrabold rounded-2xl bg-brand-navy hover:bg-[#0a2d5c] text-white shadow-lg flex items-center gap-1.5 transition-transform hover:scale-[1.01]"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              );
            })()}

            {/* Step 4 Details Form */}
            {step === 4 && (
              <form onSubmit={handleDetailsSubmit} className="flex flex-col justify-between h-full">
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-2.5 mb-1 sm:mb-2">
                    <User className="w-5 h-5 text-brand-navy" />
                    <h4 className="font-black text-base md:text-lg text-slate-900 dark:text-white">Step 4: Reference & Summary</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Row: Amount Paid and Reference Number */}
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Amount Paid (PHP)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-455 text-xs sm:text-sm font-black">₱</span>
                        <input
                          type="text"
                          value={finalAmount}
                          disabled
                          placeholder="Amount Paid (PHP)"
                          className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-slate-55 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm font-black focus:outline-none cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Reference Number</label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="Reference Number"
                        required
                        className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                      />
                    </div>

                    {/* Second Row: Account Name and Account Number */}
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Account Name</label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="Enter account holder's name"
                        required
                        className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Account Number</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Enter account number"
                        required
                        className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400"
                      />
                    </div>

                    {/* Third Row: Voucher Code (spanning full width) */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Voucher Code (Optional)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          placeholder="Enter voucher code"
                          className={`w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 placeholder:text-slate-400 ${voucherValidationMsg.type === 'success'
                            ? 'border-brand-green focus:ring-brand-green'
                            : voucherValidationMsg.type === 'error'
                              ? 'border-brand-red focus:ring-brand-red'
                              : 'border-slate-200 dark:border-slate-700 focus:ring-brand-navy'
                            }`}
                        />
                        {voucherValidating && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-slate-300 border-t-brand-navy rounded-full animate-spin" />
                          </div>
                        )}
                        {!voucherValidating && voucherValidationMsg.type === 'success' && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <CheckCircle2 className="w-4 h-4 text-brand-green" />
                          </div>
                        )}
                        {!voucherValidating && voucherValidationMsg.type === 'error' && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <AlertCircle className="w-4 h-4 text-brand-red" />
                          </div>
                        )}
                      </div>
                      {/* [CAVEMAN] Voucher validation message display */}
                      {voucherValidationMsg.message && !voucherValidating && (
                        <p className={`text-xs font-semibold mt-1.5 ${voucherValidationMsg.type === 'success' ? 'text-brand-green' : 'text-brand-red'
                          }`}>
                          {voucherValidationMsg.message}
                          {voucherValidationMsg.type === 'success' && appliedDiscount > 0 && (
                            <span className="ml-1 font-black">(-₱{appliedDiscount.toFixed(2)} discount)</span>
                          )}
                        </p>
                      )}
                      {voucherValidating && (
                        <p className="text-xs text-slate-400 mt-1.5 font-medium">Validating voucher code...</p>
                      )}
                      {availableVouchers.length > 0 && (
                        <div className="space-y-1.5 p-3 rounded-2xl bg-brand-navy/5 dark:bg-brand-navy/20 border border-brand-navy/10 mt-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-brand-navy dark:text-brand-green">Your Available Vouchers</p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {availableVouchers.map(v => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  setVoucherCode(v.code);
                                }}
                                className={`text-[10px] px-2.5 py-1 rounded-xl font-bold border transition-all ${voucherCode.toUpperCase().trim() === v.code.toUpperCase()
                                  ? 'bg-brand-green text-slate-900 border-brand-green'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm'
                                  }`}
                              >
                                {v.code} ({v.discount_type === 'percentage' ? `${v.discount_value}%` : `₱${v.discount_value}`} Off)
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cancellation Warning Notice */}
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-2.5 flex items-start gap-2 text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                    <p className="text-[10px] sm:text-xs font-semibold leading-normal text-left">
                      “Cancellations are subject to a deduction fee.”
                    </p>
                  </div>
                </div>

                {/* Step 4 Navigation Buttons */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between gap-3 sm:gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      console.log("[CAVEMAN] Back to Step 3");
                      setStep(3);
                    }}
                    className="py-2.5 sm:py-3 px-4 sm:px-5 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <Button
                    type="submit"
                    variant="success"
                    className="py-2.5 sm:py-3 px-6 sm:px-7 text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg transition-transform hover:scale-[1.01]"
                  >
                    Book Now
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Booking Confirmation Sub-Modal Overlay */}
        {showConfirmation && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-5 sm:p-6 max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Confirm Booking</h4>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed text-center">
                “Cancellations are subject to a deduction fee.”
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    console.log("[CAVEMAN] User cancelled the booking confirmation sub-modal.");
                    setShowConfirmation(false);
                  }}
                  className="flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinalizeBooking}
                  disabled={loading}
                  className="flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold rounded-2xl bg-brand-navy hover:bg-[#0a2d5c] text-white shadow-lg shadow-brand-navy/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Proceed'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Notifications Tab ──────────────────────────────────────────────────────
// ─── Customer Messages Tab ────────────────────────────────────────────────────────
import { useChatThreads, useChatMessages } from '../hooks/useChat';
import { useBookings } from '../hooks/useBookings';

function CustomerMessages() {
  const { user, profile } = useAuth();
  const { threads, loading: threadsLoading } = useChatThreads([user?.uid, profile?.id], 'customer');
  const { bookings } = useBookings(profile?.id, 'customer');
  
  const location = useLocation();
  const [selectedThread, setSelectedThread] = useState<any>(null);
  const [activeChannel, setActiveChannel] = useState<'vendor'|'personnel'>('vendor');
  const [initialized, setInitialized] = useState(false);
  const { confirm, ConfirmComponent } = useConfirm();
  
  // Find associated booking for selected thread
  const selectedBooking = useMemo(() => {
    if (!selectedThread || !bookings) return null;
    return bookings.find(b => b.id === selectedThread.booking_id);
  }, [selectedThread, bookings]);
  
  const showPersonnelTab = selectedBooking?.status === 'dispatched' || selectedBooking?.status === 'in_progress' || selectedBooking?.status === 'in-transit';

  const navigate = useNavigate();

  useEffect(() => {
    if (threads.length > 0) {
      if (location.state?.bookingId) {
        const found = threads.find(t => t.booking_id === location.state.bookingId || t.id === location.state.bookingId);
        if (found) {
          setSelectedThread(found);
          if (location.state.openChannel) {
            setActiveChannel(location.state.openChannel as any);
            // Clear the openChannel state so it doesn't force tab switching when new messages arrive
            navigate(location.pathname, { replace: true, state: { ...location.state, openChannel: undefined } });
          }
        }
      } else if (!initialized) {
        setInitialized(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threads, location.state, location.key, location.pathname, navigate]);

  const isHardLocked = useMemo(() => {
    if (selectedBooking?.status !== 'completed') return false;
    const completedAt = selectedBooking?.completed_at ? new Date(selectedBooking.completed_at) : null;
    if (!completedAt) return false;
    const hoursSinceCompletion = (new Date().getTime() - completedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCompletion > 48;
  }, [selectedBooking]);
  
  const { messages, sendMessage } = useChatMessages(selectedThread?.id || null, user?.uid);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);
  const prevChannel = useRef(activeChannel);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (messagesEndRef.current) {
        const isChannelChange = prevChannel.current !== activeChannel;
        const isInitialLoad = prevMessagesLength.current === 0 || messages.length === 0 || isChannelChange;
        messagesEndRef.current.scrollIntoView({ behavior: isInitialLoad ? 'auto' : 'smooth' });
        prevMessagesLength.current = messages.length;
        prevChannel.current = activeChannel;
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, activeChannel]);

  useEffect(() => {
    if (activeChannel === 'personnel' && selectedBooking && !showPersonnelTab) {
      setActiveChannel('vendor');
    }
  }, [showPersonnelTab, activeChannel, selectedBooking]);

  const handleSend = async () => {
    if (!inputText.trim() || !user || !selectedThread) return;
    const msgText = inputText;
    setInputText('');
    try {
      await sendMessage(user.uid, 'customer', msgText, activeChannel === 'personnel', (profile as any)?.avatar_url);
    } catch (e) {
      console.error(e);
      setInputText(msgText); // Revert on error
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-112px)] flex flex-col">
      <AdminPageHeader
        title="Messages"
        subtitle="Coordinate directly with your service providers and technicians."
        icon={<MessageSquare />}
      />

      <div className="flex-1 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm overflow-hidden flex min-h-0">
        {/* Left Pane (30%) */}
        <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/20">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-black text-slate-800 dark:text-white">Active Bookings</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {threadsLoading ? (
              <div className="text-center py-4 text-sm text-slate-500">Loading conversations...</div>
            ) : threads.length === 0 ? (
              <div className="text-center py-4 text-sm text-slate-500">No active conversations.</div>
            ) : (
              threads.map(t => (
                <div key={t.id} onClick={() => { setSelectedThread(t); setActiveChannel('vendor'); }} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedThread?.id === t.id ? 'bg-white dark:bg-slate-800 border-brand-navy shadow-md ring-1 ring-brand-navy/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{t.booking_id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                      {t.vendor_avatar ? (
                        <img src={t.vendor_avatar} alt="Vendor Logo" className="w-full h-full object-cover bg-white" />
                      ) : (
                        t.vendor_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2) || 'V'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{t.vendor_name || 'Vendor'}</h4>
                      <p className="text-xs text-slate-500 truncate">{t.service_type || 'Service'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Pane (70%) */}
        <div className="w-2/3 flex flex-col bg-slate-50 dark:bg-slate-950 relative">
          {selectedThread ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center z-10 shadow-sm relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-700">
                    {activeChannel === 'vendor' ? (
                      selectedThread.vendor_avatar ? (
                        <img src={selectedThread.vendor_avatar} alt="Vendor" className="w-full h-full object-cover bg-white" />
                      ) : (
                        (selectedThread.vendor_name || 'Vendor').split(' ').map((n: string) => n[0]).join('').substring(0, 2)
                      )
                    ) : (
                      selectedThread.technician_avatar ? (
                        <img src={selectedThread.technician_avatar} alt="Personnel" className="w-full h-full object-cover" />
                      ) : (
                        (selectedThread.personnel_name || 'Assigned Personnel').split(' ').map((n: string) => n[0]).join('').substring(0, 2)
                      )
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">
                      {activeChannel === 'vendor' ? (selectedThread.vendor_name || 'Vendor') : (selectedThread.personnel_name || 'Assigned Personnel')}
                    </h3>
                    {activeChannel === 'vendor' ? (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Online
                      </p>
                    ) : (
                      <p className="text-[11px] font-bold flex items-center gap-1 mt-0.5">
                        {selectedBooking?.status === 'assigned' && <span className="text-slate-500">🟡 Personnel Assigned</span>}
                        {selectedBooking?.status === 'dispatched' && <span className="text-emerald-600 dark:text-emerald-400">🟢 On the way (ETA: 15 mins)</span>}
                        {selectedBooking?.status === 'in-transit' && <span className="text-orange-600 dark:text-orange-400">📍 Arriving soon</span>}
                        {selectedBooking?.status === 'in_progress' && <span className="text-blue-600 dark:text-blue-400">🔵 Working on-site</span>}
                        {selectedBooking?.status === 'completed' && <span className="text-slate-500">✅ Job Completed</span>}
                        {!['assigned', 'dispatched', 'in-transit', 'in_progress', 'completed'].includes(selectedBooking?.status) && <span className="text-slate-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Online</span>}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {activeChannel === 'personnel' && (
                    <button
                      onClick={() => {
                        confirm({
                          title: `Call ${selectedThread?.personnel_name || 'Personnel'}`,
                          message: `Are you sure you want to call ${selectedThread?.personnel_name}? Standard carrier rates may apply.`,
                          confirmText: 'Call Now',
                          type: 'info'
                        });
                      }}
                      className="p-2 rounded-xl bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white transition-colors border border-brand-green/20"
                      title="Call Personnel"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </button>
                  )}
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                    <button
                      onClick={() => setActiveChannel('vendor')}
                      className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        activeChannel === 'vendor' 
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      Vendor
                    </button>
                    {showPersonnelTab && (
                      <button
                        onClick={() => setActiveChannel('personnel')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          activeChannel === 'personnel' 
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        Assigned Personnel
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                {activeChannel === 'personnel' && selectedThread?.personnel_name && (
                  <div className="flex justify-center w-full mt-2 mb-2">
                    <div className="bg-amber-50/80 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/50 text-xs px-5 py-3 rounded-2xl max-w-[85%] shadow-sm font-medium flex items-start sm:items-center gap-3">
                      <span className="text-lg leading-none">🔒</span>
                      <p className="leading-snug">
                        For your safety, <strong>{selectedThread.vendor_name || 'the vendor'}</strong> has assigned <strong>{selectedThread.personnel_name}</strong> to your booking. Please ask for their AllFix ID upon arrival.
                      </p>
                    </div>
                  </div>
                )}
                {messages.filter(m => activeChannel === 'personnel' ? (m.is_logistics || m.sender_role === 'technician') : (!m.is_logistics && m.sender_role !== 'technician')).length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-500 text-sm">No messages yet. Send a message to start the conversation.</p>
                  </div>
                ) : (
                  messages
                    .filter(m => activeChannel === 'personnel' ? (m.is_logistics || m.sender_role === 'technician') : (!m.is_logistics && m.sender_role !== 'technician'))
                    .map((msg, index, arr) => {
                    const isMe = msg.sender_id === user?.uid;
                    const isSystem = msg.sender_role === 'system';
                    
                    const nextMsg = index < arr.length - 1 ? arr[index + 1] : null;
                    const isNextSame = nextMsg && nextMsg.sender_id === msg.sender_id && nextMsg.sender_role !== 'system';
                    const showAvatar = !isMe && !isSystem && !isNextSame;

                    const currentMsgDate = msg.created_at ? (typeof msg.created_at.toDate === 'function' ? msg.created_at.toDate() : new Date(msg.created_at)) : new Date();
                    
                    let showDateSeparator = false;
                    let dateLabel = '';
                    
                    if (index === 0) {
                      showDateSeparator = true;
                    } else {
                      const prevMsg = arr[index - 1];
                      const prevMsgDate = prevMsg.created_at ? (typeof prevMsg.created_at.toDate === 'function' ? prevMsg.created_at.toDate() : new Date(prevMsg.created_at)) : new Date();
                      showDateSeparator = currentMsgDate.toDateString() !== prevMsgDate.toDateString();
                    }
                    
                    if (showDateSeparator) {
                      const today = new Date();
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      if (currentMsgDate.toDateString() === today.toDateString()) {
                        dateLabel = 'Today';
                      } else if (currentMsgDate.toDateString() === yesterday.toDateString()) {
                        dateLabel = 'Yesterday';
                      } else {
                        dateLabel = currentMsgDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', weekday: 'long' });
                      }
                    }

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex flex-col w-full">
                          {showDateSeparator && (
                            <div className="flex justify-center mb-4 mt-2 w-full">
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                                {dateLabel}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-center w-full my-4">
                            <div className="bg-brand-green/10 text-brand-green border border-brand-green/20 text-xs px-5 py-2.5 rounded-2xl text-center max-w-[85%] shadow-sm font-medium">
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className="flex flex-col w-full">
                        {showDateSeparator && (
                          <div className="flex justify-center mb-4 mt-2 w-full">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                              {dateLabel}
                            </span>
                          </div>
                        )}
                        <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'} ${isNextSame ? 'mb-1.5' : 'mb-6'} w-full`}>
                          {!isMe && (
                          <div className={`flex-shrink-0 flex items-end justify-center ${showAvatar ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-0 sm:w-0'}`}>
                            {showAvatar && (
                              <div className="w-full h-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center border border-slate-300 dark:border-slate-600">
                                {msg.sender_avatar ? (
                                  <img src={msg.sender_avatar} alt="avatar" className="w-full h-full object-cover bg-white" />
                                ) : (
                                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                    {msg.sender_role === 'vendor' ? 'V' : msg.sender_role === 'customer' ? 'C' : 'T'}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                          <div className={`rounded-2xl px-4 py-3 min-w-[120px] text-sm ${
                            isMe 
                              ? 'bg-brand-navy text-white rounded-br-none shadow-md' 
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-sm'
                          }`}>
                            <p>{msg.text}</p>
                            <span className={`text-[10px] mt-1.5 flex justify-end items-center gap-1.5 ${isMe ? 'text-slate-200' : 'text-slate-400/80'}`}>
                              {msg.created_at?.toDate ? msg.created_at.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                              {isMe && (
                                <span className={msg.is_read ? 'text-blue-200 font-black tracking-tighter text-[11px]' : 'text-slate-300/60 font-bold'}>
                                  {msg.is_read ? '✓✓' : '✓'}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              {isHardLocked ? (
                <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                  This service is marked completed. This conversation is now closed for new messages.
                  <button onClick={() => window.location.href = '/customer/support'} className="text-brand-green hover:underline ml-1">Need more help? Open a Support Ticket</button>
                </div>
              ) : selectedBooking?.status === 'completed' && activeChannel === 'personnel' ? (
                <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                  Personnel chat is closed for completed bookings.
                </div>
              ) : (
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 text-slate-800 dark:text-white"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button 
                      onClick={handleSend} 
                      disabled={!inputText.trim()}
                      className={`rounded-xl ${!inputText.trim() ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 !opacity-100' : 'bg-brand-green hover:bg-[#005e3f] text-white shadow-sm'}`}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">Your Conversations</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">Select an active booking on the left to securely chat with vendors or assigned technicians.</p>
            </div>
          )}
        </div>
      </div>
      <ConfirmComponent />
    </div>
  );
}

// ─── Customer Help & Support Tab ────────────────────────────────────────────────
function CustomerSupport() {
  const { confirm: showAlert, ConfirmComponent } = useConfirm();
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ issueType: 'Late Technician', bookingId: '', message: '' });

  const handleSubmit = async () => {
    try {
      await api.post('/api/support', {
        role: 'customer',
        issue_type: ticketForm.issueType,
        booking_id: ticketForm.bookingId,
        message: ticketForm.message,
        priority: 'medium'
      });
      showAlert({ title: 'Success', message: 'Support ticket submitted successfully. Our team will review this shortly.', type: 'success', hideCancel: true });
      setShowTicketModal(false);
      setTicketForm({ issueType: 'Late Technician', bookingId: '', message: '' });
    } catch (err) {
      showAlert({ title: 'Error', message: 'Failed to submit ticket', type: 'danger', hideCancel: true });
    }
  };

  const faqs = [
    { q: 'How do I cancel a booking?', a: 'Go to your Bookings tab, select the booking, and click Cancel. Penalties may apply if cancelled late.' },
    { q: 'When is the technician arriving?', a: 'Once Dispatched, you can message the technician directly via the Messages tab.' },
    { q: 'How do refunds work?', a: 'Refunds are automatically processed to your AllFix wallet or original payment method upon approved cancellation.' }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Help & Support"
        subtitle="Can't find the answer in our Knowledge Base? Report a problem below, and our administration team will investigate and resolve your issue."
        icon={<HelpCircle />}
        action={
          <Button onClick={() => setShowTicketModal(true)} className="bg-brand-green hover:bg-[#005e3f] text-white font-bold px-6 py-2 rounded-xl shadow-md">
            Report a Problem
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Knowledge Base / FAQ</h3>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{faq.q}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white">Report a Problem</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Issue Type</label>
                <select value={ticketForm.issueType} onChange={e => setTicketForm({...ticketForm, issueType: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm">
                  <option value="Late Technician">Late Technician</option>
                  <option value="Poor Service Quality">Poor Service Quality</option>
                  <option value="Billing/Refund Issue">Billing/Refund Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Booking ID (Optional)</label>
                <input type="text" placeholder="e.g. BK-000010" value={ticketForm.bookingId} onChange={e => setTicketForm({...ticketForm, bookingId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Details</label>
                <textarea rows={4} placeholder="Describe what happened..." value={ticketForm.message} onChange={e => setTicketForm({...ticketForm, message: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm"></textarea>
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowTicketModal(false)}>Cancel</Button>
              <Button className="bg-brand-green hover:bg-[#005e3f] text-white" onClick={handleSubmit}>Submit Ticket</Button>
            </div>
          </div>
        </div>
      )}
      <ConfirmComponent />
    </div>
  );
}

// ─── Main Layout ────────────────────────────────────────────────────────────
export default function CustomerApp() {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cart, setCart] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('booking_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('booking_cart', JSON.stringify(cart));
  }, [cart]);

  // Checkout modal states
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutCart, setCheckoutCart] = useState<any[]>([]);
  const [onCheckoutSuccess, setOnCheckoutSuccess] = useState<((bookings: any[]) => void) | null>(null);

  const triggerCheckout = (items: any[], onSuccess: (bookings: any[]) => void) => {
    setCheckoutCart(items);
    setOnCheckoutSuccess(() => onSuccess);
    setCheckoutModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark">
      <Sidebar role="customer" collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className={`transition-all duration-300 ${collapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'}`}>
        <Header onMenuToggle={() => setMobileOpen(true)} />
        <main className="p-4 md:p-6">
          <Routes>
            <Route index element={<CustomerHome />} />
            <Route path="book" element={<BookingFormTab cart={cart} setCart={setCart} onCheckout={triggerCheckout} />} />
            <Route path="bookings" element={<MyBookingsTab />} />
            <Route path="cart" element={<CartTab cart={cart} setCart={setCart} onCheckout={triggerCheckout} />} />
            <Route path="vouchers" element={<VouchersTab />} />
            <Route path="refunds" element={<RefundsTab />} />
            <Route path="notifications" element={<NotificationsTab />} />
            <Route path="messages" element={<CustomerMessages />} />
            <Route path="support" element={<CustomerSupport />} />
            <Route path="profile" element={<ProfileTab />} />
          </Routes>
        </main>
      </div>

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cart={checkoutCart}
        onSuccess={(bookings) => {
          if (onCheckoutSuccess) {
            onCheckoutSuccess(bookings);
          }
        }}
      />
    </div>
  );
}
