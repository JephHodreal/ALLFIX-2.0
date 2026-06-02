import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  CssBaseline,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Skeleton,
} from '@mui/material';

// --- Reusable Navigation & Footer ---
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';

// --- Mui Icons ---
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

// --- Centralized Service Data Source ---
import { servicesData, WORK_TYPES_MAPPING, SubServiceData } from '../constants/servicesData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/apiService';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

const ServicesPages = () => {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { isAuthenticated, role } = useAuth();
  const { isDark } = useTheme();
  const [activeSubService, setActiveSubService] = useState<any | null>(null);
  const [editingSubService, setEditingSubService] = useState<any | null>(null);
  const [services, setServices] = useState<any[]>(servicesData);
  const [loading, setLoading] = useState(true);
  const [showWorkTypesEditor, setShowWorkTypesEditor] = useState(false);
  const [editorWorkTypes, setEditorWorkTypes] = useState<{ name: string; price: string }[]>([]);
  const [editorBasePrice, setEditorBasePrice] = useState('');
  const [editorSaving, setEditorSaving] = useState(false);
  const [editorError, setEditorError] = useState('');
  const [editorSuccess, setEditorSuccess] = useState('');
  const [editorMode, setEditorMode] = useState<'base_price' | 'work_types'>('work_types');

  useEffect(() => {
    setLoading(true);
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
            icon: frontendMatch?.icon || AutoAwesomeIcon,
            brand: bs.name,
            tagline: bs.tagline || frontendMatch?.tagline || 'Specialized Services',
            description: bs.description,
            image: bs.imageUrl || bs.image || frontendMatch?.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
            accent: frontendMatch?.accent || '#2E5BA8',
            accentDark: frontendMatch?.accentDark || '#10355f',
            headerBg: frontendMatch?.headerBg || '#10355f',
            headerBgLight: frontendMatch?.headerBgLight || '#2E5BA8',
            pillText: frontendMatch?.pillText || '#2E5BA8',
            services: bs.subServices ? bs.subServices.map((sub: any) => sub.name) : [],
            subServices: (bs.subServices || []).map((sub: any) => ({
              id: sub.id,
              name: sub.name,
              description: sub.description,
              image: sub.imageUrl || sub.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
              workTypes: sub.workTypes || [],
              prices: sub.prices || {},
              redirectUrl: sub.redirectUrl
            })),
          });
        });

        // Add remaining frontend services
        servicesData.forEach((fs) => {
          if (!merged.find(m => m.id.toLowerCase() === fs.id.toLowerCase())) {
            merged.push(fs);
          }
        });

        setServices(merged);
      })
      .catch(err => {
        console.error("Failed to load services", err);
        setServices(servicesData);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleOpenWorkTypesEditor = (subServiceArg?: any, mode: 'base_price' | 'work_types' = 'work_types') => {
    console.log(`[CAVEMAN] handleOpenWorkTypesEditor called with mode: ${mode}`);
    const targetSub = subServiceArg || activeSubService;
    if (!targetSub) return;
    
    setEditorMode(mode);
    setEditingSubService(targetSub);
    const initialList: { name: string; price: string }[] = [];
    if (targetSub.workTypes && targetSub.workTypes.length > 0) {
      targetSub.workTypes.forEach((wt: string) => {
        initialList.push({
          name: wt,
          price: targetSub.prices?.[wt] || ''
        });
      });
    }
    
    const basePriceVal = targetSub.prices?.['Base Price'] || '';
    setEditorBasePrice(String(basePriceVal));
    
    setEditorWorkTypes(initialList);
    setEditorError('');
    setEditorSuccess('');
    setShowWorkTypesEditor(true);
  };

  const handleSaveWorkTypes = async () => {
    const targetSub = editingSubService || activeSubService;
    if (!targetSub || !service) return;
    
    // Validate based on mode
    if (editorMode === 'work_types') {
      const invalid = editorWorkTypes.some(
        wt => !wt.name.trim() || !wt.price.trim() || isNaN(Number(wt.price)) || Number(wt.price) < 0
      );
      if (invalid) {
        setEditorError('Each work type requires a name and a valid positive price.');
        return;
      }
    } else {
      // base_price mode
      if (!editorBasePrice.trim() || isNaN(Number(editorBasePrice)) || Number(editorBasePrice) < 0) {
        setEditorError('Standard price must be a valid positive number.');
        return;
      }
    }

    setEditorSaving(true);
    setEditorError('');
    setEditorSuccess('');
    try {
      // Find the service document from the backend
      const allRes = await api.get('/api/services');
      let backendMatch = allRes.data.find(
        (s: any) => s.name.toLowerCase() === service.brand.toLowerCase()
      );
      
      if (!backendMatch) {
        // If parent service category doesn't exist, instantiate it on-demand!
        const parentServiceId = service.id || service.brand.toLowerCase().replace(/\s+/g, '');
        await api.put(`/api/services/${parentServiceId}`, {
          name: service.brand,
          description: service.description || 'Premium services',
          tagline: service.tagline || 'Specialized Services',
          imageUrl: service.image || '',
          subServices: []
        });
        
        // Refetch service list
        const freshRes = await api.get('/api/services');
        backendMatch = freshRes.data.find(
          (s: any) => s.name.toLowerCase() === service.brand.toLowerCase()
        );
      }

      if (!backendMatch) {
        setEditorError('Failed to initialize parent service category.');
        setEditorSaving(false);
        return;
      }

      // Find the subservice in backendMatch.subServices, or use the active ID
      const subserviceId = targetSub.id;
      const existingSub = (backendMatch.subServices || []).find(
        (sub: any) => sub.id === subserviceId || sub.name === targetSub.name
      );
      
      const subIdToUse = existingSub ? existingSub.id : subserviceId;

      // Format workTypes (string array) and prices (map) for the database
      const finalWorkTypes = editorWorkTypes.map(wt => wt.name.trim());
      const finalPrices: Record<string, string> = {};
      editorWorkTypes.forEach(wt => {
        finalPrices[wt.name.trim()] = wt.price.trim();
      });

      // [CAVEMAN] Save or preserve Base Price / Standard Price
      console.log("[CAVEMAN] Checking if Base Price exists or was edited...");
      if (editorBasePrice.trim()) {
        console.log("[CAVEMAN] Saving edited Base Price:", editorBasePrice.trim());
        finalPrices['Base Price'] = editorBasePrice.trim();
      } else if (existingSub && existingSub.prices && existingSub.prices['Base Price']) {
        console.log("[CAVEMAN] Preserving Base Price from existing subservice in DB:", existingSub.prices['Base Price']);
        finalPrices['Base Price'] = String(existingSub.prices['Base Price']);
      } else if (targetSub && targetSub.prices && targetSub.prices['Base Price']) {
        console.log("[CAVEMAN] Preserving Base Price from target subservice state:", targetSub.prices['Base Price']);
        finalPrices['Base Price'] = String(targetSub.prices['Base Price']);
      } else {
        console.log("[CAVEMAN] No Base Price found to preserve/save");
      }

      // Update backend using PUT endpoint (will append if not found!)
      await api.put(`/api/services/${backendMatch.id}/subservices/${subIdToUse}`, {
        id: subIdToUse,
        name: targetSub.name,
        description: targetSub.description || '',
        imageUrl: targetSub.imageUrl || targetSub.image || '',
        workTypes: finalWorkTypes,
        prices: finalPrices
      });

      // Refetch latest data from database automatically!
      const freshServicesRes = await api.get('/api/services');
      const freshBackendService = freshServicesRes.data.find(
        (s: any) => s.name.toLowerCase() === service.brand.toLowerCase()
      );
      
      if (freshBackendService) {
        const freshSub = (freshBackendService.subServices || []).find(
          (sub: any) => sub.id === subIdToUse || sub.name === targetSub.name
        );
        if (freshSub) {
          // Map to details structure
          const updatedSub = {
            id: freshSub.id,
            name: freshSub.name,
            description: freshSub.description,
            image: freshSub.imageUrl || freshSub.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
            workTypes: freshSub.workTypes || [],
            prices: freshSub.prices || {},
          };

          // Update local state list so it updates on-screen instantly
          setServices(prev => prev.map(s => {
            if (s.id === service.id) {
              return {
                ...s,
                subServices: s.subServices.map((sub: any) => 
                  (sub.id === subIdToUse || sub.name === targetSub.name) ? updatedSub : sub
                )
              };
            }
            return s;
          }));

          // Close the form and reset editing state
          setShowWorkTypesEditor(false);
          setEditingSubService(null);
        }
      }
    } catch (err: any) {
      console.error(err);
      setEditorError(err?.response?.data?.message || 'Failed to save work types.');
    } finally {
      setEditorSaving(false);
    }
  };

  const handleDeleteWorkType = async (wtName: string) => {
    if (!activeSubService || !service) return;
    const confirmDelete = window.confirm("Are you sure you want to remove this work type?");
    if (!confirmDelete) return;

    try {
      // Find the service document from the backend
      const allRes = await api.get('/api/services');
      let backendMatch = allRes.data.find(
        (s: any) => s.name.toLowerCase() === service.brand.toLowerCase()
      );
      
      if (!backendMatch) return;

      const subserviceId = activeSubService.id;
      const existingSub = (backendMatch.subServices || []).find(
        (sub: any) => sub.id === subserviceId || sub.name === activeSubService.name
      );
      
      if (!existingSub) return;

      const subIdToUse = existingSub.id;

      // Filter out the deleted work type
      const finalWorkTypes = (existingSub.workTypes || []).filter((wt: string) => wt !== wtName);
      const finalPrices: Record<string, string> = {};
      if (existingSub.prices) {
        Object.keys(existingSub.prices).forEach(key => {
          if (key !== wtName) {
            finalPrices[key] = existingSub.prices[key];
          }
        });
      }

      // Update backend using PUT endpoint
      await api.put(`/api/services/${backendMatch.id}/subservices/${subIdToUse}`, {
        id: subIdToUse,
        name: existingSub.name,
        description: existingSub.description || '',
        imageUrl: existingSub.imageUrl || existingSub.image || '',
        workTypes: finalWorkTypes,
        prices: finalPrices
      });

      // Refetch latest data from database automatically!
      const freshServicesRes = await api.get('/api/services');
      const freshBackendService = freshServicesRes.data.find(
        (s: any) => s.name.toLowerCase() === service.brand.toLowerCase()
      );
      
      if (freshBackendService) {
        const freshSub = (freshBackendService.subServices || []).find(
          (sub: any) => sub.id === subIdToUse || sub.name === activeSubService.name
        );
        if (freshSub) {
          const updatedSub = {
            id: freshSub.id,
            name: freshSub.name,
            description: freshSub.description,
            image: freshSub.imageUrl || freshSub.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
            workTypes: freshSub.workTypes || [],
            prices: freshSub.prices || {},
          };

          // Update local state list so it updates on-screen instantly
          setServices(prev => prev.map(s => {
            if (s.id === service.id) {
              return {
                ...s,
                subServices: s.subServices.map((sub: any) => 
                  (sub.id === subIdToUse || sub.name === activeSubService.name) ? updatedSub : sub
                )
              };
            }
            return s;
          }));

          // Also update activeSubService so UI updates immediately
          setActiveSubService(updatedSub);
        }
      }
    } catch (err) {
      console.error("[CAVEMAN] Error deleting work type", err);
      alert("Failed to delete work type.");
    }
  };

  const renderBrandName = (brand: string) => {
    if (brand.endsWith('Fix')) {
      const prefix = brand.substring(0, brand.length - 3);
      return (
        <>
          {prefix}
          <span style={{ color: '#22c55e' }}>F</span>
          <span style={{ color: '#eab308' }}>i</span>
          <span style={{ color: '#ef4444' }}>x</span>
        </>
      );
    }
    return brand;
  };

  // Find dynamic service by parameter id
  const service = services.find(
    (svc) => svc.id.toLowerCase() === serviceId?.toLowerCase()
  );

  // If serviceId is specified in URL but service data has not loaded yet,
  // render a premium skeleton page loader instead of flashing the catalog overview.
  if (serviceId && !service && loading) {
    return (
      <>
        <CssBaseline />
        <Navbar />
        <Box sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc', minHeight: '100vh', width: '100%' }}>
          
          {/* HERO BANNER SKELETON */}
          <Box sx={{
            position: 'relative',
            pt: { xs: 10, sm: 12, md: 14 },
            pb: { xs: 4, sm: 5, md: 6 },
            px: 3,
            background: 'linear-gradient(135deg, #10355f 0%, #0d264a 55%, #1a3f70 100%)',
            color: 'white',
            textAlign: 'center',
          }}>
            <Container maxWidth="lg">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={64} height={64} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                <Skeleton variant="text" width={240} height={60} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
                <Skeleton variant="text" width={180} height={24} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
              </Box>
            </Container>
          </Box>

          {/* TAB BAR SKELETON */}
          <Box sx={{ bgcolor: isDark ? '#0f172a' : '#ffffff', borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.08)', py: 2 }}>
            <Container maxWidth="xl">
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} variant="rectangular" width={100} height={36} sx={{ borderRadius: '30px', bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(16, 53, 95, 0.04)' }} />
                ))}
              </Box>
            </Container>
          </Box>

          {/* SUB-SERVICES GRID SKELETON */}
          <Container maxWidth="xl" sx={{ py: { xs: 8, md: 10 }, px: { xs: 2.5, sm: 4, lg: 6 } }}>
            <Box sx={{ mb: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="text" width={320} height={40} sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : undefined }} />
              <Skeleton variant="text" width={480} height={20} sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : undefined }} />
            </Box>

            <Grid component="div" container spacing={4} sx={{ justifyContent: 'center' }}>
              {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={i} sx={{ display: 'flex' }}>
                  <Box sx={{ width: '100%', bgcolor: isDark ? '#1e293b' : 'white', borderRadius: '20px', overflow: 'hidden', border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.06)', p: 0 }}>
                    <Skeleton variant="rectangular" width="100%" height={200} sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : undefined }} />
                    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Skeleton variant="text" width="60%" height={28} sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : undefined }} />
                      <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : undefined }} />
                      <Skeleton variant="rectangular" width={28} height={4} sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : undefined }} />
                      <Skeleton variant="text" width="90%" height={16} sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : undefined }} />
                      <Skeleton variant="text" width="80%" height={16} sx={{ bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : undefined }} />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Container>

          <Footer />
        </Box>
      </>
    );
  }

  // Unified Tab Bar Component
  const renderTabs = (activeService: any | null) => {
    return (
      <Box sx={{
        bgcolor: isDark ? '#0f172a' : '#ffffff',
        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.08)',
        position: 'sticky',
        top: { xs: '56px', sm: '64px' }, // Sticky below Navbar
        zIndex: 90,
        py: 2,
        boxShadow: isDark ? '0 4px 12px rgba(0, 0, 0, 0.2)' : '0 4px 12px rgba(16, 53, 95, 0.03)',
        backdropFilter: 'blur(8px)',
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      }}>
        <Container maxWidth="xl">
          <Box sx={{
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            pb: 0.5,
            justifyContent: { xs: 'flex-start', md: 'center' },
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}>
            {/* Brand Tabs */}
            {services.map((svc) => {
              const isCurrent = activeService?.id?.toLowerCase() === svc.id?.toLowerCase();
              const BrandIcon = svc.icon;

              return (
                <Button
                  key={svc.id}
                  startIcon={<BrandIcon sx={{ fontSize: '1.1rem' }} />}
                  onClick={() => { navigate(`/services/${svc.id}`); }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: '30px',
                    px: 3,
                    py: 1,
                    flexShrink: 0,
                    fontSize: '0.85rem',
                    bgcolor: isCurrent ? svc.accent : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(16, 53, 95, 0.04)'),
                    color: isCurrent ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                    border: isCurrent ? `1px solid ${svc.accent}` : (isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.08)'),
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      bgcolor: isCurrent ? svc.accentDark : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(16, 53, 95, 0.08)'),
                      borderColor: isCurrent ? svc.accentDark : (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(16, 53, 95, 0.2)'),
                    }
                  }}
                >
                  {svc.brand}
                </Button>
              );
            })}
          </Box>
        </Container>
      </Box>
    );
  };

  // DEDICATED SERVICE BRAND PAGE (Brand detail view with subservices)
  if (service) {
    const BrandIcon = service.icon;

    return (
      <>
        <CssBaseline />
        <Navbar />

        <Box sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc', minHeight: '100vh', width: '100%', transition: 'background-color 0.3s ease' }}>
          
          {/* HERO BANNER SECTION */}
          <Box sx={{
            position: 'relative',
            pt: { xs: 10, sm: 12, md: 14 },
            pb: { xs: 4, sm: 5, md: 6 },
            px: 3,
            background: `linear-gradient(135deg, ${service.accentDark} 0%, #0d264a 55%, ${service.accent} 100%)`,
            color: 'white',
            overflow: 'hidden',
            textAlign: 'center',
          }}>
            {/* Subtle premium design pattern */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                opacity: 0.03,
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
                backgroundRepeat: 'repeat',
                pointerEvents: 'none',
              }}
            />
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>

              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' }, 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 2, 
                mb: 1.5 
              }}>
                <Box sx={{ 
                  display: 'inline-flex', 
                  p: 1.5, 
                  bgcolor: 'rgba(255, 255, 255, 0.1)', 
                  borderRadius: '50%', 
                  color: 'white', 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                  <BrandIcon sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }} />
                </Box>

                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontWeight: '900',
                    fontSize: { xs: '2rem', sm: '2.8rem', md: '3.5rem' }, 
                    lineHeight: 1.1, 
                    letterSpacing: '-0.02em',
                    textShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  }}
                >
                  {renderBrandName(service.brand)}
                </Typography>
              </Box>
              
              <Typography 
                sx={{ 
                  fontSize: { xs: '0.95rem', md: '1.1rem' }, 
                  fontWeight: 800,
                  color: '#4ade80',
                  mb: 1,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                {service.tagline}
              </Typography>

            </Container>
          </Box>

          {/* PERSISTENT TAB BAR */}
          {renderTabs(service)}

          {/* SUB-SERVICES GRID CONTAINER */}
          <Container id="subservices-grid" maxWidth="xl" sx={{ py: { xs: 8, md: 10 }, px: { xs: 2.5, sm: 4, lg: 6 }, scrollMarginTop: { xs: '120px', sm: '140px' } }}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography variant="h2" color={isDark ? '#ffffff' : '#10355f'} sx={{ fontWeight: '800', fontSize: { xs: '1.8rem', md: '2.6rem' }, mb: 2, letterSpacing: '-0.01em' }}>
                Specialized {renderBrandName(service.brand)} Solutions
              </Typography>
              <Typography sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '1.08rem', maxWidth: '620px', mx: 'auto', lineHeight: 1.6 }}>
                {service.description || 'Explore customized, premium services tailored for your property. Rest easy knowing each job is handled by background-checked pros.'}
              </Typography>
            </Box>

            <Grid component="div" container spacing={4} sx={{ justifyContent: 'center' }}>
              {service.subServices.map((sub: any, idx: number) => {
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={idx} sx={{ display: 'flex' }}>
                    <Card 
                      onClick={() => {
                        // Check for external redirect URL (e.g., Parking → leeveit.com)
                        const subData = sub as SubServiceData;
                        if (subData.redirectUrl) {
                          window.open(subData.redirectUrl, '_blank', 'noopener,noreferrer');
                          return;
                        }
                        if (role === 'admin') {
                          setActiveSubService(sub);
                        } else {
                          if (isAuthenticated) {
                            navigate(`/customer/book?subservice=${encodeURIComponent(sub.name)}`);
                          } else {
                            navigate(`/login?redirect=${encodeURIComponent('/customer/book?subservice=' + sub.name)}`);
                          }
                          window.scrollTo(0, 0);
                        }
                      }}
                      sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '20px',
                        boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(16, 53, 95, 0.04)',
                        bgcolor: isDark ? '#1e293b' : '#ffffff',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.06)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: isDark ? '0 12px 32px rgba(0, 0, 0, 0.4)' : '0 12px 32px rgba(16, 53, 95, 0.12)',
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(16, 53, 95, 0.12)',
                          '& .sub-media': {
                            transform: 'scale(1.05)'
                          },
                          '& .book-now-overlay': {
                            opacity: 1,
                            transform: 'scale(1)'
                          }
                        }
                      }}
                    >
                      {/* Subservice Image */}
                      <Box sx={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                        <CardMedia
                          className="sub-media"
                          component="img"
                          image={sub.image}
                          alt={sub.name}
                          sx={{
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.5s ease'
                          }}
                        />
                        {/* Book Now / Work Types overlay on hover */}
                        <Box
                          className="book-now-overlay"
                          sx={{
                            position: 'absolute',
                            inset: 0,
                            bgcolor: service.accent ? `${service.accent}cc` : 'rgba(16, 53, 95, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transform: 'scale(0.95)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            zIndex: 2
                          }}
                        >
                          <Typography
                            sx={{
                              color: '#ffffff',
                              fontWeight: 900,
                              fontSize: '1.1rem',
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              border: '2px solid #ffffff',
                              px: 3,
                              py: 1,
                              borderRadius: '30px',
                              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                              backgroundColor: 'rgba(255, 255, 255, 0.15)',
                              backdropFilter: 'blur(4px)'
                            }}
                          >
                            {role === 'admin' ? 'Work Types' : 'Book Now'}
                          </Typography>
                        </Box>
                      </Box>

                      <CardContent sx={{ p: '28px 32px 36px 32px', flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        {/* Name (Title) */}
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: isDark ? '#ffffff' : '#002855', 
                            fontWeight: '800', 
                            fontSize: '20px', 
                            lineHeight: 1.2, 
                            mb: '4px' 
                          }}
                        >
                          {sub.name}
                        </Typography>

                        {/* Category (Subtitle) */}
                        <Typography 
                          sx={{ 
                            color: isDark ? service.accent : '#0f3661', 
                            fontWeight: '700', 
                            fontSize: '14px', 
                            mb: '12px',
                            textTransform: 'uppercase'
                          }}
                        >
                          {service.brand}
                        </Typography>

                        {/* Horizontal Accent Line (Divider) */}
                        <Box 
                          sx={{ 
                            width: '28px', 
                            height: '3.5px', 
                            bgcolor: isDark ? service.accent : '#002855', 
                            mb: '18px',
                            borderRadius: '2px'
                          }} 
                        />

                        {/* Description */}
                        <Typography 
                          sx={{ 
                            color: isDark ? '#94a3b8' : '#5c6f84', 
                            fontSize: '14px', 
                            fontWeight: '400',
                            lineHeight: 1.6, 
                            flex: 1 
                          }}
                        >
                          {sub.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Container>

          {/* SERVICE GUARANTEE SECTION */}
          <Box sx={{ bgcolor: isDark ? '#1e293b' : 'white', py: { xs: 8, md: 10 }, borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.05)' }}>
            <Container maxWidth="md" sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'inline-flex', p: 1.5, bgcolor: isDark ? 'rgba(46, 91, 168, 0.15)' : '#f0f7ff', borderRadius: '50%', mb: 2, color: isDark ? '#38bdf8' : '#2E5BA8' }}>
                <CheckCircleIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h3" color={isDark ? '#ffffff' : '#10355f'} sx={{ fontWeight: '800', fontSize: { xs: '1.8rem', md: '2.2rem' }, mb: 2 }}>
                The AllFix Service Guarantee
              </Typography>
              <Typography sx={{ color: isDark ? '#94a3b8' : '#555', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '650px', mx: 'auto', mb: 4 }}>
                All our service brands are backed by certified experts, transparent upfront pricing, and a full satisfaction warranty. If you are not happy with our work, we will make it right, guaranteed.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => { navigate('/about'); window.scrollTo(0, 0); }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '8px',
                  px: 4,
                  py: 1.2,
                  color: isDark ? '#38bdf8' : '#10355f',
                  borderColor: isDark ? '#38bdf8' : '#10355f',
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(16, 53, 95, 0.04)',
                    borderColor: isDark ? '#0ea5e9' : '#0d264a',
                  }
                }}
              >
                Learn More About Our Values
              </Button>
            </Container>
          </Box>

          <Footer />
        </Box>

        {/* Work Types Modal Dialog for Admin */}
        <Dialog
          open={Boolean(activeSubService)}
          onClose={() => setActiveSubService(null)}
          maxWidth="xs"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                background: isDark ? '#1e293b' : '#ffffff',
              }
            }
          }}
        >
          <DialogTitle sx={{ p: 0, mb: 2, position: 'relative' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#10355f', pr: 4 }}>
              {activeSubService?.name}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: isDark ? '#94a3b8' : '#64748b', mt: 0.5 }}>
              Available Work Types
            </Typography>
            <IconButton
              onClick={() => setActiveSubService(null)}
              sx={{
                position: 'absolute',
                right: -8,
                top: -8,
                color: '#94a3b8',
                '&:hover': { color: '#64748b' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0, mt: 1 }}>
            {activeSubService && (() => {
              const wtList = activeSubService.workTypes && activeSubService.workTypes.length > 0
                ? activeSubService.workTypes
                : (WORK_TYPES_MAPPING[activeSubService.name] || []);
              
              const pricesMap = activeSubService.prices || {};
              const pricesCount = Object.keys(pricesMap).length;
              const hasBasePrice = pricesMap['Base Price'] !== undefined || pricesMap[activeSubService.name] !== undefined;

              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {/* Standard Price - Displayed only if present in database prices map */}
                  {hasBasePrice && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 2,
                        p: 2,
                        borderRadius: '16px',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.08)',
                        background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(16, 53, 95, 0.02)'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CheckCircleIcon sx={{ color: service?.accent || '#2E5BA8', fontSize: '1.25rem', flexShrink: 0 }} />
                        <Typography sx={{ color: isDark ? '#ffffff' : '#0f3661', fontWeight: 600, fontSize: '0.9rem' }}>
                          Standard Price
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
                        <Typography sx={{ color: service?.accent || '#2E5BA8', fontWeight: 700, fontSize: '0.9rem' }}>
                          ₱{pricesMap['Base Price'] !== undefined ? pricesMap['Base Price'] : (pricesMap[activeSubService.name] || '0')}
                        </Typography>
                        {role === 'admin' && (
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => {
                                const subToEdit = activeSubService;
                                setActiveSubService(null);
                                handleOpenWorkTypesEditor(subToEdit, 'base_price');
                              }}
                              sx={{
                                color: service?.accent || '#2E5BA8',
                                bgcolor: 'rgba(46, 91, 168, 0.05)',
                                '&:hover': { bgcolor: 'rgba(46, 91, 168, 0.1)' }
                              }}
                              title="Edit Standard Price"
                            >
                              <EditIcon sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                            {pricesCount >= 2 && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const standardPriceKey = pricesMap['Base Price'] !== undefined ? 'Base Price' : activeSubService.name;
                                  handleDeleteWorkType(standardPriceKey);
                                }}
                                sx={{
                                  color: '#ef4444',
                                  bgcolor: 'rgba(239, 68, 68, 0.05)',
                                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                                }}
                                title="Delete Standard Price"
                              >
                                <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                              </IconButton>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Work Types Section */}
                  {wtList.length === 0 ? (
                    <Box sx={{ py: 3, textAlign: 'center' }}>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                        No work types specified yet.
                      </Typography>
                    </Box>
                  ) : (
                    wtList.map((wt: string) => (
                      <Box
                        key={wt}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 2,
                          p: 2,
                          borderRadius: '16px',
                          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.08)',
                          background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(16, 53, 95, 0.02)',
                          transition: 'all 0.2s',
                          '&:hover': {
                            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(16, 53, 95, 0.04)',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(16, 53, 95, 0.15)',
                            transform: 'translateX(4px)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CheckCircleIcon sx={{ color: service?.accent || '#2E5BA8', fontSize: '1.25rem', flexShrink: 0 }} />
                          <Typography sx={{ color: isDark ? '#ffffff' : '#0f3661', fontWeight: 600, fontSize: '0.9rem' }}>
                            {wt}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
                          {pricesMap[wt] && (
                            <Typography sx={{ color: service?.accent || '#2E5BA8', fontWeight: 700, fontSize: '0.9rem' }}>
                              ₱{pricesMap[wt]}
                            </Typography>
                          )}
                          {role === 'admin' && (
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const subToEdit = activeSubService;
                                  setActiveSubService(null);
                                  handleOpenWorkTypesEditor(subToEdit, 'work_types');
                                }}
                                sx={{
                                  color: service?.accent || '#2E5BA8',
                                  bgcolor: 'rgba(46, 91, 168, 0.05)',
                                  '&:hover': { bgcolor: 'rgba(46, 91, 168, 0.1)' }
                                }}
                                title="Edit Work Types"
                              >
                                <EditIcon sx={{ fontSize: '1.1rem' }} />
                              </IconButton>
                              {pricesCount >= 2 && (
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteWorkType(wt)}
                                  sx={{
                                    color: '#ef4444',
                                    bgcolor: 'rgba(239, 68, 68, 0.05)',
                                    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' }
                                  }}
                                  title="Delete Work Type"
                                >
                                  <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                                </IconButton>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              );
            })()}
          </DialogContent>
          <DialogActions sx={{ p: 0, mt: 3 }}>
            <Button
              onClick={() => {
                const subToEdit = activeSubService;
                setActiveSubService(null);
                handleOpenWorkTypesEditor(subToEdit, 'work_types');
              }}
              variant="contained"
              sx={{
                width: '100%',
                bgcolor: service?.accent || '#2E5BA8',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '12px',
                textTransform: 'none',
                py: 1.2,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: service?.accentDark || '#10355f',
                  boxShadow: 'none'
                }
              }}
            >
              Add Work Type
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dedicated Work Types Editor Dialog for Admins */}
        <Dialog
          open={showWorkTypesEditor}
          onClose={() => { setShowWorkTypesEditor(false); setEditingSubService(null); }}
          maxWidth="sm"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: '24px',
                p: 3,
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                background: '#ffffff',
              }
            }
          }}
        >
          <DialogTitle sx={{ p: 0, mb: 1, position: 'relative' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#10355f' }}>
              {editorMode === 'base_price' ? 'Edit Standard Price' : 'Edit Work Types & Prices'}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#64748b', mt: 0.5 }}>
              {editorMode === 'base_price' 
                ? `Configure standard price for ${editingSubService?.name || activeSubService?.name}`
                : `Configure work types for ${editingSubService?.name || activeSubService?.name}`
              }
            </Typography>
            <IconButton
              onClick={() => { setShowWorkTypesEditor(false); setEditingSubService(null); }}
              sx={{
                position: 'absolute',
                right: -8,
                top: -8,
                color: '#94a3b8',
                '&:hover': { color: '#64748b' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0, mt: 2 }}>
            {editorError && (
              <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.85rem' }}>
                {editorError}
              </Box>
            )}

            {editorSuccess && (
              <Box sx={{ mb: 2, p: 1.5, borderRadius: '12px', bgcolor: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.15)', color: '#22c55e', fontSize: '0.85rem' }}>
                {editorSuccess}
              </Box>
            )}

            {editorMode === 'base_price' && (
              <Box
                sx={{
                  mb: 2.5,
                  p: 2,
                  borderRadius: '16px',
                  background: 'rgba(16, 53, 95, 0.02)',
                  border: '1px solid rgba(16, 53, 95, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5
                }}
              >
                <Typography sx={{ color: '#0f3661', fontWeight: 700, fontSize: '0.85rem' }}>
                  Standard Price (₱)
                </Typography>
                <Box sx={{ position: 'relative', width: '120px' }}>
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>₱</span>
                  <input
                    type="text"
                    value={editorBasePrice}
                    onChange={e => setEditorBasePrice(e.target.value)}
                    placeholder="Enter price"
                    className="w-full pl-6 pr-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-brand-navy/20"
                    style={{
                      height: '38px',
                      background: '#ffffff'
                    }}
                  />
                </Box>
              </Box>
            )}

            {editorMode === 'work_types' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                {editorWorkTypes.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center', border: '1px dashed #e2e8f0', borderRadius: '16px' }}>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                      No work types configured yet.
                    </Typography>
                  </Box>
                ) : (
                  editorWorkTypes.map((wt, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1.5,
                        alignItems: { xs: 'stretch', sm: 'center' },
                        p: 2,
                        borderRadius: '16px',
                        background: 'rgba(16, 53, 95, 0.01)',
                        border: '1px solid rgba(16, 53, 95, 0.04)',
                      }}
                    >
                      {/* Work Type Name Textarea for Wrapping Text */}
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <textarea
                          value={wt.name}
                          onChange={e => {
                            const updated = [...editorWorkTypes];
                            updated[index] = { ...updated[index], name: e.target.value };
                            setEditorWorkTypes(updated);
                          }}
                          rows={1}
                          placeholder="Work Type Name (e.g. Split Type)"
                          className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-brand-navy/20 resize-none overflow-hidden"
                          style={{
                            fontFamily: 'inherit',
                            background: '#ffffff',
                            minHeight: '38px',
                            display: 'block'
                          }}
                          onInput={e => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                          }}
                        />
                      </Box>

                      {/* Price Input without Trash Button */}
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
                        <Box sx={{ position: 'relative', flexGrow: 1, width: { sm: '120px' } }}>
                          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8' }}>₱</span>
                          <input
                            type="text"
                            value={wt.price}
                            onChange={e => {
                              const updated = [...editorWorkTypes];
                              updated[index] = { ...updated[index], price: e.target.value };
                              setEditorWorkTypes(updated);
                            }}
                            placeholder="Enter price"
                            className="w-full pl-6 pr-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-brand-navy/20"
                            style={{
                              height: '38px',
                              background: '#ffffff'
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  ))
                )}

                <Button
                  variant="outlined"
                  onClick={() => setEditorWorkTypes([...editorWorkTypes, { name: '', price: '' }])}
                  startIcon={<AddIcon />}
                  sx={{
                    mt: 1,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: service?.accent || '#2E5BA8',
                    color: service?.accent || '#2E5BA8',
                    '&:hover': {
                      borderColor: service?.accentDark || '#10355f',
                      bgcolor: 'rgba(46, 91, 168, 0.02)'
                    }
                  }}
                >
                  Add Row
                </Button>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 0, mt: 3, gap: 1.5 }}>
            <Button
              onClick={() => { setShowWorkTypesEditor(false); setEditingSubService(null); }}
              variant="outlined"
              sx={{
                flex: 1,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                borderColor: '#cbd5e1',
                color: '#64748b',
                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveWorkTypes}
              disabled={editorSaving}
              variant="contained"
              sx={{
                flex: 1,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: service?.accent || '#2E5BA8',
                color: '#ffffff',
                '&:hover': { bgcolor: service?.accentDark || '#10355f' }
              }}
            >
              {editorSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // ALL SERVICES INDEX OVERVIEW (Displays ONLY Brand Name, Image, Description)
  return (
    <>
      <CssBaseline />
      <Navbar />

      <Box sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc', minHeight: '100vh', width: '100%', transition: 'background-color 0.3s ease' }}>
        
        {/* INDEX HERO SECTION */}
        <Box sx={{
          position: 'relative',
          pt: { xs: 10, sm: 12, md: 14 },
          pb: { xs: 4, sm: 5, md: 6 },
          px: 3,
          background: 'linear-gradient(135deg, #10355f 0%, #0d264a 55%, #1a3f70 100%)',
          color: 'white',
          overflow: 'hidden',
          textAlign: 'center',
        }}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.03,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              backgroundRepeat: 'repeat',
              pointerEvents: 'none',
            }}
          />
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10 }}>
            <Typography 
              variant="h1" 
              sx={{ 
                fontWeight: '900',
                fontSize: { xs: '2rem', sm: '2.8rem', md: '3.5rem' }, 
                lineHeight: 1.1, 
                mb: 1.5, 
                letterSpacing: '-0.02em',
                textShadow: '0 4px 12px rgba(0,0,0,0.25)',
              }}
            >
              Specialized Property Care
            </Typography>
            <Typography 
              sx={{ 
                fontSize: { xs: '0.9rem', md: '1.1rem' }, 
                lineHeight: 1.6, 
                maxWidth: '750px', 
                mx: 'auto', 
                color: 'rgba(255,255,255,0.9)',
                mb: 1,
              }}
            >
              From custom cooling and deep sanitation to sustainable waste solutions and elite tech support. Discover AllFix's specialized brands, powered by verified professionals.
            </Typography>
          </Container>
        </Box>

        {/* PERSISTENT TAB BAR */}
        {renderTabs(null)}

        {/* BRANDS CATALOG GRID */}
        <Container maxWidth="xl" sx={{ py: { xs: 8, md: 10 }, px: { xs: 2.5, sm: 4, lg: 6 } }}>
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h2" color={isDark ? '#ffffff' : '#10355f'} sx={{ fontWeight: '800', fontSize: { xs: '1.8rem', md: '2.5rem' }, mb: 2 }}>
              Explore Our Specialized Brands
            </Typography>
            <Typography sx={{ color: isDark ? '#94a3b8' : '#666', fontSize: '1.05rem', maxWidth: '600px', mx: 'auto' }}>
              Select a brand to view custom care services and secure immediate expert bookings.
            </Typography>
          </Box>

          <Grid component="div" container spacing={4} sx={{ justifyContent: 'center' }}>
            {services.map((svc) => {
              const Icon = svc.icon;

              return (
                <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }} key={svc.brand} sx={{ display: 'flex' }}>
                  <Card 
                    onClick={() => { navigate(`/services/${svc.id}`); window.scrollTo(0, 0); }}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '16px',
                      boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(16, 53, 95, 0.08)',
                      bgcolor: isDark ? '#1e293b' : '#ffffff',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.05)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: isDark ? '0 12px 32px rgba(0, 0, 0, 0.4)' : '0 12px 32px rgba(16, 53, 95, 0.15)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(16, 53, 95, 0.15)',
                        '& .brand-media': {
                          transform: 'scale(1.05)',
                        }
                      }
                    }}
                  >
                    {/* Header Image */}
                    <Box sx={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                      <CardMedia
                        className="brand-media"
                        component="img"
                        image={svc.image}
                        alt={svc.brand}
                        sx={{ 
                          height: '100%', 
                          width: '100%', 
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                      />
                      {/* Brand label overlay */}
                      <Box sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: isDark ? '#1e293b' : 'white',
                        borderRadius: '24px',
                        px: 2,
                        py: 0.8,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : 'none'
                      }}>
                        <Icon sx={{ color: svc.accent, fontSize: '1.2rem' }} />
                        <Typography sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#10355f', fontSize: '0.85rem' }}>
                          {renderBrandName(svc.brand)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Content - ONLY name and description */}
                    <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {/* Service Name */}
                      <Typography variant="h5" color={isDark ? '#ffffff' : '#10355f'} sx={{ fontWeight: '800', mb: 1.5, fontSize: '1.3rem' }}>
                        {renderBrandName(svc.brand)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>

        {/* SATISFACTION ASSURANCE */}
        <Box sx={{ bgcolor: isDark ? '#1e293b' : 'white', py: { xs: 8, md: 10 }, borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.05)' }}>
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'inline-flex', p: 1.5, bgcolor: isDark ? 'rgba(46, 91, 168, 0.15)' : '#f0f7ff', borderRadius: '50%', mb: 2, color: isDark ? '#38bdf8' : '#2E5BA8' }}>
              <CheckCircleIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h3" color={isDark ? '#ffffff' : '#10355f'} sx={{ fontWeight: '800', fontSize: { xs: '1.8rem', md: '2.2rem' }, mb: 2 }}>
              The AllFix Service Guarantee
            </Typography>
            <Typography sx={{ color: isDark ? '#94a3b8' : '#555', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '650px', mx: 'auto', mb: 4 }}>
              All our service brands are backed by certified experts, transparent upfront pricing, and a full satisfaction warranty. If you are not happy with our work, we will make it right, guaranteed.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => { navigate('/about'); window.scrollTo(0, 0); }}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                px: 4,
                py: 1.2,
                color: isDark ? '#38bdf8' : '#10355f',
                borderColor: isDark ? '#38bdf8' : '#10355f',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(16, 53, 95, 0.04)',
                  borderColor: isDark ? '#0ea5e9' : '#0d264a',
                }
              }}
            >
              Learn More About Our Values
            </Button>
          </Container>
        </Box>

        <Footer />

      </Box>
    </>
  );
};

export default ServicesPages;
