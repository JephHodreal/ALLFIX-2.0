import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Grid, AppBar, Toolbar, IconButton, TextField, MenuItem, CssBaseline } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { useAuth } from '../context/AuthContext';

// --- Testimonial Data ---
const testimonials = [
  {
    initials: 'MS',
    name: 'Maria Santos',
    role: 'Homeowner, Makati City',
    highlight: 'CoolFix – AC Cleaning',
    highlightColor: '#eaf2fc',
    highlightText: '#23406e',
    avatarBg: '#eaf2fc',
    avatarText: '#23406e',
    text: '"Napakaayos ng trabaho! The CoolFix technician arrived exactly on time, wore PPE, and cleaned our 3 aircon units thoroughly. The apartment feels so much cooler now. Highly recommend!"',
    mini: 'Napakaayos ng trabaho! The CoolFix technician arrived exactly on time, wore PPE...'
  },
  {
    initials: 'RC',
    name: 'Engr. Roberto Cruz',
    role: 'Property Manager, Pasig',
    highlight: 'SaniFix – Deep Cleaning',
    highlightColor: '#eaf2fc',
    highlightText: '#23406e',
    avatarBg: '#eaf2fc',
    avatarText: '#23406e',
    text: '"We\'ve been managing commercial properties for 10 years, and AllFix SaniFix is the most reliable, professional team we\'ve worked with. Highly recommended for offices!"',
    mini: "We've been managing commercial properties for 10 years, and AllFix SaniFix is the most..."
  },
  {
    initials: 'AR',
    name: 'Anna Reyes',
    role: 'IT Manager, Mandaluyong',
    highlight: 'TechFix – IT Support',
    highlightColor: '#e1d5fa',
    highlightText: '#6c3fcf',
    avatarBg: '#e1d5fa',
    avatarText: '#6c3fcf',
    text: '"TechFix set up our entire CCTV and network infrastructure in one day. The technician was knowledgeable and courteous. Will book again!"',
    mini: 'TechFix set up our entire CCTV and network infrastructure in one day. The technicia...'
  },
  {
    initials: 'MG',
    name: 'Mark Gonzales',
    role: 'Homeowner, Quezon City',
    highlight: 'HomeFix – Renovation',
    highlightColor: '#ffe082',
    highlightText: '#23406e',
    avatarBg: '#ffe082',
    avatarText: '#23406e',
    text: '"HomeFix transformed our bathroom in just 4 days. The tiling was perfect, no leaks, and the team cleaned up after. Excellent work!"',
    mini: 'HomeFix transformed our bathroom in just 4 days. The tiling was perfect, no leaks, and...'
  },
];

// --- CORE ICONS ---
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import ShieldIcon from '@mui/icons-material/Shield';
import PersonIcon from '@mui/icons-material/Person';

import { servicesData } from '../constants/servicesData';
import api from '../services/apiService';

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

// Map Topology Data
const mapCities = [
  { id: 'Valenzuela', points: '80,60 150,50 180,100 130,130 90,110', lx: 125, ly: 85 },
  { id: 'Caloocan', points: '150,50 240,30 280,80 250,130 180,100', lx: 220, ly: 75 },
  { id: 'Navotas', points: '60,90 90,110 80,150 100,190 70,220 40,160', lx: 55, ly: 155 },
  { id: 'Malabon', points: '90,110 130,130 120,160 100,190 80,150', lx: 105, ly: 145 },
  { id: 'Caloocan', points: '130,130 180,100 200,140 170,180 120,160', lx: 160, ly: 145 },
  { id: 'Quezon City', points: '180,100 250,130 280,80 360,110 370,180 330,280 250,310 240,270 240,240 210,240 180,180 200,140', lx: 260, ly: 190 },
  { id: 'Marikina', points: '360,110 420,120 390,200 350,190 370,180', lx: 380, ly: 155 },
  { id: 'Manila', points: '100,190 120,160 170,180 180,180 210,240 190,270 190,310 150,330 130,320 70,220', lx: 135, ly: 245 },
  { id: 'San Juan', points: '210,240 240,240 240,270 190,270', lx: 215, ly: 255 },
  { id: 'Mandaluyong', points: '190,270 240,270 250,310 190,310', lx: 220, ly: 290 },
  { id: 'Pasig', points: '240,240 330,280 350,260 340,340 290,330 270,330 250,310 240,270', lx: 300, ly: 300 },
  { id: 'Makati', points: '150,330 190,310 250,310 270,330 260,350 260,360 210,390 140,370', lx: 200, ly: 340 },
  { id: 'Pasay', points: '60,300 130,320 150,330 140,370 120,410 50,390', lx: 95, ly: 355 },
  { id: 'Taguig', points: '270,330 340,340 320,430 240,460 210,390 260,360', lx: 275, ly: 390 },
  { id: 'Parañaque', points: '120,410 140,370 210,390 240,460 220,510 110,480', lx: 175, ly: 440 },
  { id: 'Las Piñas', points: '110,480 220,510 180,570 80,540', lx: 145, ly: 520 },
  { id: 'Muntinlupa', points: '180,570 220,510 240,460 260,480 250,560 210,680 150,650', lx: 205, ly: 590 },
];

const LandingPage = () => {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const handlePrev = () => setTestimonialIdx((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  const handleNext = () => setTestimonialIdx((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  const { isAuthenticated, role } = useAuth();

  const handleBookNowClick = () => {
    console.log("[CAVEMAN] Book Now button clicked! Auth state:", { isAuthenticated, role });
    if (isAuthenticated) {
      if (role === 'customer') {
        navigate('/customer/book');
      } else {
        navigate(role === 'admin' ? '/admin/bookings' : role === 'vendor' ? '/vendor/bookings' : '/personnel/bookings');
      }
    } else {
      navigate('/login');
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    console.log("[CAVEMAN] LandingPage hero section optimized with increased font sizes, reduced margins, tightened spacing, and preserved illustration size!");
  }, []);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeServiceIdx, setActiveServiceIdx] = useState(0);
  const [cyclingIconIdx, setCyclingIconIdx] = useState(0);
  const [colorCycleIdx, setColorCycleIdx] = useState(0);
  const [services, setServices] = useState(servicesData);
  const navigate = useNavigate();

  useEffect(() => {
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
        }
      })
      .catch(err => console.error("Failed to load services", err));
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // If services array is empty, do nothing
    if (services.length === 0) return;
    const iconInterval = setInterval(() => {
      setCyclingIconIdx((prev) => (prev >= services.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(iconInterval);
  }, [services.length]);

  useEffect(() => {
    const colorInterval = setInterval(() => {
      setColorCycleIdx((prev) => (prev === 2 ? 0 : prev + 1));
    }, 1500);
    return () => clearInterval(colorInterval);
  }, []);


  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Why AllFix', href: '#why-allfix' },
    { label: 'Service Area', href: '#service-area' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Become Our Partner', href: '/register-vendor' },
  ];

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('/')) {
      window.scrollTo(0, 0);
      window.location.pathname = href;
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      const offsetTop = el.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  const footerPills = [
    { name: 'CoolFix', icon: <path d="M19.5 12h-15M17.5 16h-11M21.5 8h-15" strokeWidth="2" strokeLinecap="round" /> },
    { name: 'SaniFix', icon: <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
    { name: 'HomeFix', icon: <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 9.36l-7.1 7.1a1 1 0 01-1.42 0l-1.4-1.4a1 1 0 010-1.42l7.1-7.1a6 6 0 019.36-7.94l-3.77 3.77z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
    { name: 'MoveFix', icon: <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
    { name: 'GreenFix', icon: <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM11 20v-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
    { name: 'HealthFix', icon: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
    { name: 'SpaceFix', icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
    { name: 'PetFix', icon: <><circle cx="5.5" cy="8.5" r="1.5" strokeWidth="2" /><circle cx="10" cy="5" r="1.5" strokeWidth="2" /><circle cx="14" cy="5" r="1.5" strokeWidth="2" /><circle cx="18.5" cy="8.5" r="1.5" strokeWidth="2" /><path d="M12 18c-3 0-5-1.5-5-4 0-1.5 2-4 5-4s5 2.5 5 4c0 2.5-2 4-5 4z" strokeWidth="2" /></> },
    { name: 'TechFix', icon: <><rect x="4" y="4" width="16" height="16" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></> },
  ];

  return (
    <>
      <CssBaseline />
      <Box sx={{ width: '100%', overflowX: 'hidden' }}>

        {/* ===================== NAVBAR ===================== */}
        <Navbar isLandingPage />

        {/* ===================== HERO SECTION ===================== */}
        <Box sx={{ position: 'relative', pt: { xs: 8, sm: 9, lg: 11 }, pb: { xs: 4, sm: 5, lg: 6 }, minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', backgroundImage: "linear-gradient(135deg, #06101E 0%, #0B1E36 100%)" }}>
          <Box sx={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")", backgroundRepeat: 'repeat', pointerEvents: 'none', zIndex: 0 }} />
          <Box sx={{ position: 'absolute', top: 80, left: 40, width: 288, height: 288, background: 'radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(96px)', opacity: 0.4, pointerEvents: 'none', zIndex: 0 }} />
          <Box sx={{ position: 'absolute', bottom: 80, right: 40, width: 288, height: 288, background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(96px)', opacity: 0.4, pointerEvents: 'none', zIndex: 0 }} />
          <Box sx={{ position: 'absolute', top: '15%', right: '-10%', width: { xs: 300, sm: 450, lg: 550 }, height: { xs: 300, sm: 450, lg: 550 }, background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.9, pointerEvents: 'none', zIndex: 1 }} />

          <Box sx={{ width: '100%', position: 'relative', zIndex: 10, px: { xs: 2, sm: 4, md: 5 } }}>
            <Grid container spacing={4} sx={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
              <Grid size={{ xs: 12, lg: 7 }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: { xs: 'center', lg: 'flex-start' }, gap: { xs: 2.2, sm: 2.5, lg: 3 }, textAlign: { xs: 'center', lg: 'left' }, pl: { xs: 0, lg: 4, xl: 8 } }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.0, backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '9999px', px: 2.5, py: 0.8, mb: 0, backdropFilter: 'blur(10px)', width: 'fit-content' }}>
                  <Box sx={{ width: 8, height: 8, bgcolor: '#4ade80', borderRadius: '50%' }} />
                  <Typography sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem', lg: '1.05rem' }, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'white' }}>
                    Manila's #1 Home Services Platform
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: { xs: '2.8rem', sm: '3.6rem', lg: '4.4rem', xl: '5.2rem' }, fontWeight: 900, color: 'white', mb: 0.5, lineHeight: 1.15 }}>
                  Hassle-Free <br /> Property Care, <br /> Done Right.
                </Typography>
                <Typography sx={{ fontSize: { xs: '1.15rem', sm: '1.25rem', lg: '1.35rem' }, color: 'rgba(191, 219, 254, 1)', mb: 2.5, lineHeight: 1.6, maxWidth: { xs: '90%', sm: '100%', lg: '620px' } }}>
                  From aircon cleaning to plumbing, repairs to IT support — AllFix connects you with trusted, verified professionals across Metro Manila.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: { xs: 2, sm: 3, lg: 4 }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, lg: 2 } }}>
                    <CheckCircleIcon sx={{ width: { xs: 24, sm: 32, lg: 40 }, height: { xs: 24, sm: 32, lg: 40 }, color: '#4ade80', flexShrink: 0 }} />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ color: 'white', fontWeight: 900, fontSize: { xs: '0.95rem', sm: '1.35rem', lg: '1.65rem' } }}>5,000+</Typography>
                      <Typography sx={{ color: 'rgba(191, 219, 254, 1)', fontSize: { xs: '0.75rem', sm: '1.0rem', lg: '1.2rem' } }}>Verified Pros</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, lg: 2 } }}>
                    <StarIcon sx={{ width: { xs: 24, sm: 32, lg: 40 }, height: { xs: 24, sm: 32, lg: 40 }, color: '#facc15', flexShrink: 0, fill: '#facc15' }} />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ color: 'white', fontWeight: 900, fontSize: { xs: '0.95rem', sm: '1.35rem', lg: '1.65rem' } }}>4.9★</Typography>
                      <Typography sx={{ color: 'rgba(191, 219, 254, 1)', fontSize: { xs: '0.75rem', sm: '1.0rem', lg: '1.2rem' } }}>Average Rating</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, lg: 2 } }}>
                    <ShieldIcon sx={{ width: { xs: 24, sm: 32, lg: 40 }, height: { xs: 24, sm: 32, lg: 40 }, color: '#60a5fa', flexShrink: 0 }} />
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography sx={{ color: 'white', fontWeight: 900, fontSize: { xs: '0.95rem', sm: '1.35rem', lg: '1.65rem' } }}>Insured &</Typography>
                      <Typography sx={{ color: 'rgba(191, 219, 254, 1)', fontSize: { xs: '0.75rem', sm: '1.0rem', lg: '1.2rem' } }}>Accredited</Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, lg: 5 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '520px', lg: '580px', xl: '640px' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mt: { xs: -3, lg: -14, xl: -20 }
                  }}
                >
                  <img
                    src="/images/cleaning-illustration.png"
                    alt="AllFix Services Illustration"
                    style={{
                      width: '100%',
                      height: 'auto',
                      filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.45))',
                      borderRadius: '24px',
                      objectFit: 'contain'
                    }}
                  />
                  
                  <Button
                    variant="contained"
                    onClick={handleBookNowClick}
                    sx={{
                      mt: 2.5,
                      width: '100%',
                      maxWidth: '320px',
                      bgcolor: '#041E41',
                      color: '#FFFFFF',
                      border: '2px solid #FFFFFF',
                      fontWeight: 900,
                      fontSize: '1.25rem',
                      py: 1.6,
                      px: 4,
                      borderRadius: '50px',
                      textTransform: 'none',
                      boxShadow: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#FFFFFF',
                        color: '#041E41',
                        borderColor: '#FFFFFF',
                        boxShadow: '0 8px 24px rgba(255, 255, 255, 0.2)'
                      }
                    }}
                  >
                    Book Now
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>


        {/* ===================== SERVICES SECTION ===================== */}
        <Box id="services" sx={{ position: 'relative', zIndex: 10, bgcolor: '#ffffff', pt: { xs: 6, lg: 6 }, pb: { xs: 6, lg: 8 }, minHeight: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <Container maxWidth="xl">
            <Box sx={{ textAlign: 'center', mb: 2.5 }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#eaf2fc', color: '#23406e', borderRadius: '999px', px: 3, py: 1, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.08em', boxShadow: 1, textTransform: 'uppercase', mb: 2 }}>OUR SERVICES</Box>
              <Typography sx={{ fontSize: { xs: '1.6rem', sm: '2.2rem', lg: '2rem' }, fontWeight: 900, mb: 2, lineHeight: 1.2 }}>
                Expert Brands, <span style={{ color: '#10355f' }}>One Trusted Platform</span>
              </Typography>
              <Typography sx={{ color: '#666', fontSize: { xs: '0.85rem', sm: '1rem', lg: '0.9rem' }, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>
                Each AllFix brand specializes in a distinct service area, staffed by trained, background-checked professionals with industry certifications.
              </Typography>
            </Box>

            <Box sx={{ width: '100%', mt: 1.5 }}>
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
                sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'center', mt: 2 }}>{services.map((service, index) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: '100%', maxWidth: '420px', display: 'flex' }}>
                      <ServiceCard service={service} onServiceClick={(svc) => { navigate(`/services/${svc.id}`); window.scrollTo(0, 0); }} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>
        </Box>
        {/* ===================== HOW IT WORKS ===================== */}
        <Box id="how-it-works" sx={{ position: 'relative', zIndex: 10, bgcolor: '#f8fafc', pt: { xs: 6, lg: 8 }, pb: { xs: 8, lg: 4 }, px: { xs: 2, sm: 4, lg: 6 }, minHeight: { lg: '100vh' }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: { xs: 4, lg: 1.5 } }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#eaf2fc', color: '#23406e', borderRadius: '999px', px: 3, py: 1, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.08em', boxShadow: 1, textTransform: 'uppercase', mb: 1.5 }}>
                SIMPLE PROCESS
              </Box>
              <Typography sx={{ fontSize: { xs: '1.8rem', sm: '2.4rem' }, fontWeight: 900, mb: 1, lineHeight: 1.2, color: '#10355f' }}>
                Fixed in <span style={{ color: '#10355f' }}>3 Easy Steps</span>
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '600px', mx: 'auto', lineHeight: 1.5 }}>
                We designed the booking process to be as frictionless as possible so you can get back to what matters.
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: { xs: 1.5, sm: 2 } }}>

              {/* STEP 1 */}
              <Box sx={{ bgcolor: '#10355f', borderRadius: '24px', p: { xs: 3, sm: 4, lg: 2.5 }, color: 'white', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(1, 117, 80, 0.15)' }}>
                <Box sx={{ bgcolor: 'white', color: '#10355f', px: 1.5, py: 0.3, borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, width: 'fit-content', mb: 1.5 }}>Step 1</Box>
                <Typography sx={{ fontSize: { xs: '1.3rem', sm: '1.6rem', lg: '1.5rem' }, fontWeight: 900, mb: 1, lineHeight: 1.2 }}>Choose a Service</Typography>
                <Typography sx={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.5, mb: 2, maxWidth: '90%' }}>
                  Select the type of work you need from our specialized brands. Browse by category or search directly.
                </Typography>
                <Box sx={{ mt: 'auto', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '16px', p: 2, border: '1px solid rgba(255,255,255,0.2)', animation: 'float1 4s ease-in-out infinite', '@keyframes float1': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } } }}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', position: 'relative' }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      <Box sx={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', animation: 'swipeIcon 0.6s ease-in-out', '@keyframes swipeIcon': { '0%': { transform: 'translateX(100%)', opacity: 0 }, '50%': { opacity: 1 }, '100%': { transform: 'translateX(0)', opacity: 1 } }, key: cyclingIconIdx }}>
                        {services[cyclingIconIdx] ? React.createElement(services[cyclingIconIdx].icon, { sx: { color: '#10355f', fontSize: '1.2rem' } }) : null}
                      </Box>
                    </Box>
                    <Box>
                      <Box sx={{ height: 10, width: 100, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2, mb: 1 }} />
                      <Box sx={{ height: 6, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 2, animation: 'loadingBar 2s ease-in-out infinite', '@keyframes loadingBar': { '0%, 100%': { width: '50px' }, '50%': { width: '90px' } } }} />
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* STEP 2 */}
              <Box sx={{ bgcolor: '#10355f', borderRadius: '24px', p: { xs: 3, sm: 4, lg: 2.5 }, color: '#ffffff', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(252, 188, 38, 0.15)' }}>
                <Box sx={{ bgcolor: 'white', color: '#10355f', px: 1.5, py: 0.3, borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, width: 'fit-content', mb: 1.5 }}>Step 2</Box>
                <Typography sx={{ fontSize: { xs: '1.3rem', sm: '1.6rem', lg: '1.5rem' }, fontWeight: 900, mb: 1, lineHeight: 1.2 }}>Book a Service</Typography>
                <Typography sx={{ fontSize: '0.85rem', opacity: 0.85, lineHeight: 1.5, mb: 2, maxWidth: '90%' }}>
                  Schedule your service instantly with just a few clicks. Fast, easy, and convenient booking tailored to your calendar.
                </Typography>
                <Box sx={{ mt: 'auto', bgcolor: 'rgba(255, 255, 255, 0.23)', borderRadius: '16px', p: 2, border: '1px solid rgba(255, 255, 255, 0.33)', animation: 'float2 5s ease-in-out infinite', '@keyframes float2': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } } }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, mb: 1.5, color: '#fcfcfc' }}>Select Date</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {[{ label: 'Mon', color: '#0e933f', idx: 0 }, { label: 'Tue', color: '#facc15', idx: 1 }, { label: 'Wed', color: '#ef4444', idx: 2 }].map((item) => {
                      const isActive = colorCycleIdx === item.idx;
                      return (
                        <Box key={item.label} sx={{ bgcolor: isActive ? item.color : 'white', color: isActive ? (item.color === '#facc15' ? '#ffffff' : 'white') : '#10355f', px: 1.5, py: 1, borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, boxShadow: isActive ? `0 4px 12px ${item.color}40` : 'none', transition: 'all 0.5s ease' }}>
                          {item.label}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Box>

              {/* STEP 3 — spans 2 cols on sm+ */}
              <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' }, bgcolor: '#10355f', borderRadius: '24px', p: { xs: 3, sm: 5, lg: 2.5 }, color: 'white', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 2 }, alignItems: 'center', boxShadow: '0 10px 30px rgba(216, 36, 43, 0.15)' }}>
                <Box sx={{ flex: 1, width: '100%' }}>
                  <Box sx={{ bgcolor: 'white', color: '#10355f', px: 1.5, py: 0.3, borderRadius: '999px', fontSize: '0.7rem', fontWeight: 800, width: 'fit-content', mb: 1.5 }}>Step 3</Box>
                  <Typography sx={{ fontSize: { xs: '1.4rem', sm: '1.8rem' }, fontWeight: 900, mb: 1, lineHeight: 1.2 }}>Sit Back, It's Done</Typography>
                  <Typography sx={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.5, mb: 2, maxWidth: '95%' }}>
                    A background-checked AllFix pro arrives on schedule, completes the job, and you pay only when satisfied.
                  </Typography>
                  <Box onClick={handleBookNowClick} sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, color: 'white', fontWeight: 900, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { gap: 1.5, opacity: 0.8 } }}>
                    Start Booking
                    <ArrowForwardIcon sx={{ fontSize: '1.1rem', transition: 'transform 0.3s ease' }} />
                  </Box>
                </Box>
                <Box sx={{ flex: 1, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', maxWidth: '300px', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '16px', p: 2, border: '1px solid rgba(255,255,255,0.2)', position: 'relative', animation: 'float3 4.5s ease-in-out infinite', '@keyframes float3': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PersonIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
                      </Box>
                      <Box>
                        <Box sx={{ height: 10, width: 100, bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 2, mb: 1 }} />
                        <Box sx={{ height: 6, width: 60, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 2 }} />
                      </Box>
                    </Box>
                    <Box sx={{ height: 40, width: '100%', bgcolor: 'rgba(255,255,255,0.15)', borderRadius: '12px' }} />
                    <Box sx={{ position: 'absolute', bottom: -15, right: -15, bgcolor: 'white', color: '#10355f', px: 2, py: 1, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1, boxShadow: '0 8px 20px rgba(0,0,0,0.2)', animation: 'floatPop 3s ease-in-out infinite', '@keyframes floatPop': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(4px)' } } }}>
                      <CheckCircleIcon sx={{ fontSize: 20, color: '#10355f' }} />
                      <Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, lineHeight: 1 }}>Job Complete</Typography>
                        <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: '#666', mt: 0.5 }}>5-Star Rated</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* ===================== WHY ALLFIX ===================== */}
        <Box id="why-allfix" sx={{ width: '100vw', position: 'relative', left: '50%', right: '50%', ml: '-50vw', mr: '-50vw', bgcolor: '#fff', pt: { xs: 8, lg: 12 }, pb: { xs: 8, lg: 10 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
          <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 5, lg: 6 } }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 6, lg: 8, xl: 10 }, alignItems: 'center' }}>

              {/* Mobile pill — xs through md */}
              <Box sx={{ display: { xs: 'inline-flex', lg: 'none' }, alignItems: 'center', backgroundColor: '#f0f4f8', color: '#10355f', borderRadius: '999px', px: 3, py: 1, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.08em', boxShadow: 1, textTransform: 'uppercase', alignSelf: 'flex-start', mb: -3, zIndex: 5 }}>
                <Box sx={{ width: 6, height: 6, bgcolor: '#10355f', borderRadius: '50%', mr: 1.5 }} />
                Why Choose Us?
              </Box>

              {/* LEFT: Image */}
              <Box sx={{ width: { xs: '90%', sm: '100%', lg: '42%' }, position: 'relative', ml: { xs: 3, lg: 4 } }}>
                <Box sx={{ position: 'relative', width: '100%', height: { xs: 320, sm: 480, lg: 440, xl: 480 }, borderRadius: { xs: '80px 24px 24px 0px', lg: '100px 32px 32px 0px' }, backgroundColor: '#eaf2fc', overflow: 'hidden', display: 'flex', justifyContent: 'flex-end', boxShadow: '0 20px 40px rgba(16,53,95,0.08)' }}>
                  <img src="https://images.unsplash.com/photo-1686178827149-6d55c72d81df?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="AllFix Professional at Work" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
                <Box sx={{ position: 'absolute', bottom: { xs: -20, lg: -30 }, left: { xs: -20, lg: -30 }, width: { xs: 60, lg: 85 }, height: { xs: 60, lg: 85 }, zIndex: 2 }}>
                  <Box sx={{ position: 'absolute', top: '35%', left: 0, width: '100%', height: '30%', backgroundColor: '#10355f', borderRadius: '6px' }} />
                  <Box sx={{ position: 'absolute', top: 0, left: '35%', width: '30%', height: '100%', backgroundColor: '#10355f', borderRadius: '6px' }} />
                </Box>
              </Box>

              {/* RIGHT: Content */}
              <Box sx={{ width: { xs: '100%', lg: '55%' } }}>
                {/* Desktop pill — lg+ only */}
                <Box sx={{ display: { xs: 'none', lg: 'inline-flex' }, alignItems: 'center', backgroundColor: '#f0f4f8', color: '#10355f', borderRadius: '999px', px: 3, py: 1, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.08em', boxShadow: 1, textTransform: 'uppercase', mb: 3 }}>
                  <Box sx={{ width: 6, height: 6, bgcolor: '#10355f', borderRadius: '50%', mr: 1.5 }} />
                  Why Choose Us?
                </Box>
                <Typography sx={{ fontWeight: 900, fontSize: { xs: '2rem', sm: '2.8rem', xl: '2.8rem' }, color: '#000', lineHeight: 1.15, mb: 1 }}>
                  Hassle-Free Property Care
                </Typography>
                <Box sx={{ display: 'inline-block', bgcolor: '#eef4fd', color: '#10355f', px: 2, py: 0.5, borderRadius: '12px', mb: 3 }}>
                  <Typography sx={{ fontWeight: 900, fontSize: { xs: '2rem', sm: '2.8rem', xl: '2.8rem' }, lineHeight: 1.15 }}>Guaranteed</Typography>
                </Box>
                <Typography sx={{ color: '#42526e', fontSize: { xs: '0.9rem', sm: '1.05rem', lg: '1rem' }, mb: 5, lineHeight: 1.6, maxWidth: '95%' }}>
                  AllFix is the Philippines' most trusted property care platform, connecting you with verified professionals for all your home and office needs. Our vetted technicians provide high-quality services, from aircon cleaning to full home renovations, ensuring comfort and safety.
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: { xs: 4, sm: 5, lg: 3 }, mt: 2 }}>
                  {[
                    { title: 'On-Time Guaranteed', desc: 'A service discount automatically if late by over 15 mins.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10355f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg> },
                    { title: 'Verified Professionals', desc: 'Background-checked and vetted before joining the network. All clearances checked.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10355f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></svg> },
                    { title: 'Transparent Pricing', desc: 'Detailed fixed quotes with no hidden charges. Pay only what was agreed.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10355f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg> },
                    { title: 'Insured Protection', desc: 'Third-party liability insurance coverage included with every job. Peace of mind.', icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10355f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg> },
                  ].map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, pt: 0.5 }}>
                        {item.icon}
                        <Box sx={{ width: '100%', height: '2px', bgcolor: '#10355f', mt: 1 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: '#000', fontSize: '1.05rem', mb: 0.5 }}>{item.title}</Typography>
                        <Typography sx={{ color: '#666', fontSize: '0.85rem', lineHeight: 1.5, pr: 1 }}>{item.desc}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* ===================== MAP SECTION ===================== */}
        <Box id="service-area" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: '#f0f4f8', py: { xs: 8, lg: 10 }, position: 'relative', overflow: 'hidden' }}>
          <Container maxWidth="lg" sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <Typography variant="h2" sx={{ fontWeight: '900', color: '#10355f', fontSize: { xs: '2rem', sm: '2.5rem', lg: '2.8rem' }, mb: 1 }}>
              Available in Metro Manila!
            </Typography>
            <Typography color="#666" sx={{ fontSize: '1.1rem', mb: 2 }}>
              Enjoy fast, reliable home services with AllFix wherever you are in the Metro.
            </Typography>
            <Box sx={{ position: 'relative', width: '100%', maxWidth: { xs: '100%', sm: '550px', lg: '650px' }, mx: 'auto', mt: 4, aspectRatio: '5/7' }}>
              <Box sx={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                <svg viewBox="0 0 500 700" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0px 10px 20px rgba(16, 53, 95, 0.15))' }}>
                  {mapCities.map((city, idx) => (
                    <polygon key={idx} points={city.points} fill="#10355f" stroke="#ffffff" strokeWidth="2.5" strokeLinejoin="round" style={{ transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.fill = '#10355f'; e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.transformOrigin = `${city.lx}px ${city.ly}px`; }} onMouseLeave={(e) => { e.currentTarget.style.fill = '#10355f'; e.currentTarget.style.transform = 'scale(1)'; }} />
                  ))}
                </svg>
              </Box>
              <Box sx={{ position: 'absolute', inset: 0, zIndex: 2 }}>
                {mapCities.map((loc, idx) => (
                  <Box key={idx} sx={{ position: 'absolute', top: `${(loc.ly / 700) * 100}%`, left: `${(loc.lx / 500) * 100}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translate(-50%, -55%) scale(1.1)', zIndex: 10 } }}>
                    <Box sx={{ width: { xs: 28, sm: 40, lg: 54 }, height: { xs: 28, sm: 40, lg: 54 }, borderRadius: '50%', bgcolor: 'rgba(255, 255, 255, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <Box sx={{ width: { xs: 20, sm: 28, lg: 40 }, height: { xs: 20, sm: 28, lg: 40 }, borderRadius: '50%', bgcolor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10355f', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
                        <LocationOnIcon sx={{ fontSize: { xs: '0.7rem', sm: '1rem', lg: '1.25rem' } }} />
                      </Box>
                    </Box>
                    <Typography sx={{ fontWeight: '900', color: '#10355f', fontSize: { xs: '0.55rem', sm: '0.65rem', lg: '0.8rem' }, mt: 0.5, bgcolor: '#ffffff', px: { xs: 0.6, sm: 1.0, lg: 1.2 }, py: { xs: 0.1, sm: 0.2, lg: 0.3 }, borderRadius: '999px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}>
                      {loc.id}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#e2e8f0', color: '#1e293b', px: 2.5, py: 0.8, borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, mt: 6 }}>
              <Box sx={{ width: 8, height: 8, bgcolor: '#10b981', borderRadius: '50%' }} />
              More areas coming soon!
            </Box>
          </Container>
        </Box>

        {/* ===================== TESTIMONIALS ===================== */}
        <Box id="testimonials" sx={{ position: 'relative', left: '50%', right: '50%', ml: '-50vw', mr: '-50vw', width: '100vw', bgcolor: '#0d264a', pt: { xs: 8, lg: 10 }, pb: { xs: 8, lg: 10 }, mt: 0, mb: 0, px: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', overflow: 'hidden' }}>
          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#23406e', color: 'white', borderRadius: '999px', px: 2.5, py: 0.8, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.08em', boxShadow: 1, textTransform: 'uppercase', mb: 1.5 }}>CLIENT STORIES</Box>
              <Typography sx={{ fontSize: { xs: '1.75rem', sm: '2.2rem', lg: '2rem' }, fontWeight: 900, color: 'white', mb: 1, lineHeight: 1.2 }}>Trusted by Thousands of Filipino Homeowners</Typography>
              <Typography sx={{ color: 'rgba(191, 219, 254, 1)', fontSize: { xs: '0.85rem', sm: '1rem', lg: '0.9rem' }, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>Real reviews from verified clients across Metro Manila. We let our work do the talking.</Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
              <Box sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 8px 32px rgba(16,53,95,0.18)', p: { xs: 2.5, sm: 4, lg: 3 }, width: { xs: '90vw', sm: '540px', lg: '500px' }, maxWidth: '500px', height: { xs: '280px', sm: '220px' }, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', mb: 1.5, position: 'relative' }}>
                <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1.5, mb: 1 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', background: testimonials[testimonialIdx].avatarBg, color: testimonials[testimonialIdx].avatarText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>{testimonials[testimonialIdx].initials}</Box>
                  <Box sx={{ textAlign: 'left', flex: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 900, color: '#10355f', fontSize: '1rem', mb: 0 }}>{testimonials[testimonialIdx].name}</Typography>
                      <Typography sx={{ color: '#42526e', fontSize: '0.85rem', fontWeight: 400 }}>{testimonials[testimonialIdx].role}</Typography>
                    </Box>
                    <Box sx={{ bgcolor: testimonials[testimonialIdx].highlightColor, color: testimonials[testimonialIdx].highlightText, borderRadius: '999px', px: 1.5, py: 0.4, fontWeight: 700, fontSize: '0.85rem', textAlign: 'center' }}>{testimonials[testimonialIdx].highlight}</Box>
                  </Box>
                  <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'absolute', top: 16, right: 20 }}>
                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="0" y="24" fontSize="32" fill="#eaf2fc">"</text></svg>
                  </Box>
                </Box>
                <Typography sx={{ color: '#222', fontSize: '1rem', fontWeight: 500, mt: 1.5, mb: 1, lineHeight: 1.6, textAlign: 'left' }}>{testimonials[testimonialIdx].text}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                <Button onClick={handlePrev} sx={{ minWidth: 0, p: 0.8, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.12)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg></Button>
                <Box sx={{ display: 'flex', gap: 0.8 }}>{testimonials.map((_, idx) => (<Box key={idx} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'white', opacity: testimonialIdx === idx ? 0.8 : 0.4 }} />))}</Box>
                <Button onClick={handleNext} sx={{ minWidth: 0, p: 0.8, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.12)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></Button>
              </Box>
            </Box>

            {/* Mini testimonial cards — desktop only (lg+) */}
            <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'row', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 3, width: '100%', maxWidth: '1000px', mx: 'auto' }}>
              {testimonials.map((t, idx) => (
                <Box key={t.initials} sx={{ bgcolor: 'rgba(255,255,255,0.10)', borderRadius: 2, p: 1.5, minWidth: 200, maxWidth: 240, color: 'white', fontWeight: 700, boxShadow: '0 2px 8px rgba(16,53,95,0.10)', border: testimonialIdx === idx ? '2px solid #eaf2fc' : '2px solid transparent', display: 'flex', flexDirection: 'column', gap: 0.8, opacity: testimonialIdx === idx ? 1 : 0.7, transition: 'border 0.2s, opacity 0.2s' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: t.avatarBg, color: t.avatarText, fontWeight: 900, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.initials}</Box>
                    <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '0.85rem' }}>{t.name}</Typography>
                  </Box>
                  <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.mini}</Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* ===================== CONTACT SECTION ===================== */}
        <Box id="contact-us" sx={{ position: 'relative', left: '50%', right: '50%', ml: '-50vw', mr: '-50vw', width: '100vw', bgcolor: '#f8fafc', py: { xs: 8, sm: 10, lg: 0 }, minHeight: { lg: '100vh' }, display: 'flex', alignItems: 'center', borderTop: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '100%', background: 'linear-gradient(135deg, rgba(46,91,168,0.04) 0%, rgba(16,53,95,0.06) 100%)', borderBottomLeftRadius: '100%', zIndex: 0 }} />
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'center', justifyContent: { xs: 'center', lg: 'space-between' }, gap: { xs: 4, sm: 5, lg: 4, xl: 8 }, width: '100%', maxWidth: { xs: '100%', sm: '650px', lg: '100%' }, mx: 'auto' }}>

              {/* Left: Info */}
              <Box sx={{ width: { xs: '100%', lg: '45%' }, maxWidth: { xs: '100%', sm: '600px', lg: '100%' }, mx: { xs: 'auto', lg: 0 } }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#eaf2fc', color: '#23406e', borderRadius: '8px', px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 2 }}>Reach Out</Box>
                <Typography sx={{ fontSize: { xs: '2rem', sm: '2.8rem', lg: '2.5rem', xl: '3.2rem' }, fontWeight: 900, color: '#10355f', mb: 2, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                  Let's get in <br /><span style={{ color: '#2e5ba8' }}>touch.</span>
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: { xs: '0.9rem', sm: '1.05rem', lg: '0.9rem' }, mb: 4, lineHeight: 1.6 }}>
                  Whether you need help booking a pro, have questions about our services, or want to partner with AllFix, our team is ready to assist you.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 4px 12px rgba(16,53,95,0.04)', border: '1px solid #e2e8f0', width: '100%', maxWidth: { xs: '100%', sm: '420px', lg: '340px' } }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#eaf2fc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e5ba8', flexShrink: 0 }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </Box>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>EMAIL US</Typography>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#10355f', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>inquiry@allfix.ph</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 4px 12px rgba(16,53,95,0.04)', border: '1px solid #e2e8f0', width: '100%', maxWidth: { xs: '100%', sm: '420px', lg: '340px' } }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#eaf2fc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e5ba8', flexShrink: 0 }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>CALL US</Typography>
                      <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#10355f' }}>+63 920 9631 217</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Right: Form */}
              <Box sx={{ width: { xs: '100%', lg: '50%' }, maxWidth: { xs: '100%', sm: '600px', lg: '100%' }, mx: { xs: 'auto', lg: 0 } }}>
                <Box sx={{ bgcolor: '#ffffff', borderRadius: '20px', p: { xs: 3, sm: 5, lg: 4 }, boxShadow: '0 20px 40px rgba(16,53,95,0.08)', border: '1px solid #eaf2fc' }}>
                  <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', lg: '1.4rem' }, fontWeight: 900, color: '#10355f', mb: 0.5, letterSpacing: '-0.01em' }}>Send a direct message</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 3 }}>Fill out the form below and our support team will respond shortly.</Typography>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ width: '100%' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#10355f', mb: 0.8 }}>Full Name</Typography>
                      <TextField size="small" fullWidth placeholder="e.g. Juan Dela Cruz" sx={{ width: '100%', '& .MuiOutlinedInput-root': { width: '100%', bgcolor: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#cbd5e1' }, '&.Mui-focused fieldset': { borderColor: '#2e5ba8', borderWidth: '2px' } } }} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }} sx={{ width: '100%' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#10355f', mb: 0.8 }}>Email Address</Typography>
                      <TextField size="small" fullWidth placeholder="juan@email.com" sx={{ width: '100%', '& .MuiOutlinedInput-root': { width: '100%', bgcolor: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#cbd5e1' }, '&.Mui-focused fieldset': { borderColor: '#2e5ba8', borderWidth: '2px' } } }} />
                    </Grid>
                    <Grid size={{ xs: 12 }} sx={{ width: '100%' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#10355f', mb: 0.8 }}>How can we help?</Typography>
                      <TextField fullWidth multiline rows={4} placeholder="Tell us about your concern..." sx={{ width: '100%', '& .MuiOutlinedInput-root': { width: '100%', bgcolor: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#cbd5e1' }, '&.Mui-focused fieldset': { borderColor: '#2e5ba8', borderWidth: '2px' } } }} />
                    </Grid>
                  </Grid>
                  <Button fullWidth variant="contained" endIcon={<ArrowForwardIcon sx={{ ml: 0.5, fontSize: '1.1rem' }} />} sx={{ mt: 3.5, py: 1.5, bgcolor: '#10355f', color: 'white', borderRadius: '8px', fontWeight: 800, fontSize: '0.9rem', textTransform: 'none', boxShadow: '0 4px 12px rgba(16,53,95,0.2)', transition: 'all 0.2s ease', '&:hover': { bgcolor: '#0d264a', transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(16,53,95,0.3)' } }}>
                    Submit Message
                  </Button>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* ===================== FOOTER ===================== */}
        <Footer />

      </Box>
    </>
  );
};

export default LandingPage;