import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CssBaseline,
} from '@mui/material';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { useTheme } from '../context/ThemeContext';

// Icons for Privacy Policy Sections
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import ShieldIcon from '@mui/icons-material/Shield';
import UpdateIcon from '@mui/icons-material/Update';
import ContactMailIcon from '@mui/icons-material/ContactMail';

const PrivacyPolicy = () => {
  const { isDark } = useTheme();

  useEffect(() => {
    console.log("[CAVEMAN] PrivacyPage mounted. Loading user privacy policies.");
  }, []);

  return (
    <>
      <CssBaseline />

      {/* Seamless Navbar */}
      <Navbar />

      <Box sx={{ bgcolor: isDark ? '#0f172a' : '#f8fafc', minHeight: '100vh', width: '100%', pb: { xs: 4, md: 8 } }}>
        
        {/* Hero Section */}
        <Box sx={{ 
          position: 'relative',
          minHeight: '35vh',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          pt: { xs: 12, md: 10 }, 
          pb: { xs: 4, md: 4 }, 
          px: 3, 
          background: 'linear-gradient(135deg, #10355f 0%, #0d264a 55%, #1a3f70 100%)', 
          color: 'white',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
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

          <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            <Typography
              component="h1"
              variant="h2"
              color="white"
              sx={{
                fontWeight: 900,
                fontSize: {
                  xs: '2.2rem',
                  md: '3.5rem',
                },
                lineHeight: 1.2,
                mb: 2,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 10px rgba(0,0,0,0.2)'
              }}
            >
              Privacy Policy
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.6, maxWidth: '600px', mx: 'auto' }}>
              We're committed to protecting your privacy and being transparent about how we collect and use your data.
            </Typography>
          </Container>
        </Box>

        {/* Content Container */}
        <Container maxWidth="md" sx={{ mt: { xs: -4, md: -6 }, position: 'relative', zIndex: 20 }}>
          
          <Section title="1. Introduction" icon={<InfoOutlinedIcon />}>
            <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569', fontSize: '0.975rem', lineHeight: 1.8 }}>
              AllFix Philippines Inc. ("we", "us", "our", or "Company") operates the AllFix.ph website and mobile application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </Typography>
          </Section>

          <Section title="2. Information Collection and Use" icon={<StorageIcon />}>
            <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569', fontSize: '0.975rem', lineHeight: 1.8, fontWeight: 700, mb: 2 }}>
              We collect several different types of information for various purposes to provide and improve our service to you:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 2, borderLeft: isDark ? '3px solid #334155' : '3px solid #e2e8f0' }}>
              {[
                { name: 'Personal Data', detail: 'Email address, name, contact number, business details, and payment details.' },
                { name: 'Device Information', detail: 'Browser type, IP address, and operating system details.' },
                { name: 'Usage Data', detail: 'Pages visited, time spent, and other interactive analytical data.' },
                { name: 'Location Data', detail: 'Approximate location based on IP address (only with your active consent).' }
              ].map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: isDark ? '#90caf9' : '#10355f' }}>
                    {item.name}
                  </Typography>
                  <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b', fontSize: '0.925rem', lineHeight: 1.6 }}>
                    {item.detail}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Section>

          <Section title="3. Use of Data" icon={<SettingsSuggestIcon />}>
            <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569', fontSize: '0.975rem', lineHeight: 1.8, mb: 2 }}>
              AllFix uses the collected data for various purposes, including but not limited to:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 2, borderLeft: isDark ? '3px solid #334155' : '3px solid #e2e8f0' }}>
              {[
                'To provide, maintain, and monitor the performance of our Service',
                'To notify you about changes, updates, or service alerts',
                'To allow you to participate in the interactive features of our Service',
                'To provide efficient, localized customer support',
                'To gather analysis or valuable insights to help optimize our customer experience',
                'To detect, prevent, and quickly address technical or security issues'
              ].map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Typography sx={{ color: isDark ? '#34d399' : '#017550', fontWeight: 'bold', mt: -0.2 }}>•</Typography>
                  <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b', fontSize: '0.925rem', lineHeight: 1.6 }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </Section>

          <Section title="4. Security of Data" icon={<ShieldIcon />}>
            <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569', fontSize: '0.975rem', lineHeight: 1.8 }}>
              The security of your data is of paramount importance to us. However, please remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means and protocols to protect your Personal Data, we cannot guarantee its absolute security.
            </Typography>
          </Section>

          <Section title="5. Changes to This Privacy Policy" icon={<UpdateIcon />}>
            <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569', fontSize: '0.975rem', lineHeight: 1.8, mb: 2 }}>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy page.
            </Typography>
            <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569', fontSize: '0.975rem', lineHeight: 1.8 }}>
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective immediately when they are published on this page.
            </Typography>
          </Section>

          <Section title="6. Contact Us" icon={<ContactMailIcon />}>
            <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#475569', fontSize: '0.975rem', lineHeight: 1.8, mb: 3 }}>
              If you have any questions or feedback regarding this Privacy Policy, please reach out to us:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2, 
              p: 3, 
              bgcolor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f1f5f9', 
              borderRadius: '12px',
              border: isDark ? '1px dashed rgba(255, 255, 255, 0.2)' : '1px dashed #cbd5e1'
            }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: isDark ? 'white' : '#10355f' }}>Email</Typography>
                <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b', fontSize: '0.95rem' }}>concierge.fpdnexus@gmail.com</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: isDark ? 'white' : '#10355f' }}>Phone</Typography>
                <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b', fontSize: '0.95rem' }}>+63 920 9631 217 | +63 975 8336 289</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: isDark ? 'white' : '#10355f' }}>Address</Typography>
                <Typography sx={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  139 Corporate Center, Valero, Makati City,<br/>Metro Manila, Philippines
                </Typography>
              </Box>
            </Box>
          </Section>

        </Container>

        {/* Reusable premium Footer */}
        <Footer />

      </Box>
    </>
  );
};

// Section Component - Styled Premium Card
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}
const Section = ({ title, icon, children }: SectionProps) => {
  const { isDark } = useTheme();
  return (
    <Box sx={{ 
      mb: 4, 
      p: { xs: 3, md: 4 }, 
      bgcolor: isDark ? '#1e293b' : 'white', 
      borderRadius: '16px',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(16, 53, 95, 0.08)',
      boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(16, 53, 95, 0.02)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        boxShadow: isDark ? '0 12px 30px rgba(0, 0, 0, 0.4)' : '0 12px 30px rgba(16, 53, 95, 0.06)',
        transform: 'translateY(-2px)'
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: 42, 
          height: 42, 
          borderRadius: '10px', 
          bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f0f7ff', 
          color: isDark ? '#90caf9' : '#10355f',
          flexShrink: 0
        }}>
          {icon}
        </Box>
        <Typography
          component="h2"
          variant="h6"
          color={isDark ? 'white' : '#10355f'}
          sx={{
            fontWeight: 800,
            fontSize: {
              xs: '1.15rem',
              sm: '1.25rem',
            },
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ pl: { xs: 0, sm: 7.2 } }}>
        {children}
      </Box>
    </Box>
  );
};

export default PrivacyPolicy;
