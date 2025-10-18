/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

export function AppHeader() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  return (
    <AppBar position="sticky" component="header">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo / Brand */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
              flexGrow: { xs: 1, md: 0 },
            }}
          >
            <Typography
              variant="h6"
              component="h1"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: { xs: '1.2rem', sm: '1.5rem' },
                color: 'primary.main',
                textShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
                letterSpacing: '.1rem',
              }}
            >
              MATRIX ACADEMY
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {user ? (
                <>
                  <Button component={RouterLink} to="/dashboard" color="inherit" sx={{ my: 2 }}>
                    Dashboard
                  </Button>
                  <Button
                    onClick={() => void handleLogout()}
                    variant="outlined"
                    color="primary"
                    sx={{ my: 2 }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button component={RouterLink} to="/login" color="inherit" sx={{ my: 2 }}>
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    color="primary"
                    sx={{ my: 2 }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <Box>
              <IconButton
                size="large"
                aria-label="navigation menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                {user
                  ? [
                      <MenuItem
                        key="dashboard"
                        component={RouterLink}
                        to="/dashboard"
                        onClick={handleMenuClose}
                      >
                        Dashboard
                      </MenuItem>,
                      <MenuItem key="logout" onClick={() => void handleLogout()}>
                        Logout
                      </MenuItem>,
                    ]
                  : [
                      <MenuItem
                        key="login"
                        component={RouterLink}
                        to="/login"
                        onClick={handleMenuClose}
                      >
                        Login
                      </MenuItem>,
                      <MenuItem
                        key="register"
                        component={RouterLink}
                        to="/register"
                        onClick={handleMenuClose}
                      >
                        Register
                      </MenuItem>,
                    ]}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
