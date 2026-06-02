import {
  Box,
  Container,
  Typography,
  CssBaseline,
} from '@mui/material';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';

const PrivacyPolicy = () => {
  return (
    <>
      <CssBaseline />

      {/* Seamless Navbar blending into the background */}
      <Navbar />

      <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', width: '100%' }}>
        
        {/* Hero Section - 50vh */}
        <Box sx={{ 
          position: 'relative',
          minHeight: '50vh',
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
              top: 40,
              left: 40,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(96px)',
              opacity: 0.4,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 40,
              right: 40,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(96px)',
              opacity: 0.4,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box
              component="img"
              src="/dpo-certificate.jpg"
              alt="DPO/DPS Certificate"
              sx={{
                maxWidth: { xs: '200px', sm: '280px', md: '350px' },
                maxHeight: '400px',
                objectFit: 'contain',
              }}
            />
          </Container>
        </Box>

        {/* Privacy Policy Content - White Section */}
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'white', width: '100%' }}>
          <Container maxWidth="md">
            <Typography variant="h2" fontWeight="900" color="#10355f" sx={{ fontSize: { xs: '2.2rem', md: '3.5rem' }, lineHeight: 1.2, mb: 2, letterSpacing: '-0.02em', textAlign: 'center' }}>
              Privacy & Policy
            </Typography>
            <Typography sx={{ color: '#555', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.6, maxWidth: '600px', mx: 'auto', mb: 6, textAlign: 'center' }}>
              We're committed to protecting your privacy and being transparent about how we collect and use your data.
            </Typography>
            
            <Section title="1. Introduction">
              <Typography sx={{ mb: 2 }}>
                AllFix Philippines Inc. ("we", "us", "our", or "Company") operates the AllFix.ph website and mobile application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
              </Typography>
            </Section>

            <Section title="2. Information Collection and Use">
              <Typography sx={{ fontWeight: 700, mb: 1 }}>We collect several different types of information for various purposes:</Typography>
              <Box sx={{ ml: 2, mb: 2 }}>
                <Typography sx={{ mb: 1 }}><strong>Personal Data:</strong> Email address, name, contact number, business information, and payment details.</Typography>
                <Typography sx={{ mb: 1 }}><strong>Device Information:</strong> Browser type, IP address, and operating system.</Typography>
                <Typography sx={{ mb: 1 }}><strong>Usage Data:</strong> Pages visited, time spent, and interactions with our Service.</Typography>
                <Typography><strong>Location Data:</strong> Approximate location based on IP address (with your consent).</Typography>
              </Box>
            </Section>

            <Section title="3. Use of Data">
              <Typography sx={{ mb: 2 }}>
                AllFix uses the collected data for various purposes including:
              </Typography>
              <Box sx={{ ml: 2, mb: 2 }}>
                <Typography sx={{ mb: 1 }}>• To provide and maintain our Service</Typography>
                <Typography sx={{ mb: 1 }}>• To notify you about changes to our Service</Typography>
                <Typography sx={{ mb: 1 }}>• To allow you to participate in interactive features of our Service</Typography>
                <Typography sx={{ mb: 1 }}>• To provide customer support</Typography>
                <Typography sx={{ mb: 1 }}>• To gather analysis or valuable information so that we can improve our Service</Typography>
                <Typography sx={{ mb: 1 }}>• To monitor the usage of our Service</Typography>
                <Typography sx={{ mb: 1 }}>• To detect, prevent and address technical and security issues</Typography>
              </Box>
            </Section>

            <Section title="4. Security of Data">
              <Typography sx={{ mb: 2 }}>
                The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </Typography>
            </Section>

            <Section title="5. Changes to This Privacy Policy">
              <Typography sx={{ mb: 2 }}>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
              </Typography>
              <Typography sx={{ mb: 2 }}>
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </Typography>
            </Section>

            <Section title="6. Contact Us">
              <Typography sx={{ mb: 1 }}>
                If you have any questions about this Privacy Policy, please contact us at:
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

export default PrivacyPolicy;
