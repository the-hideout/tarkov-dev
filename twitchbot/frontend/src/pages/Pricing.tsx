import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Pricing: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 10 }}>
    <Box textAlign="center">
      <Typography variant="h2" gutterBottom>Pricing</Typography>
      <Typography variant="h5" color="text.secondary">This page is coming soon!</Typography>
    </Box>
  </Container>
);

export default Pricing; 