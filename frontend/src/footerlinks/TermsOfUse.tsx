import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  CssBaseline,
} from '@mui/material';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';

// Premium Icons for each section
import GavelIcon from '@mui/icons-material/Gavel';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';
import UpdateIcon from '@mui/icons-material/Update';
import RuleIcon from '@mui/icons-material/Rule';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import ShieldIcon from '@mui/icons-material/Shield';

const TermsOfUse = () => {
  useEffect(() => {
    console.log("[CAVEMAN] TermsOfUse page mounted. Initializing dark style navbar before scroll.");
  }, []);

  return (
    <>
      <CssBaseline />

      {/* Seamless Navbar */}
      <Navbar />

      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', width: '100%', pb: { xs: 4, md: 8 } }}>
        
        {/* Premium Hero Section matching site design */}
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

          {/* Premium Radial Blobs */}
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
              Terms of Service
            </Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.6, maxWidth: '600px', mx: 'auto' }}>
              Please read these Terms of Use carefully before using AllFix.ph services.
            </Typography>
          </Container>
        </Box>

        {/* Content Container */}
        <Container maxWidth="md" sx={{ mt: { xs: -4, md: -6 }, position: 'relative', zIndex: 20 }}>
          
          <Section title="1. Acceptance of Terms" icon={<CheckCircleIcon />}>
            <Typography sx={{ color: '#475569', fontSize: '0.975rem', lineHeight: 1.8 }}>
              By accessing and using AllFix.ph (the "Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </Typography>
          </Section>

          <Section title="2. Use License" icon={<DescriptionIcon />}>
            <Typography sx={{ color: '#475569', fontSize: '0.975rem', lineHeight: 1.8, mb: 2 }}>
              Permission is granted to temporarily download one copy of the materials (information or software) on AllFix.ph for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pl: 2, borderLeft: '3px solid #e2e8f0' }}>
              {[
                'Modifying or copying the materials',
                'Using the materials for any commercial purpose or for any public display',
                'Attempting to decompile or reverse engineer any software contained on the Platform',
                'Removing any copyright or other proprietary notations from the materials',
                'Transferring the materials to another person or "mirroring" the materials on any other server'
              ].map((item, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Typography sx={{ color: '#017550', fontWeight: 'bold', mt: -0.2 }}>•</Typography>
                  <Typography sx={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.6 }}>{item}</Typography>
                </Box>
              ))}
            </Box>
          </Section>

          <Section title="3. Disclaimer" icon={<WarningAmberIcon />}>
            <Typography sx={{ color: '#475569', fontSize: '0.975rem', lineHeight: 1.8 }}>
              The materials on AllFix.ph are provided on an 'as is' basis. AllFix makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </Typography>
          </Section>

          <Section title="4. Limitations" icon={<BlockIcon />}>
            <Typography sx={{ color: '#475569', fontSize: '0.975rem', lineHeight: 1.8 }}>
              In no event shall AllFix or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AllFix.ph, even if AllFix or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </Typography>
          </Section>

          <Section title="5. Accuracy of Materials" icon={<ShieldIcon />}>
            <Typography sx={{ color: '#475569', fontSize: '0.975rem', lineHeight: 1.8 }}>
              The materials appearing on AllFix.ph could include technical, typographical, or photographic errors. AllFix does not warrant that any of the materials on the Platform are accurate, complete, or current. AllFix may make changes to the materials contained on the Platform at any time without notice.
            </Typography>
          </Section>

          <Section title="6. Links" icon={<LinkIcon />}>
            <Typography sx={{ color: '#475569', fontSize: '0.975rem', lineHeight: 1.8 }}>
              AllFix has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by AllFix of the site. Use of any such linked website is at the user's own risk.
            </Typography>
          </Section>

          <Section title="7. Modifications" icon={<UpdateIcon />}>
            <Typography sx={{ color: '#475569', fontSize: '0.975rem', lineHeight: 1.8 }}>
              AllFix may revise these Terms of Use for the Platform at any time without notice. By using this Platform, you are agreeing to be bound by the then current version of these Terms of Use.
            </Typography>
          </Section>

          <Section title="8. User Conduct" icon={<RuleIcon />}>
            <Typography sx={{ color: '#475569', fontSize: '0.975rem', lineHeight: 1.8 }}>
              Users agree not to use the Platform for any unlawful purposes or in any way that could damage, disable, overburden, or impair the Platform. This includes harassment, defamation, illegal activity, or any conduct that violates the rights of others.
            </Typography>
          </Section>

          <Section title="9. Account Registration" icon={<AccountCircleIcon />}>
            <Typography sx={{ color: '#475569', fontSize: '0.975rem', lineHeight: 1.8 }}>
              If you create an account on AllFix.ph, you are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </Typography>
          </Section>

          <Section title="10. Governing Law" icon={<GavelIcon />}>
            <Typography sx={{ color: '#475569', fontSize: '0.975rem', lineHeight: 1.8 }}>
              These Terms and Conditions are governed by and construed in accordance with the laws of the Philippines, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </Typography>
          </Section>

          <Section title="11. Contact Us" icon={<ContactMailIcon />}>
            <Typography sx={{ color: '#475569', fontSize: '0.975rem', lineHeight: 1.8, mb: 3 }}>
              If you have any questions about these Terms of Use, please contact us at:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2, 
              p: 3, 
              bgcolor: '#f1f5f9', 
              borderRadius: '12px',
              border: '1px dashed #cbd5e1'
            }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#10355f' }}>Email</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>concierge.fpdnexus@gmail.com</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#10355f' }}>Phone</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>+63 920 9631 217 | +63 975 8336 289</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#10355f' }}>Address</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
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
const Section = ({ title, icon, children }: SectionProps) => (
  <Box sx={{ 
    mb: 4, 
    p: { xs: 3, md: 4 }, 
    bgcolor: 'white', 
    borderRadius: '16px',
    border: '1px solid rgba(16, 53, 95, 0.08)',
    boxShadow: '0 4px 20px rgba(16, 53, 95, 0.02)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      boxShadow: '0 12px 30px rgba(16, 53, 95, 0.06)',
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
        bgcolor: '#f0f7ff', 
        color: '#10355f',
        flexShrink: 0
      }}>
        {icon}
      </Box>
      <Typography
        component="h2"
        variant="h6"
        color="#10355f"
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

export default TermsOfUse;
