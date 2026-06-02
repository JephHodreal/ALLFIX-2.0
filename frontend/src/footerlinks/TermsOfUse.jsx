import {
  Box,
  Container,
  Typography,
  CssBaseline,
} from '@mui/material';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';

const TermsOfUse = () => {
  return (
    <>
      <CssBaseline />

      {/* Reusable premium Navbar */}
      <Navbar />

      <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', width: '100%' }}>
        
        {/* Spacer to push content below navbar */}
        <Box sx={{ height: '80px', bgcolor: 'white' }} />

        {/* Terms of Use Content - White Section */}
        <Box sx={{ pt: { xs: 4, md: 8 }, pb: { xs: 4, md: 20 }, bgcolor: 'white', width: '100%' }}>
          <Container maxWidth="md">
            <Typography variant="h2" fontWeight="900" color="#10355f" sx={{ fontSize: { xs: '2.2rem', md: '3.5rem' }, lineHeight: 1.2, mb: 2, letterSpacing: '-0.02em', textAlign: 'center' }}>
              Terms of Service
            </Typography>
            <Typography sx={{ color: '#555', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.6, maxWidth: '600px', mx: 'auto', mb: 6, textAlign: 'center' }}>
              Please read these Terms of Use carefully before using AllFix.ph services.
            </Typography>

            <Section title="1. Acceptance of Terms">
              <Typography sx={{ mb: 2 }}>
                By accessing and using AllFix.ph (the "Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </Typography>
            </Section>

            <Section title="2. Use License">
              <Typography sx={{ mb: 2 }}>
                Permission is granted to temporarily download one copy of the materials (information or software) on AllFix.ph for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </Typography>
              <Box sx={{ ml: 2, mb: 2 }}>
                <Typography sx={{ mb: 1 }}>• Modifying or copying the materials</Typography>
                <Typography sx={{ mb: 1 }}>• Using the materials for any commercial purpose or for any public display</Typography>
                <Typography sx={{ mb: 1 }}>• Attempting to decompile or reverse engineer any software contained on the Platform</Typography>
                <Typography sx={{ mb: 1 }}>• Removing any copyright or other proprietary notations from the materials</Typography>
                <Typography sx={{ mb: 1 }}>• Transferring the materials to another person or "mirroring" the materials on any other server</Typography>
              </Box>
            </Section>

            <Section title="3. Disclaimer">
              <Typography sx={{ mb: 2 }}>
                The materials on AllFix.ph are provided on an 'as is' basis. AllFix makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </Typography>
            </Section>

            <Section title="4. Limitations">
              <Typography sx={{ mb: 2 }}>
                In no event shall AllFix or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AllFix.ph, even if AllFix or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </Typography>
            </Section>

            <Section title="5. Accuracy of Materials">
              <Typography sx={{ mb: 2 }}>
                The materials appearing on AllFix.ph could include technical, typographical, or photographic errors. AllFix does not warrant that any of the materials on the Platform are accurate, complete, or current. AllFix may make changes to the materials contained on the Platform at any time without notice.
              </Typography>
            </Section>

            <Section title="6. Links">
              <Typography sx={{ mb: 2 }}>
                AllFix has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by AllFix of the site. Use of any such linked website is at the user's own risk.
              </Typography>
            </Section>

            <Section title="7. Modifications">
              <Typography sx={{ mb: 2 }}>
                AllFix may revise these Terms of Use for the Platform at any time without notice. By using this Platform, you are agreeing to be bound by the then current version of these Terms of Use.
              </Typography>
            </Section>

            <Section title="8. User Conduct">
              <Typography sx={{ mb: 2 }}>
                Users agree not to use the Platform for any unlawful purposes or in any way that could damage, disable, overburden, or impair the Platform. This includes harassment, defamation, illegal activity, or any conduct that violates the rights of others.
              </Typography>
            </Section>

            <Section title="9. Account Registration">
              <Typography sx={{ mb: 2 }}>
                If you create an account on AllFix.ph, you are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
              </Typography>
            </Section>

            <Section title="10. Governing Law">
              <Typography sx={{ mb: 2 }}>
                These Terms and Conditions are governed by and construed in accordance with the laws of the Philippines, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </Typography>
            </Section>

            <Section title="11. Contact Us">
              <Typography sx={{ mb: 1 }}>
                If you have any questions about these Terms of Use, please contact us at:
              </Typography>
              <Box sx={{ ml: 2, mt: 2 }}>
                <Typography sx={{ mb: 1 }}>Email: inquiry@allfix.ph</Typography>
                <Typography sx={{ mb: 1 }}>Phone: +63 920 9631 217 | +63 975 8336 289</Typography>
                <Typography>
                  Address: 9824 Kamagong Street, San Antonio Village,<br/>Makati City 1203 Philippines
                </Typography>
              </Box>
            </Section>
          </Container>
        </Box>

        {/* Reusable premium Footer */}
        <Footer />

      </Box>
    </>
  );
};

// Section Component for cleaner organization
const Section = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h5" fontWeight="800" color="#10355f" sx={{ mb: 2, fontSize: '1.3rem' }}>
      {title}
    </Typography>
    <Box sx={{ color: '#555', lineHeight: 1.8 }}>
      {children}
    </Box>
  </Box>
);

export default TermsOfUse;
