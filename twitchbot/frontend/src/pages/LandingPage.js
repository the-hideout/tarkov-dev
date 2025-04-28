import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  AppBar,
  Toolbar,
  IconButton,
  Link,
  Fade,
  Slide,
  Zoom,
} from '@mui/material';
import {
  Security,
  Analytics,
  Settings,
  Notifications,
  Menu as MenuIcon,
  KeyboardArrowRight,
} from '@mui/icons-material';
import TwitchIcon from '../components/icons/TwitchIcon';
import DiscordIcon from '../components/icons/DiscordIcon';

const FeatureCard = ({ icon, title, description, delay }) => {
  const theme = useTheme();
  return (
    <Zoom in={true} style={{ transitionDelay: delay }}>
      <Card 
        sx={{ 
          height: '100%', 
          bgcolor: theme.palette.background.paper,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: theme.shadows[8],
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {icon}
            <Typography variant="h6" component="div" sx={{ ml: 1 }}>
              {title}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Zoom>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(8px)' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 'bold', color: theme.palette.text.primary }}
          >
            NexusCore
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button color="inherit" onClick={() => navigate('/features')}>Features</Button>
            <Button color="inherit" onClick={() => navigate('/pricing')}>Pricing</Button>
            <Button color="inherit" onClick={() => navigate('/docs')}>Documentation</Button>
            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
            <Button variant="contained" color="primary" onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </Box>
          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' } }}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

const Footer = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ bgcolor: theme.palette.background.paper, py: 6, mt: 8, width: '100%' }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              NexusCore
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The ultimate platform for managing your Twitch and Discord communities.
              Powered by MarkSoft.
            </Typography>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Product
            </Typography>
            <Link href="/features" color="inherit" display="block" sx={{ mb: 1 }}>Features</Link>
            <Link href="/pricing" color="inherit" display="block" sx={{ mb: 1 }}>Pricing</Link>
            <Link href="/docs" color="inherit" display="block" sx={{ mb: 1 }}>Documentation</Link>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Company
            </Typography>
            <Link href="/about" color="inherit" display="block" sx={{ mb: 1 }}>About</Link>
            <Link href="/blog" color="inherit" display="block" sx={{ mb: 1 }}>Blog</Link>
            <Link href="/careers" color="inherit" display="block" sx={{ mb: 1 }}>Careers</Link>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Legal
            </Typography>
            <Link href="/privacy" color="inherit" display="block" sx={{ mb: 1 }}>Privacy</Link>
            <Link href="/terms" color="inherit" display="block" sx={{ mb: 1 }}>Terms</Link>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="h6" gutterBottom>
              Connect
            </Typography>
            <Link href="https://twitter.com" color="inherit" display="block" sx={{ mb: 1 }}>Twitter</Link>
            <Link href="https://discord.gg" color="inherit" display="block" sx={{ mb: 1 }}>Discord</Link>
            <Link href="https://github.com" color="inherit" display="block" sx={{ mb: 1 }}>GitHub</Link>
          </Grid>
        </Grid>
        <Box sx={{ mt: 6, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} NexusCore. All rights reserved. Powered by MarkSoft.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <TwitchIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Twitch Integration',
      description: 'Manage your Twitch channel with custom commands, rewards, and moderation tools.',
      delay: '100ms',
    },
    {
      icon: <DiscordIcon color="primary" sx={{ fontSize: 40 }} />,
      title: 'Discord Integration',
      description: 'Control your Discord server with role management, auto-moderation, and welcome messages.',
      delay: '200ms',
    },
    {
      icon: <Settings color="primary" sx={{ fontSize: 40 }} />,
      title: 'Centralized Settings',
      description: 'Manage all your bot configurations from a single, intuitive dashboard.',
      delay: '300ms',
    },
    {
      icon: <Analytics color="primary" sx={{ fontSize: 40 }} />,
      title: 'Advanced Analytics',
      description: 'Track your channel growth and engagement with detailed analytics.',
      delay: '400ms',
    },
    {
      icon: <Notifications color="primary" sx={{ fontSize: 40 }} />,
      title: 'Smart Notifications',
      description: 'Stay informed with customizable notifications across platforms.',
      delay: '500ms',
    },
    {
      icon: <Security color="primary" sx={{ fontSize: 40 }} />,
      title: 'Enhanced Security',
      description: 'Keep your community safe with advanced moderation and security features.',
      delay: '600ms',
    },
  ];

  return (
    <Box sx={{ width: '100vw', minHeight: '100vh', overflowX: 'hidden', bgcolor: theme.palette.background.default, boxSizing: 'border-box' }}>
      <Navbar />
      
      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${theme.palette.primary.main}22 0%, ${theme.palette.secondary.main}22 100%)`,
          pt: 8,
        }}
      >
        <Box sx={{ maxWidth: '1600px', width: '100%', mx: 'auto', px: { xs: 2, md: 6 } }}>
          <Grid container spacing={6} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={6}>
              <Fade in={true} timeout={1000}>
                <Box>
                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{ 
                      fontWeight: 'bold',
                      fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      textFillColor: 'transparent',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Streamline Your Community Management
                  </Typography>
                  <Typography 
                    variant="h5" 
                    color="text.secondary" 
                    paragraph
                    sx={{ 
                      fontSize: { xs: '1.2rem', md: '1.4rem' },
                      maxWidth: '600px'
                    }}
                  >
                    The all-in-one platform for managing your Twitch and Discord communities.
                    Powerful tools to enhance engagement and automate moderation.
                  </Typography>
                  <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={() => navigate('/register')}
                      endIcon={<KeyboardArrowRight />}
                      sx={{ px: 4, py: 1.5 }}
                    >
                      Get Started Free
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="large"
                      onClick={() => navigate('/demo')}
                      sx={{ px: 4, py: 1.5 }}
                    >
                      Watch Demo
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={6}>
              <Slide direction="left" in={true} timeout={1000}>
                <Box
                  component="img"
                  src="/dashboard-preview.png"
                  alt="Dashboard Preview"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 2,
                    boxShadow: theme.shadows[20],
                  }}
                />
              </Slide>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ width: '100vw', bgcolor: theme.palette.background.default, py: { xs: 6, md: 10 } }}>
        <Box sx={{ maxWidth: '1600px', width: '100%', mx: 'auto', px: { xs: 2, md: 6 } }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ 
              mb: { xs: 4, md: 8 },
              fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' }
            }}
          >
            Powerful Features
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item key={index} xs={12} sm={6} md={4} lg={4} xl={2}>
                <FeatureCard {...feature} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Statistics Section */}
      <Box sx={{ bgcolor: theme.palette.background.paper, py: { xs: 6, md: 10 }, width: '100vw' }}>
        <Box sx={{ maxWidth: '1600px', width: '100%', mx: 'auto', px: { xs: 2, md: 6 } }}>
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={4}>
              <Fade in={true} timeout={1000}>
                <Box textAlign="center">
                  <Typography variant="h3" color="primary" gutterBottom>
                    1M+
                  </Typography>
                  <Typography variant="h6">Active Users</Typography>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Fade in={true} timeout={1500}>
                <Box textAlign="center">
                  <Typography variant="h3" color="primary" gutterBottom>
                    50K+
                  </Typography>
                  <Typography variant="h6">Communities</Typography>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Fade in={true} timeout={2000}>
                <Box textAlign="center">
                  <Typography variant="h3" color="primary" gutterBottom>
                    99.9%
                  </Typography>
                  <Typography variant="h6">Uptime</Typography>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: { xs: 6, md: 10 },
          width: '100vw',
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          color: 'white',
        }}
      >
        <Box sx={{ maxWidth: '1400px', width: '100%', mx: 'auto', px: { xs: 2, md: 6 } }}>
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontSize: { xs: '1.75rem', md: '2.25rem', lg: '2.75rem' } }}
          >
            Ready to take your content creation to the next level?
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            paragraph
            sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}
          >
            Join thousands of creators who trust NexusCore for their community management needs.
          </Typography>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ px: 6, py: 2 }}
            >
              Start Your Free Trial
            </Button>
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
};

export default LandingPage; 