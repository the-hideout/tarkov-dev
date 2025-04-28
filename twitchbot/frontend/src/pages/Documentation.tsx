import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Documentation: React.FC = () => (
  <Container maxWidth="md" sx={{ py: 10 }}>
    <Box textAlign="center">
      <Typography variant="h2" gutterBottom>Documentation</Typography>
      <Typography variant="h5" color="text.secondary">This page is coming soon!</Typography>
    </Box>
  </Container>
);

export default Documentation; 