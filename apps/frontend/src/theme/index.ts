/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { createTheme } from '@mui/material/styles';

// Matrix Academy theme with green color scheme
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00ff41', // Matrix green
      light: '#33ff66',
      dark: '#00cc34',
      contrastText: '#000000',
    },
    secondary: {
      main: '#003b00', // Dark green
      light: '#005000',
      dark: '#002400',
      contrastText: '#00ff41',
    },
    background: {
      default: '#0a0e0a',
      paper: '#0d1a0d',
    },
    text: {
      primary: '#00ff41',
      secondary: '#00cc34',
    },
    error: {
      main: '#ff4444',
    },
    success: {
      main: '#00ff41',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: 'monospace',
      fontWeight: 700,
      fontSize: '3rem',
      textShadow: '0 0 10px #00ff41',
    },
    h2: {
      fontFamily: 'monospace',
      fontWeight: 600,
      fontSize: '2.5rem',
      textShadow: '0 0 8px #00ff41',
    },
    h3: {
      fontFamily: 'monospace',
      fontWeight: 600,
      fontSize: '2rem',
    },
    h4: {
      fontFamily: 'monospace',
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    h5: {
      fontFamily: 'monospace',
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h6: {
      fontFamily: 'monospace',
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontFamily: 'monospace',
      fontWeight: 600,
      textTransform: 'uppercase',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)',
          '&:hover': {
            boxShadow: '0 0 20px rgba(0, 255, 65, 0.5)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#00cc34',
            },
            '&:hover fieldset': {
              borderColor: '#00ff41',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00ff41',
              boxShadow: '0 0 8px rgba(0, 255, 65, 0.3)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 10px rgba(0, 255, 65, 0.1)',
        },
      },
    },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
});
