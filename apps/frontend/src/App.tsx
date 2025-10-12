/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  const asciiArt = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║    ███╗   ███╗ █████╗ ████████╗██████╗ ██╗██╗  ██╗            ║
║    ████╗ ████║██╔══██╗╚══██╔══╝██╔══██╗██║╚██╗██╔╝            ║
║    ██╔████╔██║███████║   ██║   ██████╔╝██║ ╚███╔╝             ║
║    ██║╚██╔╝██║██╔══██║   ██║   ██╔══██╗██║ ██╔██╗             ║
║    ██║ ╚═╝ ██║██║  ██║   ██║   ██║  ██║██║██╔╝ ██╗            ║
║    ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝            ║
║                                                               ║
║      ▄▀█ █▀▀ ▄▀█ █▀▄ █▀▀ █▀▄▀█ █▄█                            ║
║      █▀█ █▄▄ █▀█ █▄▀ ██▄ █ ▀ █  █                             ║
║                                                               ║
║                                                               ║
║                      The Matrix Has You...  (\\(\\              ║
║                                             ( -.-)            ║
║                                             o_(")(")          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#0d0d0d',
        background: 'linear-gradient(to bottom, #000000, #0a0e0a)',
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
          gap: 4,
          py: 4,
          width: '100%',
          maxWidth: '100%',
        }}
      >
        <Box
          component="pre"
          sx={{
            fontFamily: 'Courier New, monospace',
            fontSize: { xs: '0.4rem', sm: '0.6rem', md: '0.85rem', lg: '1rem' },
            color: '#00ff41',
            textShadow: '0 0 10px #00ff41',
            lineHeight: 1.2,
            margin: 0,
            whiteSpace: 'pre',
            overflowX: 'auto',
          }}
        >
          {asciiArt}
        </Box>

        <Typography
          variant="h5"
          sx={{
            color: '#00ff41',
            textShadow: '0 0 10px #00ff41',
            fontFamily: 'monospace',
            mt: 2,
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
          }}
        >
          React 18 + TypeScript + Vite + Material-UI
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => setCount((count) => count + 1)}
          sx={{
            bgcolor: '#003b00',
            color: '#00ff41',
            border: '2px solid #00ff41',
            fontFamily: 'monospace',
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            fontWeight: 'bold',
            px: { xs: 3, sm: 4, md: 5 },
            py: { xs: 1.5, sm: 2 },
            '&:hover': {
              bgcolor: '#005000',
              boxShadow: '0 0 20px #00ff41',
            },
          }}
        >
          Follow the White Rabbit: {count}
        </Button>

        <Typography
          variant="caption"
          sx={{
            color: '#00ff41',
            opacity: 0.6,
            fontFamily: 'monospace',
            fontSize: { xs: '0.75rem', sm: '0.85rem', md: '1rem' },
            mt: 2,
          }}
        >
          Edit src/App.tsx and save to test HMR
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
