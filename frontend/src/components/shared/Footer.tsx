import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Typography, IconButton } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { servicesData } from '../../constants/servicesData';
import api from '../../services/apiService';

const svgIconMapping: Record<string, React.ReactNode> = {
  coolfix: <path d="M19.5 12h-15M17.5 16h-11M21.5 8h-15" strokeWidth="2" strokeLinecap="round" />,
  sanifix: <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  homefix: <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 9.36l-7.1 7.1a1 1 0 01-1.42 0l-1.4-1.4a1 1 0 010-1.42l7.1-7.1a6 6 0 019.36-7.94l-3.77 3.77z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  movefix: <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  greenfix: <path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM11 20v-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  healthfix: <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  spacefix: <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
  techfix: <><rect x="4" y="4" width="16" height="16" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>
};

const defaultSvgIcon = <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />;

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>(servicesData);

  useEffect(() => {
    api.get('/api/services')
      .then(res => {
        const backendServices = res.data;
        const merged: any[] = [];

        backendServices.forEach((bs: any) => {
          const id = bs.id || bs.name.toLowerCase().replace(/\s+/g, '');
          const frontendMatch = servicesData.find(
            s => s.id.toLowerCase() === id.toLowerCase() || s.brand.toLowerCase() === bs.name.toLowerCase()
          );
          
          merged.push({
            id,
            brand: bs.name,
            tagline: bs.tagline || frontendMatch?.tagline || 'Specialized Services',
            description: bs.description,
            image: bs.imageUrl || bs.image || frontendMatch?.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
            accent: frontendMatch?.accent || '#2E5BA8',
            accentDark: frontendMatch?.accentDark || '#10355f',
            headerBg: frontendMatch?.headerBg || '#10355f',
            headerBgLight: frontendMatch?.headerBgLight || '#2E5BA8',
            pillText: frontendMatch?.pillText || '#2E5BA8',
          });
        });

        // Add remaining frontend services
        servicesData.forEach((fs) => {
          if (!merged.find(m => m.id.toLowerCase() === fs.id.toLowerCase())) {
            merged.push({
              id: fs.id,
              brand: fs.brand,
              tagline: fs.tagline,
              description: fs.description,
              image: fs.image,
              accent: fs.accent,
              accentDark: fs.accentDark,
              headerBg: fs.headerBg,
              headerBgLight: fs.headerBgLight,
              pillText: fs.pillText,
            });
          }
        });

        setServices(merged);
        console.log("[CAVEMAN] Footer dynamic services successfully fetched and synchronized with DB:", merged.map(m => m.brand));
      })
      .catch(err => {
        console.error("[CAVEMAN] Failed to load services in Footer, falling back to static servicesData:", err);
        setServices(servicesData);
      });
  }, []);

  return (
    <Box component="footer" sx={{ width: '100%', background: 'linear-gradient(135deg, #10355f 0%, #0d264a 55%, #1a3f70 100%)', pt: { xs: 8, lg: 10 }, pb: { xs: 4, lg: 6 }, color: 'white' }}>
      <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 5, lg: 6 } }}>
        <Grid component="div" container spacing={{ xs: 4, sm: 6, lg: 8, xl: 10 }} sx={{ justifyContent: 'space-between' }}>

          {/* Col 1 - Logo */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, cursor: 'pointer' }} onClick={() => { navigate('/'); window.scrollTo(0, 0); }}>
              <Box component="img" src="/ALLFIXLOGO.png" alt="AllFix Logo" sx={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
              <Typography variant="h5" color="white" sx={{ fontWeight: '900', letterSpacing: '-0.02em', fontSize: '1.4rem' }}>
                All<span style={{ color: '#017550' }}>F</span><span style={{ color: '#fcbc26' }}>i</span><span style={{ color: '#d8242b' }}>x</span><span style={{ color: 'rgb(255,255,255)' }}>.ph</span>
              </Typography>
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6, mb: 4, maxWidth: '380px' }}>
              The Philippines' most trusted property care platform. Connecting homes and offices with verified professionals since 2021.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5, mb: 4, width: '100%', maxWidth: '400px' }}>
              {services.map(svc => {
                const iconContent = svgIconMapping[svc.id.toLowerCase()] || defaultSvgIcon;
                return (
                  <Box 
                    key={svc.id} 
                    onClick={() => { navigate(`/services/${svc.id}`); window.scrollTo(0, 0); }} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 1, 
                      border: '1px solid rgba(255,255,255,0.15)', 
                      borderRadius: '8px', 
                      px: 1, 
                      py: 0.8, 
                      cursor: 'pointer', 
                      transition: 'all 0.2s', 
                      backgroundColor: 'rgba(255,255,255,0.02)', 
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } 
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">{iconContent}</svg>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', textAlign: 'center' }}>{svc.brand}</Typography>
                  </Box>
                );
              })}
            </Box>
          </Grid>

          {/* Col 2 - COMPANY */}
          <Grid size={{ xs: 12, sm: 4, lg: 2 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.1em', mb: 3, color: 'white' }}>COMPANY</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography onClick={() => { navigate('/about'); window.scrollTo(0, 0); }} sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', cursor: 'pointer', '&:hover': { color: 'white' } }}>About AllFix</Typography>
              <Typography component="a" href="https://www.fpdasia.net/" target="_blank" rel="noopener noreferrer" sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', textDecoration: 'none', cursor: 'pointer', '&:hover': { color: 'white' } }}>FPD Asia</Typography>
            </Box>
          </Grid>

          {/* Col 3 - SUPPORT */}
          <Grid size={{ xs: 12, sm: 4, lg: 2 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.1em', mb: 3, color: 'white' }}>SUPPORT</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography onClick={() => { navigate('/register'); window.scrollTo(0, 0); }} sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', cursor: 'pointer', '&:hover': { color: 'white' } }}>Book a Service</Typography>
              <Typography onClick={() => { navigate('/vendor-apply'); window.scrollTo(0, 0); }} sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', cursor: 'pointer', '&:hover': { color: 'white' } }}>Become a Partner</Typography>
            </Box>
          </Grid>

          {/* Col 4 - LEGAL */}
          <Grid size={{ xs: 12, sm: 4, lg: 2 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.1em', mb: 3, color: 'white' }}>LEGAL</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography onClick={() => { navigate('/privacy'); window.scrollTo(0, 0); }} sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', cursor: 'pointer', '&:hover': { color: 'white' } }}>Privacy Policy</Typography>
              <Typography onClick={() => { navigate('/terms-of-use'); window.scrollTo(0, 0); }} sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', cursor: 'pointer', '&:hover': { color: 'white' } }}>Terms of Use</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ width: '100%', height: '1px', bgcolor: 'rgba(255,255,255,0.1)', my: 4 }} />

        {/* Contact row — stacks on xs–md, side-by-side at lg+ */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: { xs: 2.5, lg: 6 },
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: '100%',
        }}>

          {/* CALL US */}
          <Box sx={{
            width: { xs: '100%', lg: 'auto' },
            flex: { lg: '0 1 calc(33.333% - 16px)' },
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}>
            <Box sx={{ flexShrink: 0, mt: 0.5, color: 'white' }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', mb: 0.3, letterSpacing: '0.05em' }}>CALL US</Typography>
              <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1.05rem' }, fontWeight: 700, color: 'white' }}>
                +63 920 9631 217 | +63 975 8336 289
              </Typography>
            </Box>
          </Box>

          {/* Divider */}
          <Box sx={{ display: { xs: 'block', lg: 'none' }, width: '80%', height: '1px', bgcolor: 'rgba(255,255,255,0.15)' }} />

          {/* EMAIL US */}
          <Box sx={{
            width: { xs: '100%', lg: 'auto' },
            flex: { lg: '0 1 calc(33.333% - 16px)' },
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            transform: { lg: 'translateX(90px)' },
          }}>
            <Box sx={{ flexShrink: 0, mt: 0.5, color: 'white' }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', mb: 0.3, letterSpacing: '0.05em' }}>EMAIL US</Typography>
              <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1.05rem' }, fontWeight: 700, color: 'white' }}>
                inquiry@allfix.ph
              </Typography>
            </Box>
          </Box>

          {/* Divider */}
          <Box sx={{ display: { xs: 'block', lg: 'none' }, width: '80%', height: '1px', bgcolor: 'rgba(255,255,255,0.15)' }} />

          {/* HEAD OFFICE */}
          <Box sx={{
            width: { xs: '100%', lg: 'auto' },
            flex: { lg: '0 1 calc(33.333% - 16px)' },
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}>
            <Box sx={{ flexShrink: 0, mt: 0.5, color: 'white' }}>
              <LocationOnIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)', mb: 0.3, letterSpacing: '0.05em' }}>HEAD OFFICE</Typography>
              <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1.05rem' }, fontWeight: 700, color: 'white' }}>
                9824 Kamagong Street, Makati City 1203 Philippines
              </Typography>
            </Box>
          </Box>

        </Box>

        <Box sx={{ width: '100%', height: '1px', bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
          <Typography variant="caption" sx={{ fontSize: 'inherit' }}>© 2026 AllFix Philippines Inc. All rights reserved.</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton component="a" href="https://www.facebook.com/allfixph" target="_blank" rel="noopener noreferrer" size="small" sx={{ color: 'inherit', '&:hover': { color: 'white' } }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </IconButton>
            <IconButton component="a" href="https://www.instagram.com/allfixph" target="_blank" rel="noopener noreferrer" size="small" sx={{ color: 'inherit', '&:hover': { color: 'white' } }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </IconButton>
            <IconButton size="small" sx={{ color: 'inherit', '&:hover': { color: 'white' } }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
