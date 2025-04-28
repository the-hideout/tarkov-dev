import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Link,
  useTheme,
  useMediaQuery,
  Theme,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CardActions,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  SmartToy as BotIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const HeroSection = styled(Box)(({ theme }: { theme: Theme }) => ({
  minHeight: '80vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  color: theme.palette.common.white,
}));

const FeatureCard = styled(Card)(({ theme }: { theme: Theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const PricingCard = styled(Card)(({ theme }: { theme: Theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'center',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

interface Feature {
  title: string;
  description: string;
}

interface PricingTier {
  title: string;
  price: string;
  features: string[];
  buttonText: string;
}

const features: Feature[] = [
  {
    title: 'Real-time Analytics',
    description: 'Track your stream performance and engagement metrics in real-time.',
  },
  {
    title: 'Bot Management',
    description: 'Manage your Twitch and Discord bots from a single dashboard.',
  },
  {
    title: 'Advanced Analytics',
    description: 'Deep insights into your community growth and engagement.',
  },
  {
    title: 'Secure Integration',
    description: 'Safe and secure integration with Twitch and Discord platforms.',
  },
];

const pricingTiers: PricingTier[] = [
  {
    title: 'Free',
    price: '$0',
    features: ['Basic bot features', 'Limited analytics', 'Community support'],
    buttonText: 'Get Started',
  },
  {
    title: 'Pro',
    price: '$9.99',
    features: ['Advanced bot features', 'Full analytics', 'Priority support', 'Custom commands'],
    buttonText: 'Try Pro',
  },
  {
    title: 'Enterprise',
    price: 'Custom',
    features: ['Custom solutions', '24/7 support', 'API access', 'Dedicated account manager'],
    buttonText: 'Contact Us',
  },
];

const Landing: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      {/* Hero Section */}
      <HeroSection
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
          borderRadius: 2,
          mb: 4,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            NexusCore
          </Typography>
          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            paragraph
          >
            The ultimate platform for managing your Twitch and Discord communities.
            Powerful analytics, bot management, and automation tools in one place.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
            >
              Get Started
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              size="large"
            >
              Login
            </Button>
          </Box>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Container sx={{ py: 8 }} maxWidth="md">
        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item key={feature.title} xs={12} sm={6} md={3}>
              <FeatureCard
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 2,
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.title === 'Real-time Analytics' && <SpeedIcon sx={{ fontSize: 40 }} />}
                  {feature.title === 'Bot Management' && <BotIcon sx={{ fontSize: 40 }} />}
                  {feature.title === 'Advanced Analytics' && <AnalyticsIcon sx={{ fontSize: 40 }} />}
                  {feature.title === 'Secure Integration' && <SecurityIcon sx={{ fontSize: 40 }} />}
                </Box>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Pricing Section */}
      <Container sx={{ py: 8 }} maxWidth="md">
        <Grid container spacing={4}>
          {pricingTiers.map((tier) => (
            <Grid item key={tier.title} xs={12} sm={6} md={4}>
              <PricingCard>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {tier.title}
                  </Typography>
                  <Typography variant="h4" component="p" gutterBottom>
                    {tier.price}
                  </Typography>
                  <List>
                    {tier.features.map((feature) => (
                      <ListItem key={feature}>
                        <ListItemIcon>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions sx={{ mt: 'auto', justifyContent: 'center', pb: 2 }}>
                  <Button variant="contained" color="primary">
                    {tier.buttonText}
                  </Button>
                </CardActions>
              </PricingCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to get started?
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Join thousands of streamers who are already using NexusCore to grow their communities.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            href="/register"
            sx={{ mt: 3 }}
          >
            Sign Up Now
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: 'background.paper',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {'© '}
            <Link color="inherit" href="https://github.com/NYOGamesCOM/NexusCore">
              NexusCore
            </Link>{' '}
            {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing; 