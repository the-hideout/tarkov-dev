import React from 'react';
import { Box, Skeleton, Container, Paper } from '@mui/material';

const SuspenseFallback: React.FC = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header Skeleton */}
        <Skeleton variant="text" width="250px" height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="400px" height={24} sx={{ mb: 4 }} />

        {/* Content Skeleton */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          {[1, 2, 3, 4].map((item) => (
            <Paper
              key={item}
              sx={{
                flex: 1,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="60%" height={24} />
            </Paper>
          ))}
        </Box>

        {/* Main Content Skeleton */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 2 }}>
            <Paper sx={{ p: 2 }}>
              <Skeleton variant="text" width="200px" height={32} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="85%" />
            </Paper>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2 }}>
              <Skeleton variant="text" width="150px" height={32} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="90%" />
            </Paper>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default SuspenseFallback; 