/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          py: 4,
          px: 2,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: '#00ff41',
            textShadow: '0 0 10px #00ff41',
            fontFamily: 'monospace',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            textAlign: 'center',
          }}
        >
          Dashboard
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#00ff41',
            opacity: 0.8,
            fontFamily: 'monospace',
            fontSize: { xs: '0.85rem', sm: '1rem' },
            textAlign: 'center',
            maxWidth: '600px',
          }}
        >
          This is a protected route. In a real application, you would need to be authenticated to
          access this page. The authentication system will be implemented in a future update.
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => {
            void navigate('/');
          }}
          sx={{
            bgcolor: '#003b00',
            color: '#00ff41',
            border: '2px solid #00ff41',
            fontFamily: 'monospace',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            fontWeight: 'bold',
            px: { xs: 3, sm: 4 },
            py: { xs: 1.5, sm: 2 },
            mt: 2,
            '&:hover': {
              bgcolor: '#005000',
              boxShadow: '0 0 20px #00ff41',
            },
          }}
        >
          Return to Home
        </Button>
      </Box>
    </Box>
  );
}
