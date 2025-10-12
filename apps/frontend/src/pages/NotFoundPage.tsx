/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
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
          variant="h1"
          sx={{
            color: '#00ff41',
            textShadow: '0 0 10px #00ff41',
            fontFamily: 'monospace',
            fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
            fontWeight: 'bold',
          }}
        >
          404
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: '#00ff41',
            textShadow: '0 0 10px #00ff41',
            fontFamily: 'monospace',
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
            textAlign: 'center',
          }}
        >
          Page Not Found
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: '#00ff41',
            opacity: 0.8,
            fontFamily: 'monospace',
            fontSize: { xs: '0.85rem', sm: '1rem' },
            textAlign: 'center',
            maxWidth: '500px',
          }}
        >
          The page you are looking for does not exist or has been moved.
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
