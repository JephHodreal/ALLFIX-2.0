import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    Container,
    CssBaseline,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';

const BRAND = '#10355f';
const BRAND_MID = '#1a4a7a';

const faqData = [
    {
        question: 'What qualifications do I need to join as personnel?',
        answer: 'We welcome service professionals with experience in various fields. You\'ll need to pass our verification process to ensure quality service delivery to our customers.',
    },
    {
        question: 'How do I get paid for my work?',
        answer: 'All earnings are processed securely through the AllFix platform. Your compensation is deposited directly into your registered bank account or preferred payment method on a weekly basis.',
    },
    {
        question: 'Can I set my own schedule?',
        answer: 'Yes! AllFix offers flexible scheduling. You can accept jobs that fit your availability and manage your workload according to your preferences.',
    },
    {
        question: 'What support will I receive from AllFix?',
        answer: 'We provide comprehensive support including training resources, customer support handling, technical assistance, and a dedicated partner hotline to help you succeed.',
    },
];

const howItWorksSteps = [
    {
        step: 1,
        title: 'Create Your Profile',
        description: 'Sign up with your basic information and verify your email to get started.',
    },
    {
        step: 2,
        title: 'Complete Verification',
        description: 'Undergo our verification process to ensure quality and trustworthiness.',
    },
    {
        step: 3,
        title: 'Set Your Availability',
        description: 'Choose your working hours and service areas based on your preferences.',
    },
    {
        step: 4,
        title: 'Start Earning',
        description: 'Accept bookings from verified customers and start building your income.',
    },
];

const PersonnelLanding = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const [expandedFAQ, setExpandedFAQ] = useState<number | false>(false);

    // Step State for 'How it Works'
    const [selectedStep, setSelectedStep] = useState<number>(0);

    // Swipe Handlers for Mobile Step Slider
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && selectedStep < howItWorksSteps.length - 1) {
            setSelectedStep(selectedStep + 1);
        }
        if (isRightSwipe && selectedStep > 0) {
            setSelectedStep(selectedStep - 1);
        }
    };

    return (
        <Box sx={{ width: '100%', overflowX: 'hidden', minHeight: '100vh', bgcolor: '#ffffff' }}>
            <CssBaseline />
            <Navbar isLandingPage={false} backRoute="/vendor-apply" backLabel="Back" />

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
                {/* BACKGROUND IMAGE - Right Half */}
                <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1552879890-3a06dd3a06c2?q=80&w=1254&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Personnel Background"
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
                        component="div"
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
                                Earn Extra Income <br />
                                <Box component="span" sx={{ color: '#ffffff' }}>
                                    Working{' '}
                                    <Box component="span" sx={{ color: '#017550' }}>Flex</Box>
                                    <Box component="span" sx={{ color: '#fcbc26' }}>ib</Box>
                                    <Box component="span" sx={{ color: '#d8242b' }}>ly</Box>
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
                                Turn your skills into steady earnings with flexible work opportunities.
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
                                    Apply Now
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
                                    Already a Partner?{' '}
                                    <Box
                                        component="span"
                                        onClick={() => { navigate('/login', { state: { from: '/personnel-apply' } }); window.scrollTo(0, 0); }}
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

            {/* ===================== WHITE SECTION ===================== */}
            <Box
                sx={{
                    width: '100%',
                    minHeight: 'auto',
                    bgcolor: '#ffffff',
                    py: { xs: 6, sm: 6, md: 8, lg: 8 },
                    px: { xs: 2, sm: 4, md: 5 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 0,
                }}
            >
                <Container maxWidth="xl">
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gap: { xs: 4, md: 6, lg: 8 },
                            alignItems: 'center',
                        }}
                    >
                        {/* Left: Image */}
                        <Box
                            sx={{
                                width: '100%',
                                height: { xs: '250px', sm: '300px', md: '350px', lg: '400px' },
                                borderRadius: { xs: '12px', md: '20px' },
                                overflow: 'hidden',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                            }}
                        >
                            <Box
                                component="img"
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80"
                                alt="Personnel Career"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                }}
                            />
                        </Box>

                        {/* Right: Content */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '2rem', sm: '2.5rem', md: '2.8rem', lg: '3.2rem' },
                                    fontWeight: 900,
                                    color: BRAND,
                                    lineHeight: 1.2,
                                }}
                            >
                                Where careers thrive and growth begins
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem', lg: '1.1rem' },
                                    color: '#555',
                                    lineHeight: 1.8,
                                    fontWeight: 400,
                                }}
                            >
                                At AllFix, we're committed to supporting talented service professionals as they grow into the next generation of business innovators. Our platform combines real-world experience, flexible scheduling, and competitive earnings—ensuring every participant feels empowered, included, and set up for success from day one. With a presence across Metro Manila and key hubs nationwide, our professionals collaborate with businesses across industries, gaining exposure to diverse practices and opportunities that shape their careers.
                            </Typography>

                            <Button
                                onClick={() => { navigate('/personnel-login'); window.scrollTo(0, 0); }}
                                variant="contained"
                                sx={{
                                    bgcolor: BRAND,
                                    color: 'white',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: { xs: '0.95rem', md: '1rem' },
                                    px: 4,
                                    py: 1.8,
                                    borderRadius: '50px',
                                    width: 'fit-content',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        bgcolor: '#0d264a',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 24px rgba(16, 53, 95, 0.3)',
                                    },
                                }}
                            >
                                Join Now
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* ===================== BLUE SECTION ===================== */}
            <Box
                sx={{
                    width: '100%',
                    minHeight: 'auto',
                    bgcolor: BRAND,
                    py: { xs: 6, sm: 6, md: 8, lg: 8 },
                    px: { xs: 2, sm: 4, md: 5 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Container maxWidth="xl">
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gap: { xs: 4, md: 6 },
                            alignItems: 'center',
                        }}
                    >
                        {/* Left: Content */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                                    fontWeight: 900,
                                    color: 'white',
                                    lineHeight: 1.2,
                                }}
                            >
                                Professional Development Program
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                                    color: 'rgba(255,255,255,0.9)',
                                    lineHeight: 1.6,
                                    fontWeight: 400,
                                }}
                            >
                                Our professional development program is designed to launch talented individuals into meaningful service careers. You'll complete rotations across different departments and functions—gaining comprehensive exposure and real-world experience. The program fosters growth through hands-on training, expert mentorship, and structured skill development, supported by coaching, peer collaboration, and inclusive learning environments that set you up for success from day one.
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                                    color: 'rgba(255,255,255,0.9)',
                                    lineHeight: 1.6,
                                    fontWeight: 400,
                                }}
                            >
                                You'll work alongside experienced professionals, participate in industry events, and contribute to real projects that matter. Your achievements are recognized through competitive compensation, performance incentives, and clear career advancement pathways. With presence across major service hubs and a commitment to your growth, you'll build valuable skills and network while earning meaningful income and gaining experience that will shape your future.
                            </Typography>

                            <Button
                                onClick={() => { navigate('/personnel-login'); window.scrollTo(0, 0); }}
                                variant="contained"
                                sx={{
                                    bgcolor: '#22c55e',
                                    color: 'white',
                                    fontWeight: 700,
                                    textTransform: 'none',
                                    fontSize: { xs: '0.95rem', md: '1rem' },
                                    px: 4,
                                    py: 1.6,
                                    borderRadius: '50px',
                                    width: 'fit-content',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        bgcolor: '#16a34a',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
                                    },
                                    mt: 1,
                                }}
                            >
                                Apply Now
                            </Button>
                        </Box>

                        {/* Right: Image */}
                        <Box
                            sx={{
                                width: '100%',
                                height: { xs: '250px', sm: '300px', md: '350px' },
                                borderRadius: { xs: '12px', md: '20px' },
                                overflow: 'hidden',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
                            }}
                        >
                            <Box
                                component="img"
                                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80"
                                alt="Professional Development"
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                }}
                            />
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* ===================== HOW IT WORKS SECTION ===================== */}
            <Box
                sx={{
                    width: '100%',
                    minHeight: 'auto',
                    bgcolor: '#f8f9fa',
                    py: { xs: 6, sm: 6, md: 8, lg: 8 },
                    px: { xs: 2, sm: 4, md: 5 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Container maxWidth="lg">
                    {/* Title */}
                    <Box sx={{ mb: { xs: 6, md: 8 }, textAlign: 'center' }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                                fontWeight: 900,
                                color: BRAND,
                                lineHeight: 1.2,
                                mb: 2,
                            }}
                        >
                            How It Works
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: { xs: '0.95rem', md: '1.05rem' },
                                color: '#666',
                                maxWidth: '600px',
                                mx: 'auto',
                            }}
                        >
                            Get started with AllFix in just a few simple steps
                        </Typography>
                    </Box>

                    {/* Main Content Grid */}
                    <Grid component="div" container spacing={{ xs: 2, md: 3 }} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                        {/* Left: Phone Mockup */}
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Box
                                sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 2, md: 0 } }}
                                // On mobile, the entire left section can capture swipe gestures
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                {/* Phone Frame */}
                                <Box
                                    sx={{
                                        width: '240px',
                                        height: '420px',
                                        border: '10px solid #000',
                                        borderRadius: '35px',
                                        overflow: 'hidden',
                                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                                        position: 'relative',
                                        backgroundColor: '#fff',
                                    }}
                                >
                                    {/* Notch */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: '120px',
                                            height: '20px',
                                            backgroundColor: '#000',
                                            borderRadius: '0 0 15px 15px',
                                            zIndex: 10,
                                        }}
                                    />

                                    {/* Screen Content */}
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            padding: '20px 15px 15px',
                                            background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_MID} 100%)`,
                                            color: 'white',
                                            transition: 'all 0.3s ease',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {/* Step Headers */}
                                        {selectedStep === 0 && (
                                            <>
                                                <Typography sx={{ fontSize: '1rem', fontWeight: 800, mb: 1 }}>Create Profile</Typography>
                                                <Typography sx={{ fontSize: '0.7rem', lineHeight: 1.4, opacity: 0.9, mb: 2 }}>Enter your details and verify email.</Typography>
                                                <Box sx={{ fontSize: '2.5rem', textAlign: 'center', mt: 'auto', mb: 'auto' }}>📝</Box>
                                            </>
                                        )}
                                        {selectedStep === 1 && (
                                            <>
                                                <Typography sx={{ fontSize: '1rem', fontWeight: 800, mb: 1 }}>Verification</Typography>
                                                <Typography sx={{ fontSize: '0.7rem', lineHeight: 1.4, opacity: 0.9, mb: 2 }}>Complete verification process.</Typography>
                                                <Box sx={{ fontSize: '2.5rem', textAlign: 'center', mt: 'auto', mb: 'auto' }}>✓</Box>
                                            </>
                                        )}
                                        {selectedStep === 2 && (
                                            <>
                                                <Typography sx={{ fontSize: '1rem', fontWeight: 800, mb: 1 }}>Set Schedule</Typography>
                                                <Typography sx={{ fontSize: '0.7rem', lineHeight: 1.4, opacity: 0.9, mb: 2 }}>Choose availability and areas.</Typography>
                                                <Box sx={{ fontSize: '2.5rem', textAlign: 'center', mt: 'auto', mb: 'auto' }}>📅</Box>
                                            </>
                                        )}
                                        {selectedStep === 3 && (
                                            <>
                                                <Typography sx={{ fontSize: '1rem', fontWeight: 800, mb: 1 }}>Start Earning</Typography>
                                                <Typography sx={{ fontSize: '0.7rem', lineHeight: 1.4, opacity: 0.9, mb: 2 }}>Accept bookings and earn.</Typography>
                                                <Box sx={{ fontSize: '2.5rem', textAlign: 'center', mt: 'auto', mb: 'auto' }}>💰</Box>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Right: Steps (Desktop & Mobile Conditional) */}
                        <Grid size={{ xs: 12, md: 5 }}>

                            {/* DESKTOP VIEW: Vertical List */}
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 1.8 }}>
                                {howItWorksSteps.map((item, index) => (
                                    <Box
                                        key={index}
                                        onClick={() => setSelectedStep(index)}
                                        sx={{
                                            display: 'flex',
                                            gap: 2,
                                            p: 2,
                                            borderRadius: '16px',
                                            bgcolor: selectedStep === index ? BRAND : 'white',
                                            cursor: 'pointer',
                                            boxShadow: selectedStep === index ? `0 8px 32px rgba(16, 53, 95, 0.3)` : '0 4px 20px rgba(0,0,0,0.08)',
                                            transition: 'all 0.3s ease',
                                            border: selectedStep === index ? 'none' : '2px solid transparent',
                                            '&:hover': {
                                                boxShadow: '0 8px 32px rgba(16, 53, 95, 0.15)',
                                                transform: 'translateY(-4px)',
                                            },
                                        }}
                                    >
                                        {/* Step Number */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '55px',
                                                height: '55px',
                                                minWidth: '55px',
                                                borderRadius: '50%',
                                                bgcolor: selectedStep === index ? 'rgba(255,255,255,0.3)' : BRAND,
                                                color: 'white',
                                                fontSize: '2rem',
                                                fontWeight: 800,
                                            }}
                                        >
                                            {item.step}
                                        </Box>

                                        {/* Content */}
                                        <Box sx={{ flex: 1, py: 0.2 }}>
                                            <Typography
                                                sx={{
                                                    fontSize: '1rem',
                                                    fontWeight: 700,
                                                    color: selectedStep === index ? 'white' : BRAND,
                                                    mb: 0.5,
                                                }}
                                            >
                                                {item.title}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: '0.85rem',
                                                    color: selectedStep === index ? 'rgba(255,255,255,0.85)' : '#666',
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {item.description}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            {/* MOBILE VIEW: Swipeable Carousel */}
                            <Box
                                sx={{ display: { xs: 'block', md: 'none' }, width: '100%', mt: 1 }}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                {/* Slider Container */}
                                <Box sx={{ overflow: 'hidden', width: '100%' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            transform: `translateX(-${selectedStep * 100}%)`,
                                        }}
                                    >
                                        {howItWorksSteps.map((item, index) => (
                                            <Box key={index} sx={{ minWidth: '100%', px: 1, boxSizing: 'border-box' }}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 2,
                                                        p: 2,
                                                        borderRadius: '16px',
                                                        bgcolor: BRAND,
                                                        color: 'white',
                                                        boxShadow: '0 8px 32px rgba(16, 53, 95, 0.2)',
                                                        alignItems: 'center',
                                                        minHeight: '110px'
                                                    }}
                                                >
                                                    {/* Step Number */}
                                                    <Box
                                                        sx={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            width: '55px', height: '55px', minWidth: '55px',
                                                            borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.3)',
                                                            color: 'white', fontSize: '2rem', fontWeight: 800,
                                                        }}
                                                    >
                                                        {item.step}
                                                    </Box>

                                                    {/* Content */}
                                                    <Box sx={{ flex: 1, py: 0.2 }}>
                                                        <Typography sx={{ fontSize: '1rem', fontWeight: 700, mb: 0.5 }}>
                                                            {item.title}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>
                                                            {item.description}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>

                                {/* Indicators */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3, mb: 2 }}>
                                    {howItWorksSteps.map((_, idx) => (
                                        <Box
                                            key={idx}
                                            onClick={() => setSelectedStep(idx)}
                                            sx={{
                                                width: selectedStep === idx ? '24px' : '8px',
                                                height: '8px',
                                                borderRadius: '4px',
                                                bgcolor: selectedStep === idx ? BRAND : 'rgba(16, 53, 95, 0.2)',
                                                transition: 'all 0.3s ease',
                                                cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>

                            {/* CTA Button */}
                            <Box sx={{ mt: { xs: 1, md: 2 }, textAlign: { xs: 'center', md: 'left' } }}>
                                <Button
                                    onClick={() => { navigate('/personnel-login'); window.scrollTo(0, 0); }}
                                    variant="contained"
                                    sx={{
                                        bgcolor: BRAND,
                                        color: 'white',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        fontSize: { xs: '0.9rem', md: '0.95rem' },
                                        px: 3,
                                        py: 1.3,
                                        borderRadius: '8px',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            bgcolor: '#0d264a',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 8px 24px rgba(16, 53, 95, 0.3)',
                                        },
                                    }}
                                >
                                    Register Now
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ===================== BLUE CTA SECTION ===================== */}
            <Box
                sx={{
                    width: '100%',
                    minHeight: 'auto',
                    bgcolor: BRAND,
                    py: { xs: 3, sm: 3, md: 4, lg: 4 },
                    px: { xs: 2, sm: 4, md: 5 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: '1.6rem', sm: '2rem', md: '2.5rem', lg: '2.8rem' },
                                fontWeight: 900,
                                color: 'white',
                                lineHeight: 1.2,
                                mb: 2,
                            }}
                        >
                            Apply now and help us innovate services together!
                        </Typography>

                        <Button
                            onClick={() => { navigate('/personnel-login'); window.scrollTo(0, 0); }}
                            variant="contained"
                            sx={{
                                bgcolor: '#22c55e',
                                color: 'white',
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: { xs: '0.9rem', md: '0.95rem' },
                                px: 3.5,
                                py: 1.2,
                                borderRadius: '50px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    bgcolor: '#16a34a',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)',
                                },
                            }}
                        >
                            Apply now
                        </Button>
                    </Box>
                </Container>
            </Box>

            {/* ===================== WHITE SECTION 2 ===================== */}
            <Box
                sx={{
                    width: '100%',
                    minHeight: 'auto',
                    bgcolor: '#ffffff',
                    py: { xs: 6, sm: 6, md: 8, lg: 8 },
                    px: { xs: 2, sm: 4, md: 5 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Container maxWidth="lg">
                    {/* FAQ Title */}
                    <Box sx={{ mb: { xs: 4, md: 6 }, textAlign: 'center' }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontSize: { xs: '1.8rem', sm: '2.1rem', md: '2.8rem' },
                                fontWeight: 900,
                                color: BRAND,
                                lineHeight: 1.2,
                            }}
                        >
                            Any Questions?
                        </Typography>
                    </Box>

                    {/* FAQ Items */}
                    <Grid component="div" container spacing={{ xs: 2, md: 3 }} sx={{ justifyContent: 'center' }}>
                        <Grid size={{ xs: 12, md: 10, lg: 8 }}>
                            {faqData.map((faq: typeof faqData[0], index: number) => (
                                <Accordion
                                    key={index}
                                    expanded={expandedFAQ === index}
                                    onChange={() => setExpandedFAQ(expandedFAQ === index ? false : index)}
                                    sx={{
                                        mb: 2,
                                        backgroundColor: 'white',
                                        border: `1px solid #e0e0e0`,
                                        borderRadius: '12px',
                                        '&:before': { display: 'none' },
                                        '&.Mui-expanded': {
                                            border: `1px solid ${BRAND}`,
                                            boxShadow: `0 4px 12px rgba(16, 53, 95, 0.1)`,
                                        },
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        sx={{
                                            py: 2,
                                            px: { xs: 2, md: 3 },
                                            '& .MuiAccordionSummary-content': {
                                                my: 0,
                                            },
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: { xs: '0.95rem', md: '1.05rem' },
                                                fontWeight: 700,
                                                color: BRAND,
                                            }}
                                        >
                                            {faq.question}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails
                                        sx={{
                                            py: 2,
                                            px: { xs: 2, md: 3 },
                                            pt: 0,
                                            backgroundColor: 'rgba(16, 53, 95, 0.02)',
                                            borderTop: `1px solid #e0e0e0`,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: { xs: '0.9rem', md: '1rem' },
                                                color: '#555',
                                                lineHeight: 1.6,
                                            }}
                                        >
                                            {faq.answer}
                                        </Typography>
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* ── FOOTER ── */}
            <Footer />
        </Box>
    );
};

export default PersonnelLanding;