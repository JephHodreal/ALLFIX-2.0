import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Box, Typography, Button, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  isLandingPage?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ isLandingPage = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleBackHome = () => {
    setMobileOpen(false);
    if (!isAuthenticated || !role) {
      navigate('/');
    } else if (role === 'customer') {
      navigate('/customer');
    } else if (role === 'admin') {
      navigate('/admin/services');
    } else if (role === 'vendor') {
      navigate('/vendor/services');
    } else if (role === 'personnel') {
      navigate('/personnel');
    } else {
      navigate('/');
    }
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const timer = setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) {
          const offsetTop = el.getBoundingClientRect().top + window.scrollY - 20;
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Why AllFix', href: '#why-allfix' },
    { label: 'Service Area', href: '#service-area' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Become Our Partner', href: '/vendor-apply' },
  ];

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('/')) {
      navigate(href);
      window.scrollTo(0, 0);
      return;
    }

    if (location.pathname === '/' || isLandingPage) {
      const el = document.querySelector(href);
      if (el) {
        const offsetTop = el.getBoundingClientRect().top + window.scrollY - 20;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    } else {
      // Navigate to landing page with hash
      navigate('/' + href);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: 1100,
        background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        boxShadow: isScrolled ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
        transition: 'all 0.3s ease',
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, sm: 4, md: 5 }, minHeight: '64px' }}>
        <Box 
          onClick={() => { navigate('/'); window.scrollTo(0, 0); }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: { xs: 0, lg: 8, xl: 16 }, flex: { xs: '1 1 auto', lg: 'none' }, cursor: 'pointer' }}
        >
          <Box component="img" src="/ALLFIXLOGO.png" alt="AllFix.ph Logo" sx={{ width: { xs: 35, lg: 45 }, height: { xs: 35, lg: 45 }, objectFit: 'contain' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" sx={{ color: isScrolled ? '#10355f' : 'white', fontWeight: 'bold', lineHeight: 1, mb: 0.3, transition: 'color 0.3s ease', fontSize: { xs: '1.1rem', lg: '1.3rem' } }}>
              All<span style={{ color: '#017550' }}>F</span><span style={{ color: '#fcbc26' }}>i</span><span style={{ color: '#d8242b' }}>x</span>.ph
            </Typography>
            <Typography variant="overline" sx={{ color: isScrolled ? '#10355f' : 'white', lineHeight: 1, fontSize: '0.6rem', letterSpacing: 0.5, transition: 'color 0.3s ease' }}>
              PROPERTY CARE EXPERTS
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 0.5, mr: { xl: 4, lg: 2 } }}>
          {isLandingPage ? (
            navLinks.map((link) => (
              <Button 
                key={link.label} 
                onClick={() => handleNavClick(link.href)} 
                sx={{ 
                  px: 2, 
                  py: 1, 
                  borderRadius: 1, 
                  fontSize: '0.95rem', 
                  fontWeight: 600, 
                  textTransform: 'none', 
                  color: isScrolled ? '#10355f' : 'rgba(255,255,255,0.9)', 
                  '&:hover': { 
                    backgroundColor: isScrolled ? 'rgba(16, 53, 95, 0.1)' : 'rgba(255,255,255,0.1)', 
                    color: isScrolled ? '#10355f' : 'white' 
                  } 
                }}
              >
                {link.label}
              </Button>
            ))
          ) : (
            <Button 
              onClick={handleBackHome} 
              sx={{ 
                px: 2.5, 
                py: 1, 
                borderRadius: '30px', 
                fontSize: '0.95rem', 
                fontWeight: 700, 
                textTransform: 'none', 
                color: isScrolled ? '#10355f' : 'rgba(255,255,255,0.9)', 
                border: isScrolled ? '1px solid #10355f' : '1px solid rgba(255,255,255,0.4)',
                '&:hover': { 
                  backgroundColor: isScrolled ? 'rgba(16, 53, 95, 0.1)' : 'rgba(255,255,255,0.1)', 
                  color: isScrolled ? '#10355f' : 'white',
                  borderColor: isScrolled ? '#10355f' : 'white',
                } 
              }}
            >
              Back to Homepage
            </Button>
          )}
        </Box>

        <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ display: { xs: 'flex', lg: 'none' }, color: isScrolled ? '#10355f' : 'white' }}>
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      </Toolbar>

      {mobileOpen && (
        <Box sx={{ bgcolor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'rgba(16, 53, 95, 0.8)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.2)', display: { xs: 'block', lg: 'none' } }}>
          <Box sx={{ px: 2, py: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {isLandingPage ? (
              navLinks.map((link) => (
                <Button 
                  key={link.label} 
                  onClick={() => handleNavClick(link.href)} 
                  fullWidth 
                  sx={{ 
                    justifyContent: 'flex-start', 
                    px: 2, 
                    py: 1, 
                    borderRadius: 1, 
                    fontSize: '0.95rem', 
                    fontWeight: 600, 
                    textTransform: 'none', 
                    color: isScrolled ? '#10355f' : 'white', 
                    '&:hover': { 
                      backgroundColor: isScrolled ? 'rgba(16, 53, 95, 0.1)' : 'rgba(255,255,255,0.2)' 
                    } 
                  }}
                >
                  {link.label}
                </Button>
              ))
            ) : (
              <Button 
                onClick={handleBackHome} 
                fullWidth 
                sx={{ 
                  justifyContent: 'flex-start', 
                  px: 2, 
                  py: 1, 
                  borderRadius: 1, 
                  fontSize: '0.95rem', 
                  fontWeight: 700, 
                  textTransform: 'none', 
                  color: isScrolled ? '#10355f' : 'white', 
                  '&:hover': { 
                    backgroundColor: isScrolled ? 'rgba(16, 53, 95, 0.1)' : 'rgba(255,255,255,0.2)' 
                  } 
                }}
              >
                Back to Homepage
              </Button>
            )}
          </Box>
        </Box>
      )}
    </AppBar>
  );
};
