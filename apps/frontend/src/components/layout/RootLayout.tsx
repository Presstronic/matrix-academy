/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

export function RootLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#0d0d0d',
        background: 'linear-gradient(to bottom, #000000, #0a0e0a)',
      }}
    >
      <Outlet />
    </Box>
  );
}
