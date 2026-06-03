import React, { useState, useEffect } from 'react';
import { Routes, Route, useSearchParams, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Wrench, Calendar, Search, Star, Plus, Minus, Trash2, Edit, ShoppingBag, ArrowRight, AlertCircle, CheckCircle2, Clock, MapPin, CreditCard, ArrowLeft, User, ShieldAlert, Eye, X, Ticket, RefreshCcw, Receipt } from 'lucide-react';
import { Sidebar } from '../components/shared/Sidebar';
import { Header } from '../components/shared/Header';
import { Card, StatCard } from '../components/shared/Card';
import { DataTable } from '../components/shared/DataTable';
import { EmptyState } from '../components/shared/EmptyState';
import { Button } from '../components/shared/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/apiService';



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

const ServiceCard = ({ service, onServiceClick }: { service: any; onServiceClick: (service: any) => void }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = service.icon;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e5e5e5',
        boxShadow: hovered ? '0 25px 50px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        cursor: 'pointer',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onServiceClick(service)}
    >
      {/* Image showcase */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={service.image}
          alt={service.brand}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 10%',
            opacity: hovered ? 0.3 : 1,
            transition: 'opacity 0.5s ease',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: service.accent, opacity: hovered ? 0.6 : 0, transition: 'opacity 0.3s ease' }} />
        {hovered && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              pointerEvents: 'none',
              transition: 'opacity 0.3s, transform 0.3s',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'scale(1)' : 'scale(0.8)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: service.accent,
                boxShadow: `0 0 20px ${service.accent}80, 0 0 40px ${service.accent}40, 0 8px 16px rgba(0,0,0,0.4)`,
              }}
            >
              <Icon style={{ width: '32px', height: '32px', color: '#fff' }} />
            </div>
          </div>
        )}
      </div>

      {/* Header */}
      <div
        style={{
          position: 'relative',
          padding: '32px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${service.headerBg} 0%, ${service.headerBgLight} 100%)`,
        }}
      >
        <div style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
          {service.brand}
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', position: 'relative', zIndex: 2 }}>
          <Icon style={{ width: '22px', height: '22px', color: '#fff' }} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 24px 20px 24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontWeight: 900, fontSize: '1.25rem', color: '#000', marginBottom: '2px' }}>{service.brand}</h3>
        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: service.accent, marginBottom: '12px' }}>{service.tagline}</p>
        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>{service.description}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', marginBottom: '16px' }}>
          {service.services.map((tag: string) => (
            <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircleIcon style={{ width: '14px', height: '14px', color: service.accent, flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 500, color: service.pillText }}>{tag}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: hovered ? service.accentDark : service.accent, transition: 'color 0.2s ease', marginTop: 'auto' }}>
          About {service.brand}
          <ArrowForwardIcon style={{ width: '16px', height: '16px', transition: 'transform 0.2s ease', transform: hovered ? 'translateX(4px)' : 'translateX(0)' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', backgroundColor: service.accent, width: hovered ? '100%' : '0%', transition: 'width 0.3s ease' }} />
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

  useEffect(() => {
    if (profile?.id) {
      api.get(`/api/bookings/customer/${profile.id}`).then(r => setRecentBookings((r.data || []).slice(0, 5))).catch(() => {}).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [profile]);

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
              subServices: backendService.subServices || frontendMatch.subServices || [],
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
          if (!merged.find(m => m.id.toLowerCase() === fs.id.toLowerCase())) {
            merged.push(fs);
          }
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-br from-brand-navy to-[#0a2d5c] text-white border-none">
          <h2 className="text-2xl font-bold mb-1">Welcome back, {profile?.first_name || 'there'}!</h2>
          <p className="text-white/70">Ready to book your next service?</p>
        </Card>
      </motion.div>

      {/* ─── Services Grid (Imitates Landing Page UI & Behavior) ─── */}
      <div className="mt-8">
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
                      navigate(`/services/${svc.id}`); 
                      window.scrollTo(0, 0); 
                    }} 
                  />
                )}
              </Box>
              {/* Selector pills at the bottom */}
              <NavigationPills
                services={services}
                activeServiceIdx={activeServiceIdx}
                setActiveServiceIdx={setActiveServiceIdx}
              />
            </Box>

            {/* Tablet (sm–md): 2-column grid | Desktop (lg+): 3-column grid */}
            <Grid container rowSpacing={3} columnSpacing={1.5}
              sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'center', mt: 2 }}>
              {services.map((service, index) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ width: '100%', maxWidth: '420px', display: 'flex' }}>
                    <ServiceCard 
                      service={service} 
                      onServiceClick={(svc) => { 
                        navigate(`/services/${svc.id}`); 
                        window.scrollTo(0, 0); 
                      }} 
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </div>
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
                <span className={b.status === 'completed' ? 'badge-completed' : b.status === 'in_progress' ? 'badge-in-progress' : b.status === 'confirmed' ? 'badge-confirmed' : 'badge-pending'}>{b.status?.replace('_', ' ')}</span>
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
  const subserviceParam = searchParams.get('subservice') || '';
  const editParam = searchParams.get('edit') || '';
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
          <Button variant="primary" className="flex-1 py-3 text-sm font-semibold rounded-xl bg-brand-navy hover:bg-[#0a2d5c]" onClick={() => navigate('/customer/bookings')}>
            View My Bookings
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Book a Service</h2>
          <p className="text-sm text-slate-500">Configure services, choose your preferred vendor, and bundle them in a single booking cart.</p>
        </div>
      </div>

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
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
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
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
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
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
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
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy resize-none"
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
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy"
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
                          className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border rounded-2xl text-sm focus:outline-none focus:ring-2 ${
                            timeError
                              ? 'border-red-400 dark:border-red-500 text-red-600 dark:text-red-400 focus:ring-red-400'
                              : 'border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:ring-brand-navy'
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
                              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left ${
                                isSelected
                                  ? 'border-brand-navy bg-brand-navy/5 dark:bg-brand-navy/20'
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-800'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                  <p className={`font-bold text-sm leading-tight ${isSelected ? 'text-brand-navy dark:text-blue-400 font-extrabold' : 'text-slate-900 dark:text-white'}`}>
                                    {v.company_name || v.name || v.username}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {v.city || 'Location not specified'}
                                  </p>
                                </div>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  isSelected ? 'border-brand-navy bg-brand-navy' : 'border-slate-300 dark:border-slate-600'
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

                    <Button type="submit" variant="primary" className="w-full py-3.5 text-sm font-extrabold rounded-2xl shadow-lg transition-transform hover:scale-[1.01]">
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
                  <ShoppingBag className="w-5 h-5 text-brand-navy" />
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Selected Services</h3>
                </div>
                <span className="text-xs font-black bg-brand-navy text-white px-2.5 py-1 rounded-full">{cart.length} items</span>
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
                          className={`p-4 bg-white dark:bg-slate-800 rounded-2xl border shadow-sm relative group transition-colors ${
                            isPassed
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
      alert('Thank you! Your rating and review have been submitted successfully.');
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

  const fetchBookings = () => {
    if (profile?.id) {
      setLoading(true);
      api.get(`/api/bookings/customer/${profile.id}`)
        .then(r => setBookings(r.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [profile]);

  const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
      pending: 'badge-pending',
      confirmed: 'badge-confirmed',
      in_progress: 'badge-in-progress',
      completed: 'badge-completed',
      cancelled: 'badge-cancelled',
    };
    return <span className={cls[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
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
      alert('Your cancellation and refund request has been submitted. An administrator will review and process it shortly.');
    } catch (err: any) {
      console.error('[CAVEMAN] Refund request failed:', err);
      setRefundError(err.response?.data?.message || 'Failed to submit refund request. Please try again.');
    } finally {
      setRefundSubmitting(false);
    }
  };

  // ── Booking Details View ──
  if (selectedBooking) {
    const isCancellable = selectedBooking.status !== 'cancelled' && selectedBooking.status !== 'completed' && !selectedBooking.cancellation_requested;
    const hasRefundInfo = selectedBooking.refund_reference_number || selectedBooking.refund_method;

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
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
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ID: {selectedBooking.id}</p>
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
          <Card className="p-6 space-y-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Service Information</h4>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Service:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-bold">{selectedBooking.sub_service || selectedBooking.service_type}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Work Type:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.service_type}</span>
              </div>
              {selectedBooking.description && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-400 font-medium">Description:</span>
                  <span className="col-span-2 text-slate-600 dark:text-slate-350 italic">"{selectedBooking.description}"</span>
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
                <span className="col-span-2 text-slate-700 dark:text-slate-300 leading-normal">{selectedBooking.address || selectedBooking.service_address || '—'}</span>
              </div>
              {selectedBooking.personnel_id && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 font-medium">Personnel:</span>
                  <span className="col-span-2 text-slate-900 dark:text-white font-semibold font-semibold">Assigned</span>
                </div>
              )}
            </div>
          </Card>

          {/* Payment Information */}
          <Card className="p-6 space-y-4 bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm">
            <h4 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest border-b pb-2 border-slate-100 dark:border-slate-800">Payment & Pricing</h4>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Unit Price:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">₱{selectedBooking.price || '0.00'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Quantity:</span>
                <span className="col-span-2 text-slate-900 dark:text-white font-semibold">{selectedBooking.quantity || 1}</span>
              </div>
              {/* Voucher Discount Info */}
              {selectedBooking.discount_amount > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">Subtotal:</span>
                    <span className="col-span-2 text-slate-500 dark:text-slate-400 font-semibold line-through">₱{selectedBooking.original_price || (selectedBooking.price * (selectedBooking.quantity || 1))}</span>
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
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-900 dark:text-white font-black">Total:</span>
                <span className="col-span-2 text-lg font-black text-brand-green font-semibold">₱{selectedBooking.total_price || (selectedBooking.price * (selectedBooking.quantity || 1)) || '0.00'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-400 font-medium">Payment Status:</span>
                <span className="col-span-2">
                  {selectedBooking.payment_confirmed ? (
                    <span className="badge-completed">Confirmed</span>
                  ) : (
                    <span className="badge-pending">Pending</span>
                  )}
                </span>
              </div>
              {hasRefundInfo && (
                <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-955/20 border border-rose-200/50 dark:border-rose-900/40 rounded-xl space-y-1.5 text-xs text-rose-800 dark:text-rose-300">
                  <p className="font-extrabold uppercase tracking-wide">Refund Information</p>
                  {selectedBooking.refund_amount && <p><span className="font-bold">Refunded Amount:</span> ₱{selectedBooking.refund_amount}</p>}
                  {selectedBooking.refund_method && <p><span className="font-bold">Method:</span> {selectedBooking.refund_method}</p>}
                  {selectedBooking.refund_reference_number && <p><span className="font-bold">Refund Ref No:</span> {selectedBooking.refund_reference_number}</p>}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        {!showRefundForm && !showCancelConfirm && isCancellable && (
          <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800/80">
            <Button
              variant="danger"
              className="flex-1 py-3 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white min-w-[140px]"
              onClick={() => {
                console.log('[CAVEMAN] Customer clicked Cancel Booking for booking:', selectedBooking.id);
                setShowCancelConfirm(true);
              }}
            >
              Cancel Booking
            </Button>
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
                className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-6"
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
    <DataTable
      columns={[
        { key: 'service_type', label: 'Service', sortable: true },
        { key: 'scheduled_date', label: 'Date', sortable: true },
        { key: 'scheduled_time', label: 'Time' },
        {
          key: 'status', label: 'Status', render: (item: any) => {
            const cls: Record<string, string> = { pending: 'badge-pending', confirmed: 'badge-confirmed', in_progress: 'badge-in-progress', completed: 'badge-completed', cancelled: 'badge-cancelled' };
            return <span className={cls[item.status] || 'badge'}>{item.status?.replace('_', ' ')}</span>;
          }
        },
        {
          key: 'actions',
          label: 'Actions',
          render: (item: any) => (
            <Button
              size="sm"
              className="bg-brand-navy hover:bg-[#0a2d5c] text-white flex items-center gap-1.5"
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
          alert(`The booking for "${item.subServiceName}" - "${item.workType}" has a preferred start time that has already passed today (${item.scheduledTime}). Please edit or remove this item to proceed.`);
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
          <Button variant="primary" className="flex-1 py-3 text-sm font-semibold rounded-xl bg-brand-navy hover:bg-[#0a2d5c]" onClick={() => navigate('/customer/bookings')}>
            View My Bookings
          </Button>
        </div>
      </Card>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl max-w-xl mx-auto p-8 space-y-4">
        <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">Browse specialized care solutions to configure services and save items here.</p>
        <Button variant="primary" className="py-2.5 px-6 text-sm font-bold rounded-xl bg-brand-navy hover:bg-[#0a2d5c]" onClick={() => navigate('/customer')}>
          Browse Services
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Booking Cart</h2>
        <p className="text-sm text-slate-500">Review selected services and schedule details before completing the booking.</p>
      </div>

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
                    onClick={() => { navigate(`/customer/book?edit=${item.id}&subservice=${encodeURIComponent(item.subServiceName)}`); }}
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
            className="flex-1 py-3.5 text-sm font-extrabold rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
          >
            <span>Complete Booking</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ─── Profile Tab ────────────────────────────────────────────────────────────
function ProfileTab() {
  const { profile } = useAuth();
  if (!profile) return <EmptyState title="Profile not loaded" />;
  return (
    <Card>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">My Profile</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          ['First Name', profile.first_name], ['Last Name', profile.last_name],
          ['Email', profile.email], ['Phone', (profile as any).phone || '—'],
          ['City', (profile as any).city || '—'], ['Barangay', (profile as any).barangay || '—'],
        ].map(([label, val]) => (
          <div key={label as string}>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{val as string}</p>
          </div>
        ))}
      </div>
    </Card>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-7 h-7 text-brand-navy dark:text-brand-green" />
            My Vouchers
          </h2>
          <p className="text-sm text-slate-500">View and manage all your discount vouchers assigned by AllFix administrators.</p>
        </div>
        
        {/* Toggle Filters */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 self-stretch sm:self-auto">
          <button
            onClick={() => setFilter('unused')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              filter === 'unused'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('used')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              filter === 'used'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Redeemed
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              filter === 'expired'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Expired
          </button>
        </div>
      </div>

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
                className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${
                  isUnused
                    ? 'bg-gradient-to-br from-brand-navy via-slate-900 to-slate-950 border-brand-navy/30 dark:border-slate-850 hover:shadow-2xl hover:scale-[1.01] text-white shadow-xl'
                    : isExpired
                    ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30 text-slate-400 dark:text-slate-500 opacity-60'
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
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isUnused 
                          ? 'bg-brand-green/20 text-brand-green border border-brand-green/30' 
                          : isExpired
                          ? 'bg-red-100 dark:bg-red-950/40 text-red-650 dark:text-red-400 border border-red-200/20'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {isUnused ? 'Available' : isExpired ? 'Expired' : 'Redeemed'}
                      </span>
                      {isUnused && (
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> Available
                        </span>
                      )}
                    </div>

                    {/* Discount Value */}
                    <h3 className={`text-3xl font-black ${isUnused ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`}>
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
                      <p className={`font-mono font-black text-base tracking-wider truncate mt-0.5 ${
                        isUnused ? 'text-brand-green' : 'text-slate-455 line-through'
                      }`}>
                        {v.code}
                      </p>
                    </div>

                    {isUnused && (
                      <button
                        onClick={() => handleCopy(v.code)}
                        className="px-4 py-2 text-xs font-black rounded-xl bg-brand-green hover:bg-[#00d070] text-slate-950 transition-colors shadow-lg shadow-brand-green/10 flex items-center gap-1"
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <RefreshCcw className="w-7 h-7 text-brand-navy dark:text-brand-green" />
            Refund Center
          </h2>
          <p className="text-sm text-slate-500">Track the status of your cancellations and automatic GCash refund transactions.</p>
        </div>

        {/* Toggle Filters */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 self-stretch sm:self-auto">
          {(['all', 'Processed', 'pending', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 capitalize ${
                filter === status
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {status === 'all' ? 'All Transactions' : status === 'Processed' ? 'Completed' : status}
            </button>
          ))}
        </div>
      </div>

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
              } catch (e) {}
            }

            return (
              <div
                key={r.id}
                onClick={() => setSelectedRefund(r)}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 cursor-pointer shadow-md group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-50 dark:from-slate-800/20 to-transparent pointer-events-none rounded-tr-3xl"></div>

                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      isProcessed 
                        ? 'bg-brand-green/10 text-brand-green border-brand-green/20' 
                        : isPending
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border-red-200/20'
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

                <div className="mt-5 flex items-center justify-between text-brand-navy dark:text-brand-green group-hover:translate-x-1 transition-transform duration-300">
                  <span className="text-xs font-black">View Transaction Invoice</span>
                  <ArrowRight className="w-4 h-4" />
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
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  selectedRefund.status?.toLowerCase() === 'processed'
                    ? 'bg-brand-green/10 text-brand-green border-brand-green/20'
                    : selectedRefund.status?.toLowerCase() === 'pending'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border-red-200/20'
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
  const [paymentMethod, setPaymentMethod] = useState<'GCash'>('GCash');

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
            {step === 3 && (
              <form onSubmit={handlePaymentMethodNext} className="flex flex-col justify-between h-full">
                <div className="space-y-3.5 sm:space-y-4">
                  <div className="flex items-center gap-2.5 mb-1">
                    <CreditCard className="w-5 h-5 text-brand-navy" />
                    <h4 className="font-black text-base md:text-lg text-slate-900 dark:text-white">Step 3: Payment Method</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center">
                    {/* Left Column: payment method options (3/4 size) */}
                    <div className="sm:col-span-5 space-y-2.5 sm:space-y-3.5">
                      <p className="text-xs font-extrabold text-slate-455 uppercase tracking-widest">Select Gateway</p>
                      
                      <div
                        className="w-full sm:w-3/4 p-2 sm:p-2.5 rounded-xl border cursor-default transition-all flex items-center gap-3 border-brand-navy bg-brand-navy/5 dark:bg-brand-navy/20 text-brand-navy dark:text-blue-400 font-bold border-2"
                      >
                        <img src="/images/sample-gcash-qr.png" className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-md shadow-sm border border-slate-100 flex-shrink-0" alt="GCash Logo" />
                        <span className="text-xs sm:text-sm font-extrabold">GCash</span>
                      </div>
                    </div>

                    {/* Right Column: QR Display Box (Sized proportionally for viewports) */}
                    <div className="sm:col-span-7 bg-slate-50 dark:bg-slate-800/40 p-3.5 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col items-center gap-2.5 text-center">
                      <p className="text-[10px] sm:text-xs font-bold text-slate-455 uppercase tracking-widest">Scan QR Code to Pay</p>
                      <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100">
                        <img
                          src="/images/sample-gcash-qr.png"
                          alt="GCash QR Code"
                          className="w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain transition-all"
                        />
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500 leading-normal font-semibold">
                        Scan code with your GCash app.
                      </p>
                    </div>
                  </div>

                  {/* Cancellation Warning Notice */}
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-2.5 flex items-start gap-2 text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                    <p className="text-[10px] sm:text-xs font-semibold leading-normal text-left">
                      “Once the booking status is confirmed, any cancellation refund will be subject to a deduction fee.”
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
            )}

            {/* Step 4 Details Form */}
            {step === 4 && (
              <form onSubmit={handleDetailsSubmit} className="flex flex-col justify-between h-full">
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-2.5 mb-1 sm:mb-2">
                    <User className="w-5 h-5 text-brand-navy" />
                    <h4 className="font-black text-base md:text-lg text-slate-900 dark:text-white">Step 4: Reference & Summary</h4>
                  </div>

                  <div className="space-y-3.5 sm:space-y-4">
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

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Voucher Code (Optional)</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          placeholder="Enter voucher code"
                          className={`w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 placeholder:text-slate-400 ${
                            voucherValidationMsg.type === 'success'
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
                        <p className={`text-xs font-semibold mt-1.5 ${
                          voucherValidationMsg.type === 'success' ? 'text-brand-green' : 'text-brand-red'
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
                                className={`text-[10px] px-2.5 py-1 rounded-xl font-bold border transition-all ${
                                  voucherCode.toUpperCase().trim() === v.code.toUpperCase()
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
                      “Once the booking status is confirmed, any cancellation refund will be subject to a deduction fee.”
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
                “Once the booking status is confirmed, any cancellation refund will be subject to a deduction fee.”
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

// ─── Main Layout ────────────────────────────────────────────────────────────
export default function CustomerApp() {
  const [collapsed, setCollapsed] = useState(true);
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
      <Sidebar role="customer" collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`transition-all duration-300 ${collapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        <Header />
        <main className="p-6">
          <Routes>
            <Route index element={<CustomerHome />} />
            <Route path="book" element={<BookingFormTab cart={cart} setCart={setCart} onCheckout={triggerCheckout} />} />
            <Route path="bookings" element={<MyBookingsTab />} />
            <Route path="cart" element={<CartTab cart={cart} setCart={setCart} onCheckout={triggerCheckout} />} />
            <Route path="vouchers" element={<VouchersTab />} />
            <Route path="refunds" element={<RefundsTab />} />

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
