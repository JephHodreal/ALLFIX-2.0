import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Wrench, Calendar, Search, Star, Plus, Minus, Trash2, Edit, ShoppingBag, ArrowRight, AlertCircle, CheckCircle2, Clock, MapPin, CreditCard, ArrowLeft, User, ShieldAlert, Home, BookOpen, LayoutGrid, ChevronDown } from 'lucide-react';
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

// ─── TASK 4: Mobile Service Selector Dropdown (replaces NavigationPills on mobile) ───
type NavigationPillsProps = {
  services: Array<any>;
  activeServiceIdx: number;
  setActiveServiceIdx: (idx: number) => void;
};

const NavigationPills: React.FC<NavigationPillsProps> = ({ services, activeServiceIdx, setActiveServiceIdx }) => {
  return (
    <>
      {/* MOBILE: Dropdown selector (xs only) */}
      <Box sx={{ display: { xs: 'block', sm: 'none' }, width: '100%', mt: 1.5, px: 1 }}>
        <Box sx={{ position: 'relative' }}>
          <select
            value={activeServiceIdx}
            onChange={(e) => setActiveServiceIdx(Number(e.target.value))}
            style={{
              width: '100%',
              appearance: 'none',
              WebkitAppearance: 'none',
              padding: '10px 40px 10px 14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              borderRadius: '10px',
              color: '#23406e',
              backgroundColor: 'rgba(35, 64, 110, 0.04)',
              border: '1.5px solid rgba(35, 64, 110, 0.2)',
              cursor: 'pointer',
              outline: 'none',
              backgroundImage: 'none',
            }}
          >
            {services.map((svc, idx) => (
              <option key={svc.brand} value={idx}>
                {svc.brand}
              </option>
            ))}
          </select>
          {/* Custom chevron icon */}
          <Box
            sx={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              color: '#23406e',
            }}
          >
            <ChevronDown size={16} />
          </Box>
        </Box>
      </Box>

      {/* DESKTOP/TABLET: Original pill grid (sm and up) */}
      <Box
        id="services-scroll-navbar"
        sx={{
          display: { xs: 'none', sm: 'grid' },
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
    </>
  );
};

// ─── ServiceCard — unchanged for desktop; mobile sizing handled by wrapper ───
const ServiceCard = ({ service, onServiceClick, isMobile = false }: { service: any; onServiceClick: (service: any) => void; isMobile?: boolean }) => {
  const [hovered, setHovered] = useState(false);
  const Icon = service.icon;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: isMobile ? '14px' : '16px',
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
      {/* Image showcase — shorter on mobile */}
      <div style={{
        position: 'relative',
        height: isMobile ? '120px' : '200px',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
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
                width: isMobile ? '44px' : '64px',
                height: isMobile ? '44px' : '64px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: service.accent,
                boxShadow: `0 0 20px ${service.accent}80, 0 0 40px ${service.accent}40, 0 8px 16px rgba(0,0,0,0.4)`,
              }}
            >
              <Icon style={{ width: isMobile ? '22px' : '32px', height: isMobile ? '22px' : '32px', color: '#fff' }} />
            </div>
          </div>
        )}
      </div>

      {/* Header — compact on mobile */}
      <div
        style={{
          position: 'relative',
          padding: isMobile ? '10px 14px' : '32px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${service.headerBg} 0%, ${service.headerBgLight} 100%)`,
          flexShrink: 0,
        }}
      >
        <div style={{
          fontSize: isMobile ? '0.65rem' : '0.75rem',
          fontWeight: 900,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          padding: isMobile ? '4px 8px' : '6px 12px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: '#fff',
        }}>
          {service.brand}
        </div>
        <div style={{
          width: isMobile ? '28px' : '40px',
          height: isMobile ? '28px' : '40px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.15)',
          position: 'relative',
          zIndex: 2,
          flexShrink: 0,
        }}>
          <Icon style={{ width: isMobile ? '14px' : '22px', height: isMobile ? '14px' : '22px', color: '#fff' }} />
        </div>
      </div>

      {/* Body — compact on mobile */}
      <div style={{
        padding: isMobile ? '10px 14px 12px 14px' : '12px 24px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minHeight: 0,
      }}>
        <h3 style={{
          fontWeight: 900,
          fontSize: isMobile ? '0.9rem' : '1.25rem',
          color: '#000',
          marginBottom: isMobile ? '1px' : '2px',
          lineHeight: 1.2,
        }}>{service.brand}</h3>
        <p style={{
          fontSize: isMobile ? '0.72rem' : '0.85rem',
          fontWeight: 600,
          color: service.accent,
          marginBottom: isMobile ? '6px' : '12px',
          lineHeight: 1.3,
        }}>{service.tagline}</p>

        {/* Description — show truncated on mobile */}
        {!isMobile && (
          <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>{service.description}</p>
        )}

        {/* Tags — compact 2-col grid, limit to 4 on mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: isMobile ? '4px 8px' : '8px 12px',
          marginBottom: isMobile ? '8px' : '16px',
        }}>
          {(isMobile ? service.services.slice(0, 4) : service.services).map((tag: string) => (
            <div key={tag} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '6px' }}>
              <CheckCircleIcon style={{ width: isMobile ? '11px' : '14px', height: isMobile ? '11px' : '14px', color: service.accent, flexShrink: 0 }} />
              <span style={{ fontSize: isMobile ? '0.67rem' : '0.8rem', fontWeight: 500, color: service.pillText, lineHeight: 1.2 }}>{tag}</span>
            </div>
          ))}
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: isMobile ? '0.75rem' : '0.9rem',
          fontWeight: 700,
          color: hovered ? service.accentDark : service.accent,
          transition: 'color 0.2s ease',
          marginTop: 'auto',
        }}>
          About {service.brand}
          <ArrowForwardIcon style={{ width: isMobile ? '13px' : '16px', height: isMobile ? '13px' : '16px', transition: 'transform 0.2s ease', transform: hovered ? 'translateX(4px)' : 'translateX(0)' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', backgroundColor: service.accent, width: hovered ? '100%' : '0%', transition: 'width 0.3s ease' }} />
    </div>
  );
};

// ─── TASK 3: Enhanced Animated Scroll Indicator ───────────────────────────
const SwipeIndicator = ({ visible }: { visible?: boolean })  => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        mt: 1.5,
        mb: 0.5,
        opacity: 1, // Fixed invalid value "10" to "1"
      }}
    >
      {/* Left Animated arrow sequence */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: '5px',
              height: '9px',
              borderRight: '2px solid #23406e',
              borderTop: '2px solid #23406e',
              transform: 'rotate(45deg)',
              borderRadius: '1px',
              animation: 'arrowPulseLeft 1.1s ease-in-out infinite',
              animationDelay: `${i * 0.18}s`,
              '@keyframes arrowPulseLeft': {
                '0%, 100%': { opacity: 0.2, transform: 'rotate(45deg) translateX(0)' },
                '50%': { opacity: 0.8, transform: 'rotate(45deg) translateX(2px)' },
              },
            }}
          />
        ))}
      </Box>

      {/* Center Text */}
      <Box
        sx={{
          fontSize: '0.7rem',
          fontWeight: 700,
          color: '#23406e',
          letterSpacing: '0.03em',
          animation: 'slideText 1.4s ease-in-out infinite',
          '@keyframes slideText': {
            '0%, 100%': { transform: 'translateX(0px)', opacity: 0.7 },
            '50%': { transform: 'translateX(3px)', opacity: 1 },
          },
        }}
      >
        Swipe to explore services
      </Box>

      {/* Right Animated arrow sequence */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: '5px',
              height: '9px',
              borderRight: '2px solid #23406e',
              borderTop: '2px solid #23406e',
              transform: 'rotate(45deg)',
              borderRadius: '1px',
              animation: 'arrowPulseRight 1.1s ease-in-out infinite',
              animationDelay: `${i * 0.18}s`,
              '@keyframes arrowPulseRight': {
                '0%, 100%': { opacity: 0.2, transform: 'rotate(45deg) translateX(0)' },
                '50%': { opacity: 0.8, transform: 'rotate(45deg) translateX(2px)' },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

// ─── TASK 1 & 3: Mobile Horizontal Scroll Service Cards with enhanced indicator ───
const MobileServiceScrollRow = ({
  services,
  onServiceClick,
}: {
  services: any[];
  onServiceClick: (svc: any) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [activeDot, setActiveDot] = useState(0);

  // Hide hint after first interaction
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      if (!hasScrolled) {
        setHasScrolled(true);
        setShowHint(false);
      }
      // Update active dot
      const cardWidth = el.scrollWidth / services.length;
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveDot(Math.min(idx, services.length - 1));
    };
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, [hasScrolled, services.length]);

  // Auto-hide hint after 3.5s
  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Right-edge gradient fade when hint is showing */}
      {showHint && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '56px',
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.88))',
            zIndex: 5,
            pointerEvents: 'none',
            animation: 'fadeEdge 3.5s ease forwards',
            '@keyframes fadeEdge': {
              '0%': { opacity: 1 },
              '75%': { opacity: 1 },
              '100%': { opacity: 0 },
            },
          }}
        />
      )}

      {/* Horizontal scroll container */}
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          overflowY: 'hidden',
          gap: 1.5,
          pb: 1,
          px: 1.5,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        {services.map((service, index) => (
          <Box
            key={service.id || index}
            sx={{
              flexShrink: 0,
              // TASK 1: Reduced width for more compact mobile cards
              width: '68vw',
              maxWidth: '260px',
              scrollSnapAlign: 'start',
            }}
          >
            {/* Pass isMobile=true for compact layout */}
            <ServiceCard service={service} onServiceClick={onServiceClick} isMobile={true} />
          </Box>
        ))}
        {/* Trailing spacer */}
        <Box sx={{ flexShrink: 0, width: '8px' }} />
      </Box>

      {/* TASK 3: Enhanced animated swipe indicator */}
      <SwipeIndicator visible={showHint} />

      {/* Scroll dot indicators — active dot tracks position */}
      {services.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '5px',
            mt: showHint ? 0.5 : 1.5,
          }}
        >
          {services.map((_, idx) => (
            <Box
              key={idx}
              sx={{
                width: idx === activeDot ? '16px' : '6px',
                height: '6px',
                borderRadius: idx === activeDot ? '3px' : '50%',
                bgcolor: '#23406e',
                opacity: idx === activeDot ? 0.85 : 0.2,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// ─── TASK 2: Mobile Header Branding Component ─────────────────────────────
// This wraps the existing Header and injects mobile branding.
// Usage: Replace <Header /> with <HeaderWithMobileBranding /> in CustomerApp.
const HeaderWithMobileBranding = () => {
  return (
    <Box sx={{ position: 'relative' }}>
      {/* Mobile-only branding overlay injected above the header area */}
      <Box
        sx={{
          display: { xs: 'flex', sm: 'none' },
          alignItems: 'center',
          gap: '7px',
          position: 'absolute',
          top: '50%',
          left: '16px',
          transform: 'translateY(-50%)',
          zIndex: 1300,
          pointerEvents: 'none',
        }}
      >
        {/* AllFix logo mark */}
        <Box
          sx={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #23406e 0%, #2E5BA8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(35, 64, 110, 0.3)',
            flexShrink: 0,
          }}
        >
          {/* Wrench icon as logo mark */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </Box>
        {/* Brand text */}
        <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <Box
            component="span"
            sx={{
              fontSize: '0.82rem',
              fontWeight: 900,
              color: '#23406e',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            AllFix
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: '0.6rem',
              fontWeight: 600,
              color: '#2E5BA8',
              letterSpacing: '0.01em',
              lineHeight: 1.1,
            }}
          >
            allfix.ph
          </Box>
        </Box>
      </Box>

      {/* Existing Header — untouched */}
      <Header />
    </Box>
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

      {/* ─── Services Grid ─── */}
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
            {/* ── TASK 1 & 3: Mobile horizontal scroll row (xs only) ── */}
            <Box sx={{ display: { xs: 'block', sm: 'none' }, width: '100%' }}>
              <MobileServiceScrollRow
                services={services}
                onServiceClick={(svc) => {
                  navigate(`/services/${svc.id}`);
                  window.scrollTo(0, 0);
                }}
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

      {/* ─── Desktop Book a Service Section (sm and up only) ─── */}
      <Box sx={{ display: { xs: 'none', sm: 'block' }, mt: 2 }}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Book a Service</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Choose a service below to start a new booking — pick your vendor, schedule, and confirm in minutes.
          </p>
        </div>
        <div
          style={{
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            overflow: 'hidden',
          }}
        >
          {/* Top banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #23406e 0%, #2E5BA8 100%)',
              padding: '20px 28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BookOpen style={{ width: '22px', height: '22px', color: '#fff' }} />
              </div>
              <div>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', marginBottom: '2px' }}>
                  Ready to schedule a service?
                </p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                  Multi-service booking · Choose your vendor · Instant confirmation
                </p>
              </div>
            </div>
            <button
              onClick={() => { navigate('/customer/book'); window.scrollTo(0, 0); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '12px',
                backgroundColor: '#fff',
                color: '#23406e',
                fontWeight: 800,
                fontSize: '0.85rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
            >
              Book Now
              <ArrowRight style={{ width: '15px', height: '15px' }} />
            </button>
          </div>

          {/* Quick-access service tiles */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '1px',
              backgroundColor: '#e2e8f0',
            }}
          >
            {services.map((svc) => {
              const SvcIcon = svc.icon;
              return (
                <button
                  key={svc.id}
                  onClick={() => { navigate('/customer/book'); window.scrollTo(0, 0); }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '18px 12px',
                    backgroundColor: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    textAlign: 'center',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f1f5f9'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff'; }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: `linear-gradient(135deg, ${svc.headerBg} 0%, ${svc.headerBgLight} 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <SvcIcon style={{ width: '18px', height: '18px', color: '#fff', fontSize: '18px' }} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#334155',
                      lineHeight: 1.2,
                    }}
                  >
                    {svc.brand}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Box>

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

  const [services, setServices] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        setSearchParams({});
      }
    }
  }, [editParam, cart, services, setSearchParams]);

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

  const activeServiceCategory = services.find((s: any) => s.id === serviceId || s.name?.toLowerCase()?.replace(/\s+/g, '') === serviceId);
  const subServicesOptions = activeServiceCategory?.subServices || [];
  const activeSubService = subServicesOptions.find((sub: any) => sub.id === subServiceId || sub.name === subServiceId);

  const workTypeOptions = activeSubService?.workTypes && activeSubService.workTypes.length > 0
    ? activeSubService.workTypes
    : activeSubService ? [activeSubService.name] : [];

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

  const selectableVendors = scheduleAvailableVendors.filter((v: any) => {
    const isSelectable = v.available_slots === undefined || v.available_slots > 0;
    console.log(`[CAVEMAN] Vendor ${v.company_name || v.name || v.username} remaining slots: ${v.available_slots} -> Displayable/Selectable: ${isSelectable}`);
    return isSelectable;
  });

  useEffect(() => {
    if (vendorId && scheduleAvailableVendors.length > 0) {
      const isSelectable = selectableVendors.some(v => v.id === vendorId);
      if (!isSelectable) {
        console.log(`[CAVEMAN] Auto-resetting vendorId because selected vendor is no longer selectable`);
        setVendorId('');
      }
    }
  }, [scheduleAvailableVendors, vendorId]);

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

  const price = Number(activeSubService?.prices?.[workType] || activeSubService?.prices?.[activeSubService?.name] || activeSubService?.prices?.['Base Price'] || 0);
  const itemTotal = price * quantity;

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !subServiceId || !workType || !vendorId || !scheduledDate || !scheduledTime || quantity < 1) {
      alert("Please fill all booking details");
      return;
    }

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
    
    const isVendorSelectable = selectableVendors.some(v => v.id === vendorId);
    if (!isVendorSelectable) {
      console.log(`[CAVEMAN] Booking blocked: selected vendor ${vendorId} is not in selectableVendors list.`);
      alert("The selected vendor is not available for the chosen schedule.");
      return;
    }

    if (selectedVendor && selectedVendor.available_slots !== undefined && selectedVendor.available_slots <= 0) {
      console.log(`[CAVEMAN] Booking blocked: ${selectedVendor.company_name || selectedVendor.name} has available_slots = ${selectedVendor.available_slots}`);
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

  const handleCheckout = () => {
    if (cart.length === 0) return;

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
      setCart([]);
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
                    {cart.map((item) => (
                      <div key={item.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative group">
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
                              <span>📅 {item.scheduledDate}</span>
                              <span>•</span>
                              <span>⏰ {item.scheduledTime}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-sm text-brand-green">₱{item.total}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Qty: {item.quantity}</p>
                          </div>
                        </div>

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
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-900 dark:text-white pt-2 text-lg font-black">
                      <span>Total Amount</span>
                      <span className="text-brand-green">₱{cart.reduce((sum, item) => sum + item.total, 0)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    loading={checkoutLoading}
                    variant="success"
                    className="w-full py-4 text-sm font-extrabold rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform"
                  >
                    <span>Complete Multi-Service Booking</span>
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

// ─── My Bookings Tab ────────────────────────────────────────────────────────
function MyBookingsTab() {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (profile?.id) {
      api.get(`/api/bookings/customer/${profile.id}`).then(r => setBookings(r.data || [])).catch(() => {}).finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [profile]);
  return (
    <DataTable columns={[
      { key: 'service_type', label: 'Service', sortable: true },
      { key: 'scheduled_date', label: 'Date', sortable: true },
      { key: 'scheduled_time', label: 'Time' },
      { key: 'status', label: 'Status', render: (item: any) => {
        const cls: Record<string, string> = { pending: 'badge-pending', confirmed: 'badge-confirmed', in_progress: 'badge-in-progress', completed: 'badge-completed' };
        return <span className={cls[item.status] || 'badge'}>{item.status?.replace('_', ' ')}</span>;
      }},
    ]} data={bookings} loading={loading} searchPlaceholder="Search bookings..." emptyTitle="No bookings yet" emptyDescription="Book a service to see your bookings here." />
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
      setCart([]);
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

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  onSuccess: (bookings: any[]) => void;
}

function CheckoutModal({ isOpen, onClose, cart, onSuccess }: CheckoutModalProps) {
  const { profile } = useAuth();
  const [step, setStep] = useState(2);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const [unitNo, setUnitNo] = useState('');
  const [street, setStreet] = useState('');
  const [barangay, setBarangay] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Dragon Pay'>('GCash');

  const [referenceNumber, setReferenceNumber] = useState('');
  const [voucherCode, setVoucherCode] = useState('');

  const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

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
    console.log(`[CAVEMAN] Step 4 Payment Details complete. Reference: ${referenceNumber}, Voucher: ${voucherCode}`);
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

      for (const item of cart) {
        const bookingData = {
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
          total_price: item.total,
          address: fullAddress,
          service_address: fullAddress,
          unit_house_no: unitNo,
          postal_code: postalCode,
          payment_method: paymentMethod,
          payment_reference: referenceNumber,
          voucher_code: voucherCode || null,
          slot_id: item.slotId || null
        };

        console.log("[CAVEMAN] Sending booking request to backend:", bookingData);
        const res = await api.post('/api/bookings', bookingData);
        bookingsCreated.push({
          id: res.data?.id,
          ...bookingData
        });
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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl w-full max-w-6xl max-h-[96vh] sm:max-h-[90vh] overflow-y-auto z-10 flex flex-col pt-3 sm:pt-4 md:pt-5 pb-4 sm:pb-6 md:pb-8 px-4 sm:px-6 md:px-8"
      >
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch flex-grow min-h-0">
          <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/30 p-4 sm:p-5 rounded-2xl border border-slate-150 dark:border-slate-800/80 flex flex-col justify-between h-auto lg:h-full transition-all duration-300">
            <div>
              <div
                onClick={() => setSummaryExpanded(!summaryExpanded)}
                className="lg:hidden flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer shadow-sm"
              >
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  📋 Show Booking Summary ({cart.length})
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-brand-green">₱{totalAmount}</span>
                  <span className="text-slate-455 text-[10px] transition-transform duration-300">{summaryExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              <h4 className="hidden lg:block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3.5">Booking Summary</h4>
              
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

            <div className="hidden lg:block pt-4 mt-4 border-t border-slate-200 dark:border-slate-700/80">
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm font-bold text-slate-455 uppercase tracking-widest">Total Amount</span>
                <span className="text-xl font-black text-brand-green">₱{totalAmount}</span>
              </div>
            </div>

            {step >= 3 && (
              <div className="hidden lg:block pt-4 mt-4 border-t border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
                <p className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Service Location</p>
                <div className="text-slate-700 dark:text-slate-350 bg-white/50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 leading-relaxed">
                  <p className="font-bold text-slate-900 dark:text-white">{unitNo}</p>
                  <p>{street}, Brgy. {barangay}</p>
                  <p>{city}</p>
                  {postalCode && (
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Postal Code: {postalCode}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 flex flex-col justify-between min-h-[360px] lg:min-h-[400px]">
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
                      <input type="text" value={unitNo} onChange={(e) => setUnitNo(e.target.value)} placeholder="e.g. Unit 5B, Building A" required className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Street Address *</label>
                      <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Street name & number" required className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Barangay *</label>
                      <input type="text" value={barangay} onChange={(e) => setBarangay(e.target.value)} placeholder="Barangay / District" required className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">City / Municipality *</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Postal Code / ZIP (Optional)</label>
                      <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="e.g. 1000" className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end gap-3 sm:gap-4 mt-4">
                  <Button type="submit" variant="primary" className="py-2.5 sm:py-3 px-5 sm:px-6 text-xs sm:text-sm font-extrabold rounded-2xl bg-brand-navy hover:bg-[#0a2d5c] text-white shadow-lg flex items-center gap-1.5 transition-transform hover:scale-[1.01]">
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handlePaymentMethodNext} className="flex flex-col justify-between h-full">
                <div className="space-y-3.5 sm:space-y-4">
                  <div className="flex items-center gap-2.5 mb-1">
                    <CreditCard className="w-5 h-5 text-brand-navy" />
                    <h4 className="font-black text-base md:text-lg text-slate-900 dark:text-white">Step 3: Payment Method</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6 items-center">
                    <div className="sm:col-span-5 space-y-2.5 sm:space-y-3.5">
                      <p className="text-xs font-extrabold text-slate-455 uppercase tracking-widest">Select Gateway</p>
                      
                      <div onClick={() => { console.log("[CAVEMAN] Payment method switched to GCash"); setPaymentMethod('GCash'); }} className={`w-full sm:w-3/4 p-2 sm:p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${paymentMethod === 'GCash' ? 'border-brand-navy bg-brand-navy/5 dark:bg-brand-navy/20 text-brand-navy dark:text-blue-400 font-bold border-2' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-350 dark:hover:border-slate-700'}`}>
                        <img src="/images/sample-gcash-qr.png" className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-md shadow-sm border border-slate-100 flex-shrink-0" alt="GCash Logo" />
                        <span className="text-xs sm:text-sm font-extrabold">GCash</span>
                      </div>

                      <div onClick={() => { console.log("[CAVEMAN] Payment method switched to Dragon Pay"); setPaymentMethod('Dragon Pay'); }} className={`w-full sm:w-3/4 p-2 sm:p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${paymentMethod === 'Dragon Pay' ? 'border-brand-navy bg-brand-navy/5 dark:bg-brand-navy/20 text-brand-navy dark:text-blue-400 font-bold border-2' : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-350 dark:hover:border-slate-700'}`}>
                        <img src="/images/sample-qr-dragonpay.png" className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-md shadow-sm border border-slate-100 flex-shrink-0" alt="Dragon Pay Logo" />
                        <span className="text-xs sm:text-sm font-extrabold">Dragon Pay</span>
                      </div>
                    </div>

                    <div className="sm:col-span-7 bg-slate-50 dark:bg-slate-800/40 p-3.5 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col items-center gap-2.5 text-center">
                      <p className="text-[10px] sm:text-xs font-bold text-slate-455 uppercase tracking-widest">Scan QR Code to Pay</p>
                      <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100">
                        <img src={paymentMethod === 'GCash' ? '/images/sample-gcash-qr.png' : '/images/sample-qr-dragonpay.png'} alt={`${paymentMethod} QR Code`} className="w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain transition-all" />
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-500 leading-normal font-semibold">Scan code with your {paymentMethod} app.</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-2.5 flex items-start gap-2 text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                    <p className="text-[10px] sm:text-xs font-semibold leading-normal text-left">"Once the booking status is confirmed, any cancellation refund will be subject to a deduction fee."</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between gap-3 sm:gap-4 mt-4">
                  <button type="button" onClick={() => { console.log("[CAVEMAN] Back to Step 2"); setStep(2); }} className="py-2.5 sm:py-3 px-4 sm:px-5 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5">
                    <ArrowLeft className="w-4 h-4" /><span>Back</span>
                  </button>
                  <Button type="submit" variant="primary" className="py-2.5 sm:py-3 px-5 sm:px-6 text-xs sm:text-sm font-extrabold rounded-2xl bg-brand-navy hover:bg-[#0a2d5c] text-white shadow-lg flex items-center gap-1.5 transition-transform hover:scale-[1.01]">
                    <span>Continue</span><ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

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
                        <input type="text" value={totalAmount} disabled placeholder="Amount Paid (PHP)" className="w-full pl-9 pr-4 py-2.5 sm:py-3 bg-slate-55 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm font-black focus:outline-none cursor-not-allowed" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Reference Number</label>
                      <input type="text" value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Reference Number" required className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-455 mb-1 sm:mb-1.5">Voucher Code (Optional)</label>
                      <input type="text" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)} placeholder="Voucher Code (Optional)" className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy placeholder:text-slate-400" />
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-2.5 flex items-start gap-2 text-amber-800 dark:text-amber-300">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                    <p className="text-[10px] sm:text-xs font-semibold leading-normal text-left">"Once the booking status is confirmed, any cancellation refund will be subject to a deduction fee."</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-between gap-3 sm:gap-4 mt-4">
                  <button type="button" onClick={() => { console.log("[CAVEMAN] Back to Step 3"); setStep(3); }} className="py-2.5 sm:py-3 px-4 sm:px-5 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5">
                    <ArrowLeft className="w-4 h-4" /><span>Back</span>
                  </button>
                  <Button type="submit" variant="success" className="py-2.5 sm:py-3 px-6 sm:px-7 text-xs sm:text-sm font-extrabold rounded-2xl shadow-lg transition-transform hover:scale-[1.01]">
                    Book Now
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

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
                "Once the booking status is confirmed, any cancellation refund will be subject to a deduction fee."
              </p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { console.log("[CAVEMAN] User cancelled the booking confirmation sub-modal."); setShowConfirmation(false); }} className="flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={handleFinalizeBooking} disabled={loading} className="flex-1 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold rounded-2xl bg-brand-navy hover:bg-[#0a2d5c] text-white shadow-lg shadow-brand-navy/20 flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
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

// ─── TASK 3: Mobile Bottom Navigation Bar ──────────────────────────────────
const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: Home, path: '/customer' },
    { label: 'Book', icon: BookOpen, path: '/customer/book' },
    { label: 'Bookings', icon: ClipboardList, path: '/customer/bookings' },
    { label: 'Cart', icon: ShoppingBag, path: '/customer/cart' },
  ];

  const isActive = (path: string) => {
    const p = location.pathname.replace(/\/$/, ''); // strip trailing slash
    if (path === '/customer') {
      return p === '/customer';
    }
    return p === path || p.startsWith(path + '/');
  };

  return (
    <Box
      component="nav"
      sx={{
        display: { xs: 'flex', sm: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {navItems.map(({ label, icon: Icon, path }) => {
        const active = isActive(path);
        return (
          <Box
            key={path}
            onClick={() => navigate(path)}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pt: 1,
              pb: 0.75,
              gap: '3px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              color: active ? '#23406e' : '#94a3b8',
              position: 'relative',
              '&:active': { transform: 'scale(0.92)' },
            }}
          >
            {/* Active indicator dot above icon */}
            {active && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '6px',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  bgcolor: '#23406e',
                  transition: 'all 0.2s',
                }}
              />
            )}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 28,
                borderRadius: '10px',
                bgcolor: active ? 'rgba(35, 64, 110, 0.1)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              <Icon size={active ? 20 : 19} strokeWidth={active ? 2.2 : 1.7} />
            </Box>
            <Box
              component="span"
              sx={{
                fontSize: '10px',
                fontWeight: active ? 700 : 500,
                letterSpacing: '0.01em',
                lineHeight: 1,
              }}
            >
              {label}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

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
      {/* Desktop Sidebar — hidden on mobile (the bottom nav takes over) */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Sidebar role="customer" collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </Box>

      {/* Main content — no left margin on mobile (sidebar is hidden) */}
      <Box
        sx={{
          transition: 'margin-left 0.3s',
          ml: { xs: 0, sm: collapsed ? '72px' : '260px' },
          // Add bottom padding on mobile to clear the bottom nav bar
          pb: { xs: '64px', sm: 0 },
        }}
      >
        {/* TASK 2: Use HeaderWithMobileBranding instead of plain Header */}
        <HeaderWithMobileBranding />
        <main className="p-6">
          <Routes>
            <Route index element={<CustomerHome />} />
            <Route path="book" element={<BookingFormTab cart={cart} setCart={setCart} onCheckout={triggerCheckout} />} />
            <Route path="bookings" element={<MyBookingsTab />} />
            <Route path="cart" element={<CartTab cart={cart} setCart={setCart} onCheckout={triggerCheckout} />} />
            <Route path="profile" element={<ProfileTab />} />
          </Routes>
        </main>
      </Box>

      {/* TASK 3: Mobile Bottom Navigation (xs only) */}
      <MobileBottomNav />

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