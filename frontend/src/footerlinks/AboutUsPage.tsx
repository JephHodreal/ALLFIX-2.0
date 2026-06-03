import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CssBaseline,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupsIcon from '@mui/icons-material/Groups';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { useTheme } from '../context/ThemeContext';

const coreValues = [
  {
    icon: (color: string) => <StarIcon sx={{ fontSize: 32, color }} />,
    title: 'Excellence',
    description: 'We deliver exceptional quality in every service, ensuring customer satisfaction with certified professionals and verified expertise.',
    borderColor: '#3b82f6',
  },
  {
    icon: (color: string) => <GroupsIcon sx={{ fontSize: 32, color }} />,
    title: 'Integrity',
    description: 'We operate with transparency and honesty, building trust through reliable service delivery and genuine customer relationships.',
    borderColor: '#10b981',
  },
  {
    icon: (color: string) => <LightbulbIcon sx={{ fontSize: 32, color }} />,
    title: 'Innovation',
    description: 'We embrace technology and modern solutions to make property care accessible, efficient, and hassle-free for every Filipino.',
    borderColor: '#f59e0b',
  },
  {
    icon: (color: string) => <AssignmentIcon sx={{ fontSize: 32, color }} />,
    title: 'Accountability',
    description: 'We stand behind our work with service guarantees and are committed to making things right every single time.',
    borderColor: '#ef4444',
  },
];

const AboutUsPage = () => {
  const { isDark } = useTheme();

  useEffect(() => {
    console.log("[CAVEMAN] AboutUsPage mounted. Loading company overview.");
  }, []);

  // Helper to render branded "AllFix" with custom letters
  const renderBrandedName = (textBefore = 'About All', textAfter = '.ph') => {
    return (
      <>
        {textBefore}
        <span style={{ color: '#017550' }}>F</span>
        <span style={{ color: '#fcbc26' }}>i</span>
        <span style={{ color: '#d8242b' }}>x</span>
        {textAfter}
      </>
    );
  };

  return (
    <>
      <CssBaseline />

      {/* Seamless Navbar */}
      <Navbar />

      <Box sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc', minHeight: '100vh', width: '100%', pb: { xs: 4, md: 8 } }}>
        
        {/* Premium Hero Section */}
        <Box sx={{ 
          position: 'relative',
          minHeight: '45vh',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          pt: { xs: 12, md: 10 }, 
          pb: { xs: 6, md: 8 }, 
          px: 3, 
          background: 'linear-gradient(135deg, #10355f 0%, #0d264a 55%, #1a3f70 100%)',
          color: 'white',
          overflow: 'hidden'
        }}>
          {/* Background Design Pattern */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.04,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              backgroundRepeat: 'repeat',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Gradient Blobs */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              left: -50,
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(96, 165, 250, 0.25) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(80px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -50,
              right: -50,
              width: 300,
              height: 300,
              background: 'radial-gradient(circle, rgba(1, 117, 80, 0.2) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(80px)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            <Typography
              component="h1"
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: {
                  xs: '2.5rem',
                  md: '4rem',
                },
                lineHeight: 1.2,
                mb: 3,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              {renderBrandedName('About All', '.ph')}
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, lineHeight: 1.6, maxWidth: '700px', mx: 'auto', color: 'rgba(255,255,255,0.9)' }}>
              The Philippines' most trusted property care platform, connecting homes and offices with verified professionals since 2021.
            </Typography>
          </Container>
        </Box>

        {/* Content Container */}
        <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -6 }, position: 'relative', zIndex: 20 }}>
          
          {/* Our Story Card */}
          <Box sx={{ 
            mb: 6, 
            p: { xs: 3, md: 5 }, 
            bgcolor: isDark ? '#1e293b' : 'white', 
            borderRadius: '20px',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.08)',
            boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.2)' : '0 10px 30px rgba(16, 53, 95, 0.03)'
          }}>
            <Typography
              component="h2"
              variant="h4"
              color={isDark ? 'white' : '#10355f'}
              sx={{
                fontWeight: 800,
                mb: 4,
                fontSize: { xs: '1.75rem', md: '2.2rem' },
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              Our Story
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <Box sx={{ 
                  position: 'relative',
                  width: '100%',
                  height: '350px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: isDark ? '0 16px 32px rgba(0,0,0,0.3)' : '0 16px 32px rgba(16, 53, 95, 0.1)',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(16, 53, 95, 0.12)'
                }}>
                  <Box
                    component="img"
                    src="/images/coolfix.jpg"
                    alt="AllFix story image"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      transition: 'transform 0.5s ease',
                      '&:hover': {
                        transform: 'scale(1.03)'
                      }
                    }}
                  />
                </Box>
              </div>
              <div>
                <Typography sx={{ mb: 2.5, color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569', fontSize: '1rem', lineHeight: 1.8 }}>
                  AllFix.ph was born from a simple observation: Filipinos deserve access to reliable, professional property care services without the stress and uncertainty. What started as a vision to solve this problem has grown into the Philippines' most trusted platform for home and office maintenance.
                </Typography>
                <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569', fontSize: '1rem', lineHeight: 1.8 }}>
                  Today, AllFix.ph connects thousands of property owners and managers with verified, skilled professionals across all major services—from air-conditioning to IT support, plumbing to sustainability solutions. We've built a community of experts dedicated to making property care simple, affordable, and accessible to every Filipino.
                </Typography>
              </div>
            </div>
          </Box>

          {/* Mission & Vision Side-by-Side Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Card sx={{ 
                height: '100%', 
                p: { xs: 3, md: 4 }, 
                borderRadius: '20px', 
                bgcolor: isDark ? '#1e293b' : 'white',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.08)',
                boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.2)' : '0 10px 30px rgba(16, 53, 95, 0.03)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: 44, 
                    height: 44, 
                    borderRadius: '12px', 
                    bgcolor: isDark ? 'rgba(37, 99, 235, 0.1)' : '#eff6ff', 
                    color: isDark ? '#60a5fa' : '#2563eb'
                  }}>
                    <TrackChangesIcon />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? 'white' : '#10355f' }}>Our Mission</Typography>
                </Box>
                <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569', fontSize: '1.05rem', lineHeight: 1.8 }}>
                  To empower every Filipino home and business by providing access to trusted, professional property care services that enhance quality of life and operational efficiency.
                </Typography>
              </Card>
            </div>
            <div>
              <Card sx={{ 
                height: '100%', 
                p: { xs: 3, md: 4 }, 
                borderRadius: '20px', 
                bgcolor: isDark ? '#1e293b' : 'white',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.08)',
                boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.2)' : '0 10px 30px rgba(16, 53, 95, 0.03)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: 44, 
                    height: 44, 
                    borderRadius: '12px', 
                    bgcolor: isDark ? 'rgba(5, 150, 105, 0.1)' : '#ecfdf5', 
                    color: isDark ? '#34d399' : '#059669'
                  }}>
                    <VisibilityIcon />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: isDark ? 'white' : '#10355f' }}>Our Vision</Typography>
                </Box>
                <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569', fontSize: '1.05rem', lineHeight: 1.8 }}>
                  To be the Philippines' most trusted and accessible platform for property care, setting industry standards for quality, reliability, and customer satisfaction.
                </Typography>
              </Card>
            </div>
          </div>

          {/* Core Values Section */}
          <Box sx={{ mb: 8, width: '100%' }}>
            <Typography
              component="h2"
              variant="h4"
              color={isDark ? 'white' : '#10355f'}
              sx={{
                fontWeight: 900,
                fontSize: {
                  xs: '1.8rem',
                  md: '2.5rem',
                },
                lineHeight: 1.2,
                mb: 5,
                letterSpacing: '-0.02em',
                textAlign: 'center',
              }}
            >
              Our Core Values
            </Typography>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {coreValues.map((value, index) => (
                <div key={index}>
                  <Card sx={{ 
                    height: '100%',
                    bgcolor: isDark ? '#1e293b' : 'white',
                    borderRadius: '20px',
                    boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(16, 53, 95, 0.02)',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.08)',
                    borderTop: `4px solid ${value.borderColor}`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: isDark ? '0 12px 30px rgba(0, 0, 0, 0.4)' : '0 12px 30px rgba(16, 53, 95, 0.08)',
                      transform: 'translateY(-4px)',
                    }
                  }}>
                    <CardContent sx={{ 
                      textAlign: 'center', 
                      pt: 4, 
                      pb: 4, 
                      px: 2.5,
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                    }}>
                      <Box sx={{ 
                        mb: 2.5, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: isDark ? '#334155' : '#f1f5f9'
                      }}>
                        {value.icon(isDark ? '#90caf9' : '#10355f')}
                      </Box>
                      <Typography
                        component="h3"
                        variant="h6"
                        color={isDark ? '#90caf9' : '#10355f'}
                        sx={{
                          fontWeight: 800,
                          mb: 1.5,
                          fontSize: '1.2rem',
                          lineHeight: 1.2,
                        }}
                      >
                        {value.title}
                      </Typography>
                      <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b', lineHeight: 1.7, fontSize: '0.9rem' }}>
                        {value.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </Box>

          {/* Why Choose AllFix Card Section */}
          <Box sx={{ 
            p: { xs: 4, md: 6 }, 
            borderRadius: '20px',
            bgcolor: isDark ? '#1e293b' : '#FFFFFF',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.08)',
            boxShadow: isDark ? '0 10px 40px rgba(0, 0, 0, 0.2)' : '0 10px 40px rgba(16, 53, 95, 0.04)'
          }}>
            <Typography
              component="h2"
              variant="h4"
              color={isDark ? 'white' : '#10355f'}
              sx={{
                fontWeight: 900,
                mb: 4,
                fontSize: {
                  xs: '1.6rem',
                  md: '2.2rem',
                },
                lineHeight: 1.2,
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              {renderBrandedName('Why Choose All', '')}
            </Typography>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                'Verified & background-checked professionals across all services',
                'Easy online booking with transparent pricing',
                'Real-time job tracking and customer support',
                'Service guarantee on all bookings',
                'Eco-friendly and sustainable solutions available',
                'Trusted by thousands of Filipino families and businesses since 2021',
              ].map((item, index) => (
                <div key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 28, 
                      height: 28, 
                      borderRadius: '50%', 
                      bgcolor: isDark ? 'rgba(1, 117, 80, 0.1)' : '#e6f7ed', 
                      color: isDark ? '#45d393' : '#017550',
                      flexShrink: 0,
                      mt: 0.2
                    }}>
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    </Box>
                    <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569', fontSize: '1rem', lineHeight: 1.6 }}>
                      {item}
                    </Typography>
                  </Box>
                </div>
              ))}
            </div>
          </Box>

        </Container>

        {/* Reusable premium Footer */}
        <Footer />

      </Box>
    </>
  );
};

export default AboutUsPage;