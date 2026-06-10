import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  TextField,
  CssBaseline,
  IconButton
} from '@mui/material';

import { motion } from 'framer-motion';

// --- Shared Components & Context ---
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { useAuth } from '../context/AuthContext';
import { servicesData } from '../constants/servicesData';
import api from '../services/apiService';

// --- Icons ---
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShieldIcon from '@mui/icons-material/Shield';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Testimonial {
  initials: string;
  name: string;
  role: string;
  highlight: string;
  highlightColor: string;
  highlightText: string;
  avatarBg: string;
  avatarText: string;
  text: string;
  mini: string;
}

interface HowItWorksStep {
  title: string;
  desc: string;
  img: string;
}

interface MapCity {
  id: string;
  points: string;
  lx: number;
  ly: number;
}

interface CityDetail {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  services: string[];
}

export interface ServiceItem {
  id: string;
  brand: string;
  tagline: string;
  description: string;
  image: string;
  accent: string;
  accentDark: string;
  headerBg: string;
  headerBgLight: string;
  pillText: string;
  services: string[];
  subServices?: any[]; // Accepts both strings and backend objects to prevent overlap errors
  icon: React.ElementType;
}

// ==========================================
// STATIC DATA
// ==========================================

const testimonials: Testimonial[] = [
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

const howItWorksSteps: HowItWorksStep[] = [
  {
    title: "Choose a Service",
    desc: "Browse our list of specialized brands and select the service that fits your exact property needs.",
    img: ""
  },
  {
    title: "Book a Service",
    desc: "Set your preferred date and time, provide your location, and secure your booking with upfront pricing.",
    img: ""
  },
  {
    title: "Sit Back, It's Done",
    desc: "Our vetted professionals handle the rest. Track their progress and enjoy a hassle-free experience.",
    img: ""
  }
];

const serviceSubServices: Record<string, string[]> = {
  'CoolFix': ['AC Cleaning', 'Installation', 'Gas Recharge', 'Emergency Repair'],
  'SaniFix': ['Deep Cleaning', 'Sanitization', 'Disinfection', 'Odor Removal'],
  'HomeFix': ['Renovation', 'Repairs', 'Handyman', 'Maintenance'],
  'MoveFix': ['Packing', 'Loading', 'Transport', 'Unpacking'],
  'GreenFix': ['Waste Audit', 'Recycling', 'Composting', 'Eco Consultation'],
  'HealthFix': ['Air Quality', 'Water Testing', 'Pest Control', 'Wellness Checks'],
  'SpaceFix': ['Interior Design', 'Space Planning', 'Organization', 'Furniture Setup'],
  'PoolFix': ['Cleaning', 'Maintenance', 'Filter Replacement', 'Water Testing'],
  'TechFix': ['PC Setup', 'WiFi Help', 'Smart Home', 'Device Repair'],
};

const allServices: string[] = ['CoolFix', 'SaniFix', 'HomeFix', 'MoveFix', 'GreenFix', 'HealthFix', 'SpaceFix', 'PoolFix', 'TechFix'];

const mapCities: MapCity[] = [
  { id: 'Valenzuela', points: '80,60 150,50 180,100 130,130 90,110', lx: 125, ly: 85 },
  { id: 'North Caloocan', points: '150,50 240,30 280,80 250,130 180,100', lx: 220, ly: 75 },
  { id: 'Navotas', points: '60,90 90,110 80,150 100,190 70,220 40,160', lx: 55, ly: 155 },
  { id: 'Malabon', points: '90,110 130,130 120,160 100,190 80,150', lx: 105, ly: 145 },
  { id: 'South Caloocan', points: '130,130 180,100 200,140 180,180 170,180 120,160', lx: 160, ly: 145 },
  { id: 'Quezon City', points: '180,100 250,130 280,80 360,110 370,180 330,280 250,310 240,270 240,240 210,240 180,180 200,140', lx: 260, ly: 190 },
  { id: 'Marikina', points: '360,110 420,120 390,200 350,190 370,180', lx: 380, ly: 155 },
  { id: 'Manila', points: '100,190 120,160 170,180 180,180 210,240 190,270 190,310 150,330 130,320 70,220', lx: 135, ly: 245 },
  { id: 'San Juan', points: '210,240 240,240 240,270 190,270', lx: 215, ly: 255 },
  { id: 'Mandaluyong', points: '190,270 240,270 250,310 190,310', lx: 220, ly: 290 },
  { id: 'Pasig', points: '240,240 330,280 350,260 340,340 290,330 270,330 250,310 240,270', lx: 300, ly: 300 },
  { id: 'Makati', points: '150,330 190,310 250,310 270,330 260,350 260,360 210,390 140,370', lx: 200, ly: 340 },
  { id: 'Pasay', points: '60,300 130,320 150,330 140,370 120,410 50,390', lx: 95, ly: 355 },
  { id: 'Taguig', points: '270,330 340,340 320,430 240,460 210,390 260,360 260,350', lx: 275, ly: 390 },
  { id: 'Parañaque', points: '120,410 140,370 210,390 240,460 220,510 110,480', lx: 175, ly: 440 },
  { id: 'Las Piñas', points: '110,480 220,510 180,570 80,540', lx: 145, ly: 520 },
  { id: 'Muntinlupa', points: '180,570 220,510 240,460 260,480 250,560 210,680 150,650', lx: 205, ly: 590 },
];

const cityDetails: Record<string, CityDetail> = {
  "Default": {
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    title: "Metro Manila Coverage",
    subtitle: "Planning & Operations",
    description: "Hover over a pin on the map to see specific services, coverage details, and availability in your city.",
    services: []
  },
  "Valenzuela": {
    image: "https://s3.cloudstoragesg.com/dotph/asset/97f98052-ee52-404c-8c7a-3f4be1b4a529.jpg",
    title: "Valenzuela Service Area",
    subtitle: "Growing Coverage",
    description: "Professional home and commercial services available throughout Valenzuela with quick response times.",
    services: ["CoolFix", "SaniFix", "HomeFix", "TechFix"]
  },
  "North Caloocan": {
    image: "https://www.dmcihomes.com/uploads/news/why-invest-in-dmci-homes-the-calinea-place-1693457748303.jpg",
    title: "North Caloocan Service Area",
    subtitle: "Full Coverage",
    description: "Comprehensive AllFix services for residential and commercial properties in Caloocan.",
    services: ["CoolFix", "SaniFix", "HomeFix", "HealthFix", "TechFix", "SpaceFix"]
  },
  "South Caloocan": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Andres_Bonifacio_Monument%2C_Caloocan%2C_Aug_2025.jpg/1280px-Andres_Bonifacio_Monument%2C_Caloocan%2C_Aug_2025.jpg",
    title: "South Caloocan Service Area",
    subtitle: "Full Coverage",
    description: "Comprehensive AllFix services for residential and commercial properties in Caloocan.",
    services: ["CoolFix", "SaniFix", "HomeFix", "HealthFix", "TechFix"]
  },
  "Navotas": {
    image: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2d/JfNavotasCityHallAlmacenRoadsMetroManilafvf_15.JPG/250px-JfNavotasCityHallAlmacenRoadsMetroManilafvf_15.JPG",
    title: "Navotas Service Area",
    subtitle: "Coastal Coverage",
    description: "Specialized services tailored for Navotas residential communities and fish port areas.",
    services: ["SaniFix", "CoolFix", "HealthFix"]
  },
  "Malabon": {
    image: "https://pia.gov.ph/wp-content/uploads/2025/04/malabon-city-hall-jeannie-sandoval.jpg",
    title: "Malabon Service Area",
    subtitle: "Standard Coverage",
    description: "Reliable home maintenance and repair services throughout Malabon.",
    services: ["CoolFix", "HomeFix", "SaniFix", "MoveFix"]
  },
  "Quezon City": {
    image: "https://upload.wikimedia.org/wikipedia/commons/9/97/The_Heart_of_Quezon_City.jpg",
    title: "Quezon City Service Area",
    subtitle: "Full Coverage",
    description: "Fast and reliable home repairs, cleaning, and maintenance available across all barangays in Quezon City.",
    services: ["CoolFix", "SaniFix", "HomeFix", "MoveFix", "GreenFix", "HealthFix", "SpaceFix", "PoolFix", "TechFix"]
  },
  "Marikina": {
    image: "https://upload.wikimedia.org/wikipedia/commons/3/34/Marikina_City_Clock_Tower_Arch%2C_May_2026_%281%29.jpg",
    title: "Marikina Service Area",
    subtitle: "Premium Coverage",
    description: "Expert services for Marikina's upscale residential and commercial establishments.",
    services: ["CoolFix", "SaniFix", "HomeFix", "SpaceFix", "TechFix", "HealthFix"]
  },
  "Manila": {
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/7e/97/7e/manila-city-hall-taken.jpg?w=1400&h=-1&s=1",
    title: "City of Manila Coverage",
    subtitle: "Historic & Commercial",
    description: "Comprehensive property care available for both heritage homes and modern high-rises in Manila.",
    services: ["CoolFix", "SaniFix", "HomeFix", "MoveFix", "TechFix"]
  },
  "San Juan": {
    image: "https://www.colliers.com/-/media/images/colliers/asia/philippines/colliers-blog/viewpoint_san-juan-real-estate_hero-image.ashx?bid=5d5b8e667264442389b47df6d025a604",
    title: "San Juan Service Area",
    subtitle: "Standard Coverage",
    description: "Dedicated home services for San Juan's growing residential communities.",
    services: ["CoolFix", "HomeFix", "SaniFix", "TechFix"]
  },
  "Mandaluyong": {
    image: "https://res.klook.com/image/upload/fl_lossy.progressive,q_60/Mobile/City/zfh0bwhox5wp3ldchujt.jpg",
    title: "Mandaluyong Service Area",
    subtitle: "Full Coverage",
    description: "Premium maintenance and cleaning services for Mandaluyong's business and residential districts.",
    services: ["CoolFix", "SaniFix", "HomeFix", "HealthFix", "SpaceFix", "TechFix"]
  },
  "Pasig": {
    image: "https://res.klook.com/image/upload/fl_lossy.progressive,q_60/Mobile/City/vgm9gpuvopozgoporoo7.jpg",
    title: "Pasig City Services",
    subtitle: "Full Coverage",
    description: "Rapid response times for Ortigas Center and neighboring residential barangays.",
    services: ["CoolFix", "SaniFix", "HomeFix", "MoveFix", "TechFix", "HealthFix", "SpaceFix"]
  },
  "Makati": {
    image: "https://www.vistaresidences.com.ph/assets/img/why-makati-city-is-best-place-to-live-in-for-working-people.png",
    title: "Makati City Service Area",
    subtitle: "Premium Coverage",
    description: "Expert personnel ready to serve residential and commercial properties in the central business district.",
    services: ["CoolFix", "SaniFix", "HomeFix", "SpaceFix", "HealthFix", "TechFix", "PoolFix"]
  },
  "Pasay": {
    image: "https://federalland.ph/app/uploads/2025/07/snapshot-of-the-bay-area-pasay-city-philippines.jpg.webp",
    title: "Pasay Service Area",
    subtitle: "Commercial Coverage",
    description: "Specialized services for Pasay's commercial and entertainment establishments.",
    services: ["CoolFix", "SaniFix", "TechFix", "HomeFix"]
  },
  "Taguig": {
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/View_from_Grand_Hyatt_Manila_overlooking_Bonifacio_Global_City_and_Makati_skylines_at_sunset.jpg/330px-View_from_Grand_Hyatt_Manila_overlooking_Bonifacio_Global_City_and_Makati_skylines_at_sunset.jpg",
    title: "Taguig & BGC Area",
    subtitle: "Corporate & Residential",
    description: "Top-tier maintenance and deep cleaning tailored for BGC condominiums and commercial spaces.",
    services: ["CoolFix", "SaniFix", "HomeFix", "SpaceFix", "TechFix", "HealthFix", "PoolFix"]
  },
  "Parañaque": {
    image: "https://res.klook.com/image/upload/fl_lossy.progressive,q_60/Mobile/City/ompe3zwy9qhcj1lrehxa.jpg",
    title: "Parañaque Service Area",
    subtitle: "Full Coverage",
    description: "Complete home and property maintenance services throughout Parañaque.",
    services: ["CoolFix", "SaniFix", "HomeFix", "MoveFix", "GreenFix", "TechFix"]
  },
  "Las Piñas": {
    image: "https://www.dmcihomes.com/uploads/optimized/Robinsons-Las-Pinas-Mall-one-of-the-city-s-key-lifestyle-centers-68b8fe1a0f3fc.jpg",
    title: "Las Piñas Service Area",
    subtitle: "Coastal Coverage",
    description: "Professional services for Las Piñas residential and commercial properties.",
    services: ["CoolFix", "HomeFix", "SaniFix", "MoveFix"]
  },
  "Muntinlupa": {
    image: "https://www.visitphilippines.org/wp-content/uploads/2016/04/Visit-Philippines-Muntinlupa.jpg",
    title: "Muntinlupa Service Area",
    subtitle: "Growing Coverage",
    description: "Expanding AllFix services for Muntinlupa's developing communities and industrial areas.",
    services: ["CoolFix", "HomeFix", "SaniFix"]
  }
};

// Map Helper Method
const getCityDetails = (cityId: string): CityDetail => {
  let details = cityDetails[cityId];

  if (!details) {
    if (cityId === "Default") return cityDetails["Default"];
    details = {
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      title: `${cityId} Service Area`,
      subtitle: "Standard Coverage",
      description: `Comprehensive AllFix property care and maintenance services are fully available throughout ${cityId}.`,
      services: ["CoolFix", "SaniFix", "HomeFix", "TechFix"]
    };
  } else {
    details = { ...details };
  }

  try {
    const normalizeId = (id: string) =>
      id.toLowerCase()
        .replace(/ñ/g, 'n')
        .replace(/\s+/g, '-');

    const localKey = `area_services_${normalizeId(cityId)}`;
    const saved = localStorage.getItem(localKey);
    console.log(`[getCityDetails] Checking localStorage for key: ${localKey}`);
    console.log(`[getCityDetails] Raw saved value:`, saved);
    if (saved) {
      const parsed = JSON.parse(saved);
      const activeServices = Object.keys(parsed).filter(k => parsed[k]);
      console.log(`[getCityDetails] Parsed active services:`, activeServices);
      details.services = activeServices;
    }
  } catch (e) {
    console.error(`[getCityDetails] Error parsing localStorage:`, e);
  }

  return details;
};

const POPUP_W = 300;
const POPUP_H = 310;

// ==========================================
// SUB COMPONENTS
// ==========================================

interface NavigationPillsProps {
  services: ServiceItem[];
  activeServiceIdx: number;
  setActiveServiceIdx: (idx: number) => void;
}

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
            onClick={() => setActiveServiceIdx(idx)}
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

interface ServiceCardProps {
  service: ServiceItem;
  onServiceClick: (service: ServiceItem) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onServiceClick }) => {
  const [hovered, setHovered] = useState<boolean>(false);
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
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={service.image}
          alt={service.brand}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 10%',
            transition: 'opacity 0.5s ease',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </div>

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


// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth() as { isAuthenticated: boolean, role: string };

  const [dynamicTestimonials, setDynamicTestimonials] = useState<any[]>([]);
  const [testimonialIdx, setTestimonialIdx] = useState<number>(0);

  // Direct Message states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactStatus, setContactStatus] = useState<'success' | 'error' | null>(null);
  const [contactStatusMsg, setContactStatusMsg] = useState('');

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactStatus('error');
      setContactStatusMsg('Please fill in all fields.');
      return;
    }

    setContactSubmitting(true);
    setContactStatus(null);
    setContactStatusMsg('');

    try {
      const response = await api.post('/api/support/contact', {
        name: contactName.trim(),
        email: contactEmail.trim(),
        message: contactMessage.trim()
      });

      setContactStatus('success');
      setContactStatusMsg(response.data?.message || 'Your message has been sent successfully!');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    } catch (err: any) {
      console.error('Contact form submission failed:', err);
      const errMsg = err.response?.data?.message || 'Failed to send message. Please try again later.';
      setContactStatus('error');
      setContactStatusMsg(errMsg);
    } finally {
      setContactSubmitting(false);
    }
  };

  const colors = [
    { bg: '#eaf2fc', text: '#23406e' },
    { bg: '#e1d5fa', text: '#6c3fcf' },
    { bg: '#ffe082', text: '#805b00' },
    { bg: '#e6f4ea', text: '#137333' }
  ];

  const mapReviewsToTestimonials = (fetchedReviews: any[]) => {
    if (!fetchedReviews || fetchedReviews.length === 0) return [];
    return fetchedReviews.map((r, idx) => {
      const color = colors[idx % colors.length];
      const initials = r.customer_name ? r.customer_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2) : 'AF';
      const cleanText = r.feedback || '';
      const miniText = cleanText.length > 70 ? cleanText.substring(0, 70) + '...' : cleanText;
      return {
        id: r.id,
        initials,
        customer_name: r.customer_name || 'Verified Customer',
        feedback: cleanText,
        rating: r.rating || 5,
        name: r.customer_name || 'Verified Customer',
        role: 'Verified Client',
        highlight: r.service_type || 'Premium Care',
        highlightColor: color.bg,
        highlightText: color.text,
        avatarBg: color.bg,
        avatarText: color.text,
        text: `"${cleanText}"`,
        mini: miniText
      };
    });
  };

  useEffect(() => {
    const fetchFeatured = () => {
      api.get('/api/reviews/featured')
        .then(res => {
          const liveFeatured = (res.data || []).filter((r: any) => r.featured === true || r.featured === 'true');
          const mapped = mapReviewsToTestimonials(liveFeatured);

          setDynamicTestimonials(prev => {
            const prevIds = prev.map(p => p.id).join(',');
            const newIds = mapped.map(m => m.id).join(',');
            if (prevIds !== newIds) {
              return mapped;
            }
            return prev;
          });
        })
        .catch(err => {
          console.error('Failed to fetch featured reviews:', err);
        });
    };

    fetchFeatured();
    const interval = setInterval(fetchFeatured, 5000);
    return () => clearInterval(interval);
  }, []);

  const displayTestimonials = dynamicTestimonials;

  useEffect(() => {
    if (displayTestimonials.length > 0 && testimonialIdx >= displayTestimonials.length) {
      setTestimonialIdx(0);
    }
  }, [displayTestimonials.length, testimonialIdx]);

  const handlePrev = () => setTestimonialIdx((prev) => (displayTestimonials.length > 0 ? (prev === 0 ? displayTestimonials.length - 1 : prev - 1) : 0));
  const handleNext = () => setTestimonialIdx((prev) => (displayTestimonials.length > 0 ? (prev === displayTestimonials.length - 1 ? 0 : prev + 1) : 0));

  const [activeHowItWorksIdx, setActiveHowItWorksIdx] = useState<number>(0);
  const [selectedHowItWorksStep, setSelectedHowItWorksStep] = useState<number | null>(null);

  // --- Service Area Map State ---
  const mapWrapperRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [popupCity, setPopupCity] = useState<CityDetail | null>(null);
  const [popupPos, setPopupPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [imageLoadState, setImageLoadState] = useState<Record<string, boolean>>({});
  const [selectedPopupService, setSelectedPopupService] = useState<string | null>(null);
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [activeMapCity, setActiveMapCity] = useState<string>("Default");

  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activeServiceIdx, setActiveServiceIdx] = useState<number>(0);
  const [services, setServices] = useState<ServiceItem[]>(servicesData as ServiceItem[]);

  useEffect(() => {
    api.get('/api/services')
      .then(res => {
        const backendServices = res.data;
        const merged: ServiceItem[] = [];

        backendServices.forEach((backendService: any) => {
          const id = backendService.id || backendService.name.toLowerCase().replace(/\s+/g, '');
          const frontendMatch = servicesData.find(
            svc => svc.id.toLowerCase() === id.toLowerCase() || svc.brand.toLowerCase() === backendService.name.toLowerCase()
          );

          if (frontendMatch) {
            merged.push({
              ...(frontendMatch as ServiceItem),
              id,
              description: backendService.description,
              tagline: backendService.tagline || frontendMatch.tagline,
              image: backendService.imageUrl || backendService.image || frontendMatch.image,
              services: backendService.subServices ? backendService.subServices.map((sub: any) => sub.name || sub) : [],
              subServices: backendService.subServices || frontendMatch.subServices || [],
            } as ServiceItem);
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
              services: backendService.subServices ? backendService.subServices.map((sub: any) => sub.name || sub) : [],
              subServices: backendService.subServices || [],
            } as ServiceItem);
          }
        });

        servicesData.forEach((fs) => {
          if (!merged.find(m => m.id.toLowerCase() === fs.id.toLowerCase())) {
            merged.push(fs as ServiceItem);
          }
        });

        if (merged.length > 0) {
          setServices(merged);
        }
      })
      .catch(err => console.error("Failed to load services", err));
  }, []);

  // Preload map images
  useEffect(() => {
    const preloadImages = () => {
      Object.entries(cityDetails).forEach(([city, details]) => {
        const img = new Image();
        img.onload = () => setImageLoadState((prev) => ({ ...prev, [city]: true }));
        img.onerror = () => setImageLoadState((prev) => ({ ...prev, [city]: false }));
        img.src = details.image;
      });
    };
    preloadImages();
  }, []);

  // Responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Map popup closing logic on scroll
      const testimonialsEl = document.getElementById('testimonials');
      const whyAllFixEl = document.getElementById('why-allfix');
      let shouldClose = false;

      if (testimonialsEl) {
        const rect = testimonialsEl.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) shouldClose = true;
      }
      if (whyAllFixEl) {
        const rect = whyAllFixEl.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) shouldClose = true;
      }
      if (shouldClose) {
        setPopupCity(null);
        setSelectedPopupService(null);
        setSelectedPinId(null);
        setActiveMapCity("Default");
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Map Interaction Handlers ---
  const positionPopup = (pinEl: HTMLElement) => {
    const pinRect = pinEl.getBoundingClientRect();
    const vw = window.innerWidth;

    const pinCenterX = pinRect.left + pinRect.width / 2;
    const pinCenterY = pinRect.top + pinRect.height / 2;

    let y = pinCenterY - POPUP_H - 16;
    if (y < 80) y = pinCenterY + pinRect.height + 16;

    let x = pinCenterX - POPUP_W / 2;
    x = Math.max(12, Math.min(x, vw - POPUP_W - 12));

    setPopupPos({ x, y });
  };

  const handlePinEnter = (e: React.MouseEvent<HTMLElement>, loc: MapCity) => {
    if (isMobile) return;
    setActiveMapCity(loc.id);

    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    hoverTimeoutRef.current = setTimeout(() => {
      const details = getCityDetails(loc.id);
      setPopupCity(details);
      positionPopup(e.currentTarget);
    }, 2500);
  };

  const handlePinLeave = () => {
    if (isMobile) return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (selectedPinId) return;

    setActiveMapCity('Default');
    setPopupCity(null);
    setSelectedPopupService(null);
  };

  // Custom storage sync effect so the map updates IN REAL TIME if the admin toggles it in another tab!
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!selectedPinId && !activeMapCity) return;
      const targetCity = selectedPinId || activeMapCity;
      if (targetCity === 'Default') return;

      const normalizeId = (id: string) =>
        id.toLowerCase()
          .replace(/ñ/g, 'n')
          .replace(/\s+/g, '-');

      const expectedKey = `area_services_${normalizeId(targetCity)}`;
      if (e.key === expectedKey || e.key === 'global_custom_services') {
        const updatedDetails = getCityDetails(targetCity);
        setPopupCity(updatedDetails);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedPinId, activeMapCity]);

  // For same-tab updates (since 'storage' event only fires across tabs)
  useEffect(() => {
    const targetCity = selectedPinId || activeMapCity;
    if (targetCity && targetCity !== 'Default') {
      const interval = setInterval(() => {
        const currentDetails = getCityDetails(targetCity);
        // Deep compare services array to avoid infinite renders
        setPopupCity(prev => {
          if (!prev) return currentDetails;
          const prevServices = [...(prev.services || [])].sort().join(',');
          const newServices = [...(currentDetails.services || [])].sort().join(',');
          if (prevServices !== newServices) {
            return currentDetails;
          }
          return prev;
        });
      }, 1000); // Check every second if the user is testing in the SAME tab/window
      return () => clearInterval(interval);
    }
  }, [selectedPinId, activeMapCity]);

  const handlePinClick = (e: React.MouseEvent<HTMLElement>, loc: MapCity) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setActiveMapCity(loc.id);
    setSelectedPinId(loc.id);
    const details = getCityDetails(loc.id);
    setPopupCity(details);

    if (!isMobile) positionPopup(e.currentTarget);
  };

  const handleMapClick = () => {
    setPopupCity(null);
    setActiveMapCity('Default');
    setSelectedPinId(null);
    setSelectedPopupService(null);
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ width: '100%', overflowX: 'hidden' }}>

        {/* ===================== NAVBAR ===================== */}
        <Navbar isLandingPage />

        {/* ===================== HERO SECTION ===================== */}
        <Box
          sx={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            pt: { xs: 8, md: 0 },
            bgcolor: '#10355f'
          }}
        >
          {/* BACKGROUND IMAGE */}
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1567361809214-b97d828071d9?q=80&w=897&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="AllFix Professional at Work"
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: { xs: '100%', md: '50%' },
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              zIndex: 0,
            }}
          />

          {/* LEFT HALF / MOBILE OVERLAY */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: { xs: '100%', md: '50%' },
              bgcolor: {
                xs: 'rgba(16, 53, 95, 0.90)',
                md: '#10355f'
              },
              zIndex: 1,
            }}
          />

          {/* RIGHT HALF DESKTOP/TABLET: Top header overlay for menu legibility */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: { xs: '100%', md: '50%' },
              height: '64px',
              bgcolor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 1,
              display: { xs: 'none', md: 'block' }
            }}
          />

          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 10, height: '100%', px: { xs: 3, sm: 6, md: 6, lg: 8 } }}>
            <Grid
              container
              sx={{
                width: '100%',
                minHeight: '100vh',
                alignItems: 'center',
                alignContent: 'center'
              }}
            >
              {/* TEXT CONTENT (LEFT SIDE) */}
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', pr: { md: 4, lg: 8 }, pt: { xs: 6, md: 10, lg: 12 }, pb: { xs: 5, md: 0 } }}>

                {/* Bold multi-colored brand accent line */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
                  <Box sx={{ width: 64, height: 8, bgcolor: '#017550', borderRadius: '8px' }} />
                  <Box sx={{ width: 64, height: 8, bgcolor: '#fcbc26', borderRadius: '8px' }} />
                  <Box sx={{ width: 64, height: 8, bgcolor: '#d8242b', borderRadius: '8px' }} />
                </Box>
                <Typography
                  sx={{
                    fontSize: { xs: '3rem', sm: '4rem', md: '4.2rem', lg: '5rem', xl: '5.5rem' },
                    fontWeight: 800,
                    color: 'white',
                    mb: 3,
                    lineHeight: 1.05,
                    letterSpacing: '-0.03em'
                  }}
                >
                  Every Service You Need, <br />
                  <Box component="span" sx={{ color: '#ffffff' }}>
                    All in{' '}
                    <Box component="span" sx={{ color: '#017550' }}>O</Box>
                    <Box component="span" sx={{ color: '#fcbc26' }}>n</Box>
                    <Box component="span" sx={{ color: '#d8242b' }}>e</Box>
                    {' '}Place.
                  </Box>
                </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.25rem', lg: '1.35rem' },
                    color: 'rgba(255, 255, 255, 0.85)',
                    mb: { xs: 4, md: 5 },
                    lineHeight: 1.6,
                    maxWidth: '580px',
                    fontWeight: 400
                  }}
                >
                  From deep cleaning and renovations to IT support, moving, and aircon repair—AllFix connects you with Metro Manila's most trusted professionals for literally any task.
                </Typography>

              </Grid>

              {/* CALL-TO-ACTION BUTTONS (RIGHT SIDE) */}
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pb: { xs: 8, md: 0 } }}>
                <Box
                  sx={{
                    bgcolor: 'rgba(0, 0, 0, 0.45)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: '16px',
                    p: { xs: 3, sm: 4 },
                    width: '90%',
                    maxWidth: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
                    ml: { lg: 6, xl: 8 },
                  }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => { navigate('/register'); window.scrollTo(0, 0); }}
                    sx={{
                      bgcolor: '#10355f',
                      color: 'white',
                      fontWeight: 900,
                      fontSize: '1rem',
                      py: 2,
                      borderRadius: '8px',
                      textTransform: 'none',
                      boxShadow: '0 8px 20px rgba(66, 95, 163, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: '#0a2342',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 24px rgba(66, 95, 163, 0.5)',
                      }
                    }}
                  >
                    Book Now
                  </Button>

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => { navigate('/vendor-apply'); window.scrollTo(0, 0); }}
                    sx={{
                      bgcolor: 'transparent',
                      color: 'white',
                      border: '1px solid rgba(255, 255, 255, 0.6)',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '1rem',
                      py: 1.8,
                      textTransform: 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'white',
                      }
                    }}
                  >
                    Become Our Partner
                  </Button>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textAlign: 'center',
                      mt: 1.5,
                      fontSize: '0.95rem',
                      fontWeight: 500,
                    }}
                  >
                    Already have an account?{' '}
                    <Box
                      component="span"
                      onClick={() => { navigate('/login', { state: { from: '/' } }); window.scrollTo(0, 0); }}
                      sx={{
                        color: '#ffffffff',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-block',
                        '&:hover': {
                          textDecoration: 'underline',
                        }
                      }}
                    >
                      Sign In
                    </Box>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* ===================== SERVICES SECTION ===================== */}
        <Box id="services" sx={{ scrollMarginTop: { xs: '80px', md: '100px' }, position: 'relative', zIndex: 10, bgcolor: '#ffffff', pt: { xs: 6, lg: 6 }, pb: { xs: 6, lg: 8 }, minHeight: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
          <Container maxWidth="xl">
            <Box sx={{ textAlign: 'center', mb: 2.5 }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#eaf2fc', color: '#23406e', borderRadius: '999px', px: 3, py: 1, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.08em', boxShadow: 1, textTransform: 'uppercase', mb: 2 }}>OUR SERVICES</Box>
              <Typography sx={{ fontWeight: 900, mb: 2, lineHeight: 1.2, fontSize: { xs: '1.6rem', sm: '2.2rem', lg: '2rem' } }}>
                <span style={{ color: '#10355f' }}>All In One Trusted Platform</span>
              </Typography>
              <Typography sx={{ color: '#666', maxWidth: '600px', mx: 'auto', lineHeight: 1.6, fontSize: { xs: '0.85rem', sm: '1rem', lg: '0.9rem' } }}>
                Each AllFix brand specializes in a distinct service area, staffed by trained, background-checked professionals with industry certifications.
              </Typography>
            </Box>

            <Box sx={{ width: '100%', mt: 1.5 }}>
              <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', alignItems: 'center', width: '100%' }}>
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
                <NavigationPills
                  services={services}
                  activeServiceIdx={activeServiceIdx}
                  setActiveServiceIdx={setActiveServiceIdx}
                />
              </Box>

              <Grid container rowSpacing={3} columnSpacing={1.5} sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'center', mt: 2 }}>
                {services.map((service, index) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0, x: index % 3 === 0 ? -80 : index % 3 === 2 ? 80 : 0, y: index % 3 === 1 ? 50 : 0 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      sx={{ width: '100%', maxWidth: '420px', display: 'flex' }}
                    >
                      <ServiceCard service={service} onServiceClick={(svc) => { navigate(`/services/${svc.id}`); window.scrollTo(0, 0); }} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Container>
        </Box>

        {/* ===================== HOW IT WORKS ===================== */}
        <Box id="how-it-works" sx={{ scrollMarginTop: { xs: '80px', md: '100px' }, position: 'relative', zIndex: 10, bgcolor: '#f8fafc', pt: { xs: 6, lg: 8 }, pb: { xs: 8, lg: 12 }, px: { xs: 2, sm: 4, lg: 6 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2 } }}>
            <Box sx={{ textAlign: 'center', px: { xs: 2, sm: 0 }, mb: { xs: 5, sm: 6, lg: 8 } }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#eaf2fc', color: '#23406e', borderRadius: '999px', px: 3, py: 1, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.08em', boxShadow: 1, textTransform: 'uppercase', mb: 1.5 }}>
                SIMPLE PROCESS
              </Box>
              <Typography sx={{ fontWeight: 900, mb: 1, lineHeight: 1.2, color: '#10355f', fontSize: { xs: '1.8rem', sm: '2.4rem' } }}>
                Fixed in <span style={{ color: '#10355f' }}>3 Easy Steps</span>
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '600px', mx: 'auto', lineHeight: 1.5 }}>
                We designed the booking process to be as frictionless as possible so you can get back to what matters.
              </Typography>
            </Box>

            <Grid
              container
              spacing={{ xs: 0, sm: 3 }}
              id="how-it-works-scroll"
              onScroll={(e: React.UIEvent<HTMLDivElement>) => {
                const container = e.currentTarget;
                const scrollLeft = container.scrollLeft;
                const itemWidth = container.clientWidth;
                const newIdx = Math.round(scrollLeft / itemWidth);
                if (newIdx !== activeHowItWorksIdx) {
                  setActiveHowItWorksIdx(newIdx);
                }
              }}
              sx={{
                justifyContent: { xs: 'flex-start', md: 'center' },
                flexWrap: { xs: 'nowrap', sm: 'wrap' },
                overflowX: { xs: 'auto', sm: 'visible' },
                scrollSnapType: { xs: 'x mandatory', sm: 'none' },
                scrollBehavior: 'smooth',
                '&::-webkit-scrollbar': { display: 'none' },
                pb: { xs: 2, sm: 0 },
              }}
            >
              {howItWorksSteps.map((step, index) => (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4 }}
                  key={index}
                  sx={{
                    minWidth: { xs: '100%', sm: 'auto' },
                    scrollSnapAlign: 'start',
                    px: { xs: 2, sm: 0 },
                  }}
                  onMouseEnter={() => setSelectedHowItWorksStep(index)}
                  onMouseLeave={() => setSelectedHowItWorksStep(null)}
                  onClick={() => setSelectedHowItWorksStep(selectedHowItWorksStep === index ? null : index)}
                >
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%', position: 'relative' }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, alignItems: 'center', justifyContent: 'center', width: { xs: '100%', sm: '240px' }, height: { xs: 'auto', sm: '220px' }, mb: { xs: 3, sm: 0 }, zIndex: 2 }}>
                      <Box sx={{ display: { xs: 'flex', sm: 'none' }, bgcolor: '#10355f', color: 'white', minWidth: 44, width: 44, height: 44, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', mr: 2, flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>{index + 1}</Typography>
                      </Box>
                      <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        whileHover={{ scale: 1.05, y: -15 }}
                        transition={{ duration: 1.5, delay: index * 0.2, type: "spring", bounce: 0.4 }}
                        sx={{
                          width: { xs: 180, sm: 240 },
                          height: { xs: 180, sm: 220 },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        {step.title === "Sit Back, It's Done" ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 680.83858 584.23207" xmlnsXlink="http://www.w3.org/1999/xlink">
                            <path d="M310.70569,694.02818a24.21459,24.21459,0,0,0,23.38269-4.11877c8.18977-6.87441,10.758-18.196,12.8467-28.68191l6.17973-31.01657-12.9377,8.90837c-9.30465,6.40641-18.81826,13.01866-25.26011,22.29785s-9.25223,21.94707-4.07792,31.988" transform="translate(-259.58071 -157.88396)" fill="#e6e6e6" />
                            <path d="M312.7034,733.73874c-1.62839-11.86368-3.30382-23.88078-2.15884-35.87167,1.01467-10.64932,4.26373-21.04881,10.87831-29.57938a49.20592,49.20592,0,0,1,12.62466-11.44039c1.26215-.79648,2.42409,1.20354,1.16733,1.997a46.77949,46.77949,0,0,0-18.50446,22.32562c-4.02857,10.24607-4.67545,21.41582-3.98154,32.3003.41944,6.58218,1.31074,13.1212,2.20588,19.65251a1.19817,1.19817,0,0,1-.808,1.42251,1.16348,1.16348,0,0,1-1.42253-.808Z" transform="translate(-259.58071 -157.88396)" fill="#f2f2f2" />
                            <path d="M324.42443,714.70229a17.82513,17.82513,0,0,0,15.53141,8.01862c7.8644-.37318,14.41806-5.85973,20.31713-11.07027l17.452-15.4088-11.54987-.55281c-8.30619-.39784-16.82672-.771-24.73813,1.79338s-15.20758,8.72639-16.654,16.91541" transform="translate(-259.58071 -157.88396)" fill="#e6e6e6" />
                            <path d="M308.10042,740.55843c7.83972-13.87142,16.93234-29.28794,33.1808-34.21552a37.02609,37.02609,0,0,1,13.95545-1.441c1.48189.128,1.11179,2.41174-.367,2.28454a34.39833,34.39833,0,0,0-22.27164,5.89215c-6.27994,4.27453-11.16975,10.21755-15.30781,16.51907-2.53511,3.86051-4.80576,7.88445-7.07642,11.903C309.48824,742.78513,307.36641,741.85759,308.10042,740.55843Z" transform="translate(-259.58071 -157.88396)" fill="#f2f2f2" />
                            <path d="M935.3957,569.31654H503.18092a5.03014,5.03014,0,0,1-5.02359-5.02359V162.90754a5.03017,5.03017,0,0,1,5.02359-5.02358H935.3957a5.03017,5.03017,0,0,1,5.02359,5.02358V564.292a5.02922,5.02922,0,0,1-5.02359,5.02359Z" transform="translate(-259.58071 -157.88396)" fill="#fff" />
                            <path d="M935.3957,569.31654H503.18092a5.03014,5.03014,0,0,1-5.02359-5.02359V162.90754a5.03017,5.03017,0,0,1,5.02359-5.02358H935.3957a5.03017,5.03017,0,0,1,5.02359,5.02358V564.292a5.02922,5.02922,0,0,1-5.02359,5.02359ZM503.18092,159.88944a3.01808,3.01808,0,0,0-3.01152,3.01151V564.292a3.01808,3.01808,0,0,0,3.01152,3.01152H935.3957a3.01717,3.01717,0,0,0,3.01153-3.01152V162.90754a3.01809,3.01809,0,0,0-3.01153-3.01151Z" transform="translate(-259.58071 -157.88396)" fill="#cacaca" />
                            <path d="M707.41023,262.18528a3.41053,3.41053,0,0,0,0,6.82105H894.55305a3.41053,3.41053,0,0,0,0-6.82105Z" transform="translate(-259.58071 -157.88396)" fill="#e4e4e4" />
                            <path d="M707.41023,282.65037a3.41054,3.41054,0,0,0,0,6.82106h95.54019a3.41054,3.41054,0,0,0,0-6.82106Z" transform="translate(-259.58071 -157.88396)" fill="#e4e4e4" />
                            <path d="M543.84146,392.7046a3.41054,3.41054,0,0,0,0,6.82106h350.8937a3.41054,3.41054,0,0,0,0-6.82106Z" transform="translate(-259.58071 -157.88396)" fill="#e4e4e4" />
                            <path d="M543.84146,413.1697a3.41054,3.41054,0,0,0,0,6.82106H803.13254a3.41054,3.41054,0,0,0,0-6.82106Z" transform="translate(-259.58071 -157.88396)" fill="#e4e4e4" />
                            <path d="M543.84146,433.17177a3.41054,3.41054,0,0,0,0,6.82106h350.8937a3.41054,3.41054,0,0,0,0-6.82106Z" transform="translate(-259.58071 -157.88396)" fill="#e4e4e4" />
                            <path d="M543.84146,453.63687a3.41054,3.41054,0,0,0,0,6.82106H803.13254a3.41054,3.41054,0,0,0,0-6.82106Z" transform="translate(-259.58071 -157.88396)" fill="#e4e4e4" />
                            <path d="M543.84146,474.17177a3.41054,3.41054,0,0,0,0,6.82106h350.8937a3.41054,3.41054,0,0,0,0-6.82106Z" transform="translate(-259.58071 -157.88396)" fill="#e4e4e4" />
                            <path d="M543.84146,494.63687a3.41054,3.41054,0,0,0,0,6.82106H803.13254a3.41054,3.41054,0,0,0,0-6.82106Z" transform="translate(-259.58071 -157.88396)" fill="#e4e4e4" />
                            <path d="M599.41943,324.82812a49,49,0,1,1,48.99952-49A49.05567,49.05567,0,0,1,599.41943,324.82812Z" transform="translate(-259.58071 -157.88396)" fill="#10355f" />
                            <path d="M450.67833,510.10041a12.24754,12.24754,0,0,0-14.953-11.36231l-16.19641-22.82521-16.27138,6.45945,23.32519,31.91237a12.31392,12.31392,0,0,0,24.09559-4.1843Z" transform="translate(-259.58071 -157.88396)" fill="#a0616a" />
                            <path d="M419.11211,508.40888l-49.00774-63.57777L388.46714,387.12c1.34563-14.50936,10.425-18.56089,10.81135-18.72645l.5893-.25281,15.979,42.6119-11.73235,31.28625,28.79671,48.4319Z" transform="translate(-259.58071 -157.88396)" fill="#3f3d56" />
                            <path d="M589.30794,312.41993a12.24758,12.24758,0,0,0-10.17219,15.78672l-21.50463,17.91269,7.69816,15.72326,30.01343-25.72272a12.31392,12.31392,0,0,0-6.03477-23.69995Z" transform="translate(-259.58071 -157.88396)" fill="#a0616a" />
                            <path d="M590.06206,344.02244l-59.59835,53.77665-58.95815-13.84578c-14.57-.21979-19.31136-8.9587-19.50629-9.33113l-.29761-.568,41.2489-19.22578,32.0997,9.27828,46.06046-32.45509Z" transform="translate(-259.58071 -157.88396)" fill="#3f3d56" />
                            <polygon points="227.248 568.437 243.261 568.436 250.878 506.672 227.245 506.673 227.248 568.437" fill="#a0616a" />
                            <path d="M483.39733,721.74476h50.32614a0,0,0,0,1,0,0V741.189a0,0,0,0,1,0,0h-36.207a14.11914,14.11914,0,0,1-14.11914-14.11914v-5.32505A0,0,0,0,1,483.39733,721.74476Z" transform="translate(757.57348 1305.02654) rotate(179.99738)" fill="#2f2e41" />
                            <polygon points="163.247 568.437 179.26 568.436 186.878 506.672 163.245 506.673 163.247 568.437" fill="#a0616a" />
                            <path d="M419.397,721.74476H469.7231a0,0,0,0,1,0,0V741.189a0,0,0,0,1,0,0h-36.207A14.11914,14.11914,0,0,1,419.397,727.06981v-5.32505a0,0,0,0,1,0,0Z" transform="translate(629.57273 1305.02946) rotate(179.99738)" fill="#2f2e41" />
                            <polygon points="157.552 342.991 158.858 434.42 160.165 554.584 188.899 551.972 203.267 386.094 221.553 551.972 251.218 551.972 254.206 384.788 243.757 348.216 157.552 342.991" fill="#2f2e41" />
                            <path d="M473.37417,513.1531c-31.26533.00239-60.04471-14.14839-60.43319-14.34263l-.32273-.16136-2.62373-62.96637c-.76082-2.22509-15.74263-46.13091-18.28-60.08625-2.57083-14.13882,34.68842-26.54742,39.213-27.99853l1.02678-11.37405,41.75366-4.49918,5.292,14.5536,14.97942,5.6168a7.40924,7.40924,0,0,1,4.59212,8.7043l-8.32539,33.85619,20.33325,112.01266-4.37755.18946C495.709,511.39658,484.38425,513.1525,473.37417,513.1531Z" transform="translate(-259.58071 -157.88396)" fill="#3f3d56" />
                            <circle cx="454.46738" cy="294.45965" r="30.06284" transform="matrix(0.87745, -0.47966, 0.47966, 0.87745, -345.12824, 96.19037)" fill="#a0616a" />
                            <path d="M430.1166,323.56132c5.72926,6.10289,16.36927,2.82672,17.1158-5.51069a10.07153,10.07153,0,0,0-.01268-1.94523c-.38544-3.69311-2.519-7.046-2.008-10.94542a5.73974,5.73974,0,0,1,1.05046-2.687c4.56548-6.11359,15.28263,2.73444,19.59138-2.8,2.642-3.39359-.46364-8.73664,1.56381-12.52956,2.67591-5.006,10.60183-2.53654,15.57222-5.27809,5.53017-3.05032,5.1994-11.53517,1.55907-16.6961-4.43955-6.294-12.22348-9.65241-19.91044-10.13643s-15.32094,1.59394-22.4974,4.39069c-8.15392,3.17767-16.23969,7.56925-21.25749,14.739-6.10218,8.71919-6.68942,20.44132-3.6376,30.63677C419.10222,311.0013,425.43805,318.57766,430.1166,323.56132Z" transform="translate(-259.58071 -157.88396)" fill="#2f2e41" />
                            <path d="M641.58071,741.9626h-381a1,1,0,0,1,0-2h381a1,1,0,0,1,0,2Z" transform="translate(-259.58071 -157.88396)" fill="#cacaca" />
                            <g>  <clipPath id="draw-check-clip">    <rect x="575" y="250" width="70" height="50">      <animate attributeName="width" values="0; 70; 70" keyTimes="0; 0.3; 1" dur="3s" repeatCount="indefinite" />    </rect>  </clipPath>  <path clipPath="url(#draw-check-clip)" d="M596.58984,294.33545a3.488,3.488,0,0,1-2.38134-.93555l-16.15723-15.00732a3.49994,3.49994,0,0,1,4.76367-5.12891l13.68555,12.71192,27.07666-27.07618a3.5,3.5,0,1,1,4.94922,4.9502l-29.46094,29.46094A3.49275,3.49275,0,0,1,596.58984,294.33545Z" transform="translate(-259.58071 -157.88396)" fill="#fff" /></g>
                          </svg>
                        ) : step.title === "Choose a Service" ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 825 528.58115" xmlnsXlink="http://www.w3.org/1999/xlink">
                            <style>
                              {`
                                @keyframes card1Anim {
                                  0%, 55% { fill: #d3d3d3; transform: scale(1); }
                                  60%, 75% { fill: #10355f; transform: scale(1.08); }
                                  80%, 100% { fill: #d3d3d3; transform: scale(1); }
                                }
                                @keyframes card2Anim {
                                  0%, 75% { fill: #d3d3d3; transform: scale(1); }
                                  80%, 95% { fill: #10355f; transform: scale(1.08); }
                                  100% { fill: #d3d3d3; transform: scale(1); }
                                }
                                @keyframes card3Anim {
                                  0%, 15% { fill: #10355f; transform: scale(1.08); }
                                  20%, 95% { fill: #d3d3d3; transform: scale(1); }
                                  100% { fill: #10355f; transform: scale(1.08); }
                                }
                                @keyframes card4Anim {
                                  0%, 15% { fill: #d3d3d3; transform: scale(1); }
                                  20%, 35% { fill: #10355f; transform: scale(1.08); }
                                  40%, 100% { fill: #d3d3d3; transform: scale(1); }
                                }
                                @keyframes card5Anim {
                                  0%, 35% { fill: #d3d3d3; transform: scale(1); }
                                  40%, 55% { fill: #10355f; transform: scale(1.08); }
                                  60%, 100% { fill: #d3d3d3; transform: scale(1); }
                                }
                                .svg-card {
                                  transform-origin: center;
                                  transform-box: fill-box;
                                }
                              `}
                            </style>
                            <g>
                              <animateTransform attributeName="transform" type="translate" values="0 0; 0 0; -166 0; -166 0; -332 0; -332 0; -498 0; -498 0; -664 0; -664 0; -830 0" keyTimes="0; 0.15; 0.2; 0.35; 0.4; 0.55; 0.6; 0.75; 0.8; 0.95; 1" dur="15s" repeatCount="indefinite" />
                              <g>
                                <path className="svg-card" style={{ animation: 'card1Anim 15s infinite' }} d="m153.32458,307.67604H7.67542c-4.23224,0-7.67542-3.44336-7.67542-7.67578V65.35182c0-4.23242,3.44318-7.67578,7.67542-7.67578h145.64917c4.23224,0,7.67542,3.44336,7.67542,7.67578v234.64844c0,4.23242-3.44318,7.67578-7.67542,7.67578Z" fill="#d3d3d3" />
                                <path className="svg-card" style={{ animation: 'card2Anim 15s infinite' }} d="m319.32458,307.67604h-145.64917c-4.23224,0-7.67542-3.44336-7.67542-7.67578V65.35182c0-4.23242,3.44318-7.67578,7.67542-7.67578h145.64917c4.23224,0,7.67542,3.44336,7.67542,7.67578v234.64844c0,4.23242-3.44318,7.67578-7.67542,7.67578Z" fill="#d3d3d3" />
                                <path className="svg-card" style={{ animation: 'card3Anim 15s infinite' }} d="m485.32458,307.67604h-145.64917c-4.23218,0-7.67542-3.44336-7.67542-7.67578V65.35182c0-4.23242,3.44324-7.67578,7.67542-7.67578h145.64917c4.23218,0,7.67542,3.44336,7.67542,7.67578v234.64844c0,4.23242-3.44324,7.67578-7.67542,7.67578Z" fill="#10355f" />
                                <path className="svg-card" style={{ animation: 'card4Anim 15s infinite' }} d="m651.32458,307.67604h-145.64917c-4.23218,0-7.67542-3.44336-7.67542-7.67578V65.35182c0-4.23242,3.44324-7.67578,7.67542-7.67578h145.64917c4.23218,0,7.67542,3.44336,7.67542,7.67578v234.64844c0,4.23242-3.44324,7.67578-7.67542,7.67578Z" fill="#d3d3d3" />
                                <path className="svg-card" style={{ animation: 'card5Anim 15s infinite' }} d="m817.32458,307.67604h-145.64917c-4.23218,0-7.67542-3.44336-7.67542-7.67578V65.35182c0-4.23242,3.44324-7.67578,7.67542-7.67578h145.64917c4.23218,0,7.67542,3.44336,7.67542,7.67578v234.64844c0,4.23242-3.44324,7.67578-7.67542,7.67578Z" fill="#d3d3d3" />
                              </g>
                              <g transform="translate(830, 0)">
                                <path className="svg-card" style={{ animation: 'card1Anim 15s infinite' }} d="m153.32458,307.67604H7.67542c-4.23224,0-7.67542-3.44336-7.67542-7.67578V65.35182c0-4.23242,3.44318-7.67578,7.67542-7.67578h145.64917c4.23224,0,7.67542,3.44336,7.67542,7.67578v234.64844c0,4.23242-3.44318,7.67578-7.67542,7.67578Z" fill="#d3d3d3" />
                                <path className="svg-card" style={{ animation: 'card2Anim 15s infinite' }} d="m319.32458,307.67604h-145.64917c-4.23224,0-7.67542-3.44336-7.67542-7.67578V65.35182c0-4.23242,3.44318-7.67578,7.67542-7.67578h145.64917c4.23224,0,7.67542,3.44336,7.67542,7.67578v234.64844c0,4.23242-3.44318,7.67578-7.67542,7.67578Z" fill="#d3d3d3" />
                                <path className="svg-card" style={{ animation: 'card3Anim 15s infinite' }} d="m485.32458,307.67604h-145.64917c-4.23218,0-7.67542-3.44336-7.67542-7.67578V65.35182c0-4.23242,3.44324-7.67578,7.67542-7.67578h145.64917c4.23218,0,7.67542,3.44336,7.67542,7.67578v234.64844c0,4.23242-3.44324,7.67578-7.67542,7.67578Z" fill="#10355f" />
                                <path className="svg-card" style={{ animation: 'card4Anim 15s infinite' }} d="m651.32458,307.67604h-145.64917c-4.23218,0-7.67542-3.44336-7.67542-7.67578V65.35182c0-4.23242,3.44324-7.67578,7.67542-7.67578h145.64917c4.23218,0,7.67542,3.44336,7.67542,7.67578v234.64844c0,4.23242-3.44324,7.67578-7.67542,7.67578Z" fill="#d3d3d3" />
                                <path className="svg-card" style={{ animation: 'card5Anim 15s infinite' }} d="m817.32458,307.67604h-145.64917c-4.23218,0-7.67542-3.44336-7.67542-7.67578V65.35182c0-4.23242,3.44324-7.67578,7.67542-7.67578h145.64917c4.23218,0,7.67542,3.44336,7.67542,7.67578v234.64844c0,4.23242-3.44324,7.67578-7.67542,7.67578Z" fill="#d3d3d3" />
                              </g>
                            </g>
                            <path d="m527.59072,22.28612l15.65201-12.17843s17.85959,5.56608,18.31995,5.79626,27.71535,63.43454,27.71535,63.43454c0,0-69.81672,35.72967-64.71098,32.24563,5.10574-3.47356,4.04901-50.56558-.70099-56.70711-4.76047-6.15199-.70099-21.57381-.70099-21.57381l4.40475-11.01708h.02091Z" fill="#2f2e43" />
                            <polygon points="570.85344 50.76524 549.63536 50.76524 549.63536 84.43377 573.02966 76.74379 570.85344 50.76524" fill="#e7979a" />
                            <circle cx="552.53349" cy="36.76632" r="23.3106" fill="#e7979a" />
                            <path d="m523.49987,32.51851l5.71257.97302c5.33592-21.34364,17.40973-14.37557,18.5606-14.61621s18.31995,18.55013,16.92843,37.57108c-1.39152,19.02094,23.19551,27.93505,23.19551,27.93505,0,0,8.58977,16.14373.93117,45.36569-7.65861,29.22196,8.5793,39.02538,8.5793,39.02538,32.01548-2.72027,12.76434-47.3745,7.65861-55.49346-5.10574-8.11895-1.6217-22.26434-1.6217-22.26434,7.88877-6.95761-1.39152-22.26434-1.39152-22.26434,0,0,1.63216-20.41247-3.2434-24.35685-4.87556-3.94439-5.10574-13.68504-5.10574-13.68504-8.58977-37.3409-36.65037-30.15312-36.65037-30.15312-35.94938-3.94439-33.55344,31.96314-33.55344,31.96314Z" fill="#2f2e43" />
                            <rect x="538.74979" y="473.9741" width="23.26898" height="33.00643" fill="#e69b9e" />
                            <path d="m516.08896,526.96343c-2.44673,0-4.62356-.06076-6.26385-.21104-6.18166-.56747-12.07769-5.12837-15.04198-7.79645-1.32888-1.19624-1.75666-3.10751-1.06441-4.75567v-.00054c.49721-1.18268,1.48947-2.06318,2.7226-2.41581l16.33126-4.66561,26.44342-17.84161.29458.52895c.11013.19747,2.7066,4.87448,3.57651,8.03678.33066,1.20275.24359,2.20477-.25851,2.97785-.34884.53709-.83167.84903-1.22581,1.02643.47904.50291,1.97773,1.51741,6.59967,2.25522,6.73936,1.07146,8.16373-5.91881,8.22096-6.21611l.04503-.23328.19992-.12966c3.21113-2.06752,5.18452-3.00552,5.86755-2.8075.4256.12749,1.13765.34016,3.05082,19.37855.19368.59568,1.53721,4.97864.62308,9.16738-.99388,4.55819-20.90274,2.98979-24.88397,2.62902-.11311.01411-15.02217,1.07309-25.23687,1.07309Z" fill="#36344e" />
                            <rect x="615.49102" y="451.70449" width="23.26898" height="33.00643" transform="translate(-152.76168 402.77971) rotate(-31.94922)" fill="#e69b9e" />
                            <path d="m602.04547,522.43942c-2.72938,0-5.2404-.32822-7.02879-.64505-1.76072-.31194-3.13491-1.70729-3.41973-3.47208h0c-.20426-1.26677.17198-2.53896,1.03213-3.49053l11.38815-12.60148,12.99643-29.13076.52949.29241c.19802.10905,4.87665,2.70388,7.28784,4.92656.91712.84578,1.37337,1.74201,1.35655,2.66374-.01194.64016-.25634,1.16043-.49694,1.51904.6719.17469,2.48064.24142,6.79334-1.57817,6.28474-2.65289,3.79542-9.34207,3.68637-9.62526l-.08545-.22189.10118-.21538c1.62998-3.45309,2.80506-5.29926,3.4927-5.48697.42886-.11881,1.14687-.3114,12.84344,14.8285.47931.40309,3.93864,3.41132,5.37983,7.44924,1.56813,4.39381-16.15467,13.59754-19.72332,15.39814-.10986.08897-18.65864,13.56987-26.27307,17.40109-3.0199,1.51904-6.59614,1.98885-9.86017,1.98885Z" fill="#36344e" />
                            <path d="m579.14847,197.92737h-65.1406l-5.9116,60.5939,25.86325,223.90184h33.25275l-13.3011-129.31624,53.94335,116.75409,29.558-20.6906-42.12015-108.99512s15.04822-94.95507,3.22502-118.60147c-11.8232-23.6464-19.36891-23.6464-19.36891-23.6464Z" fill="#36344e" />
                            <polygon points="611.54926 201.62212 508.09627 201.62212 539.13217 67.87218 584.20812 67.87218 611.54926 201.62212" fill="#10355f" />
                            <path id="uuid-b13828aa-7dbb-4654-a51f-7f6b6cc292f7-1286" d="m482.40729,65.23639c-1.65026-8.13701,1.37222-15.56892,6.75029-16.59942,5.37804-1.0305,11.074,4.73017,12.72372,12.87032.70531,3.24274.59384,6.60404-.32512,9.80263l6.54008,34.56354-16.90893,2.6722-4.65216-34.35723c-2.09939-2.62086-3.51483-5.69052-4.12788-8.95203h0Z" fill="#e69b9e" />
                            <path d="m583.10358,67.87218h-39.75553l-26.79817,53.59634-10.10704-40.15985-22.20581,2.35814s5.25488,78.47187,28.22474,75.8215c22.96986-2.65037,76.53152-73.35803,70.64181-91.61612Z" fill="#10355f" />
                            <path id="uuid-fc7bb237-60d5-4a24-8159-aaf6584accef-1287" d="m627.50108,271.69796c1.65026,8.13701-1.37222,15.56892-6.75029,16.59942-5.37804,1.0305-11.074-4.73017-12.72372-12.87032-.70531-3.24274-.59384-6.60404.32512-9.80263l-6.54008-34.56354,16.90893-2.6722,4.65216,34.35723c2.09939,2.62086,3.51483,5.69052,4.12788,8.95203,0,0,0,.00002,0,0Z" fill="#e69b9e" />
                            <path d="m560.44734,67.87218s22.59128-.95632,23.76078,0c6.16113,5.03805,42.33324,186.70099,42.33324,186.70099h-22.90745s-43.18658-186.70099-43.18658-186.70099Z" fill="#10355f" />
                            <path d="m378.82042,527.40924c0,.64994.52194,1.17191,1.17191,1.17191h411.20153c.64994,0,1.17191-.52197,1.17191-1.17191s-.52197-1.17191-1.17191-1.17191h-411.20153c-.64997,0-1.17191.52197-1.17191,1.17191Z" fill="#3f3d58" />
                          </svg>
                        ) : step.title === "Book a Service" ? (
                          <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 960.001 690.941"><style>
                            {`
    @keyframes boxSelect {
      0%, 16.65% { fill: #10355f; }
      16.66%, 100% { fill: #f2f2f2; }
    }
    @keyframes checkmarkJump {
      0%, 16.65% { transform: translate(0px, 0px); }
      16.66%, 33.32% { transform: translate(234.005px, 0px); }
      33.33%, 49.99% { transform: translate(468.007px, 0px); }
      50%, 66.65% { transform: translate(0px, 167.311px); }
      66.66%, 83.32% { transform: translate(234.005px, 167.311px); }
      83.33%, 100% { transform: translate(468.007px, 167.311px); }
    }
    @keyframes checkmarkPop {
      0%, 5% { transform: scale(0); opacity: 0; }
      15% { transform: scale(1.15); opacity: 1; }
      25%, 90% { transform: scale(1); opacity: 1; }
      95%, 100% { transform: scale(0); opacity: 0; }
    }
  `}
                          </style><defs><linearGradient id="a-1444" x1="-145.593" y1="1" x2="-145.593" gradientUnits="objectBoundingBox"><stop offset="0" stopColor="gray" stopOpacity="0.251" /><stop offset="0.535" stopColor="gray" stopOpacity="0.122" /><stop offset="1" stopColor="gray" stopOpacity="0.102" /></linearGradient></defs><g transform="translate(-480 -195)"><g transform="translate(1255.777 411.489)"><path d="M994.932,546.427c-6.231,6.808-13.959,11.876-22.345,15.811h-.01c-.789.374-1.578.738-2.377,1.082h-.01l-.01.01-.01-.01h-.01a.01.01,0,0,1-.01.01h-.01l-.01-.01c-.01.01-.01.01-.02,0l-.01.01-.01-.01h-.01c-.01.01-.01.01-.02,0h-.01a141.386,141.386,0,0,1-17.257,6.17,239.386,239.386,0,0,1-106.325,5.554l-2.023-.364V492.632c.668-.283,1.346-.566,2.023-.84q6.631-2.746,13.424-5.048,9.772-3.338,19.816-5.725a214.62,214.62,0,0,1,66.8-5.4q6.115.455,12.2,1.315c8.487,1.184,17.389,3.247,25.218,6.828h.01c1.143.536,2.266,1.093,3.379,1.689,6.959,3.773,12.826,8.963,16.407,16.074a30.922,30.922,0,0,1,2.752,8.082v.02c.2.971.344,1.952.455,2.923C1008.2,524.526,1003.236,537.343,994.932,546.427Z" transform="translate(-844.441 -321.168)" fill="#f2f2f2" /><path d="M1006.929,512.154a1.392,1.392,0,0,1-.3.04q-25.992,1.138-51.914,3.379h-.03c-.071.01-.131.01-.2.02q-26.614,2.306-53.118,5.776c-.748.1-1.487.2-2.226.293q-18.329,2.443-36.588,5.422-8.057,1.32-16.084,2.751c-.678.121-1.345.233-2.023.364v-3.065c.678-.131,1.355-.243,2.023-.364q26.736-4.734,53.653-8.265,6.767-.91,13.555-1.72,19.6-2.367,39.269-4.087l2.873-.243q25.173-2.14,50.416-3.247a.954.954,0,0,1,.243.02C1008.092,509.372,1008.436,511.8,1006.929,512.154Z" transform="translate(-844.441 -320.772)" fill="#fff" /><path d="M970.322,559.809c-21.587.159-42.853-8.995-58.122-24.145a78.719,78.719,0,0,1-11.313-14.233c-1.029-1.65-3.437.17-2.417,1.806,11.858,19.018,31.611,32.565,53.389,37.547A81.746,81.746,0,0,0,970.71,562.8C972.645,562.787,972.244,559.8,970.322,559.809Z" transform="translate(-843.82 -320.639)" fill="#fff" /><path d="M879.7,480.95a1.712,1.712,0,0,1-1.264,1.143,65.975,65.975,0,0,0-14.242,5.564,69.195,69.195,0,0,0-17.733,13.4c-.273.273-.536.546-.789.829-.425.445-.83.9-1.234,1.366v-4.41c.648-.688,1.325-1.366,2.023-2.013a72.747,72.747,0,0,1,13.423-10.156Q869.66,483.337,879.7,480.95Z" transform="translate(-844.441 -321.1)" fill="#fff" /><path d="M984.476,482.873a70.206,70.206,0,0,0-32.8,28.916,1.517,1.517,0,0,0,.8,1.976,1.545,1.545,0,0,0,1.976-.8,66.812,66.812,0,0,1,31.152-27.3c1.786-.763.655-3.56-1.134-2.8Z" transform="translate(-843.202 -321.079)" fill="#fff" /><path d="M1027.109,398.517c-2.347,8.922-6.848,17-12.442,24.379l-.01.01c-.516.688-1.052,1.386-1.608,2.053v.01a140.887,140.887,0,0,1-12.554,13.545,236.13,236.13,0,0,1-53.987,38.571c-31.024,16.205-65.7,25.785-100.043,26.331-.263.01-.526.01-.789.01-.415.01-.83.01-1.234.01V457.461c.657-1.254,1.335-2.509,2.023-3.753a222.064,222.064,0,0,1,32.4-44.327c.3-.334.617-.668.93-.991q7.1-7.5,14.89-14.273a213.258,213.258,0,0,1,68.068-40.311c8.062-2.893,16.9-5.21,25.5-5.665,1.264-.071,2.519-.1,3.783-.091,7.921.111,15.517,1.983,22,6.616a31.356,31.356,0,0,1,6.191,5.877c.627.779,1.2,1.578,1.76,2.4v.01C1028.688,372.965,1030.245,386.611,1027.109,398.517Z" transform="translate(-844.441 -322.636)" fill="#f2f2f2" /><path d="M1021.991,362.8v.01a1.466,1.466,0,0,1-.243.172q-22.457,13.064-44.347,27.08c-.02.01-.03.02-.051.03a1.71,1.71,0,0,1-.182.111q-22.5,14.415-44.367,29.8c-.607.425-1.224.86-1.841,1.295q-15.1,10.667-29.882,21.789-27.92,21.03-54.615,43.619c-.678.567-1.345,1.143-2.023,1.72V484.49c.668-.577,1.346-1.153,2.023-1.72q10.227-8.634,20.636-17.025c2.074-1.669,4.157-3.338,6.241-4.987q27.768-22.108,56.779-42.567h.01q5.706-4.021,11.431-7.971,16.266-11.2,32.9-21.86c.8-.516,1.608-1.032,2.417-1.548q21.289-13.6,43.133-26.3a1.506,1.506,0,0,1,.223-.111C1021.748,359.794,1023.174,361.8,1021.991,362.8Z" transform="translate(-844.441 -322.495)" fill="#fff" /><path d="M1011.34,421.156c-19.043,10.168-42.128,11.941-62.687,5.617a78.727,78.727,0,0,1-16.63-7.349c-1.678-.984-2.965,1.747-1.3,2.722,19.335,11.333,43.121,14.155,64.72,8.45a81.746,81.746,0,0,0,17.631-6.971c1.708-.912-.037-3.375-1.733-2.469Z" transform="translate(-843.453 -321.813)" fill="#fff" /><path d="M869.575,458.463a69.341,69.341,0,0,1-.964-16.053,73.158,73.158,0,0,1,10.905-34.546q7.109-7.493,14.894-14.275a1.724,1.724,0,0,1-.593,1.6,66.2,66.2,0,0,0-10.026,11.539,69.921,69.921,0,0,0-11.21,51.481,1.226,1.226,0,0,1-.317,1.156,1.643,1.643,0,0,1-2.688-.906Z" transform="translate(-844.164 -322.11)" fill="#fff" /><path d="M987.988,346.619a70.2,70.2,0,0,0-15.611,40.842A1.517,1.517,0,0,0,974,388.838a1.545,1.545,0,0,0,1.378-1.628,66.812,66.812,0,0,1,14.908-38.643C991.517,347.062,989.217,345.111,987.988,346.619Z" transform="translate(-842.963 -322.659)" fill="#fff" /><path d="M884.712,380.124v.01c-.07.87-.152,1.73-.243,2.59v.02a142.92,142.92,0,0,1-3.287,18.168c-.708,2.934-1.477,5.847-2.316,8.76-.1.374-.213.749-.324,1.113v.01a232.174,232.174,0,0,1-8.841,24.935,241.68,241.68,0,0,1-23.236,42.708c-.657.981-1.335,1.962-2.023,2.934V322.96c.678-.04,1.346-.04,2.023-.02q.485,0,.971.03a30.671,30.671,0,0,1,8.376,1.629c.951.314,1.871.668,2.782,1.062,11.036,4.835,19.705,15.5,23.468,27.221C884.884,361.663,885.45,370.9,884.712,380.124Z" transform="translate(-844.441 -322.927)" fill="#f2f2f2" /><path d="M858.593,325.649a1.087,1.087,0,0,1-.112.283q-6.145,11.942-12.017,24c-.678,1.386-1.355,2.782-2.023,4.168v-6.879q1-2.064,2.023-4.127,4.537-9.2,9.226-18.309a1.31,1.31,0,0,1,.122-.2C856.742,323.252,859.048,324.163,858.593,325.649Z" transform="translate(-844.441 -322.915)" fill="#fff" /><path d="M885.035,381.1c-.182.324-.364.647-.567.971a80.739,80.739,0,0,1-10.54,14.4,86.908,86.908,0,0,1-27.464,20c-.668.324-1.345.627-2.023.91V414.1c.678-.3,1.355-.617,2.023-.941a81.8,81.8,0,0,0,35.779-33.2,1.664,1.664,0,0,1,2.468-.475,1.166,1.166,0,0,1,.323,1.619Z" transform="translate(-844.441 -322.277)" fill="#fff" /></g><path d="M951.53,205.653V293.52h-2.312v-.936H175.754v.936h-2.312V205.653A38.19,38.19,0,0,1,211.594,167.5H913.377a38.19,38.19,0,0,1,38.153,38.153Z" transform="translate(306.559 27.5)" fill="#10355f" /><path d="M913.377,167.5H211.594a38.19,38.19,0,0,0-38.153,38.153V707.422a38.19,38.19,0,0,0,38.153,38.153H913.377a38.191,38.191,0,0,0,38.153-38.153V205.653A38.19,38.19,0,0,0,913.377,167.5Zm35.841,539.922a35.886,35.886,0,0,1-35.841,35.841H211.594a35.886,35.886,0,0,1-35.841-35.841V205.653a35.886,35.886,0,0,1,35.841-35.841H913.377a35.886,35.886,0,0,1,35.841,35.841Z" transform="translate(306.559 27.5)" fill="#3f3d56" /><circle cx="23.123" cy="23.123" r="23.123" transform="translate(614.113 234.887)" fill="#fff" /><circle cx="23.123" cy="23.123" r="23.123" transform="translate(1077.73 234.887)" fill="#fff" /><path style={{ animation: 'boxSelect 12s infinite', animationDelay: '0s' }} d="M388.773,459.72H251.218a22,22,0,0,1-21.98-21.98V372.727a22,22,0,0,1,21.98-21.98H388.773a22,22,0,0,1,21.98,21.98V437.74a22.005,22.005,0,0,1-21.98,21.98Z" transform="translate(315.271 56.114)" fill="#f2f2f2" /><path style={{ animation: 'boxSelect 12s infinite', animationDelay: '2s' }} d="M591.171,459.72H453.617a22,22,0,0,1-21.98-21.98V372.727a22,22,0,0,1,21.98-21.98H591.171a22,22,0,0,1,21.98,21.98V437.74a22.005,22.005,0,0,1-21.98,21.98Z" transform="translate(346.877 56.114)" fill="#f2f2f2" /><path style={{ animation: 'boxSelect 12s infinite', animationDelay: '8s' }} d="M591.261,605.191H453.707a22.672,22.672,0,0,1-22.646-22.646V517.531a22.672,22.672,0,0,1,22.646-22.646H591.261a22.672,22.672,0,0,1,22.646,22.646v65.014A22.672,22.672,0,0,1,591.261,605.191Z" transform="translate(346.785 78.621)" fill="#f2f2f2" /><path style={{ animation: 'boxSelect 12s infinite', animationDelay: '6s' }} d="M388.473,605.191H250.918a22.672,22.672,0,0,1-22.646-22.646V517.531a22.672,22.672,0,0,1,22.646-22.646H388.473a22.672,22.672,0,0,1,22.646,22.646v65.014a22.672,22.672,0,0,1-22.646,22.646Z" transform="translate(315.121 78.621)" fill="#f2f2f2" /><path style={{ animation: 'boxSelect 12s infinite', animationDelay: '10s' }} d="M793.66,605.191H656.105a22.672,22.672,0,0,1-22.646-22.646V517.531a22.672,22.672,0,0,1,22.646-22.646H793.66a22.672,22.672,0,0,1,22.646,22.646v65.014A22.672,22.672,0,0,1,793.66,605.191Z" transform="translate(378.391 78.621)" fill="#f2f2f2" /><path style={{ animation: 'boxSelect 12s infinite', animationDelay: '4s' }} d="M793.66,460.013H656.105a22.672,22.672,0,0,1-22.646-22.646V372.353a22.672,22.672,0,0,1,22.646-22.646H793.66a22.672,22.672,0,0,1,22.646,22.646v65.014A22.672,22.672,0,0,1,793.66,460.013Z" transform="translate(378.391 55.952)" fill="#f2f2f2" /><g style={{ animation: 'checkmarkJump 12s infinite' }}><g style={{ transformOrigin: 'center', transformBox: 'fill-box', animation: 'checkmarkPop 2s infinite' }}><circle cx="37.3" cy="37.3" r="37.3" transform="translate(597.969 424.047)" fill="#fff" /><path d="M306.25,414.013a3.868,3.868,0,0,1-2.328-.773l-.042-.031-8.766-6.711a3.894,3.894,0,0,1,4.737-6.183l5.678,4.354,13.417-17.5a3.894,3.894,0,0,1,5.46-.721l-.083.113.086-.112a3.9,3.9,0,0,1,.721,5.46l-15.782,20.582A3.9,3.9,0,0,1,306.25,414.013Z" transform="translate(325.32 61.563)" fill="#10355f" /></g></g><path d="M906.378,732.812H465.885a1.156,1.156,0,0,1,0-2.312H906.378a1.156,1.156,0,0,1,0,2.312Z" transform="translate(352.043 133.911)" fill="#e6e6e6" /><g transform="translate(-683.91)"><path d="M279.454,796.9a.406.406,0,0,1,.085.043c-1.042-2.25-2.013-4.526-2.9-6.838-.1-.271-.2-.551-.306-.823.008.07.008.14.018.219.026.438.061.875.1,1.322.053.691.1,1.392.1,2.093.008.219.008.426.008.648a12.8,12.8,0,0,1-.263,2.539h.035c.219.018.42.026.631.061a8.568,8.568,0,0,1,2.387.682.521.521,0,0,1,.1.053Z" transform="translate(1401.857 63.627)" fill="url(#a-1444)" /><path d="M18.5,67.489c.193-3.651,1.432-7.193,1.524-10.847a20.828,20.828,0,0,0-1.087-6.956q-.134-.37-.271-.737a24.868,24.868,0,1,1,25.7-8.668c-.095.345-.182.677-.252.987a7.086,7.086,0,0,0-.133.751,36.592,36.592,0,0,0,1.052,13.559c.937,3.421,2.526,6.9,5.51,8.824-5.785-.871-11.557.268-17.345,1.407a68.581,68.581,0,0,1-13.139,1.717C19.542,67.526,19.019,67.515,18.5,67.489Z" transform="translate(1644.709 460.025)" fill="#ed9da0" /><path d="M393.158,389.082a15.738,15.738,0,0,0,3.288,3.314c.817.669,1.654,1.353,2.531,1.968a10.853,10.853,0,0,0,5.383,2.19c2.565.171,8.008-1.332,9.6-3.529a6.365,6.365,0,0,0,.917-3.676,16.911,16.911,0,0,0-.884-5.142,28.657,28.657,0,0,0-4.151-7.512c-1.855-2.578-3.921-5.114-6.676-6.676a25.892,25.892,0,0,0-2.839-1.306c-1.674-.682-3.341-1.372-5.015-2.056a2.422,2.422,0,0,0-.91-.241c-1.346.014-1.594,2.069-.83,3.18,1.527,2.237,4.962,2.859,5.926,5.4a3.847,3.847,0,0,0-3.576,2.772,1.96,1.96,0,0,1-.482,1.118c-.442.355-1.132.154-1.634.422-.891.476-.5,1.8-.6,2.805a13.125,13.125,0,0,1-.917,2.524,5.363,5.363,0,0,0,.863,4.446Z" transform="translate(1165.104 116.29)" fill="#ed9da0" /><path d="M269.715,808.553c-.828-.828-2.183-.687-3.34-.5a123.916,123.916,0,0,1-18.779,1.519c-.788-3.845,1.5-7.586,2.235-11.437a10.309,10.309,0,0,1,.744-2.892c.886-1.7,2.883-2.477,4.759-2.872,3.384-.713,8.674-1.973,10.564,1.449C268.164,797.923,268.889,803.987,269.715,808.553Z" transform="translate(1436.955 63.346)" fill="#ed9da0" /><path d="M283.33,791.776c2.551,1.74,5.718,2.284,8.784,2.678s6.226.69,9.005,2.056c2.4,1.185,4.419,3.127,6.957,3.977a14.491,14.491,0,0,0,7.225.114c2.852-.535,5.892-1.574,7.432-4.038,1.372-2.19,1.226-4.968,1.038-7.546q-.332-4.368-.649-8.751a4.167,4.167,0,0,0-.542-2.115c-2.062-3.006-7.075,1.259-9.762,1.252-4.252-.007-8.818-2.31-11.884-5.129a3.615,3.615,0,0,0-.924-.7c-1.212-.542-2.424.462-3.5,1.339-.12.1-.241.2-.361.295-2.484,1.968-5.818,2.37-8.885,3.167s-6.36,2.4-7.312,5.43a4.617,4.617,0,0,0-.147.582C279.247,787.177,280.94,790.143,283.33,791.776Z" transform="translate(1354.533 65.602)" fill="#090814" /><path d="M319.114,576.021a38.331,38.331,0,0,1-5.253,28.282,52.807,52.807,0,0,0-4.27,6.847,31.115,31.115,0,0,0-1.666,5.426l-4.732,19.587c-1.279,5.285-2.564,10.677-2.18,16.1.268,3.781,1.221,8.033-1.108,11.022a8.12,8.12,0,0,0-1.408,1.931,4.889,4.889,0,0,0-.023,2.545c2.394,14.221,4.17,29.088-.155,42.845-3.921,12.469-4.143,26.285-7.476,38.924a8.677,8.677,0,0,1-2.07,4.316,6.785,6.785,0,0,1-3.1,1.475c-4.911,1.169-10.1-.2-14.678-2.323-3.219-1.492-6.684-4.108-6.409-7.645.131-1.683,1.114-3.154,1.781-4.708,1.308-3.04,1.413-6.437,1.767-9.729.886-8.268,3.434-16.244,5.36-24.331s3.234-16.536,1.6-24.686a215.944,215.944,0,0,0-15.882-48.857,5.894,5.894,0,0,0-1.455-2.188,15.045,15.045,0,0,1-2.059-1.405,6.212,6.212,0,0,1-.942-2.561c-.716-2.58-2.844-4.483-4.27-6.749-3.6-5.721-2.46-13.055-2.327-19.814.13-6.573-.817-13.207.261-19.69s4.793-13.114,11.045-15.146c3.1-1.007,6.446-.778,9.686-.458C286.318,566.734,303,569.853,319.114,576.021Z" transform="translate(1386.389 91.587)" fill="#090814" /><path d="M248.142,617.695a41.051,41.051,0,0,0,.863,7.6q4.54,25.459,9.675,50.812c.3,1.466.6,2.933.991,4.372a35.457,35.457,0,0,0,6.555,12.9c14.269,17.783,15.5,43.608,23.24,65.053.522,1.449,1.044,2.906,1.6,4.339a108.352,108.352,0,0,0,4.773,10.654,3.047,3.047,0,0,0,.984,1.272,2.921,2.921,0,0,0,1.553.3,45.345,45.345,0,0,0,20.106-4.573,4.165,4.165,0,0,0,2.136-1.774,4.292,4.292,0,0,0,.228-2.046c-.214-4.252-.476-8.657-2.5-12.393a26.444,26.444,0,0,0-4.955-6.006,227.384,227.384,0,0,0-4.858-39.744c-1.506-6.662-3.368-13.4-7.237-19.028-2.852-4.158-6.943-8.262-6.441-13.277.221-2.2,1.145-4.944-.649-6.24-.783-.569-1.942-.643-2.472-1.449a2.756,2.756,0,0,1-.349-1.245,30.745,30.745,0,0,1,.636-10.291,54.279,54.279,0,0,0,1.534-6.709,8.447,8.447,0,0,0-1.688-6.478c-.094-4.58.033-9.333-.061-13.906a25.792,25.792,0,0,1,.643-7.767c.348-1.2.877-2.343,1.145-3.569.957-4.4-1.433-9.668,1.412-13.156,1.185-1.449,3.013-2.169,4.566-3.214a16.753,16.753,0,0,0,6.267-9.012,49.738,49.738,0,0,0,1.775-11.034,11.356,11.356,0,0,0,.026-2.387,4.366,4.366,0,0,0-.321-1.193c-.884-1.989-3.261-2.758-5.377-3.267a174.1,174.1,0,0,0-41.057-4.8c-5.114-3.482-7.994-2.237-10.164,1.449a38.131,38.131,0,0,0-2.892,7.063c-.991,2.993-1.051,19.745-2.015,22.751C244.567,605.61,248.189,613.591,248.142,617.695Z" transform="translate(1387.432 91.138)" fill="#090814" /><path d="M19274.021,7160.922c-5.342-.523-10.785-.591-15.937-2.089-3.219-.94-6.273-2.419-9.545-3.166a43.488,43.488,0,0,0-8.041-.824c-5.957-.243-11.957-.48-17.857.4-.475.068-1.061.106-1.342-.281a1.24,1.24,0,0,1-.18-.7,11.9,11.9,0,0,1,1.521-6.33c.752-1.323,1.8-2.623,1.77-4.149-.039-.527.8-52.194,2.146-80.175a33.731,33.731,0,0,1-3.77.082,195.283,195.283,0,0,1-34.105-3.752c-1.273-.218-15-8.739-17.812-12.326-3.344-4.329-11.764-32.107-12.061-33.687a12.851,12.851,0,0,0-3.945-7.1,2.594,2.594,0,0,1-.936-1.251,1.985,1.985,0,0,1,.223-1.216,9.372,9.372,0,0,1,6.477-4.857,27.882,27.882,0,0,1,8.348-.33,18.9,18.9,0,0,1,2.732.727c2.205,5.972,17.576,33.644,18.381,33.6,2.2.136,6.941.94,8.934,0,2.258-1.057,9.674-1.1,10.072-1.319.9-.523,8.957-4.013,10.01-3.9-.66-.591,14.609-4.43,15.66-6.267.33-.575.426-1.331.883-1.77a4.577,4.577,0,0,1,.693-1.381,4.4,4.4,0,0,1,3.537-1.047,15.611,15.611,0,0,1,4.615.848v0c1.08,1.255,2.535,2.637,4.145,2.235a5.674,5.674,0,0,0,1.613-.863c2.865-1.847,6.385-2.283,9.758-2.792a143.186,143.186,0,0,0,20.086-4.518,20.61,20.61,0,0,1,5.943-1.207c4.217.024,7.949,2.821,10.592,6.107s4.512,7.125,7.1,10.45c1.848,2.366,4.049,4.455,5.773,6.912,4.354,6.2-13.281,80-13.043,81.243,1.652,11.745,2.52,44.429,1.787,50.454A92.187,92.187,0,0,0,19274.021,7160.922Z" transform="translate(-17589.389 -6493.069)" fill="#e6e6e6" /><path d="M224.918,407.565a25.14,25.14,0,0,1,8.9-2.929,18.751,18.751,0,0,1,5.661-.407c1.75.218,3.43.894,5.191.992,2.472.138,4.841-.865,7.23-1.518s5.146-.9,7.16.541a3.09,3.09,0,0,0,1.557.828,2.727,2.727,0,0,0,1.61-.789,9.173,9.173,0,0,1,11.433.6c4.558,4.275,4.043,12.626,9.385,15.868,1.473.893,3.355,1.364,4.215,2.859a10.558,10.558,0,0,0,.727,1.375,3.723,3.723,0,0,0,1.285.916,24.956,24.956,0,0,1,4.4,2.531,6.3,6.3,0,0,1,2.534,4.248,8,8,0,0,1-.778,3.573,33.525,33.525,0,0,1-32.582,20.832,5.157,5.157,0,0,1-3.409-1.065,6.443,6.443,0,0,1-1.193-1.971c-2.511-5.266-7.229-9.154-10.224-14.16-1.785-2.983-2.931-6.321-4.789-9.26-2.817-4.455-7.1-7.746-11.295-10.94-2.364-1.8-5-3.691-7.968-3.565-2.647.113-4.574.256-3.6-2.993a10.4,10.4,0,0,1,4.559-5.568Z" transform="translate(1434.381 111.787)" fill="#e6e6e6" /><path d="M224.918,407.565a25.14,25.14,0,0,1,8.9-2.929,18.751,18.751,0,0,1,5.661-.407c1.75.218,3.43.894,5.191.992,2.472.138,4.841-.865,7.23-1.518s5.146-.9,7.16.541a3.09,3.09,0,0,0,1.557.828,2.727,2.727,0,0,0,1.61-.789,9.173,9.173,0,0,1,11.433.6c4.558,4.275,4.043,12.626,9.385,15.868,1.473.893,3.355,1.364,4.215,2.859a10.558,10.558,0,0,0,.727,1.375,3.723,3.723,0,0,0,1.285.916,24.956,24.956,0,0,1,4.4,2.531,6.3,6.3,0,0,1,2.534,4.248,8,8,0,0,1-.778,3.573,33.525,33.525,0,0,1-32.582,20.832,5.157,5.157,0,0,1-3.409-1.065,6.443,6.443,0,0,1-1.193-1.971c-2.511-5.266-7.229-9.154-10.224-14.16-1.785-2.983-2.931-6.321-4.789-9.26-2.817-4.455-7.1-7.746-11.295-10.94-2.364-1.8-5-3.691-7.968-3.565-2.647.113-4.574.256-3.6-2.993a10.4,10.4,0,0,1,4.559-5.568Z" transform="translate(1434.381 111.787)" fill="#090814" opacity="0.05" /><path d="M242.838,817.065c1.8,1.681,4.278,2.417,6.682,2.939a120.421,120.421,0,0,0,16.631,2.055c1.808.134,3.622.275,5.43.415,5.3.4,10.613.811,15.939.83a109.908,109.908,0,0,0,19.6-1.694,1.663,1.663,0,0,0,1.79-1.989c-.115-6.624-4.54-11.769-6.028-18.224-.616-2.652-1.752,1.847-1.966,2.094a5.431,5.431,0,0,1-4.319,2.3c-5.47.3-11.6-3.027-15.939-5.986a20.408,20.408,0,0,0-2.953-1.827,8.688,8.688,0,0,0-2.387-.682,14.432,14.432,0,0,0-8.135,1.647c-3.267,1.62-6.137,3.951-9.367,5.618a26.33,26.33,0,0,1-8.4,2.659c-2.959.408-6.495.6-8.012,3.167a.025.025,0,0,0-.007.021C240.14,812.524,241.044,815.39,242.838,817.065Z" transform="translate(1403.521 62.637)" fill="#090814" /><path d="M263.908,372.848a4.594,4.594,0,0,1-1.717.639,5.54,5.54,0,0,1-4.59-.687Z" transform="translate(1433.861 115.494)" opacity="0.1" /><path d="M268.148,378.974s19.518-16.7,11.483-35.509a25.378,25.378,0,0,0-1.637-3.112c-8.509-13.923-26.14-12.821-36.142-10.84-5.47,1.01-13.518.17-12.361,9.725s5.018,7.805,5.018,7.805l7.343,8.981s8.267,3.284,6.037,11.089S268.148,378.974,268.148,378.974Z" transform="translate(1416.221 128.783)" fill="#090814" /></g></g></svg>
                        ) : (
                          <Box
                            component="img"
                            src={step.img}
                            alt={step.title}
                            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Desktop Step Number Badge */}
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', bgcolor: '#10355f', color: 'white', width: 32, height: 32, borderRadius: '50%', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, zIndex: 3, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                      {index + 1}
                    </Box>

                    {/* Card Content */}
                    <Box
                      sx={{
                        pt: 3, pb: 5, px: 4, bgcolor: '#10355f', borderRadius: '24px', border: '1px solid #10355f', width: '100%', flex: 1, transition: 'all 0.3s ease', cursor: { xs: 'default', sm: 'pointer' },
                        '&:hover': {
                          bgcolor: { xs: '#1a4a7a', sm: selectedHowItWorksStep === index ? '#1a4a7a' : '#1a4a7a' },
                          boxShadow: { xs: '0 20px 40px rgba(16, 53, 95, 0.2)', sm: '0 20px 40px rgba(16, 53, 95, 0.2)' },
                          borderColor: { xs: '#1a4a7a', sm: selectedHowItWorksStep === index ? '#1a4a7a' : '#1a4a7a' },
                          transform: { sm: 'scale(1.02)' }
                        },
                        ...(selectedHowItWorksStep === index && { bgcolor: '#0a2540', boxShadow: '0 20px 50px rgba(16, 53, 95, 0.35)', borderColor: '#0a2540', transform: 'scale(1.02)' })
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 900, color: 'white', mb: 2, fontSize: '1.4rem', lineHeight: 1.2 }}>
                        {step.title}
                      </Typography>
                      <Typography sx={{ fontSize: '1rem', color: 'white', lineHeight: 1.6, maxWidth: '260px', mx: 'auto' }}>
                        {step.desc}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Tablet/Desktop Popup for Step Details */}
            {selectedHowItWorksStep !== null && (
              <Box sx={{
                display: { xs: 'none', sm: 'block', md: 'none' }, mt: 5, animation: 'slideUp 0.4s ease-out',
                '@keyframes slideUp': { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } }
              }}>
                <Box sx={{ bgcolor: '#eaf2fc', borderRadius: '24px', p: 4, border: '2px solid #10355f', boxShadow: '0 20px 40px rgba(16, 53, 95, 0.15)', textAlign: 'center', position: 'relative' }}>
                  <Button onClick={() => setSelectedHowItWorksStep(null)} sx={{ position: 'absolute', top: 16, right: 16, minWidth: 'auto', width: 36, height: 36, p: 0, color: '#10355f', fontSize: '1.5rem', fontWeight: 'bold', '&:hover': { bgcolor: 'rgba(16, 53, 95, 0.1)' } }}>
                    ✕
                  </Button>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#10355f', color: 'white', width: 56, height: 56, borderRadius: '50%', fontSize: '1.8rem', fontWeight: 900, mb: 2, boxShadow: '0 8px 20px rgba(16, 53, 95, 0.3)' }}>
                    {selectedHowItWorksStep + 1}
                  </Box>
                  <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#10355f', mb: 2, lineHeight: 1.3 }}>
                    {howItWorksSteps[selectedHowItWorksStep].title}
                  </Typography>
                  <Typography sx={{ fontSize: '1rem', color: '#42526e', lineHeight: 1.7, maxWidth: '500px', mx: 'auto' }}>
                    {howItWorksSteps[selectedHowItWorksStep].desc}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Dots & Arrow Buttons Indicator for Mobile */}
            <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', alignItems: 'center', gap: 3, mt: 4 }}>
              <Button
                onClick={() => {
                  const el = document.getElementById('how-it-works-scroll');
                  if (el) {
                    const newIdx = Math.max(0, activeHowItWorksIdx - 1);
                    el.scrollTo({ left: newIdx * el.clientWidth, behavior: 'smooth' });
                    setActiveHowItWorksIdx(newIdx);
                  }
                }}
                disabled={activeHowItWorksIdx === 0}
                sx={{
                  minWidth: 'auto', width: 40, height: 40, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: activeHowItWorksIdx === 0 ? '#e2e8f0' : '#10355f', color: activeHowItWorksIdx === 0 ? '#94a3b8' : 'white', border: 'none', cursor: activeHowItWorksIdx === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                  '&:hover:not(:disabled)': { bgcolor: '#0a2540', transform: 'scale(1.1)' }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </Button>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {howItWorksSteps.map((_, idx) => (
                  <Box
                    key={idx}
                    onClick={() => {
                      const el = document.getElementById('how-it-works-scroll');
                      if (el) {
                        el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
                        setActiveHowItWorksIdx(idx);
                      }
                    }}
                    sx={{ width: activeHowItWorksIdx === idx ? 24 : 10, height: 10, borderRadius: '5px', bgcolor: activeHowItWorksIdx === idx ? '#10355f' : '#cbd5e1', transition: 'all 0.3s ease', cursor: 'pointer' }}
                  />
                ))}
              </Box>

              <Button
                onClick={() => {
                  const el = document.getElementById('how-it-works-scroll');
                  if (el) {
                    const newIdx = Math.min(howItWorksSteps.length - 1, activeHowItWorksIdx + 1);
                    el.scrollTo({ left: newIdx * el.clientWidth, behavior: 'smooth' });
                    setActiveHowItWorksIdx(newIdx);
                  }
                }}
                disabled={activeHowItWorksIdx === howItWorksSteps.length - 1}
                sx={{
                  minWidth: 'auto', width: 40, height: 40, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: activeHowItWorksIdx === howItWorksSteps.length - 1 ? '#e2e8f0' : '#10355f', color: activeHowItWorksIdx === howItWorksSteps.length - 1 ? '#94a3b8' : '#ffffff', border: 'none', cursor: activeHowItWorksIdx === howItWorksSteps.length - 1 ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease',
                  '&:hover:not(:disabled)': { bgcolor: '#0a2540', transform: 'scale(1.1)' }
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Button>
            </Box>
          </Container>
        </Box>

        {/* ===================== WHY ALLFIX ===================== */}
        <Box id="why-allfix" sx={{ scrollMarginTop: { xs: '80px', md: '100px' }, width: '100vw', position: 'relative', left: '50%', right: '50%', ml: '-50vw', mr: '-50vw', bgcolor: '#fff', pt: { xs: 8, lg: 12 }, pb: { xs: 8, lg: 10 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
          <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 5, lg: 6 } }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 6, lg: 8, xl: 10 }, alignItems: 'center' }}>

              {/* Mobile pill */}
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
                <Box sx={{ display: { xs: 'none', lg: 'inline-flex' }, alignItems: 'center', backgroundColor: '#f0f4f8', color: '#10355f', borderRadius: '999px', px: 3, py: 1, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.08em', boxShadow: 1, textTransform: 'uppercase', mb: 3 }}>
                  <Box sx={{ width: 6, height: 6, bgcolor: '#10355f', borderRadius: '50%', mr: 1.5 }} />
                  Why Choose Us?
                </Box>

                <Typography
                  sx={{
                    fontWeight: 900,
                    color: '#000',
                    lineHeight: 1.15,
                    mb: 1,
                    fontSize: { xs: '2rem', sm: '2.8rem', xl: '3rem' },
                    letterSpacing: '-0.02em'
                  }}
                >
                  Your Personal Concierge,
                </Typography>

                <Box sx={{ display: 'inline-block', bgcolor: '#eaf2fc', color: '#2e5ba8', px: 2.5, py: 0.5, borderRadius: '12px', mb: 3 }}>
                  <Typography sx={{ fontWeight: 900, lineHeight: 1.15, fontSize: { xs: '2rem', sm: '2.8rem', xl: '3rem' } }}>
                    In One Platform.
                  </Typography>
                </Box>

                <Typography sx={{ color: '#42526e', mb: 5, lineHeight: 1.6, maxWidth: '95%', fontSize: { xs: '0.95rem', sm: '1.05rem', lg: '1.05rem' } }}>
                  AllFix acts as your dedicated personal concierge, connecting you with Metro Manila's most trusted professionals for your home, office, and daily lifestyle needs. Whether you need an IT network setup, an aircon deep clean, or pool maintenance, our vetted experts deliver top-tier results so you can focus on what matters most.
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
        <Box id="service-area" sx={{ scrollMarginTop: { xs: '80px', md: '100px' }, bgcolor: '#f0f4f8', py: { xs: 8, lg: 12 }, position: 'relative', overflow: 'visible' }}>
          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, px: { xs: 2, sm: 4, lg: 6 } }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
              <Typography variant="h2" sx={{ fontWeight: '900', color: '#10355f', mb: 1, fontSize: { xs: '2rem', sm: '2.5rem', lg: '2.8rem' } }}>
                Available in Metro Manila!
              </Typography>
            </Box>

            {/* Map Wrapper */}
            <Box
              ref={mapWrapperRef}
              onClick={handleMapClick}
              component={motion.div}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              sx={{ position: 'relative', width: '100%', maxWidth: '900px', mx: 'auto', cursor: 'pointer' }}
            >
              <svg viewBox="-20 30 560 700" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: 'auto', filter: 'drop-shadow(0px 10px 30px rgba(16,53,95,0.25))' }}>
                {mapCities.map((city, idx) => (
                  <motion.polygon
                    key={idx}
                    points={city.points}
                    variants={{
                      hidden: { opacity: 0, x: (city.lx - 200) * 1.5, y: (city.ly - 350) * 1.5 },
                      visible: { opacity: 1, x: 0, y: 0, transition: { duration: 2.5, type: 'spring', bounce: 0.2, delay: idx * 0.05 } }
                    }}
                    fill={activeMapCity === city.id ? '#10355f' : '#10355f'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    style={{ transition: 'fill 0.25s ease', cursor: 'pointer' }}
                    onMouseEnter={(e: React.MouseEvent<SVGPolygonElement, MouseEvent>) => {
                      setActiveMapCity(city.id);
                      const target = e.currentTarget as SVGPolygonElement;
                      target.style.fill = '#10355f';
                      target.style.transform = 'scale(1.01)';
                      target.style.transformOrigin = `${city.lx}px ${city.ly}px`;
                    }}
                    onMouseLeave={(e: React.MouseEvent<SVGPolygonElement, MouseEvent>) => {
                      setActiveMapCity('Default');
                      const target = e.currentTarget as SVGPolygonElement;
                      target.style.fill = '#10355f';
                      target.style.transform = 'scale(1)';
                    }}
                  />
                ))}
              </svg>

              {/* Pins Overlay */}
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }}>
                {mapCities.map((loc, idx) => {
                  const leftPct = ((loc.lx + 20) / 560) * 100;
                  const topPct = ((loc.ly - 30) / 700) * 100;
                  const isActive = activeMapCity === loc.id;

                  return (
                    <Box
                      key={idx}
                      onMouseEnter={(e) => handlePinEnter(e, loc)}
                      onMouseLeave={handlePinLeave}
                      onClick={(e) => { e.stopPropagation(); handlePinClick(e, loc); }}
                      sx={{
                        position: 'absolute', top: `${topPct}%`, left: `${leftPct}%`,
                        transform: isActive ? 'translate(-50%, -60%) scale(1.25)' : 'translate(-50%, -50%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer',
                        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)', zIndex: isActive ? 20 : 10, pointerEvents: 'auto',
                      }}
                    >
                      <Box
                        component={motion.div}
                        variants={{
                          hidden: { opacity: 0, y: -300, scale: 3 },
                          visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, type: 'spring', bounce: 0.6, delay: 2.2 + (idx * 0.05) } }
                        }}
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                      >
                        <Box sx={{
                          width: { xs: 22, sm: 30, md: 36, lg: 42 }, height: { xs: 22, sm: 30, md: 36, lg: 42 },
                          borderRadius: '50%', bgcolor: isActive ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.18)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.3s'
                        }}>
                          <Box sx={{
                            width: { xs: 14, sm: 20, md: 24, lg: 28 }, height: { xs: 14, sm: 20, md: 24, lg: 28 },
                            borderRadius: '50%', bgcolor: isActive ? '#10355f' : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#fff' : '#10355f',
                            boxShadow: isActive ? '0 0 0 3px rgba(108, 118, 209, 0.3), 0 4px 12px rgba(0,0,0,0.18)' : '0 4px 12px rgba(0,0,0,0.18)', transition: 'all 0.25s'
                          }}>
                            <LocationOnIcon sx={{ fontSize: { xs: '0.55rem', sm: '0.7rem', md: '0.85rem', lg: '1rem' } }} />
                          </Box>
                        </Box>
                        <Typography sx={{
                          fontSize: { xs: '0.42rem', sm: '0.55rem', md: '0.65rem', lg: '0.73rem' }, fontWeight: 900, mt: 0.3, whiteSpace: 'nowrap',
                          bgcolor: isActive ? '#10355f' : '#fff', color: isActive ? '#fff' : '#10355f', px: { xs: 0.4, sm: 0.7, md: 1.0, lg: 1.2 },
                          py: { xs: 0.1, sm: 0.2, md: 0.25 }, borderRadius: '999px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'all 0.25s'
                        }}>
                          {loc.id}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: '#e2e8f0', color: '#1e293b', px: 2.5, py: 1, borderRadius: '999px', fontSize: '0.9rem', fontWeight: 700 }}>
                <Box sx={{ width: 10, height: 10, bgcolor: '#10b981', borderRadius: '50%' }} />
                More areas coming soon!
              </Box>
            </Box>
          </Container>

          {/* ── DESKTOP FLOATING POPUP ── */}
          {popupCity && !isMobile && (
            <Box onClick={(e) => e.stopPropagation()} sx={{ position: 'fixed', top: popupPos.y, left: popupPos.x, zIndex: 9999, width: 600, bgcolor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(16,53,95,0.22), 0 4px 16px rgba(0,0,0,0.10)', border: '1px solid rgba(16,53,95,0.08)', pointerEvents: 'auto', animation: 'popFade 0.18s ease-out forwards', display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '0', '@keyframes popFade': { from: { opacity: 0, transform: 'scale(0.93) translateY(6px)' }, to: { opacity: 1, transform: 'scale(1) translateY(0)' } } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', padding: '0' }}>
                <Box sx={{ position: 'relative', width: '100%', height: 200, overflow: 'hidden', bgcolor: '#f0f4f8' }}>
                  {!imageLoadState[activeMapCity] && <Box sx={{ width: '100%', height: '100%', bgcolor: '#e2e8f0', animation: 'pulse 1.5s ease-in-out infinite' }} />}
                  <Box component="img" src={popupCity.image} alt={popupCity.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: imageLoadState[activeMapCity] ? 1 : 0, transition: 'opacity 0.3s ease' }} />
                </Box>
                <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, bgcolor: '#e8f5e9', px: 1, py: 0.35, borderRadius: '999px', fontSize: '0.6rem', fontWeight: 700, color: '#1b5e20', mb: 0.8, width: 'fit-content' }}>
                    <Box sx={{ width: 5, height: 5, bgcolor: '#10b981', borderRadius: '50%' }} /> Active Coverage
                  </Box>
                  <Typography sx={{ fontWeight: '900', color: '#0a2540', fontSize: '0.95rem', lineHeight: 1.2, mb: 0.25 }}>{popupCity.title}</Typography>
                  <Typography sx={{ fontWeight: '700', color: '#10355f', fontSize: '0.75rem', mb: 0.6 }}>{popupCity.subtitle}</Typography>
                  <Typography color="#64748b" sx={{ fontSize: '0.72rem', lineHeight: 1.4 }}>{popupCity.description}</Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%)', borderLeft: '1px solid #bfdbfe', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 4, height: '100%', background: 'linear-gradient(180deg, #10355f 0%, #10355f100%)', borderRadius: '2px' }} />
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0c4a6e', textTransform: 'uppercase', letterSpacing: '0.8px', background: 'linear-gradient(90deg, #0c4a6e 0%, #10355f 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Available Services</Typography>
                </Box>

                {selectedPopupService ? (
                  <>
                    <Button onClick={() => setSelectedPopupService(null)} sx={{ textTransform: 'none', fontSize: '0.7rem', fontWeight: 700, color: '#10355f', p: 0, mb: 1.5, justifyContent: 'flex-start', transition: 'all 0.2s', '&:hover': { transform: 'translateX(-4px)' } }}>← Back to Services</Button>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#0c4a6e', mb: 1.2, textTransform: 'uppercase', letterSpacing: '0.6px', opacity: 0.8 }}>{selectedPopupService} Options:</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8 }}>
                      {serviceSubServices[selectedPopupService]?.map((subService) => (
                        <Box key={subService} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#fff', border: '1.5px solid #10355f', px: 1, py: 0.6, borderRadius: '8px', fontSize: '0.65rem', fontWeight: 700, color: '#0c4a6e', whiteSpace: 'normal', textAlign: 'left', cursor: 'pointer', boxShadow: '0 2px 8px rgba(14, 165, 233, 0.08)', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 6px 16px rgba(14, 165, 233, 0.16)', bgcolor: '#f0f9ff' } }}>
                          <Box sx={{ width: 5, height: 5, bgcolor: '#10355f', borderRadius: '50%', flexShrink: 0 }} />{subService}
                        </Box>
                      ))}
                    </Box>
                  </>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.9 }}>
                    {(() => {
                      let customList: string[] = [];
                      try {
                        const saved = localStorage.getItem('global_custom_services');
                        if (saved) customList = JSON.parse(saved);
                      } catch (e) { }
                      const displayServices = Array.from(new Set([...allServices, ...customList]));

                      return displayServices.map((service, idx) => {
                        const isAvailable = popupCity.services && popupCity.services.includes(service);
                        return (
                          <Box key={service} onClick={() => isAvailable && setSelectedPopupService(service)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.6, bgcolor: '#fff', border: '2px solid transparent', px: 1.2, py: 1.2, borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800, color: isAvailable ? '#0c4a6e' : '#94a3b8', textAlign: 'center', cursor: isAvailable ? 'pointer' : 'not-allowed', transition: 'all 0.3s', boxShadow: isAvailable ? '0 4px 12px rgba(2, 132, 199, 0.08)' : '0 2px 6px rgba(0, 0, 0, 0.05)', position: 'relative', overflow: 'hidden', background: isAvailable ? `linear-gradient(135deg, #fff 0%, #f0f9ff 100%)` : '#f8fafc', opacity: isAvailable ? 1 : 0.6, '&:hover': isAvailable ? { transform: 'translateY(-6px) scale(1.05)', boxShadow: '0 12px 24px rgba(14, 165, 233, 0.2)', borderColor: '#10355f', background: `linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)` } : {} }}>
                            <Box sx={{ position: 'relative' }}>
                              <Box sx={{ width: 6, height: 6, bgcolor: isAvailable ? '#10355f' : '#cbd5e1', borderRadius: '50%' }} />
                            </Box>
                            <Box sx={{ position: 'relative' }}>
                              {service}
                            </Box>
                            {!isAvailable && (
                              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.85)', backdropFilter: 'blur(2px)', color: '#fff', fontSize: '0.5rem', fontWeight: 900, px: 0.8, py: 0.4, borderRadius: '6px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', letterSpacing: '0.5px' }}>COMING SOON</Box>
                              </Box>
                            )}
                          </Box>
                        );
                      });
                    })()}
                  </Box>
                )}
                <Box sx={{ mt: 4, mb: 1, textAlign: 'right' }}>
                  <Typography onClick={() => navigate('/register')} sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#10355f', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'all 0.2s ease', '&:hover': { color: '#0284c7', transform: 'translateX(3px)' } }}>Book Now →</Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* ── MOBILE BOTTOM SHEET ── */}
          {popupCity && isMobile && (
            <>
              <Box onClick={() => setPopupCity(null)} sx={{ position: 'fixed', inset: 0, zIndex: 9998, bgcolor: 'rgba(0,0,0,0.35)', animation: 'bsIn 0.2s ease-out forwards', '@keyframes bsIn': { from: { opacity: 0 }, to: { opacity: 1 } } }} />
              <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, bgcolor: '#fff', borderRadius: '20px 20px 0 0', overflow: 'hidden', boxShadow: '0 -8px 40px rgba(16,53,95,0.18)', animation: 'sheetUp 0.28s cubic-bezier(0.34,1.2,0.64,1) forwards', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5, flexShrink: 0 }}>
                  <Box sx={{ width: 40, height: 4, bgcolor: '#cbd5e1', borderRadius: '999px' }} />
                </Box>
                <Box onClick={() => { setPopupCity(null); setSelectedPopupService(null); }} sx={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', bgcolor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, color: '#10355f', fontWeight: 900, fontSize: '1rem' }}>✕</Box>

                <Box sx={{ display: 'flex', gap: 0, flex: 1, overflow: 'auto', flexDirection: 'column' }}>
                  <Box component="img" src={popupCity.image} alt={popupCity.title} sx={{ width: '100%', height: 'auto', minHeight: 250, objectFit: 'cover', display: 'block', flexShrink: 0 }} />
                  <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'auto' }}>
                    <Box>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, bgcolor: '#e8f5e9', px: 1.5, py: 0.4, borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700, color: '#1b5e20', mb: 1.5 }}>
                        <Box sx={{ width: 7, height: 7, bgcolor: '#10b981', borderRadius: '50%' }} /> Active Coverage
                      </Box>
                      <Typography sx={{ fontWeight: '900', color: '#0a2540', fontSize: '1.3rem', lineHeight: 1.2, mb: 0.5 }}>{popupCity.title}</Typography>
                      <Typography sx={{ fontWeight: '700', color: '#10355f', fontSize: '0.9rem', mb: 1.5 }}>{popupCity.subtitle}</Typography>
                      <Typography color="#64748b" sx={{ fontSize: '0.9rem', lineHeight: 1.6, pb: 1.5 }}>{popupCity.description}</Typography>
                    </Box>

                    {popupCity.services && popupCity.services.length > 0 && (
                      <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                        {selectedPopupService ? (
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Button onClick={() => setSelectedPopupService(null)} sx={{ textTransform: 'none', fontSize: '0.8rem', fontWeight: 700, color: '#2E5BA8', p: 0, minWidth: 'auto', '&:hover': { textDecoration: 'underline' } }}>← Back to Services</Button>
                            </Box>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#10355f', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{selectedPopupService} - Services:</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                              {serviceSubServices[selectedPopupService]?.map((subService) => (
                                <Box key={subService} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, bgcolor: '#e8f5e9', border: '1px solid #10b981', px: 1.2, py: 0.6, borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#1b5e20', whiteSpace: 'nowrap' }}>
                                  <Box sx={{ width: 5, height: 5, bgcolor: '#10b981', borderRadius: '50%' }} />{subService}
                                </Box>
                              ))}
                            </Box>
                          </>
                        ) : (
                          <>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: '#10355f', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Available Services:</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {(() => {
                                let customList: string[] = [];
                                try {
                                  const saved = localStorage.getItem('global_custom_services');
                                  if (saved) customList = JSON.parse(saved);
                                } catch (e) { }
                                const displayServices = Array.from(new Set([...allServices, ...customList]));

                                return displayServices.map((service: string) => {
                                  const isAvailable = popupCity.services && popupCity.services.includes(service);
                                  return (
                                    <Box key={service} onClick={() => isAvailable && setSelectedPopupService(service)} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, p: 1.5, borderRadius: '12px', bgcolor: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: isAvailable ? 'pointer' : 'not-allowed', opacity: isAvailable ? 1 : 0.6, transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
                                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: isAvailable ? '#f0f9ff' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isAvailable ? '#0c4a6e' : '#94a3b8' }} />
                                      </Box>
                                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: isAvailable ? '#0a2540' : '#64748b', flexGrow: 1 }}>{service}</Typography>
                                      {!isAvailable && (
                                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pr: 2, pointerEvents: 'none' }}>
                                          <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.85)', backdropFilter: 'blur(2px)', color: '#fff', fontSize: '0.55rem', fontWeight: 900, px: 1, py: 0.5, borderRadius: '6px', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', letterSpacing: '0.5px' }}>COMING SOON</Box>
                                        </Box>
                                      )}
                                      {isAvailable && <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7' }}>Select →</Typography>}
                                    </Box>
                                  );
                                });
                              })()}
                            </Box>
                          </>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>

        {/* ===================== TESTIMONIALS ===================== */}
        {displayTestimonials.length > 0 && (
          <Box id="testimonials" sx={{ scrollMarginTop: { xs: '80px', md: '100px' }, position: 'relative', left: '50%', right: '50%', ml: '-50vw', mr: '-50vw', width: '100vw', bgcolor: '#0d264a', pt: { xs: 8, lg: 10 }, pb: { xs: 8, lg: 10 }, mt: 0, mb: 0, px: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', overflow: 'hidden' }}>
            <Container
              maxWidth="xl"
              component={motion.div}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              sx={{ position: 'relative', zIndex: 10 }}
            >
              <Box
                component={motion.div}
                variants={{
                  hidden: { opacity: 0, x: -80 },
                  visible: { opacity: 1, x: 0, transition: { duration: 1.5, ease: "easeOut" } }
                }}
                sx={{ textAlign: 'center', mb: 6 }}
              >
                <Box sx={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#23406e', color: 'white', borderRadius: '999px', px: 2.5, py: 0.8, fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.08em', boxShadow: 1, textTransform: 'uppercase', mb: 1.5 }}>CLIENT STORIES</Box>
                <Typography sx={{ fontSize: { xs: '1.75rem', sm: '2.2rem', lg: '2rem' }, fontWeight: 900, color: 'white', mb: 1, lineHeight: 1.2 }}>Trusted by Thousands of Filipino Homeowners</Typography>
                <Typography sx={{ color: 'rgba(191, 219, 254, 1)', fontSize: { xs: '0.85rem', sm: '1rem', lg: '0.9rem' }, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>Real reviews from verified clients across Metro Manila. We let our work do the talking.</Typography>
              </Box>

              <Box
                component={motion.div}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0, transition: { duration: 1.5, ease: "easeOut" } }
                }}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 4 }}
              >
                <Box sx={{ bgcolor: 'white', borderRadius: 3, boxShadow: '0 8px 32px rgba(16,53,95,0.18)', p: { xs: 2.5, sm: 4, lg: 3 }, width: { xs: '90vw', sm: '540px', lg: '500px' }, maxWidth: '500px', height: { xs: '290px', sm: '240px' }, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', mb: 1.5, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', background: displayTestimonials[testimonialIdx]?.avatarBg, color: displayTestimonials[testimonialIdx]?.avatarText, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>{displayTestimonials[testimonialIdx]?.initials}</Box>
                    <Box sx={{ textAlign: 'left', flex: 1 }}>
                      <Typography sx={{ fontWeight: 900, color: '#10355f', fontSize: '1.1rem', mb: 0.5 }}>{displayTestimonials[testimonialIdx]?.customer_name}</Typography>
                      <Box sx={{ display: 'flex', gap: 0.2, color: '#fbbf24' }}>
                        {Array.from({ length: displayTestimonials[testimonialIdx]?.rating || 5 }).map((_, i) => (
                          <StarIcon key={i} sx={{ fontSize: '1rem' }} />
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ display: { xs: 'none', lg: 'block' }, position: 'absolute', top: 16, right: 20 }}>
                      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="0" y="24" fontSize="32" fill="#eaf2fc">"</text></svg>
                    </Box>
                  </Box>
                  <Typography sx={{ color: '#222', fontSize: '1.02rem', fontWeight: 500, mt: 2, mb: 1, lineHeight: 1.6, textAlign: 'left', fontStyle: 'italic' }}>
                    "{displayTestimonials[testimonialIdx]?.feedback}"
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                  <Button onClick={handlePrev} sx={{ minWidth: 0, p: 0.8, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.12)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg></Button>
                  <Box sx={{ display: 'flex', gap: 0.8 }}>{displayTestimonials.map((_: any, idx: number) => (<Box key={idx} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'white', opacity: testimonialIdx === idx ? 0.8 : 0.4 }} />))}</Box>
                  <Button onClick={handleNext} sx={{ minWidth: 0, p: 0.8, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.12)', color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></Button>
                </Box>
              </Box>

              {/* Mini testimonial cards — desktop only (lg+) */}
              <Box
                component={motion.div}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0, transition: { duration: 1.5, delay: 0.2, ease: "easeOut" } }
                }}
                sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'row', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 3, width: '100%', maxWidth: '1000px', mx: 'auto' }}
              >
                {displayTestimonials.map((t: any, idx: number) => (
                  <Box key={t.id || t.initials} sx={{ bgcolor: 'rgba(255,255,255,0.10)', borderRadius: 2, p: 1.5, minWidth: 200, maxWidth: 240, color: 'white', fontWeight: 700, boxShadow: '0 2px 8px rgba(16,53,95,0.10)', border: testimonialIdx === idx ? '2px solid #eaf2fc' : '2px solid transparent', display: 'flex', flexDirection: 'column', gap: 0.8, opacity: testimonialIdx === idx ? 1 : 0.7, transition: 'border 0.2s, opacity 0.2s', cursor: 'pointer' }} onClick={() => setTestimonialIdx(idx)}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: t.avatarBg, color: t.avatarText, fontWeight: 900, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.initials}</Box>
                      <Typography sx={{ fontWeight: 700, color: 'white', fontSize: '0.85rem' }}>{t.customer_name}</Typography>
                    </Box>
                    <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.feedback}</Typography>
                  </Box>
                ))}
              </Box>
            </Container>
          </Box>
        )}

        {/* ===================== CONTACT SECTION ===================== */}
        <Box id="contact-us" sx={{ scrollMarginTop: { xs: '80px', md: '100px' }, position: 'relative', left: '50%', right: '50%', ml: '-50vw', mr: '-50vw', width: '100vw', bgcolor: '#f8fafc', py: { xs: 8, sm: 10, lg: 0 }, minHeight: { lg: '100vh' }, display: 'flex', alignItems: 'center', borderTop: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <Box sx={{ position: 'absolute', top: 0, right: 0, width: '45%', height: '100%', background: 'linear-gradient(135deg, rgba(46,91,168,0.04) 0%, rgba(16,53,95,0.06) 100%)', borderBottomLeftRadius: '100%', zIndex: 0 }} />
          <Container
            maxWidth="lg"
            component={motion.div}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'center', justifyContent: { xs: 'center', lg: 'space-between' }, gap: { xs: 4, sm: 5, lg: 4, xl: 8 }, width: '100%', maxWidth: { xs: '100%', sm: '650px', lg: '100%' }, mx: 'auto' }}>

              {/* Left: Info */}
              <Box
                component={motion.div}
                variants={{
                  hidden: { opacity: 0, x: -80 },
                  visible: { opacity: 1, x: 0, transition: { duration: 1.5, ease: "easeOut" } }
                }}
                sx={{ width: { xs: '100%', lg: '45%' }, maxWidth: { xs: '100%', sm: '600px', lg: '100%' }, mx: { xs: 'auto', lg: 0 } }}
              >
                <Box sx={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#eaf2fc', color: '#23406e', borderRadius: '8px', px: 1.5, py: 0.5, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', mb: 2 }}>Reach Out</Box>
                <Typography sx={{ fontSize: { xs: '2rem', sm: '2.8rem', lg: '2.5rem', xl: '3.2rem' }, fontWeight: 900, color: '#10355f', mb: 2, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                  Let's get in <br /><span style={{ color: '#2e5ba8' }}>touch.</span>
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: { xs: '0.9rem', sm: '1.05rem', lg: '0.9rem' }, mb: 4, lineHeight: 1.6 }}>
                  Whether you need help booking a pro, have questions about our services, or want to partner with AllFix, our team is ready to assist you.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ bgcolor: 'white', p: { xs: 1.25, sm: 1.5 }, borderRadius: 3, display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, boxShadow: '0 4px 12px rgba(16,53,95,0.04)', border: '1px solid #e2e8f0', width: '100%', maxWidth: { xs: '100%', sm: '420px', lg: '400px' } }}>
                    <Box sx={{ width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 }, borderRadius: '10px', bgcolor: '#eaf2fc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e5ba8', flexShrink: 0 }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </Box>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>EMAIL US</Typography>
                      <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, fontWeight: 800, color: '#10355f', whiteSpace: 'nowrap' }}>concierge.fpdnexus@gmail.com</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ bgcolor: 'white', p: { xs: 1.25, sm: 1.5 }, borderRadius: 3, display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, boxShadow: '0 4px 12px rgba(16,53,95,0.04)', border: '1px solid #e2e8f0', width: '100%', maxWidth: { xs: '100%', sm: '420px', lg: '400px' } }}>
                    <Box sx={{ width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 }, borderRadius: '10px', bgcolor: '#eaf2fc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e5ba8', flexShrink: 0 }}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </Box>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' }, fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>CALL US</Typography>
                      <Typography sx={{ fontSize: { xs: '0.8rem', sm: '0.95rem' }, fontWeight: 800, color: '#10355f', whiteSpace: 'nowrap' }}>+63 920 9631 217</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Right: Form */}
              <Box
                component={motion.div}
                variants={{
                  hidden: { opacity: 0, x: 80 },
                  visible: { opacity: 1, x: 0, transition: { duration: 1.5, ease: "easeOut" } }
                }}
                sx={{ width: { xs: '100%', lg: '50%' }, maxWidth: { xs: '100%', sm: '600px', lg: '100%' }, mx: { xs: 'auto', lg: 0 } }}
              >
                <Box sx={{ bgcolor: '#ffffff', borderRadius: '20px', p: { xs: 3, sm: 5, lg: 4 }, boxShadow: '0 20px 40px rgba(16,53,95,0.08)', border: '1px solid #eaf2fc' }}>
                  <Typography sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem', lg: '1.4rem' }, fontWeight: 900, color: '#10355f', mb: 0.5, letterSpacing: '-0.01em' }}>Send a direct message</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748b', mb: 3 }}>Fill out the form below and our support team will respond shortly.</Typography>
                  <form onSubmit={handleSubmitContact}>
                    <Grid container spacing={2.5}>
                      <Grid size={{ xs: 12, sm: 6 }} sx={{ width: '100%' }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#10355f', mb: 0.8 }}>Full Name</Typography>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="e.g. Juan Dela Cruz"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          disabled={contactSubmitting}
                          required
                          sx={{ width: '100%', '& .MuiOutlinedInput-root': { width: '100%', bgcolor: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#cbd5e1' }, '&.Mui-focused fieldset': { borderColor: '#2e5ba8', borderWidth: '2px' } } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }} sx={{ width: '100%' }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#10355f', mb: 0.8 }}>Email Address</Typography>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="juan@email.com"
                          type="email"
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          disabled={contactSubmitting}
                          required
                          sx={{ width: '100%', '& .MuiOutlinedInput-root': { width: '100%', bgcolor: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#cbd5e1' }, '&.Mui-focused fieldset': { borderColor: '#2e5ba8', borderWidth: '2px' } } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }} sx={{ width: '100%' }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#10355f', mb: 0.8 }}>How can we help?</Typography>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          placeholder="Tell us about your concern..."
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          disabled={contactSubmitting}
                          required
                          sx={{ width: '100%', '& .MuiOutlinedInput-root': { width: '100%', bgcolor: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', '& fieldset': { borderColor: '#e2e8f0' }, '&:hover fieldset': { borderColor: '#cbd5e1' }, '&.Mui-focused fieldset': { borderColor: '#2e5ba8', borderWidth: '2px' } } }}
                        />
                      </Grid>
                    </Grid>

                    {contactStatusMsg && (
                      <Typography sx={{
                        mt: 2,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: contactStatus === 'success' ? '#20b759' : '#d8242b',
                        textAlign: 'center'
                      }}>
                        {contactStatusMsg}
                      </Typography>
                    )}

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={contactSubmitting}
                      endIcon={!contactSubmitting && <ArrowForwardIcon sx={{ ml: 0.5, fontSize: '1.1rem' }} />}
                      sx={{ mt: 3.5, py: 1.5, bgcolor: '#10355f', color: 'white', borderRadius: '8px', fontWeight: 800, fontSize: '0.9rem', textTransform: 'none', boxShadow: '0 4px 12px rgba(16,53,95,0.2)', transition: 'all 0.2s ease', '&:hover': { bgcolor: '#0d264a', transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(16,53,95,0.3)' } }}
                    >
                      {contactSubmitting ? 'Sending Message...' : 'Submit Message'}
                    </Button>
                  </form>
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

