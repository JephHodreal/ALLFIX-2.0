import {
  Box,
  Container,
  Typography,
  CssBaseline,
  Card,
  CardContent,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupsIcon from '@mui/icons-material/Groups';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';

const coreValues = [
  {
    icon: <StarIcon sx={{ fontSize: 40, color: '#2E5BA8' }} />,
    title: 'Excellence',
    description: 'We deliver exceptional quality in every service, ensuring customer satisfaction with certified professionals and verified expertise.',
  },
  {
    icon: <GroupsIcon sx={{ fontSize: 40, color: '#2E5BA8' }} />,
    title: 'Integrity',
    description: 'We operate with transparency and honesty, building trust through reliable service delivery and genuine customer relationships.',
  },
  {
    icon: <LightbulbIcon sx={{ fontSize: 40, color: '#2E5BA8' }} />,
    title: 'Innovation',
    description: 'We embrace technology and modern solutions to make property care accessible, efficient, and hassle-free for every Filipino.',
  },
  {
    icon: <AssignmentIcon sx={{ fontSize: 40, color: '#2E5BA8' }} />,
    title: 'Accountability',
    description: 'We stand behind our work with service guarantees and are committed to making things right every single time.',
  },
];

const AboutUsPage = () => {
  return (
    <>
      <CssBaseline />

      {/* Reusable premium Navbar */}
      <Navbar />

      <Box sx={{ bgcolor: 'grey.100', minHeight: '100vh', width: '100%' }}>
        
        {/* Hero Section */}
        <Box sx={{ 
          position: 'relative',
          minHeight: '50vh',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          pt: { xs: 12, md: 10 }, 
          pb: { xs: 4, md: 8 }, 
          px: 3, 
          background: 'linear-gradient(135deg, #10355f 0%, #0d264a 55%, #1a3f70 100%)',
          color: 'white',
          overflow: 'hidden'
        }}>
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            <Typography variant="h1" fontWeight="900" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, lineHeight: 1.2, mb: 3, letterSpacing: '-0.02em' }}>
              About AllFix.ph
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', md: '1.2rem' }, lineHeight: 1.6, maxWidth: '700px', mx: 'auto', color: 'rgba(255,255,255,0.9)' }}>
              The Philippines' most trusted property care platform, connecting homes and offices with verified professionals since 2021.
            </Typography>
          </Container>
        </Box>

        {/* About Content - White Section */}
        <Box sx={{ pt: { xs: 6, md: 8 }, pb: { xs: 4, md: 12 }, bgcolor: 'white', width: '100%' }}>
          <Container maxWidth="md">
            
            {/* Our Story Section */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h3" fontWeight="800" color="#10355f" sx={{ mb: 3, fontSize: '1.8rem' }}>
                Our Story
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 4, md: 6 }, alignItems: 'stretch' }}>
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifycontent: 'center' }}>
                  <Box sx={{ 
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    minHeight: { xs: '300px', md: '400px' },
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 16px 32px rgba(46, 91, 168, 0.15)',
                    border: '4px solid #eaf2fc'
                  }}>
                    <Box
                      component="img"
                      src="/images/coolfix.jpg"
                      alt="AllFix story"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center'
                      }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography sx={{ mb: 2, color: '#555', lineHeight: 1.8 }}>
                    AllFix.ph was born from a simple observation: Filipinos deserve access to reliable, professional property care services without the stress and uncertainty. What started as a vision to solve this problem has grown into the Philippines' most trusted platform for home and office maintenance.
                  </Typography>
                  <Typography sx={{ mb: 2, color: '#555', lineHeight: 1.8 }}>
                    Today, AllFix.ph connects thousands of property owners and managers with verified, skilled professionals across all major services—from air-conditioning to IT support, plumbing to sustainability solutions. We've built a community of experts dedicated to making property care simple, affordable, and accessible to every Filipino.
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Mission Section */}
            <Section title="Our Mission">
              <Box sx={{ 
                p: 3, 
                bgcolor: '#f0f7ff', 
                borderLeft: '4px solid #2E5BA8', 
                borderRadius: '8px',
                mb: 4
              }}>
                <Typography sx={{ fontSize: '1.1rem', color: '#10355f', fontWeight: 600, lineHeight: 1.8 }}>
                  To empower every Filipino home and business by providing access to trusted, professional property care services that enhance quality of life and operational efficiency.
                </Typography>
              </Box>
            </Section>

            {/* Vision Section */}
            <Section title="Our Vision">
              <Box sx={{ 
                p: 3, 
                bgcolor: '#f0f7ff', 
                borderLeft: '4px solid #2E5BA8', 
                borderRadius: '8px',
                mb: 4
              }}>
                <Typography sx={{ fontSize: '1.1rem', color: '#10355f', fontWeight: 600, lineHeight: 1.8 }}>
                  To be the Philippines' most trusted and accessible platform for property care, setting industry standards for quality, reliability, and customer satisfaction.
                </Typography>
              </Box>
            </Section>

            {/* Core Values Section */}
            <Box sx={{ mb: 8, width: '100%' }}>
              <Typography variant="h2" fontWeight="900" color="#10355f" sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, lineHeight: 1.2, mb: 6, letterSpacing: '-0.02em', textAlign: 'center' }}>
                Our Core Values
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, 
                gap: 3, 
                width: '100%' 
              }}>
                {coreValues.map((value, index) => (
                  <Card key={index} sx={{ 
                    height: '100%',
                    minHeight: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(46, 91, 168, 0.1)',
                    transition: 'all 0.3s ease',
                    overflow: 'visible',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(46, 91, 168, 0.15)',
                      transform: 'translateY(-4px)',
                    }
                  }}>
                    <CardContent sx={{ 
                      textAlign: 'center', 
                      pt: 3, 
                      pb: 3, 
                      px: 2,
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '100%',
                      overflow: 'visible'
                    }}>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                        {value.icon}
                      </Box>
                      <Typography variant="h5" fontWeight="800" color="#10355f" sx={{ mb: 2, wordWrap: 'break-word', overflow: 'visible' }}>
                        {value.title}
                      </Typography>
                      <Typography sx={{ color: '#666', lineHeight: 1.7, fontSize: '0.95rem', flex: 1 }}>
                        {value.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>

            {/* NEW STYLED SECTION: Why Choose AllFix */}
            {/* White Background & Premium soft shadows */}
            <Box sx={{ 
              mb: 6, 
              p: { xs: 3, md: 5 }, 
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: '1px solid rgba(16, 53, 95, 0.12)',
              boxShadow: '0 12px 40px rgba(16, 53, 95, 0.06), 0 2px 10px rgba(16, 53, 95, 0.04)'
            }}>
              <Typography variant="h3" fontWeight="800" color="#10355f" sx={{ mb: 4, fontSize: '1.8rem' }}>
                Why Choose AllFix
              </Typography>
              
              {/* Flex Column guarantees it stacks like 1, 2, 3, 4, 5 vertically */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {[
                  'Verified & background-checked professionals across all services',
                  'Easy online booking with transparent pricing',
                  'Real-time job tracking and customer support',
                  'Service guarantee on all bookings',
                  'Eco-friendly and sustainable solutions available',
                  'Trusted by thousands of Filipino families and businesses since 2021',
                ].map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: '50%', 
                      bgcolor: '#eaf2fc', 
                      flexShrink: 0 
                    }}>
                      <Typography sx={{ color: '#2E5BA8', fontSize: '0.85rem', fontWeight: 'bold' }}>✓</Typography>
                    </Box>
                    <Typography sx={{ color: '#334155', fontSize: '1.05rem', lineHeight: 1.6, fontWeight: 500 }}>
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
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
  <Box sx={{ mb: 6 }}>
    <Typography variant="h3" fontWeight="800" color="#10355f" sx={{ mb: 3, fontSize: '1.8rem' }}>
      {title}
    </Typography>
    <Box sx={{ color: '#555', lineHeight: 1.8 }}>
      {children}
    </Box>
  </Box>
);

export default AboutUsPage;