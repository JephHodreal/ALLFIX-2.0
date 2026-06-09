import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, Button, Typography, Alert, CircularProgress, Stepper, Step, StepLabel,
    CssBaseline, Container, Grid, IconButton, TextField,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
// Mock auth service for UI demonstration
const signUpUser = async (email: string, pass: string) => ({ success: true });
const confirmUserSignUp = async (email: string, code: string) => ({ success: true });

const BRAND = '#10355f';
const BRAND_MID = '#1a4a7a';

const steps: string[] = ['Account Details', 'Business Info', 'Verify Email'];

// --- TYPESCRIPT INTERFACES ---
interface HowItWorksStep {
    title: string;
    desc: string;
    img?: string;
}

interface FooterPill {
    name: string;
    icon: React.ReactNode;
}

interface Opportunity {
    image: string;
    title: string;
    tag: string;
    description: string;
}

interface BlueCellData {
    type: 'blue';
    quote: string;
    name: string;
    company: string;
}

interface ImgCellData {
    type: 'img';
    src: string;
}

type TestimonialCell = BlueCellData | ImgCellData;

interface TestimonialSlide {
    cells: TestimonialCell[];
}

interface MobileTestimonial {
    img: string;
    quote: string;
    name: string;
    company: string;
}

interface FAQ {
    question: string;
    answer: string;
}

// --- DATA ARRAYS ---
const howItWorksData: HowItWorksStep[] = [
    { title: 'The Customer Books', desc: 'The customer places a service booking through the AllFix app.' },
    { title: 'You Prepare', desc: 'You receive a notification to confirm and prepare for the job.' },
    { title: 'You Deliver', desc: "Head to the customer's location and complete the service." },
    { title: 'Watch Your Business Grow', desc: 'We provide insights so you can track your revenue and performance.' },
];

const footerPills: FooterPill[] = [
    { name: 'CoolFix', icon: <path d="M19.5 12h-15M17.5 16h-11M21.5 8h-15" strokeWidth="2" strokeLinecap="round" /> },
    { name: 'SaniFix', icon: <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
    { name: 'HomeFix', icon: <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 9.36l-7.1 7.1a1 1 0 01-1.42 0l-1.4-1.4a1 1 0 010-1.42l7.1-7.1a6 6 0 019.36-7.94l-3.77 3.77z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
    { name: 'MoveFix', icon: <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
    { name: 'GreenFix', icon: <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM11 20v-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
    { name: 'HealthFix', icon: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
    { name: 'SpaceFix', icon: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> },
    { name: 'PetFix', icon: <><circle cx="5.5" cy="8.5" r="1.5" strokeWidth="2" /><circle cx="10" cy="5" r="1.5" strokeWidth="2" /><circle cx="14" cy="5" r="1.5" strokeWidth="2" /><circle cx="18.5" cy="8.5" r="1.5" strokeWidth="2" /><path d="M12 18c-3 0-5-1.5-5-4 0-1.5 2-4 5-4s5 2.5 5 4c0 2.5-2 4-5 4z" strokeWidth="2" /></> },
    { name: 'TechFix', icon: <><rect x="4" y="4" width="16" height="16" rx="2" ry="2" strokeWidth="2" /><path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></> },
];

const opportunities: Opportunity[] = [
    {
        image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80',
        title: 'Connect With New Customers',
        tag: 'MARKET REACH',
        description: 'Adding your business to AllFix means access to thousands of new customers in different neighbourhoods across Metro Manila.',
    },
    {
        image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80',
        title: 'Unlock Revenue',
        tag: 'FINANCIAL GROWTH',
        description: "Let customers book your services from anywhere, and capture the interest of new ones who haven't found you yet.",
    },
    {
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
        title: 'Focus on Your Business',
        tag: 'OPERATIONAL SUPPORT',
        description: 'We take care of all the payments and customer support, so you can focus on what matters — delivering great service.',
    },
];

const testimonialSlides: TestimonialSlide[] = [
    {
        cells: [
            { type: 'blue', quote: '"The platform provided an opportunity for our brands to be readily accessible to customers whenever and wherever they are."', name: 'Rolando Cruz', company: 'CoolTech Aircon Services' },
            { type: 'img', src: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80' },
            { type: 'img', src: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=80' },
            { type: 'blue', quote: '"Apart from their strong customer base, AllFix always ensures that we grow our business together. Thank you AllFix!"', name: 'Maria Santos', company: 'Santos Plumbing & Repair' },
        ],
    },
    {
        cells: [
            { type: 'img', src: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80' },
            { type: 'blue', quote: '"We\'ve seen a 40% increase in monthly bookings since partnering with AllFix. Their platform is truly a game changer."', name: 'Jose Reyes', company: 'Reyes Electrical Solutions' },
            { type: 'blue', quote: '"AllFix handles customer support and payments so I can focus on delivering great work. My revenue doubled in just two months."', name: 'Ana Lim', company: 'Lim Pest Control Services' },
            { type: 'img', src: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80' },
        ],
    },
];

const mobileTestimonials: MobileTestimonial[] = [
    {
        img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80',
        quote: '"The platform provided an opportunity for our brands to be readily accessible to customers whenever and wherever they are."',
        name: 'Rolando Cruz',
        company: 'CoolTech Aircon Services'
    },
    {
        img: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&q=80',
        quote: '"Apart from their strong customer base, AllFix always ensures that we grow our business together. Thank you AllFix!"',
        name: 'Maria Santos',
        company: 'Santos Plumbing & Repair'
    },
    {
        img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80',
        quote: '"We\'ve seen a 40% increase in monthly bookings since partnering with AllFix. Their platform is truly a game changer."',
        name: 'Jose Reyes',
        company: 'Reyes Electrical Solutions'
    },
    {
        img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
        quote: '"AllFix handles customer support and payments so I can focus on delivering great work. My revenue doubled in just two months."',
        name: 'Ana Lim',
        company: 'Lim Pest Control Services'
    }
];

const faqData: FAQ[] = [
    {
        question: 'Are there any upfront fees to join AllFix?',
        answer: 'No, joining AllFix as a partner is completely free. There are no registration or subscription fees. We only charge a small commission on successfully completed bookings.',
    },
    {
        question: 'How long does the application process take?',
        answer: 'Once you submit your application and verify your email, our onboarding team will review your details. You can expect to hear back from us within 24 to 48 hours.',
    },
    {
        question: 'How do I get paid for my services?',
        answer: 'All customer payments are handled securely through the AllFix platform. Your earnings will be deposited directly into your registered bank account or preferred e-wallet on a weekly basis.',
    },
    {
        question: 'What kind of support will I receive?',
        answer: 'We handle all customer support, booking logistics, and payment processing so you can focus entirely on delivering great service. You will also have access to a dedicated Partner Support hotline for any operational issues.',
    },
];

const VendorApplication: React.FC = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [activeStep, setActiveStep] = useState<number>(0);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [testimonialIdx, setTestimonialIdx] = useState<number>(0);

    // New states for mobile interactions
    const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const [howItWorksIdx, setHowItWorksIdx] = useState<number>(0);
    const [oppIdx, setOppIdx] = useState<number>(0);
    const [mobileTestimonialIdx, setMobileTestimonialIdx] = useState<number>(0);

    const formRef = useRef<HTMLDivElement>(null);
    const howItWorksRef = useRef<HTMLDivElement>(null);
    const oppRef = useRef<HTMLDivElement>(null);
    const mobileTestimonialRef = useRef<HTMLDivElement>(null);

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [businessName, setBusinessName] = useState<string>('');
    const [businessAddress, setBusinessAddress] = useState<string>('');
    const [contactNumber, setContactNumber] = useState<string>('');
    const [serviceDescription, setServiceDescription] = useState<string>('');
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [partnerLogos, setPartnerLogos] = useState<{ id?: string; name: string; url: string }[]>([]);
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchPartnerLogos = async () => {
            try {
                const res = await fetch('/api/partner-logos');
                if (res.ok) {
                    const data = await res.json();
                    setPartnerLogos(data || []);
                }
            } catch (err) {
                console.error('Failed to fetch partner logos:', err);
            }
        };
        fetchPartnerLogos();
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTestimonialIdx(i => (i + 1) % testimonialSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const scrollToForm = () => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleHowItWorksScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const totalScroll = el.scrollWidth - el.clientWidth;
        if (totalScroll <= 0) return;
        const progress = el.scrollLeft / totalScroll;
        const index = Math.round(progress * (howItWorksData.length - 1));
        setHowItWorksIdx(index);
    };

    const handleOppScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const totalScroll = el.scrollWidth - el.clientWidth;
        if (totalScroll <= 0) return;
        const progress = el.scrollLeft / totalScroll;
        const index = Math.round(progress * (opportunities.length - 1));
        setOppIdx(index);
    };

    const handleMobileTestimonialScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const totalScroll = el.scrollWidth - el.clientWidth;
        if (totalScroll <= 0) return;
        const progress = el.scrollLeft / totalScroll;
        const index = Math.round(progress * (mobileTestimonials.length - 1));
        setMobileTestimonialIdx(index);
    };

    const scrollToHowItWorks = (index: number) => {
        if (howItWorksRef.current) {
            const el = howItWorksRef.current;
            const totalScroll = el.scrollWidth - el.clientWidth;
            el.scrollTo({ left: (totalScroll / (howItWorksData.length - 1)) * index, behavior: 'smooth' });
        }
    };

    const scrollToOpp = (index: number) => {
        if (oppRef.current) {
            const el = oppRef.current;
            const totalScroll = el.scrollWidth - el.clientWidth;
            el.scrollTo({ left: (totalScroll / (opportunities.length - 1)) * index, behavior: 'smooth' });
        }
    };

    const scrollToMobileTestimonial = (index: number) => {
        if (mobileTestimonialRef.current) {
            const el = mobileTestimonialRef.current;
            const totalScroll = el.scrollWidth - el.clientWidth;
            el.scrollTo({ left: (totalScroll / (mobileTestimonials.length - 1)) * index, behavior: 'smooth' });
        }
    };

    const handleNext = async () => {
        setError('');
        if (activeStep === 0) {
            if (password !== confirmPassword) return setError('Passwords do not match');
            if (password.length < 8) return setError('Password must be at least 8 characters');
            setActiveStep(1);
        } else if (activeStep === 1) {
            if (!businessName || !contactNumber) return setError('Please fill in all required fields');
            setIsLoading(true);
            const result: any = await signUpUser(email, password); // Adjust type based on your authService
            if (result.success) { setActiveStep(2); } else { setError(result.error); }
            setIsLoading(false);
        } else if (activeStep === 2) {
            setIsLoading(true);
            const result: any = await confirmUserSignUp(email, verificationCode); // Adjust type based on your authService
            if (result.success) {
                navigate('/vendor-application-submitted', { state: { businessName, email } });
            } else { setError(result.error); }
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (activeStep) {
            case 0:
                return (
                    <>
                        <TextField size="small" label="Email" type="email" fullWidth required value={email} onChange={e => setEmail(e.target.value)} sx={{ mb: 1.5 }} disabled={isLoading} />
                        <TextField size="small" label="Password" type="password" fullWidth required value={password} onChange={e => setPassword(e.target.value)} sx={{ mb: 1.5 }} disabled={isLoading} helperText="Minimum 8 characters" />
                        <TextField size="small" label="Confirm Password" type="password" fullWidth required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={isLoading} />
                    </>
                );
            case 1:
                return (
                    <>
                        <TextField size="small" label="Business Name" fullWidth required value={businessName} onChange={e => setBusinessName(e.target.value)} sx={{ mb: 1.5 }} disabled={isLoading} />
                        <TextField size="small" label="Business Address" fullWidth value={businessAddress} onChange={e => setBusinessAddress(e.target.value)} sx={{ mb: 1.5 }} disabled={isLoading} />
                        <TextField size="small" label="Contact Number" fullWidth required value={contactNumber} onChange={e => setContactNumber(e.target.value)} sx={{ mb: 1.5 }} disabled={isLoading} />
                        <TextField size="small" label="Services Description" fullWidth multiline rows={2} value={serviceDescription} onChange={e => setServiceDescription(e.target.value)} disabled={isLoading} helperText="Briefly describe your services" />
                    </>
                );
            case 2:
                return (
                    <>
                        <Typography variant="body2" sx={{ mb: 1.5 }}>
                            A verification code has been sent to <strong>{email}</strong>
                        </Typography>
                        <TextField size="small" label="Verification Code" fullWidth required value={verificationCode} onChange={e => setVerificationCode(e.target.value)} disabled={isLoading} placeholder="Enter 6-digit code" />
                    </>
                );
            default: return null;
        }
    };

    const BlueCell = ({ quote, name, company }: { quote: string; name: string; company: string }) => (
        <Box sx={{
            bgcolor: BRAND,
            p: { xs: 4, sm: 5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
        }}>
            <Typography sx={{
                color: 'white',
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontWeight: 600,
                fontStyle: 'italic',
                lineHeight: 1.7,
                mb: 2,
            }}>
                {quote}
            </Typography>
            <Typography sx={{ color: 'white', fontWeight: 800, fontSize: { xs: '0.9rem', md: '0.95rem' }, mb: 0.3 }}>{name}</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.8rem', md: '0.85rem' } }}>{company}</Typography>
        </Box>
    );

    const ImgCell = ({ src }: { src: string }) => (
        <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <Box component="img" src={src} alt="testimonial partner"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </Box>
    );

    return (
        <>
            <CssBaseline />

            <Navbar isLandingPage={false} backRoute="/" backLabel="Back" />

            {/* ── HERO SECTION ── */}
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
                {/* BACKGROUND IMAGE - Right Half */}
                <Box
                    component="img"
                    src="https://plus.unsplash.com/premium_photo-1722686486500-9f54228769de?q=80&w=1160&auto=format&fit=crop"
                    alt="technician tools"
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
                                Grow Your Business <br />
                                <Box component="span" sx={{ color: '#ffffff' }}>
                                    With{' '}
                                    <Box component="span" sx={{ color: '#017550' }}>All</Box>
                                    <Box component="span" sx={{ color: '#fcbc26' }}>Fi</Box>
                                    <Box component="span" sx={{ color: '#d8242b' }}>x</Box>
                                    .ph
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
                                Join the Philippines' fastest-growing home services platform. List your business, reach thousands of customers across Metro Manila, and watch your bookings grow — all with zero upfront cost.
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
                                    onClick={() => { navigate('/register-vendor'); window.scrollTo(0, 0); }}
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
                                    Apply Now
                                </Button>

                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => { navigate('/personnel-apply'); window.scrollTo(0, 0); }}
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
                                    Register as Personnel
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
                                        onClick={() => { navigate('/login', { state: { from: '/vendor-apply' } }); window.scrollTo(0, 0); }}
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

            {/* ── HOW IT WORKS ── */}
            <Box sx={{
                width: '100%', bgcolor: 'white',
                pt: { xs: 8, sm: 8, md: 10 }, pb: { xs: 6, sm: 6, md: 8 },
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 3, md: 4 } }}>
                    <Box sx={{ mb: { xs: 5, md: 8 }, textAlign: 'center', px: 3 }}>
                        <Typography variant="h3" sx={{
                            fontSize: { xs: '1.8rem', sm: '2.1rem', md: '2.8rem' },
                            fontWeight: 900, color: BRAND, lineHeight: 1.2,
                        }}>
                            We make it <span style={{ color: '#0d264a' }}>simple and easy</span>
                        </Typography>
                    </Box>

                    {/* Horizontal scroll container on Mobile, Grid on Desktop */}
                    <Box
                        ref={howItWorksRef}
                        onScroll={handleHowItWorksScroll}
                        sx={{
                            display: { xs: 'flex', sm: 'grid' },
                            flexDirection: { xs: 'row', sm: 'unset' },
                            overflowX: { xs: 'auto', sm: 'unset' },
                            scrollSnapType: { xs: 'x mandatory', sm: 'unset' },
                            gridTemplateColumns: { sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                            gap: { xs: 3, sm: 3, md: 3 },
                            width: '100%',
                            px: { xs: 3, sm: 0 },
                            pb: { xs: 2, sm: 0 },
                            '&::-webkit-scrollbar': { display: 'none' },
                        }}
                    >
                        {howItWorksData.map((step, index) => (
                            <Box key={index} sx={{ minWidth: { xs: '85%', sm: 'auto' }, scrollSnapAlign: 'start' }}>
                                <Box sx={{
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', textAlign: 'center',
                                    height: '100%', position: 'relative',
                                }}>
                                    {/* Floating SVG image container */}
                                    <Box sx={{
                                        width: { xs: '115px', sm: '140px', md: '165px' },
                                        height: { xs: '115px', sm: '140px', md: '165px' },
                                        mb: -1, zIndex: 2,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {step.title === 'The Customer Books' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 960.001 690.941" style={{ filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.12))' }}>
                                                <defs>
                                                    <linearGradient id="a-1444" x1="-145.593" y1="1" x2="-145.593" gradientUnits="objectBoundingBox">
                                                        <stop offset="0" stopColor="gray" stopOpacity="0.251" />
                                                        <stop offset="0.535" stopColor="gray" stopOpacity="0.122" />
                                                        <stop offset="1" stopColor="gray" stopOpacity="0.102" />
                                                    </linearGradient>
                                                </defs>
                                                <g transform="translate(-480 -195)">
                                                    <g transform="translate(1255.777 411.489)">
                                                        <path d="M994.932,546.427c-6.231,6.808-13.959,11.876-22.345,15.811h-.01c-.789.374-1.578.738-2.377,1.082h-.01l-.01.01-.01-.01h-.01a.01.01,0,0,1-.01.01h-.01l-.01-.01c-.01.01-.01.01-.02,0l-.01.01-.01-.01h-.01c-.01.01-.01.01-.02,0h-.01a141.386,141.386,0,0,1-17.257,6.17,239.386,239.386,0,0,1-106.325,5.554l-2.023-.364V492.632c.668-.283,1.346-.566,2.023-.84q6.631-2.746,13.424-5.048,9.772-3.338,19.816-5.725a214.62,214.62,0,0,1,66.8-5.4q6.115.455,12.2,1.315c8.487,1.184,17.389,3.247,25.218,6.828h.01c1.143.536,2.266,1.093,3.379,1.689,6.959,3.773,12.826,8.963,16.407,16.074a30.922,30.922,0,0,1,2.752,8.082v.02c.2.971.344,1.952.455,2.923C1008.2,524.526,1003.236,537.343,994.932,546.427Z" transform="translate(-844.441 -321.168)" fill="#f2f2f2" />
                                                        <path d="M1006.929,512.154a1.392,1.392,0,0,1-.3.04q-25.992,1.138-51.914,3.379h-.03c-.071.01-.131.01-.2.02q-26.614,2.306-53.118,5.776c-.748.1-1.487.2-2.226.293q-18.329,2.443-36.588,5.422-8.057,1.32-16.084,2.751c-.678.121-1.345.233-2.023.364v-3.065c.678-.131,1.355-.243,2.023-.364q26.736-4.734,53.653-8.265,6.767-.91,13.555-1.72,19.6-2.367,39.269-4.087l2.873-.243q25.173-2.14,50.416-3.247a.954.954,0,0,1,.243.02C1008.092,509.372,1008.436,511.8,1006.929,512.154Z" transform="translate(-844.441 -320.772)" fill="#fff" />
                                                        <path d="M970.322,559.809c-21.587.159-42.853-8.995-58.122-24.145a78.719,78.719,0,0,1-11.313-14.233c-1.029-1.65-3.437.17-2.417,1.806,11.858,19.018,31.611,32.565,53.389,37.547A81.746,81.746,0,0,0,970.71,562.8C972.645,562.787,972.244,559.8,970.322,559.809Z" transform="translate(-843.82 -320.639)" fill="#fff" />
                                                        <path d="M879.7,480.95a1.712,1.712,0,0,1-1.264,1.143,65.975,65.975,0,0,0-14.242,5.564,69.195,69.195,0,0,0-17.733,13.4c-.273.273-.536.546-.789.829-.425.445-.83.9-1.234,1.366v-4.41c.648-.688,1.325-1.366,2.023-2.013a72.747,72.747,0,0,1,13.423-10.156Q869.66,483.337,879.7,480.95Z" transform="translate(-844.441 -321.1)" fill="#fff" />
                                                        <path d="M984.476,482.873a70.206,70.206,0,0,0-32.8,28.916,1.517,1.517,0,0,0,.8,1.976,1.545,1.545,0,0,0,1.976-.8,66.812,66.812,0,0,1,31.152-27.3c1.786-.763.655-3.56-1.134-2.8Z" transform="translate(-843.202 -321.079)" fill="#fff" />
                                                        <path d="M1027.109,398.517c-2.347,8.922-6.848,17-12.442,24.379l-.01.01c-.516.688-1.052,1.386-1.608,2.053v.01a140.887,140.887,0,0,1-12.554,13.545,236.13,236.13,0,0,1-53.987,38.571c-31.024,16.205-65.7,25.785-100.043,26.331-.263.01-.526.01-.789.01-.415.01-.83.01-1.234.01V457.461c.657-1.254,1.335-2.509,2.023-3.753a222.064,222.064,0,0,1,32.4-44.327c.3-.334.617-.668.93-.991q7.1-7.5,14.89-14.273a213.258,213.258,0,0,1,68.068-40.311c8.062-2.893,16.9-5.21,25.5-5.665,1.264-.071,2.519-.1,3.783-.091,7.921.111,15.517,1.983,22,6.616a31.356,31.356,0,0,1,6.191,5.877c.627.779,1.2,1.578,1.76,2.4v.01C1028.688,372.965,1030.245,386.611,1027.109,398.517Z" transform="translate(-844.441 -322.636)" fill="#f2f2f2" />
                                                        <path d="M1021.991,362.8v.01a1.466,1.466,0,0,1-.243.172q-22.457,13.064-44.347,27.08c-.02.01-.03.02-.051.03a1.71,1.71,0,0,1-.182.111q-22.5,14.415-44.367,29.8c-.607.425-1.224.86-1.841,1.295q-15.1,10.667-29.882,21.789-27.92,21.03-54.615,43.619c-.678.567-1.345,1.143-2.023,1.72V484.49c.668-.577,1.346-1.153,2.023-1.72q10.227-8.634,20.636-17.025c2.074-1.669,4.157-3.338,6.241-4.987q27.768-22.108,56.779-42.567h.01q5.706-4.021,11.431-7.971,16.266-11.2,32.9-21.86c.8-.516,1.608-1.032,2.417-1.548q21.289-13.6,43.133-26.3a1.506,1.506,0,0,1,.223-.111C1021.748,359.794,1023.174,361.8,1021.991,362.8Z" transform="translate(-844.441 -322.495)" fill="#fff" />
                                                        <path d="M1011.34,421.156c-19.043,10.168-42.128,11.941-62.687,5.617a78.727,78.727,0,0,1-16.63-7.349c-1.678-.984-2.965,1.747-1.3,2.722,19.335,11.333,43.121,14.155,64.72,8.45a81.746,81.746,0,0,0,17.631-6.971c1.708-.912-.037-3.375-1.733-2.469Z" transform="translate(-843.453 -321.813)" fill="#fff" />
                                                        <path d="M869.575,458.463a69.341,69.341,0,0,1-.964-16.053,73.158,73.158,0,0,1,10.905-34.546q7.109-7.493,14.894-14.275a1.724,1.724,0,0,1-.593,1.6,66.2,66.2,0,0,0-10.026,11.539,69.921,69.921,0,0,0-11.21,51.481,1.226,1.226,0,0,1-.317,1.156,1.643,1.643,0,0,1-2.688-.906Z" transform="translate(-844.164 -322.11)" fill="#fff" />
                                                        <path d="M987.988,346.619a70.2,70.2,0,0,0-15.611,40.842A1.517,1.517,0,0,0,974,388.838a1.545,1.545,0,0,0,1.378-1.628,66.812,66.812,0,0,1,14.908-38.643C991.517,347.062,989.217,345.111,987.988,346.619Z" transform="translate(-842.963 -322.659)" fill="#fff" />
                                                        <path d="M884.712,380.124v.01c-.07.87-.152,1.73-.243,2.59v.02a142.92,142.92,0,0,1-3.287,18.168c-.708,2.934-1.477,5.847-2.316,8.76-.1.374-.213.749-.324,1.113v.01a232.174,232.174,0,0,1-8.841,24.935,241.68,241.68,0,0,1-23.236,42.708c-.657.981-1.335,1.962-2.023,2.934V322.96c.678-.04,1.346-.04,2.023-.02q.485,0,.971.03a30.671,30.671,0,0,1,8.376,1.629c.951.314,1.871.668,2.782,1.062,11.036,4.835,19.705,15.5,23.468,27.221C884.884,361.663,885.45,370.9,884.712,380.124Z" transform="translate(-844.441 -322.927)" fill="#f2f2f2" />
                                                        <path d="M858.593,325.649a1.087,1.087,0,0,1-.112.283q-6.145,11.942-12.017,24c-.678,1.386-1.355,2.782-2.023,4.168v-6.879q1-2.064,2.023-4.127,4.537-9.2,9.226-18.309a1.31,1.31,0,0,1,.122-.2C856.742,323.252,859.048,324.163,858.593,325.649Z" transform="translate(-844.441 -322.915)" fill="#fff" />
                                                        <path d="M885.035,381.1c-.182.324-.364.647-.567.971a80.739,80.739,0,0,1-10.54,14.4,86.908,86.908,0,0,1-27.464,20c-.668.324-1.345.627-2.023-.91V414.1c.678-.3,1.355-.617,2.023-.941a81.8,81.8,0,0,0,35.779-33.2,1.664,1.664,0,0,1,2.468-.475,1.166,1.166,0,0,1,.323,1.619Z" transform="translate(-844.441 -322.277)" fill="#fff" />
                                                    </g>
                                                    <path d="M951.53,205.653V293.52h-2.312v-.936H175.754v.936h-2.312V205.653A38.19,38.19,0,0,1,211.594,167.5H913.377a38.19,38.19,0,0,1,38.153,38.153Z" transform="translate(306.559 27.5)" fill="#10355f" />
                                                    <path d="M913.377,167.5H211.594a38.19,38.19,0,0,0-38.153,38.153V707.422a38.19,38.19,0,0,0,38.153,38.153H913.377a38.191,38.191,0,0,0,38.153-38.153V205.653A38.19,38.19,0,0,0,913.377,167.5Zm35.841,539.922a35.886,35.886,0,0,1-35.841,35.841H211.594a35.886,35.886,0,0,1-35.841-35.841V205.653a35.886,35.886,0,0,1,35.841-35.841H913.377a35.886,35.886,0,0,1,35.841,35.841Z" transform="translate(306.559 27.5)" fill="#3f3d56" />
                                                    <circle cx="23.123" cy="23.123" r="23.123" transform="translate(614.113 234.887)" fill="#fff" />
                                                    <circle cx="23.123" cy="23.123" r="23.123" transform="translate(1077.73 234.887)" fill="#fff" />
                                                    <path d="M388.773,459.72H251.218a22,22,0,0,1-21.98-21.98V372.727a22,22,0,0,1,21.98-21.98H388.773a22,22,0,0,1,21.98,21.98V437.74a22.005,22.005,0,0,1-21.98,21.98Z" transform="translate(315.271 56.114)" fill="#10355f" />
                                                    <path d="M591.171,459.72H453.617a22,22,0,0,1-21.98-21.98V372.727a22,22,0,0,1,21.98-21.98H591.171a22,22,0,0,1,21.98,21.98V437.74a22.005,22.005,0,0,1-21.98,21.98Z" transform="translate(346.877 56.114)" fill="#10355f" />
                                                    <path d="M591.261,605.191H453.707a22.672,22.672,0,0,1-22.646-22.646V517.531a22.672,22.672,0,0,1,22.646-22.646H591.261a22.672,22.672,0,0,1,22.646,22.646v65.014A22.672,22.672,0,0,1,591.261,605.191Z" transform="translate(346.785 78.621)" fill="#f2f2f2" />
                                                    <path d="M388.473,605.191H250.918a22.672,22.672,0,0,1-22.646-22.646V517.531a22.672,22.672,0,0,1,22.646-22.646H388.473a22.672,22.672,0,0,1,22.646,22.646v65.014a22.672,22.672,0,0,1-22.646,22.646Z" transform="translate(315.121 78.621)" fill="#f2f2f2" />
                                                    <path d="M793.66,605.191H656.105a22.672,22.672,0,0,1-22.646-22.646V517.531a22.672,22.672,0,0,1,22.646-22.646H793.66a22.672,22.672,0,0,1,22.646,22.646v65.014A22.672,22.672,0,0,1,793.66,605.191Z" transform="translate(378.391 78.621)" fill="#f2f2f2" />
                                                    <path d="M793.66,460.013H656.105a22.672,22.672,0,0,1-22.646-22.646V372.353a22.672,22.672,0,0,1,22.646-22.646H793.66a22.672,22.672,0,0,1,22.646,22.646v65.014A22.672,22.672,0,0,1,793.66,460.013Z" transform="translate(378.391 55.952)" fill="#f2f2f2" />
                                                    <circle cx="37.3" cy="37.3" r="37.3" transform="translate(597.969 424.047)" fill="#fff" />
                                                    <path d="M306.25,414.013a3.868,3.868,0,0,1-2.328-.773l-.042-.031-8.766-6.711a3.894,3.894,0,0,1,4.737-6.183l5.678,4.354,13.417-17.5a3.894,3.894,0,0,1,5.46-.721l-.083.113.086-.112a3.9,3.9,0,0,1,.721,5.46l-15.782,20.582A3.9,3.9,0,0,1,306.25,414.013Z" transform="translate(325.32 61.563)" fill="#10355f" />
                                                    <circle cx="37.3" cy="37.3" r="37.3" transform="translate(832.637 423.512)" fill="#fff" />
                                                    <path d="M509.225,413.549a3.868,3.868,0,0,1-2.328-.773l-.042-.031-8.766-6.711a3.894,3.894,0,0,1,4.737-6.183L508.5,404.2l13.417-17.5a3.894,3.894,0,0,1,5.46-.721l-.083.113.086-.112a3.9,3.9,0,0,1,.721,5.46L512.323,412.03a3.9,3.9,0,0,1-3.1,1.52Z" transform="translate(357.014 61.491)" fill="#10355f" />
                                                    <path d="M906.378,732.812H465.885a1.156,1.156,0,0,1,0-2.312H906.378a1.156,1.156,0,0,1,0,2.312Z" transform="translate(352.043 133.911)" fill="#e6e6e6" />
                                                    <g transform="translate(-683.91)">
                                                        <path d="M279.454,796.9a.406.406,0,0,1,.085.043c-1.042-2.25-2.013-4.526-2.9-6.838-.1-.271-.2-.551-.306-.823.008.07.008.14.018.219.026.438.061.875.1,1.322.053.691.1,1.392.1,2.093.008.219.008.426.008.648a12.8,12.8,0,0,1-.263,2.539h.035c.219.018.42.026.631.061a8.568,8.568,0,0,1,2.387.682.521.521,0,0,1,.1.053Z" transform="translate(1401.857 63.627)" fill="url(#a-1444)" />
                                                        <path d="M18.5,67.489c.193-3.651,1.432-7.193,1.524-10.847a20.828,20.828,0,0,0-1.087-6.956q-.134-.37-.271-.737a24.868,24.868,0,1,1,25.7-8.668c-.095.345-.182.677-.252.987a7.086,7.086,0,0,0-.133.751,36.592,36.592,0,0,0,1.052,13.559c.937,3.421,2.526,6.9,5.51,8.824-5.785-.871-11.557.268-17.345,1.407a68.581,68.581,0,0,1-13.139,1.717C19.542,67.526,19.019,67.515,18.5,67.489Z" transform="translate(1644.709 460.025)" fill="#ed9da0" />
                                                        <path d="M393.158,389.082a15.738,15.738,0,0,0,3.288,3.314c.817.669,1.654,1.353,2.531,1.968a10.853,10.853,0,0,0,5.383,2.19c2.565.171,8.008-1.332,9.6-3.529a6.365,6.365,0,0,0,.917-3.676,16.911,16.911,0,0,0-.884-5.142,28.657,28.657,0,0,0-4.151-7.512c-1.855-2.578-3.921-5.114-6.676-6.676a25.892,25.892,0,0,0-2.839-1.306c-1.674-.682-3.341-1.372-5.015-2.056a2.422,2.422,0,0,0-.91-.241c-1.346.014-1.594,2.069-.83,3.18,1.527,2.237,4.962,2.859,5.926,5.4a3.847,3.847,0,0,0-3.576,2.772,1.96,1.96,0,0,1-.482,1.118c-.442.355-1.132.154-1.634.422-.891.476-.5,1.8-.6,2.805a13.125,13.125,0,0,1-.917,2.524,5.363,5.363,0,0,0,.863,4.446Z" transform="translate(1165.104 116.29)" fill="#ed9da0" />
                                                        <path d="M269.715,808.553c-.828-.828-2.183-.687-3.34-.5a123.916,123.916,0,0,1-18.779,1.519c-.788-3.845,1.5-7.586,2.235-11.437a10.309,10.309,0,0,1,.744-2.892c.886-1.7,2.883-2.477,4.759-2.872,3.384-.713,8.674-1.973,10.564,1.449C268.164,797.923,268.889,803.987,269.715,808.553Z" transform="translate(1436.955 63.346)" fill="#ed9da0" />
                                                        <path d="M283.33,791.776c2.551,1.74,5.718,2.284,8.784,2.678s6.226.69,9.005,2.056c2.4,1.185,4.419,3.127,6.957,3.977a14.491,14.491,0,0,0,7.225.114c2.852-.535,5.892-1.574,7.432-4.038,1.372-2.19,1.226-4.968,1.038-7.546q-.332-4.368-.649-8.751a4.167,4.167,0,0,0-.542-2.115c-2.062-3.006-7.075,1.259-9.762,1.252-4.252-.007-8.818-2.31-11.884-5.129a3.615,3.615,0,0,0-.924-.7c-1.212-.542-2.424.462-3.5,1.339-.12.1-.241.2-.361.295-2.484,1.968-5.818,2.37-8.885,3.167s-6.36,2.4-7.312,5.43a4.617,4.617,0,0,0-.147.582C279.247,787.177,280.94,790.143,283.33,791.776Z" transform="translate(1354.533 65.602)" fill="#090814" />
                                                        <path d="M319.114,576.021a38.331,38.331,0,0,1-5.253,28.282,52.807,52.807,0,0,0-4.27,6.847,31.115,31.115,0,0,0-1.666,5.426l-4.732,19.587c-1.279,5.285-2.564,10.677-2.18,16.1.268,3.781,1.221,8.033-1.108,11.022a8.12,8.12,0,0,0-1.408,1.931,4.889,4.889,0,0,0-.023,2.545c2.394,14.221,4.17,29.088-.155,42.845-3.921,12.469-4.143,26.285-7.476,38.924a8.677,8.677,0,0,1-2.07,4.316,6.785,6.785,0,0,1-3.1,1.475c-4.911,1.169-10.1-.2-14.678-2.323-3.219-1.492-6.684-4.108-6.409-7.645.131-1.683,1.114-3.154,1.781-4.708,1.308-3.04,1.413-6.437,1.767-9.729.886-8.268,3.434-16.244,5.36-24.331s3.234-16.536,1.6-24.686a215.944,215.944,0,0,0-15.882-48.857,5.894,5.894,0,0,0-1.455-2.188,15.045,15.045,0,0,1-2.059-1.405,6.212,6.212,0,0,1-.942-2.561c-.716-2.58-2.844-4.483-4.27-6.749-3.6-5.721-2.46-13.055-2.327-19.814.13-6.573-.817-13.207.261-19.69s4.793-13.114,11.045-15.146c3.1-1.007,6.446-.778,9.686-.458C286.318,566.734,303,569.853,319.114,576.021Z" transform="translate(1386.389 91.587)" fill="#090814" />
                                                        <path d="M248.142,617.695a41.051,41.051,0,0,0,.863,7.6q4.54,25.459,9.675,50.812c.3,1.466.6,2.933.991,4.372a35.457,35.457,0,0,0,6.555,12.9c14.269,17.783,15.5,43.608,23.24,65.053.522,1.449,1.044,2.906,1.6,4.339a108.352,108.352,0,0,0,4.773,10.654,3.047,3.047,0,0,0,.984,1.272,2.921,2.921,0,0,0,1.553.3,45.345,45.345,0,0,0,20.106-4.573,4.165,4.165,0,0,0,2.136-1.774,4.292,4.292,0,0,0,.228-2.046c-.214-4.252-.476-8.657-2.5-12.393a26.444,26.444,0,0,0-4.955-6.006,227.384,227.384,0,0,0-4.858-39.744c-1.506-6.662-3.368-13.4-7.237-19.028-2.852-4.158-6.943-8.262-6.441-13.277.221-2.2,1.145-4.944-.649-6.24-.783-.569-1.942-.643-2.472-1.449a2.756,2.756,0,0,1-.349-1.245,30.745,30.745,0,0,1,.636-10.291,54.279,54.279,0,0,0,1.534-6.709,8.447,8.447,0,0,0-1.688-6.478c-.094-4.58.033-9.333-.061-13.906a25.792,25.792,0,0,1,.643-7.767c.348-1.2.877-2.343,1.145-3.569.957-4.4-1.433-9.668,1.412-13.156,1.185-1.449,3.013-2.169,4.566-3.214a16.753,16.753,0,0,0,6.267-9.012,49.738,49.738,0,0,0,1.775-11.034,11.356,11.356,0,0,0,.026-2.387,4.366,4.366,0,0,0-.321-1.193c-.884-1.989-3.261-2.758-5.377-3.267a174.1,174.1,0,0,0-41.057-4.8c-5.114-3.482-7.994-2.237-10.164,1.449a38.131,38.131,0,0,0-2.892,7.063c-.991,2.993-1.051,19.745-2.015,22.751C244.567,605.61,248.189,613.591,248.142,617.695Z" transform="translate(1387.432 91.138)" fill="#090814" />
                                                    </g>
                                                </g>
                                            </svg>
                                        ) : step.title === 'You Prepare' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 606.625 720" xmlnsXlink="http://www.w3.org/1999/xlink" role="img" style={{ filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.12))' }}>
                                                <g transform="translate(-789 -270.5)">
                                                    <path d="M797.411,247.279A24.721,24.721,0,0,0,774.8,232.154H323.562A24.474,24.474,0,0,0,299.1,256.615V827.478a24.474,24.474,0,0,0,24.461,24.461H774.82a24.493,24.493,0,0,0,24.461-24.461V256.615a24.029,24.029,0,0,0-1.854-9.335Zm-3.578,580.2A19.052,19.052,0,0,1,774.8,846.506H323.562a19.031,19.031,0,0,1-19.029-19.022V256.618a19.055,19.055,0,0,1,19.029-19.029H774.82a19.123,19.123,0,0,1,17.663,11.97,21.087,21.087,0,0,1,.715,2.147,18.869,18.869,0,0,1,.651,4.912Z" transform="translate(489.898 138.561)" fill="#3f3d56" />
                                                    <path d="M578.54,312.161H442.619a10.874,10.874,0,0,1,0-21.748H578.54a10.874,10.874,0,1,1,0,21.748Z" transform="translate(614.601 193.333)" fill="#3f3d56" />
                                                    <path d="M578.54,341.585H442.619a10.874,10.874,0,0,1,0-21.748H578.54a10.874,10.874,0,1,1,0,21.748Z" transform="translate(614.601 220.995)" fill="#3f3d56" />
                                                    <path d="M455.465,416.457h-99.33A12.247,12.247,0,0,1,343.9,404.223V287.006a12.247,12.247,0,0,1,12.234-12.234h99.33A12.247,12.247,0,0,1,467.7,287.006V404.223A12.247,12.247,0,0,1,455.465,416.457Z" transform="translate(532.016 178.628)" fill="#10355f" />
                                                    <path d="M661.041,401.835H353.861a10.874,10.874,0,0,1,0-21.748h307.18a10.874,10.874,0,1,1,0,21.748Z" transform="translate(531.157 277.638)" fill="#ccc" />
                                                    <path d="M661.041,431.258H353.861a10.874,10.874,0,0,1,0-21.748h307.18a10.874,10.874,0,1,1,0,21.748Z" transform="translate(531.157 305.3)" fill="#ccc" />
                                                    <path d="M661.041,460.682H353.861a10.874,10.874,0,0,1,0-21.748h307.18a10.874,10.874,0,1,1,0,21.748Z" transform="translate(531.157 332.962)" fill="#ccc" />
                                                    <path d="M661.041,490.106H353.861a10.874,10.874,0,0,1,0-21.748h307.18a10.874,10.874,0,1,1,0,21.748Z" transform="translate(531.157 360.625)" fill="#ccc" />
                                                    <path d="M661.041,519.53H353.861a10.874,10.874,0,0,1,0-21.748h307.18a10.874,10.874,0,1,1,0,21.748Z" transform="translate(531.157 388.287)" fill="#ccc" />
                                                    <circle cx="104.941" cy="104.941" r="104.941" transform="translate(1185.743 270.5)" fill="#10355f" />
                                                    <path d="M569.583,293.9a10.884,10.884,0,0,1-6.548-2.176l-.117-.088-24.663-18.866a10.96,10.96,0,1,1,13.336-17.4l15.975,12.25,37.748-49.247a10.955,10.955,0,0,1,15.36-2.029l0,0-.234.325.241-.325a10.969,10.969,0,0,1,2.026,15.363l-44.4,57.9a10.962,10.962,0,0,1-8.717,4.274Z" transform="translate(710.7 121.575)" fill="#fff" />
                                                </g>
                                            </svg>
                                        ) : step.title === 'You Deliver' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 808.41844 712.52788" xmlnsXlink="http://www.w3.org/1999/xlink" role="img" style={{ filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.12))' }}><path d="M714.96678,737.11091l-1.98354-27.58851a89.24423,89.24423,0,0,0-41.89885-9.39586c20.43166,15.79292,18.7951,47.3576,32.9451,68.95961a53.68053,53.68053,0,0,0,40.02768,23.72162l17.00408,9.78252A89.95167,89.95167,0,0,0,740.117,730.24435,86.88782,86.88782,0,0,0,723.74913,715.849C720.03237,726.52007,714.96678,737.11091,714.96678,737.11091Z" transform="translate(-195.79078 -93.73606)" fill="#f2f2f2" /><path id="a8455189-ed55-4a18-ae95-69e4c9a5ea4d-1530" data-name="f02c4e45-f306-4b42-b3ad-5ddd3016d7d2" d="M613.68122,806.26394h389.281a1.247,1.247,0,0,0,0-2.494H613.6812a1.247,1.247,0,0,0,0,2.494h0Z" transform="translate(-195.79078 -93.73606)" fill="#ccc" /><path d="M365.83032,508.54938v.53376h.372A5.30968,5.30968,0,0,1,365.83032,508.54938Zm2.863-226.33756a192.99845,192.99845,0,0,0-40.00088,117.86763q.00874,9.7374.95408,19.19978c.09714,1.08373.21008,2.16746.35619,3.235a192.54566,192.54566,0,0,0,32.81915,87.36145c.695,1.019,1.40663,2.02188,2.119,3.02473a193.84342,193.84342,0,0,0,26.308,29.851c78.65278,72.62736,201.28967,67.74281,273.917-10.91,1.116-1.18075,2.18379-2.37773,3.235-3.57467a193.66531,193.66531,0,0,0,8.4919-246.05488c-.82534-1.08373-1.66578-2.16745-2.5392-3.235q-2.8714-3.61515-5.9527-7.08468c-1.05122-1.197-2.119-2.39393-3.235-3.5747A193.51344,193.51344,0,0,0,522.793,205.97881c-1.86,0-3.70415.03236-5.54832.08088q-1.84428.04844-3.68757.14557a193.74871,193.74871,0,0,0-142.32467,72.77158c-.87352,1.06756-1.71386,2.15128-2.5392,3.235Zm-2.491,226.87132a5.327,5.327,0,0,1-.3721-.53376v.53376h.3721Z" transform="translate(-195.79078 -93.73606)" fill="#fff" /><path d="M364.47187,506.55988l.5497-1.11608,41.18172-82.92951v-.01616l1.60171-3.21885v-.01616L475.83658,282.2119v-.01617l1.60171-3.21884.01579-.01617,34.45334-69.43951,1.64989-3.31589q1.84428-.097,3.68756-.14557l-1.6333,3.29972-34.54969,69.60125v.01617l-1.60171,3.21884v.01617L409.64839,422.83782l-.0158.01616-41.18172,82.9942-1.61751,3.235-.25905.5337-1.6333,3.28354c-.7124-1.00285-1.424-2.00569-2.119-3.02473Z" transform="translate(-195.79078 -93.73606)" fill="#3f3d56" /><path d="M408.95327,419.27921v3.235H330.00273c-.14611-1.06756-.25905-2.15128-.35619-3.235Z" transform="translate(-195.79078 -93.73606)" fill="#3f3d56" /><path d="M531.64654,444.51422v-3.235h78.95053c.14611,1.06756.25905,2.15128.3562,3.235Z" transform="translate(-195.79078 -93.73606)" fill="#3f3d56" /><path d="M597.6824,433.24335h3.235v78.95053c-1.06756.14611-2.15129.25905-3.235.3562Z" transform="translate(-195.79078 -93.73606)" fill="#3f3d56" /><path d="M676.89288,282.21182c-.82537-1.08374-1.66571-2.16748-2.53918-3.23505h-5.95276v-7.08472c-1.05121-1.1969-2.1189-2.3938-3.235-3.57464v10.65936H371.23255c-.87354,1.06757-1.71387,2.15131-2.53919,3.23505H665.166V531.84133c1.116-1.18078,2.18377-2.37774,3.235-3.57464V282.21182Z" transform="translate(-195.79078 -93.73606)" fill="#3f3d56" /><rect x="170.03564" y="412.11017" width="300.9565" height="3.23501" fill="#3f3d56" /><path d="M365.83032,508.54938v.53376h.372A5.30968,5.30968,0,0,1,365.83032,508.54938Zm2.863-226.33756a192.99845,192.99845,0,0,0-40.00088,117.86763q.00874,9.7374.95408,19.19978c.09714,1.08373.21008,2.16746.35619,3.235a192.54566,192.54566,0,0,0,32.81915,87.36145c.695,1.019,1.40663,2.02188,2.119,3.02473a193.84342,193.84342,0,0,0,26.308,29.851c78.65278,72.62736,201.28967,67.74281,273.917-10.91,1.116-1.18075,2.18379-2.37773,3.235-3.57467a193.66531,193.66531,0,0,0,8.4919-246.05488c-.82534-1.08373-1.66578-2.16745-2.5392-3.235q-2.8714-3.61515-5.9527-7.08468c-1.05122-1.197-2.119-2.39393-3.235-3.5747A193.51344,193.51344,0,0,0,522.793,205.97881c-1.86,0-3.70415.03236-5.54832.08088q-1.84428.04844-3.68757.14557a193.74871,193.74871,0,0,0-142.32467,72.77158c-.87352,1.06756-1.71386,2.15128-2.5392,3.235Zm-35.4398,140.3024c-.14532-1.06751-.25826-2.15131-.372-3.23506a190.89733,190.89733,0,0,1,39.88793-137.06741c.85693-1.08373,1.71465-2.16745,2.604-3.235a190.62139,190.62139,0,0,1,136.53388-69.45567c1.22883-.06471,2.45854-.12941,3.704-.16175q3.566-.14557,7.18163-.14557a190.32405,190.32405,0,0,1,142.37286,63.89146c1.116,1.22932,2.19958,2.45862,3.235,3.72027.631.7117,1.22892,1.42341,1.81179,2.15128.88931,1.06756,1.74624,2.15129,2.604,3.235a190.48085,190.48085,0,0,1-4.41576,241.12154c-1.03543,1.26165-2.119,2.49092-3.235,3.72024a190.64292,190.64292,0,0,1-33.08946,29.43812c-86.2606,60.37228-205.13,39.38568-265.50219-46.87483-.12953-.17785-.25905-.3558-.372-.5337a5.30968,5.30968,0,0,1-.372-.53376q-.70341-.99484-1.35845-1.98955a189.16712,189.16712,0,0,1-31.21833-84.04556Zm32.94878,86.56892a5.327,5.327,0,0,1-.3721-.53376v.53376h.3721Z" transform="translate(-195.79078 -93.73606)" fill="#ccc" /><path d="M746.34016,608.55752h-193.65a8.94094,8.94094,0,0,1-8.9309-8.9309v-94.357a8.94094,8.94094,0,0,1,8.9309-8.9309h193.65a8.941,8.941,0,0,1,8.9309,8.9309v94.357A8.941,8.941,0,0,1,746.34016,608.55752Z" transform="translate(-195.79078 -93.73606)" fill="#cacaca" /><path d="M661.04108,600.96511c-42.41065,0-86.6333-.40527-103.1333-.668a8.32,8.32,0,0,1-8.14844-8.28613V505.27664a2.94069,2.94069,0,0,1,2.93018-2.9375H746.33405a2.94048,2.94048,0,0,1,2.937,2.92968v58.84766a36.714,36.714,0,0,1-36.0957,36.57031C697.79743,600.887,679.588,600.96511,661.04108,600.96511Z" transform="translate(-195.79078 -93.73606)" fill="#e4e4e4" /><path d="M726.34755,556.56087H568.78332a4.96271,4.96271,0,0,1-4.66512-3.28967l-17.83332-50.03238a4.95275,4.95275,0,0,1,4.65817-6.61548l196.95789-.27483h.00688a4.95265,4.95265,0,0,1,4.55209,6.90351l-.27-.11561.27.11561-21.56028,50.30721A4.94669,4.94669,0,0,1,726.34755,556.56087Z" transform="translate(-195.79078 -93.73606)" fill="#cacaca" /><path d="M614.45231,591.23677H560.11973a5.04768,5.04768,0,0,1,0-10.09535h54.33258a5.04768,5.04768,0,0,1,0,10.09535Z" transform="translate(-195.79078 -93.73606)" fill="#cacaca" /><circle cx="453.4306" cy="462.82481" r="12.33819" fill="#3f3d56" /><path d="M258.161,119.24859a139.8087,139.8087,0,0,1,194.80744,33.80816c44.45868,63.13047,89.06955,228.67432,57.57876,324.575-93.92941-99.21546-238.233-109.52515-286.19436-163.57575C173.1045,256.301,195.03059,163.70733,258.161,119.24859Z" transform="translate(-195.79078 -93.73606)" fill="#10355f" /><circle id="faf5c3b1-f7bb-4793-8f76-a694569c182e" data-name="b262ea8c-1946-46c9-a449-3a1996c39394" cx="144.77165" cy="122.8712" r="45.59621" fill="#fff" /><circle id="e618366e-6f5c-4381-83a5-490aecbf791d" data-name="bcc29a3a-8123-4529-80aa-6f70df2823cf" cx="353.30112" cy="403.68803" r="29.86454" fill="#10355f" /><path d="M291.77986,206.0863a45.59533,45.59533,0,1,0,78.74981,45.98049,45.58953,45.58953,0,0,1-69.41687-57.28918A45.59524,45.59524,0,0,0,291.77986,206.0863Z" transform="translate(-195.79078 -93.73606)" fill="#231f20" opacity="0.2" /><path d="M224.2671,314.271c47.9613,54.05057,192.265,64.36029,286.19434,163.57574a193.39447,193.39447,0,0,0,6.7514-27.75854C423.33015,359.89226,287.06,348.49349,240.72059,296.271c-41.47448-46.7403-35.01831-116.29408,2.412-164.69008C191.7975,179.16676,177.30287,261.34414,224.2671,314.271Z" transform="translate(-195.79078 -93.73606)" fill="#231f20" opacity="0.2" /><path d="M820.41976,505.24113,801.05649,499.343c-8.42863,10.16294-15.41749,39.60186-15.41749,39.60186L759.13763,582.009A8.93655,8.93655,0,1,0,771.88,590.77118l40.10863-48.69278Z" transform="translate(-195.79078 -93.73606)" fill="#ffb6b6" /><path d="M820.04873,509.94074l3.57869-29.312L815.6062,467.233a16.43321,16.43321,0,0,0-15.45224-7.88124h0a16.39445,16.39445,0,0,0-14.89927,16.70464c.30089,12.59836,2.28566,28.5296,10.03108,32.88346l.07849.04412Z" transform="translate(-195.79078 -93.73606)" fill="#10355f" /><polygon points="678.959 681.066 667.348 686.67 640.203 644.55 657.341 636.278 678.959 681.066" fill="#ffb6b6" /><path d="M881.00666,786.71729l-35.70683,17.236-.218-.45156a15.43341,15.43341,0,0,1,7.18868-20.60688l.00086-.00042,4.13348-8.09669,14.558-.92582,3.117-1.5046Z" transform="translate(-195.79078 -93.73606)" fill="#2f2e41" /><polygon points="592.527 696.767 579.634 696.766 573.5 647.033 592.53 647.034 592.527 696.767" fill="#ffb6b6" /><path d="M788.77225,803.9533l-39.64918-.00149v-.50143a15.43341,15.43341,0,0,1,15.43256-15.43232h.001l7.24243-5.49449,13.51278,5.49532,3.46111.00012Z" transform="translate(-195.79078 -93.73606)" fill="#2f2e41" /><path d="M775.53969,559.85,760.7649,661.73705l4.02093,13.4064-5.27629,9.49491,7.74835,71.46417-3.14522,6.92449,8.78773,5.41965h17.88176l.949-75.48987,4.41711-11.08355v-6.10839l8.99195-46.032,2.07412,71.65964,2.87077,5.53736c10.69335,24.26152,25.09819,32.20527,35.28181,50.34019l17.88251-9.68637-.375-7.22386c3.59249-1.81886-5.39371-7.13482-6.25721-11.06786l-1.564-7.04184-10.43147-21.608-.39808-7.60953,2.85494-51.75609-1.34338-69.696L822.279,553.6438Z" transform="translate(-195.79078 -93.73606)" fill="#2f2e41" /><circle cx="602.96442" cy="319.29953" r="23.23247" fill="#ffb6b6" /><path d="M764.42774,603.80325l-.33908-.11824,4.49682-14.61431a11.90358,11.90358,0,0,1,2.14691-11.09871c-.72728-1.25882-3.72552-7.20329,1.15695-12.25421-.29178-1.47275-1.76016-10.18916,3.36389-14.44987,0,0,9.94242-75.35562,15.51873-95.25953.16154-1.45637-1.14418-13.34567,6.35635-13.81172,3.95582-.24558,9.89228-.62141,18.80116-1.19588,1.15076-.08259,1.82529,1.86094,2.84689,5.024.69163,2.14-2.86727,5.06438-2.0061,5.016l.06076-.004.05893.01565A37.455,37.455,0,0,1,844.58617,489.33l-2.64825,45.02572c.40093,1.81073,8.83647,53.156,6.63136,58.66826-1.25082,3.12631.8819,5.07385,2.439,6.496.80222.73274,1.38179,1.26173,1.301,1.84057a.96543.96543,0,0,1-.60067.70909c-1.40944.70435-.6305,5.53516.19174,8.41481l.08368.294-.27214.13971c-.31434.16117-25.52493-11.40141-56.15281-11.40214C784.01476,599.516,777.34192,608.30808,764.42774,603.80325Z" transform="translate(-195.79078 -93.73606)" fill="#10355f" /><path d="M817.16646,427.31967a1.93506,1.93506,0,0,1-.98668-1.22862l-.33108-1.34869,1.018,1.0609a4.02136,4.02136,0,0,0-1.17732-6.87293,8.43787,8.43787,0,0,0-1.37415-.334,9.51145,9.51145,0,0,1-1.43928-.34708,6.56206,6.56206,0,0,1-3.93836-5.53517,17.38892,17.38892,0,0,1,.68944-6.24316,85.018,85.018,0,0,1-30.84289-.92738,14.31613,14.31613,0,0,1-4.42661-1.74089,17.1477,17.1477,0,0,1-6.05725-6.09436,1.83032,1.83032,0,0,1,.24813-2.15636,1.99125,1.99125,0,0,1,1.44764-.63741l-.37146-1.00451a1.893,1.893,0,0,1,2.12289-2.51655l1.31485.24594-.12625-.87353a1.89212,1.89212,0,0,1,2.53911-2.04249,2.08541,2.08541,0,0,0,2.77668-1.53169l.45223-2.196.04547-.11642c2.22477-3.70588,6.49857-6.4,11.72558-7.39138,4.66163-.88336,9.42077-.43731,14.02456-.00582a12.8401,12.8401,0,0,1,5.60684,1.41635,4.89984,4.89984,0,0,1,2.44451,4.52338c4.53284-1.39379,9.39676,1.38289,11.80125,4.88175,2.85927,4.161,3.32132,9.38112,3.40463,13.46391.19719,9.65071-1.79109,17.54671-5.90881,23.469a5.52949,5.52949,0,0,1-2.54965,2.26624,2.616,2.616,0,0,1-.8437.13607A2.71166,2.71166,0,0,1,817.16646,427.31967Z" transform="translate(-195.79078 -93.73606)" fill="#2f2e41" /><path d="M818.00176,518.79414l-17.05269-10.90552c-10.85886,7.5108-25.53411,33.9708-25.53411,33.9708l-37.14114,34.313a8.93656,8.93656,0,1,0,9.90452,11.87625l51.76259-36.06Z" transform="translate(-195.79078 -93.73606)" fill="#ffb6b6" /><path d="M816.376,523.21919,827.73342,495.961l-4.1079-15.06363A16.43323,16.43323,0,0,0,810.874,469.138h0a16.39447,16.39447,0,0,0-18.855,12.06325c-3.11067,12.212-5.49952,28.08768.7833,34.3705l.06367.06367Z" transform="translate(-195.79078 -93.73606)" fill="#10355f" /></svg>
                                        ) : step.title === 'Watch Your Business Grow' ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 800 595.193" xmlnsXlink="http://www.w3.org/1999/xlink" role="img" style={{ filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.12))' }}><g transform="translate(-145.75 -144.922)"><path d="M790.072,754.15H612.158c-.258,0-.467-.327-.467-.731s.209-.731.467-.731H790.072c.258,0,.467.327.467.731S790.329,754.15,790.072,754.15Z" transform="translate(-462.641 -21.366)" fill="#d6d6e3" /><g transform="translate(145.75 321.282)"><path d="M475.908,637.585c1.145,2.193,2,4.563,3.491,6.538,1.676,2.241,7.6,4.691,7.6,4.691s7.4,3.5,11.213,5.838a2.506,2.506,0,0,1-.218,2.5c-4.7,3.3-10.867,3.37-16.615,3.329a22.167,22.167,0,0,1-5.748-.548c-3.039-.806-5.643-2.926-8.642-3.789a22.926,22.926,0,0,0-4.748-.669l-6.3-.427a14.84,14.84,0,0,1-4.91-.911,4.966,4.966,0,0,1-3.1-3.668,10.541,10.541,0,0,1,.734-3.942c.806-3.1.556-6.836,2.967-8.948a9.15,9.15,0,0,1,3.346-1.612,106.721,106.721,0,0,1,13.39-3.563C472.111,631.667,474.255,634.408,475.908,637.585Z" transform="translate(-342.979 -243.198)" fill="#3f3d56" /><path d="M388.612,655.253c.161,1.717.21,3.684-1.032,4.885a5.507,5.507,0,0,1-2.7,1.209c-5.958,1.387-12.6,1.483-17.784-1.757a4.91,4.91,0,0,1-1.4-1.2,4.379,4.379,0,0,1-.709-2.217,19.021,19.021,0,0,1,1.153-6.731,118.125,118.125,0,0,0,3.426-15.922c.065-.443,15.212,2.419,16.22,3.918,1.266,1.854,1.274,6.3,1.612,8.513Q388.16,650.577,388.612,655.253Z" transform="translate(-326.899 -243.429)" fill="#3f3d56" /><path d="M443.8,393.994l4.031,37.479c.806,7.659,1.653,15.358,1.1,23.04-.645,8.868-.734,33.295-.6,36.737a55.631,55.631,0,0,1-.347,6.852c-1.822,22.742,6.248,82.955,8.8,84.309l-23.927,8.674c-3.055-3.829-1.032-9.787-1.612-14.648-.532-4.378-16.313-92.1-16.8-94.112-.806-2.668-6.288-15.4-12.278-43.461-5.176,7.707-4.966,17.736-5.99,26.974-1.435,12.9-9.908,104.165-8.666,108.809s1.854,9.739-.04,14.164a43.532,43.532,0,0,0-20.727-2.289c-7.683-7.86-1.817-120.738-3.628-129.85-1.209-6.022-3.289-11.867-4.031-17.97-1.008-8.553.7-17.171,2.418-25.62,1.153-5.7,2.3-11.4,3.6-17.067,1.4-6.087,3.072-12.3,6.82-17.284,6-7.973,16.647-11.512,26.6-10.738s19.251,5.3,27.474,10.948A103.574,103.574,0,0,1,443.8,393.994Z" transform="translate(-325.702 -191.951)" fill="#090814" /><path d="M423.783,218.771a6.958,6.958,0,0,0-.927,2.37c-.2,1.653.806,3.168,1.612,4.611a25.113,25.113,0,0,1,2.362,5.885,9.674,9.674,0,0,1,.347,3.926,9.473,9.473,0,0,1-1.048,2.822c-1.556,3-3.862,5.772-7,7.022a12.326,12.326,0,0,1-7.57.306,22.984,22.984,0,0,1-6.925-3.289,21.05,21.05,0,0,1-4.74-4.111,28.417,28.417,0,0,1-3.273-5.643c-1.677-3.507-3.378-7.256-3.071-11.1a3.71,3.71,0,0,1,.193-1.024,5.506,5.506,0,0,1,1.08-1.612,21.041,21.041,0,0,0,4.934-14.632l11.746,2.668c2.588.589,5.176,1.177,7.731,1.911,2.1.6,5.321,1.443,6.683,3.313S424.71,217.062,423.783,218.771Z" transform="translate(-332.436 -160.241)" fill="#ed9da0" /><path d="M411.45,243.311c.9-1.975,2.854-3.225,4.635-4.466s3.587-2.83,3.934-4.982a3.571,3.571,0,0,1,.355-1.4c.685-1.032,2.314-.516,3.289.242,2.37,1.846,3.982,4.466,5.555,7.022a60,60,0,0,1,5.2,9.827c2.265,5.974,2.539,12.5,2.789,18.872.226,5.8.443,11.7-.967,17.325-.887,3.563-2.418,7.022-2.507,10.69-.266,13.326-4.893,26.063-5.216,39.389a102.194,102.194,0,0,0,.58,11.536l.758,8.65q-17.583-1.008-35.068-3.088a67.079,67.079,0,0,0-2.515-11.7,253.892,253.892,0,0,1-8.15-48.16c-.621-8.642-1.258-17.252-2.217-25.862-.863-7.828-2.556-15.7-1.54-23.516a32.466,32.466,0,0,1,3.305-10.174,6.707,6.707,0,0,1,2.58-3.088,6.972,6.972,0,0,1,1.822-.589,33.809,33.809,0,0,1,5.546-.653,3.822,3.822,0,0,1,1.354.129,4.249,4.249,0,0,1,1.846,1.79,33.472,33.472,0,0,0,14.632,12.205Z" transform="translate(-329.826 -165.063)" fill="#f2f2f2" /><path d="M406.72,244.188c1.5,2.144,4.676,2.652,6.062,4.837a12.681,12.681,0,0,1,1.056,2.878c.846,2.7,2.556,5.047,3.6,7.683,1.5,3.789,1.54,7.981,1.556,12.052a39.88,39.88,0,0,1-.742,9.674c-.484,1.991-1.274,3.886-1.854,5.853a28.619,28.619,0,0,0-1.08,10.319,4.224,4.224,0,0,0,.58,2.136,4.635,4.635,0,0,0,2.064,1.4c2.362,1.04,4.837,2.1,7.417,1.862a2.717,2.717,0,0,0,1.475-.492,3.282,3.282,0,0,0,.726-.959l1.612-2.725c1.459-2.491,2.983-5.28,2.419-8.126a16.122,16.122,0,0,0-1.83-4.168,49,49,0,0,1-2.628-6.506c-2.572-7.393-5.176-14.89-5.756-22.694a19.944,19.944,0,0,1,.967-8.8,25.07,25.07,0,0,1,2.838-4.91,2.1,2.1,0,0,0-2.265-.766,13.479,13.479,0,0,0-2.346.975c-2.37,1-5,.637-7.393-.048-.935-.274-2.418-1.209-3.386-1.145C409.477,242.56,406.776,244.285,406.72,244.188Z" transform="translate(-334.995 -167.649)" fill="#10355f" /><path d="M427.926,241.5c-.484-.387-1.233-.742-1.661-.29a1.87,1.87,0,0,0-.306.653c-.419,1.129-1.653,1.685-2.773,2.12a4.611,4.611,0,0,1-4.073-.926c-.439-.663-.5-.577,0-1.194a14.254,14.254,0,0,1,2.936-1.677,17.236,17.236,0,0,0,7.03-11.061,5.256,5.256,0,0,1,1.927,3.329c.266,1.282.3,2.6,5.64,3.886.395,1.838,1.274,3.555,1.475,5.417a28.3,28.3,0,0,1,0,2.983,18.313,18.313,0,0,0,.339,2.886C431.5,245.632,430.167,243.286,427.926,241.5Z" transform="translate(-337.329 -165.054)" fill="#f2f2f2" /><path d="M406.907,234.168c-.806-.766-1.612-1.491-2.418-2.273a31.36,31.36,0,0,1-7.8-12.375c-1.032.806-2.169,1.87-2.193,3.225a4.942,4.942,0,0,0,1.064,2.62,40.857,40.857,0,0,1,5.909,15.809,4.708,4.708,0,0,1,4.071-2.169c1.274,0,8.758,3.023,9.17,2.169.143-.316.553-.552-.18-1.329C412.882,238.075,407.646,234.864,406.907,234.168Z" transform="translate(-332.627 -163.192)" fill="#f2f2f2" /><path d="M413.385,228.154a66.911,66.911,0,0,0,27.071,16.389,6.078,6.078,0,0,1,2.733,1.387,5.587,5.587,0,0,1,1.137,2.5c1.967,7.691,2.628,15.648,3.281,23.556a13.125,13.125,0,0,1-.081,3.934c-.476,2.112-1.975,3.821-3.45,5.409-4.627,4.958-9.908,10.142-10.69,16.881a26.964,26.964,0,0,1-.46,3.87c-.4,1.5-1.3,2.822-1.846,4.281-2.693,7.183,3.394,15.882-.314,22.573a40.742,40.742,0,0,1,4.079,12.3,16.011,16.011,0,0,0,1.1,4.74c1.1,2.306,3.378,3.773,5.168,5.643,5.458,5.595,6.127,14.156,6.449,21.968.2,4.4.137,9.456-3.225,12.342-1.943,1.685-4.6,2.233-7.135,2.652-3.378.564-7.054.967-10.045-.7-2.144-1.193-3.6-3.281-5-5.3-2.644-3.845-5.3-7.683-7.8-11.625-3.966-6.216-7.707-13.318-6.562-20.606-.322,7.457-1.894,14.971-5.555,21.468s-9.553,11.923-16.7,14.068-15.511.629-20.839-4.6a28.166,28.166,0,0,1-4.442-5.99,58.465,58.465,0,0,1-6.562-16.7c-.347-1.524-.6-3.225.161-4.587.363-.645.919-1.153,1.3-1.79,1.274-2.169-.322-27.224-1.451-32.682s-2.814-10.883-2.685-16.454c.137-5.893-4.1-11.2-7.336-16.123-1.806-2.773-3.91-5.353-5.482-8.263a26.66,26.66,0,0,1-2.112-19.961,52.316,52.316,0,0,1,4.418-9.851l2.66-4.99a8.231,8.231,0,0,1,5.643-4.837l18.4-7.255a27.694,27.694,0,0,0,6.643-3.321c2.249-1.693,3.926-4.031,6.07-5.837a3.4,3.4,0,0,1,2.418-1.056c1.725.153,2.338,2.33,2.515,4.031.4,3.805,3.225,7.03,4.184,10.73,5.192,20.436,16.18,39.285,19.195,60.148,3.386-8.134,6.772-16.285,11.109-23.943a19.877,19.877,0,0,0,1.717-3.475,14.834,14.834,0,0,0,.572-5.393c-.218-5.248-1.612-10.375-2.991-15.446C416.859,241.351,415.247,234.99,413.385,228.154Z" transform="translate(-321.1 -163.595)" fill="#3f3d56" /><path d="M474.96,331.929c.365.576-10,42.118-13.5,38.079-1.25-1.451-2.612-2.8-3.765-4.329a30.361,30.361,0,0,1-4.031-7.852,68.064,68.064,0,0,1-4.168-20.735,14.18,14.18,0,0,1,.685-5.966,31.732,31.732,0,0,1,1.79-3.225c2.161-3.894,2.6-8.505,2.564-12.955s-.516-8.916,0-13.342a30.521,30.521,0,0,1,3.225-10.585,15.019,15.019,0,0,1,4.377-5.458,7.884,7.884,0,0,1,4.837-1.572C469.607,284.143,473.954,329.944,474.96,331.929Z" transform="translate(-340.731 -176.628)" fill="#3f3d56" /><path d="M365.955,403.675c.242.177.516.419.451.709s-.3.363-.508.484a6.256,6.256,0,0,0-2.322,3.144,87.746,87.746,0,0,0-3.5,9.263,40.608,40.608,0,0,0-6.32-7.376c-1.838-1.693-3.894-3.3-4.877-5.587,0-.064,4.224-3.184,4.611-3.523,1.185-1.056,2.676-3.982,3.9-4.627,1.387-.726,2.709,2.12,3.765,3.265a32.019,32.019,0,0,0,4.8,4.249Z" transform="translate(-323.784 -197.408)" fill="#ed9da0" /><ellipse cx="23.626" cy="23.626" rx="23.626" ry="23.626" transform="translate(61.366 9.077)" fill="#ed9da0" /><path d="M875.072,278.922c2.386-3.69,6.862-6.15,11.2-5.459a15.3,15.3,0,0,1,25.631-8.922,4.757,4.757,0,0,1,4.652-.466,9.808,9.808,0,0,1,3.779,3.033,22.012,22.012,0,0,1,3.08,22.394c.53-1.928-1.4-3.742-3.354-4.175s-4-.023-5.98-.305c-2.537-.361-4.818-1.833-7.36-2.164a16.755,16.755,0,0,0-6.367.818,17.262,17.262,0,0,1-6.364.855c-2.139-.254-4.894,7.852-4.857,13.562.007,1.082-.216,2.471-1.273,2.7-1.3.283-2.057-1.514-3.3-2a2.293,2.293,0,0,0-2.812,1.5,3.738,3.738,0,0,0,.714,3.348,11.044,11.044,0,0,0,2.678,2.323l-.51.425a3.037,3.037,0,0,1-3.834.476,8.275,8.275,0,0,1-2.753-3.135,36.883,36.883,0,0,1-5.05-12.1A17.623,17.623,0,0,1,875.072,278.922Z" transform="translate(-816.558 -260.374)" fill="#090814" /><path d="M318.621,317.6a31.246,31.246,0,0,0-.871,6.562,29.361,29.361,0,0,0,1.314,7.586c5.192,18.711,14.656,35.971,25.314,52.2a46.985,46.985,0,0,1,10.722-9.787,2.3,2.3,0,0,0,.806-.806,2.185,2.185,0,0,0-.258-1.886c-2.943-6.03-12.947-44.67-14.785-48.144,3.749-1.459,5.917-5.321,7.505-9.021a49.408,49.408,0,0,0,3.612-11.859,35.681,35.681,0,0,0-4.361-22.694,36.277,36.277,0,0,0-7.3-9.158,73.283,73.283,0,0,0-6.96-3.888C331.5,266.748,319.636,312.712,318.621,317.6Z" transform="translate(-317.75 -172.338)" fill="#3f3d56" /></g><path d="M309.965,553.645H255.753a5.543,5.543,0,0,1-5.537-5.537V369.481a5.543,5.543,0,0,1,5.537-5.537h54.213a5.543,5.543,0,0,1,5.537,5.537V548.108A5.543,5.543,0,0,1,309.965,553.645Z" transform="translate(175.93 -25.025)" fill="#10355f" /><path d="M423.2,543.339H368.99a5.543,5.543,0,0,1-5.537-5.537V288.292a5.543,5.543,0,0,1,5.537-5.537H423.2a5.543,5.543,0,0,1,5.537,5.537V537.8A5.544,5.544,0,0,1,423.2,543.339Z" transform="translate(161.556 -14.719)" fill="#10355f" /><path d="M536.441,553.645H482.228a5.543,5.543,0,0,1-5.537-5.537V369.481a5.543,5.543,0,0,1,5.537-5.537h54.213a5.543,5.543,0,0,1,5.537,5.537V548.108a5.543,5.543,0,0,1-5.537,5.537Z" transform="translate(147.182 -25.025)" fill="#10355f" /><path d="M649.678,539.271H595.465a5.422,5.422,0,0,1-5.537-5.286V255.993a5.422,5.422,0,0,1,5.537-5.286h54.213a5.422,5.422,0,0,1,5.537,5.286V533.985a5.422,5.422,0,0,1-5.537,5.286Z" transform="translate(132.808 -10.651)" fill="#10355f" /><path d="M762.916,531.948H708.7a5.543,5.543,0,0,1-5.537-5.537V198.556a5.543,5.543,0,0,1,5.537-5.537h54.213a5.543,5.543,0,0,1,5.537,5.537V526.412a5.544,5.544,0,0,1-5.537,5.537Z" transform="translate(118.434 -3.329)" fill="#10355f" /><ellipse cx="11.192" cy="11.192" rx="11.192" ry="11.192" transform="translate(447.597 294.151)" fill="#3f3d56" /><ellipse cx="11.192" cy="11.192" rx="11.192" ry="11.192" transform="translate(546.461 221.402)" fill="#3f3d56" /><ellipse cx="11.192" cy="11.192" rx="11.192" ry="11.192" transform="translate(645.324 294.151)" fill="#3f3d56" /><ellipse cx="11.192" cy="11.192" rx="11.192" ry="11.192" transform="translate(744.188 185.96)" fill="#3f3d56" /><ellipse cx="11.192" cy="11.192" rx="11.192" ry="11.192" transform="translate(843.051 144.922)" fill="#3f3d56" /><path d="M760.208,583.353H182.239a.873.873,0,0,1,0-1.746H760.208a.873.873,0,1,1,0,1.746Z" transform="translate(184.669 -52.654)" fill="#cbcbcb" /><path d="M105.4,162.554l-1.042-1.4,100.5-74.824,98.544,73.5L403.3,51.377l.179-.073,96.945-40.012.666,1.614L404.324,52.844l-100.7,109.329L204.864,88.507Z" transform="translate(352.789 143.489)" fill="#3f3d56" /></g></svg>
                                        ) : (
                                            <Box component="img" src={step.img} alt={step.title}
                                                sx={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.12))' }} />
                                        )}
                                    </Box>

                                    {/* Card Content */}
                                    <Box
                                        sx={{
                                            pt: 3,
                                            pb: 5,
                                            px: 4,
                                            bgcolor: '#10355f',
                                            borderRadius: '24px',
                                            border: '1px solid #10355f',
                                            width: '100%',
                                            flex: 1,
                                            position: 'relative',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                bgcolor: '#1a4a7a',
                                                boxShadow: '0 20px 40px rgba(16, 53, 95, 0.2)',
                                                borderColor: '#1a4a7a'
                                            }
                                        }}
                                    >
                                        {/* Step Number Badge */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 24,
                                                right: 24,
                                                bgcolor: 'white',
                                                color: BRAND,
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '0.85rem',
                                                fontWeight: 900,
                                                zIndex: 3,
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            {index + 1}
                                        </Box>

                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 900,
                                                color: 'white',
                                                mb: 2,
                                                pr: 3, // Prevent text from overlapping the badge
                                                fontSize: '1.4rem',
                                                lineHeight: 1.2
                                            }}
                                        >
                                            {step.title}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                fontSize: '1rem',
                                                color: 'white',
                                                lineHeight: 1.6,
                                                maxWidth: '260px',
                                                mx: 'auto'
                                            }}
                                        >
                                            {step.desc}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    {/* How It Works Mobile Dots */}
                    <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', gap: 1, mt: 3 }}>
                        {howItWorksData.map((_, i) => (
                            <Box
                                key={i}
                                onClick={() => scrollToHowItWorks(i)}
                                sx={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    bgcolor: howItWorksIdx === i ? BRAND : '#cbd5e1',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease'
                                }}
                            />
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ── AD BANNER SECTION ── */}
            <Box sx={{
                width: '100%', bgcolor: 'white', position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pt: { xs: 4, md: 6 }, pb: { xs: 8, md: 10 },
            }}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: 0, right: 0,
                    height: { xs: '200px', sm: '240px', md: '300px' },
                    bgcolor: BRAND, transform: 'translateY(-50%)', zIndex: 0,
                }} />

                <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3, md: 4 } }}>
                    <Box sx={{
                        width: '100%', maxWidth: '940px', mx: 'auto',
                        height: { xs: '220px', sm: '260px', md: '320px' },
                        borderRadius: { xs: '16px', md: '28px' },
                        overflow: 'hidden', position: 'relative',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
                    }}>
                        <Box component="img"
                            src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80"
                            alt="Partner Ad"
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                        <Box sx={{
                            position: 'absolute', inset: 0,
                            background: {
                                xs: 'linear-gradient(to top, rgba(16,53,95,0.97) 0%, rgba(16,53,95,0.5) 100%)',
                                md: 'linear-gradient(to right, rgba(16,53,95,0) 0%, rgba(16,53,95,0.85) 45%, rgba(16,53,95,1) 100%)',
                            },
                        }} />

                        <Box sx={{
                            position: 'absolute', top: 0, bottom: 0, right: 0,
                            width: { xs: '100%', md: '60%' },
                            display: 'flex', flexDirection: 'column', justifyContent: 'center',
                            p: { xs: '24px 20px', sm: '28px 32px', md: 6 },
                            textAlign: { xs: 'center', md: 'left' },
                        }}>
                            <Typography variant="h2" sx={{
                                fontWeight: 900, color: 'white',
                                fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.2rem', lg: '2.4rem' },
                                lineHeight: 1.15, mb: 1,
                            }}>
                                Partner with AllFix today
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, gap: 1.5, mb: { xs: 1.5, md: 2 } }}>
                                <Box component="img" src="/ALLFIXLOGO.png" alt="AllFix" sx={{ width: 22, height: 22, borderRadius: '50%' }} />
                                <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: { xs: '0.85rem', md: '1rem' } }}>AllFix.ph</Typography>
                            </Box>

                            <Typography sx={{
                                color: 'rgba(255,255,255,0.85)',
                                fontSize: { xs: '0.82rem', sm: '0.9rem', md: '0.95rem' },
                                lineHeight: 1.5, mb: { xs: 2, md: 3.5 },
                                maxWidth: '380px', mx: { xs: 'auto', md: 0 },
                                display: { xs: 'none', sm: 'block' },
                            }}>
                                Take your business to the next level by reaching new customers and boosting your sales!
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-start' } }}>
                                <Button variant="contained" onClick={scrollToForm} sx={{
                                    bgcolor: '#017550', color: 'white', fontWeight: 800,
                                    px: { xs: 3, md: 4 }, py: { xs: 1.1, md: 1.4 },
                                    borderRadius: '10px', textTransform: 'none',
                                    fontSize: { xs: '0.88rem', md: '1rem' },
                                    boxShadow: '0 4px 14px rgba(1,117,80,0.4)',
                                    '&:hover': { bgcolor: '#015c3f', transform: 'scale(1.03)' },
                                    transition: 'all 0.2s',
                                }}>
                                    Join Us Now
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* ── PARTNER LOGOS CAROUSEL ── */}
            <Box sx={{
                width: '100%', bgcolor: 'white',
                py: { xs: 4, md: 5 },
                overflow: 'hidden', position: 'relative',
                borderBottom: '1px solid #f1f5f9',
            }}>
                <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
                <Box sx={{
                    display: 'flex', width: 'max-content',
                    animation: 'scroll 30s linear infinite',
                    '&:hover': { animationPlayState: 'paused' },
                }}>
                    {[...Array(2)].map((_, setIndex) => (
                        <Box key={setIndex} sx={{ display: 'flex', alignItems: 'center' }}>
                            {partnerLogos.map((logo, index) => (
                                failedImages[logo.id || logo.name] ? (
                                    <Box
                                        key={`${setIndex}-${index}`}
                                        sx={{
                                            height: { xs: 40, sm: 50, md: 60 },
                                            width: { xs: 130, sm: 180, md: 220 },
                                            mx: { xs: 3, sm: 5, md: 7 },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '12px',
                                            bgcolor: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            color: '#475569',
                                            fontWeight: 800,
                                            fontSize: { xs: '0.8rem', sm: '0.95rem', md: '1.05rem' },
                                            letterSpacing: '0.02em',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': { transform: 'scale(1.1)' },
                                            px: 2,
                                            textAlign: 'center'
                                        }}
                                    >
                                        <span className="truncate max-w-full">{logo.name}</span>
                                    </Box>
                                ) : (
                                    <Box
                                        key={`${setIndex}-${index}`}
                                        sx={{
                                            height: { xs: 50, sm: 65, md: 80 },
                                            mx: { xs: 3, sm: 5, md: 7 },
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                            '&:hover': { transform: 'scale(1.1)' },
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={logo.url}
                                            alt={logo.name}
                                            onError={() => setFailedImages(prev => ({ ...prev, [logo.id || logo.name]: true }))}
                                            sx={{
                                                maxWidth: { xs: '150px', sm: '210px', md: '260px' },
                                                maxHeight: '100%',
                                                objectFit: 'contain',
                                                display: 'block',
                                            }}
                                        />
                                    </Box>
                                )
                            ))}
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* ── OPPORTUNITIES SECTION ── */}
            <Box sx={{
                width: '100%', bgcolor: '#f8fafc',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pt: { xs: 8, md: 10 }, pb: { xs: 6, md: 8 },
            }}>
                <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 3, md: 4 } }}>
                    <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center', px: 2 }}>
                        <Typography variant="h3" sx={{
                            fontSize: { xs: '1.8rem', sm: '2rem', md: '2.5rem' },
                            fontWeight: 900, color: BRAND, lineHeight: 1.2,
                        }}>
                            AllFix brings <span style={{ color: '#0d264a' }}>new opportunities</span>
                        </Typography>
                    </Box>

                    <Box
                        ref={oppRef}
                        onScroll={handleOppScroll}
                        sx={{
                            display: { xs: 'flex', sm: 'grid' },
                            flexDirection: { xs: 'row', sm: 'unset' },
                            overflowX: { xs: 'auto', sm: 'unset' },
                            scrollSnapType: { xs: 'x mandatory', sm: 'unset' },
                            gridTemplateColumns: { sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                            gap: { xs: 2.5, md: 3, lg: 4 },
                            maxWidth: '1200px', mx: 'auto',
                            px: { xs: 2.5, sm: 0 },
                            pb: { xs: 2, sm: 0 },
                            '&::-webkit-scrollbar': { display: 'none' },
                        }}
                    >
                        {opportunities.map((opp, index) => (
                            <Box key={index} sx={{
                                minWidth: { xs: '85%', sm: 'auto' },
                                scrollSnapAlign: { xs: 'center', sm: 'unset' },
                                display: 'flex', flexDirection: 'column',
                                bgcolor: 'white',
                                borderRadius: { xs: '16px', md: '20px' },
                                overflow: 'hidden',
                                border: '1px solid #eaf2fc',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 24px rgba(0,0,0,0.08)' },
                                ...(index === 2 && { gridColumn: { sm: '1 / -1', lg: 'auto' }, maxWidth: { sm: '50%', lg: '100%' }, mx: { sm: 'auto', lg: 0 }, width: '100%' }),
                            }}>
                                <Box sx={{ width: '100%', height: { xs: '200px', sm: '220px', md: '240px', lg: '280px' } }}>
                                    <Box component="img" src={opp.image} alt={opp.title}
                                        sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                                </Box>
                                <Box sx={{ p: { xs: 3, sm: 3, md: 4 }, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Typography sx={{ fontWeight: 800, color: '#0d264a', fontSize: { xs: '1.2rem', md: '1.3rem', lg: '1.4rem' }, lineHeight: 1.2, mb: 0.5 }}>
                                        {opp.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' }, fontWeight: 700, color: '#0d264a', mb: { xs: 2, md: 2 }, letterSpacing: '0.04em' }}>
                                        {opp.tag}
                                    </Typography>
                                    <Box sx={{ width: { xs: '32px', md: '40px' }, height: '3px', bgcolor: '#0d264a', mb: { xs: 2, md: 3 } }} />
                                    <Typography sx={{ fontSize: { xs: '0.95rem', md: '0.95rem', lg: '1rem' }, color: '#64748b', lineHeight: 1.7, flex: 1 }}>
                                        {opp.description}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    {/* Opportunities Mobile Dots */}
                    <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', gap: 1, mt: 3 }}>
                        {opportunities.map((_, i) => (
                            <Box
                                key={i}
                                onClick={() => scrollToOpp(i)}
                                sx={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    bgcolor: oppIdx === i ? BRAND : '#cbd5e1',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease'
                                }}
                            />
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* ── TESTIMONIALS ── */}
            <Box sx={{
                width: '100%',
                pt: { xs: 5, md: 6 },
                pb: { xs: 3, md: 4 },
                bgcolor: 'white',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
                <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 2, md: 3 } }}>

                    {/* Title */}
                    <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center', px: { xs: 2, sm: 0 } }}>
                        <Typography variant="h3" sx={{
                            fontSize: { xs: '1.7rem', sm: '2.1rem', md: '2.8rem' },
                            fontWeight: 900, color: BRAND, lineHeight: 1.2,
                        }}>
                            What our <span style={{ color: '#0d264a' }}>partners say</span>
                        </Typography>
                    </Box>

                    {/* ========================================================================= */}
                    {/* DESKTOP SLIDER (Hidden on mobile) */}
                    {/* ========================================================================= */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' }, overflow: 'hidden', width: '100%' }}>
                        <Box sx={{
                            display: 'flex',
                            transition: 'transform 0.55s cubic-bezier(.4,0,.2,1)',
                            transform: `translateX(-${testimonialIdx * 100}%)`,
                            willChange: 'transform',
                        }}>
                            {testimonialSlides.map((slide, si) => (
                                <Box key={si} sx={{
                                    minWidth: '100%',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gridTemplateRows: {
                                        sm: '220px 220px',
                                        md: '250px 250px',
                                        lg: '270px 270px',
                                    },
                                }}>
                                    {slide.cells.map((cell, ci) =>
                                        cell.type === 'blue'
                                            ? <BlueCell key={ci} quote={cell.quote} name={cell.name} company={cell.company} />
                                            : <ImgCell key={ci} src={cell.src} />
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* Desktop Nav Dots/Arrows */}
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', justifyContent: 'center', gap: 2, mt: { xs: 3, md: 4 } }}>
                        <Button
                            onClick={() => setTestimonialIdx(i => (i - 1 + testimonialSlides.length) % testimonialSlides.length)}
                            sx={{
                                minWidth: { xs: 38, md: 42 }, width: { xs: 38, md: 42 }, height: { xs: 38, md: 42 },
                                borderRadius: '50%', bgcolor: BRAND, color: 'white',
                                '&:hover': { bgcolor: '#0d264a' }, p: 0, fontSize: '1.1rem',
                            }}
                        >←</Button>
                        {testimonialSlides.map((_, i) => (
                            <Box key={i} onClick={() => setTestimonialIdx(i)} sx={{
                                width: { xs: 7, md: 8 }, height: { xs: 7, md: 8 },
                                borderRadius: '50%', cursor: 'pointer',
                                bgcolor: testimonialIdx === i ? BRAND : '#cbd5e1',
                                transition: 'background 0.25s',
                            }} />
                        ))}
                        <Button
                            onClick={() => setTestimonialIdx(i => (i + 1) % testimonialSlides.length)}
                            sx={{
                                minWidth: { xs: 38, md: 42 }, width: { xs: 38, md: 42 }, height: { xs: 38, md: 42 },
                                borderRadius: '50%', bgcolor: BRAND, color: 'white',
                                '&:hover': { bgcolor: '#0d264a' }, p: 0, fontSize: '1.1rem',
                            }}
                        >→</Button>
                    </Box>

                    {/* ========================================================================= */}
                    {/* MOBILE SLIDER (1 at a time, scroll snap) */}
                    {/* ========================================================================= */}
                    <Box
                        ref={mobileTestimonialRef}
                        onScroll={handleMobileTestimonialScroll}
                        sx={{
                            display: { xs: 'flex', sm: 'none' },
                            overflowX: 'auto',
                            scrollSnapType: 'x mandatory',
                            width: '100%',
                            '&::-webkit-scrollbar': { display: 'none' },
                            borderRadius: '16px',
                            border: `1px solid ${BRAND}`,
                        }}
                    >
                        {mobileTestimonials.map((t, i) => (
                            <Box key={i} sx={{ minWidth: '100%', scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ height: '240px', width: '100%' }}>
                                    <Box component="img" src={t.img} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                                <Box sx={{ bgcolor: BRAND, p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                                    <Typography sx={{ color: 'white', fontSize: '1rem', fontWeight: 600, mb: 2, fontStyle: 'italic', lineHeight: 1.6 }}>{t.quote}</Typography>
                                    <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', mb: 0.2 }}>{t.name}</Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{t.company}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    {/* Mobile Nav Dots */}
                    <Box sx={{ display: { xs: 'flex', sm: 'none' }, justifyContent: 'center', gap: 1, mt: 3 }}>
                        {mobileTestimonials.map((_, i) => (
                            <Box
                                key={i}
                                onClick={() => scrollToMobileTestimonial(i)}
                                sx={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    bgcolor: mobileTestimonialIdx === i ? BRAND : '#cbd5e1',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease'
                                }}
                            />
                        ))}
                    </Box>

                </Container>
            </Box>

            {/* ── FAQ SECTION ── */}
            <Box sx={{
                width: '100%', bgcolor: 'white',
                pt: { xs: 3, md: 4 },
                pb: { xs: 6, md: 8 },
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Container maxWidth="lg" sx={{ px: { xs: 3, sm: 4, md: 5 } }}>
                    <Grid container spacing={{ xs: 5, md: 8 }}>
                        {/* Left Column: Title */}
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Box sx={{ position: 'sticky', top: '120px' }}>
                                <Typography variant="h3" sx={{
                                    fontSize: { xs: '2rem', md: '2.8rem' },
                                    fontWeight: 900, color: BRAND, lineHeight: 1.1, mb: 2
                                }}>
                                    Any questions?
                                </Typography>
                                <Typography sx={{
                                    fontSize: { xs: '1rem', md: '1.1rem' },
                                    color: '#64748b', lineHeight: 1.6
                                }}>
                                    We're here to help you grow your business. Here are answers to some of the most common questions from our new partners.
                                </Typography>
                            </Box>
                        </Grid>

                        {/* Right Column: Accordions */}
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {faqData.map((faq, index) => (
                                    <Accordion
                                        key={index}
                                        disableGutters
                                        elevation={0}
                                        sx={{
                                            bgcolor: 'transparent',
                                            borderBottom: '1px solid #edf2f7',
                                            '&:before': { display: 'none' },
                                            '&.Mui-expanded': { margin: 0 },
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon sx={{ color: BRAND }} />}
                                            sx={{
                                                px: 0, py: 1.5,
                                                '& .MuiAccordionSummary-content': { margin: 0 },
                                                '& .MuiAccordionSummary-content.Mui-expanded': { margin: 0 },
                                            }}
                                        >
                                            <Typography sx={{
                                                fontSize: { xs: '1.05rem', md: '1.15rem' },
                                                fontWeight: 800, color: '#0d264a'
                                            }}>
                                                {faq.question}
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ px: 0, pb: 3, pt: 0 }}>
                                            <Typography sx={{
                                                fontSize: { xs: '0.9rem', md: '0.95rem' },
                                                color: '#64748b', lineHeight: 1.7
                                            }}>
                                                {faq.answer}
                                            </Typography>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ===================== FOOTER ===================== */}
            <Footer />
        </>
    );
};

export default VendorApplication;
