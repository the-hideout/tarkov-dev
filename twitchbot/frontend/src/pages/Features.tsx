import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Features: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 10 }}>
    <Box textAlign="center">
      <Typography variant="h2" gutterBottom>Features</Typography>
      <Typography variant="h5" color="text.secondary">This page is coming soon!</Typography>
    </Box>
  </Container>
);

export default Features; 