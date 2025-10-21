/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { UserAvatar } from '@/components/user/UserAvatar';
import { useAuth } from '@/hooks/useAuth';

export function AppHeader() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    handleMobileMenuClose();
    await logout();
  };

  const userFullName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    : '';

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
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer',
                    py: 1,
                    px: 2,
                    borderRadius: 1,
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(0, 255, 65, 0.1)',
                    },
                  }}
                  onClick={handleUserMenuOpen}
                  role="button"
                  aria-label="User menu"
                  aria-haspopup="true"
                  aria-expanded={Boolean(userMenuAnchor)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleUserMenuOpen(e as unknown as React.MouseEvent<HTMLElement>);
                    }
                  }}
                >
                  <UserAvatar
                    avatar={user.avatar}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    size="medium"
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.primary',
                      fontWeight: 500,
                    }}
                  >
                    {userFullName}
                  </Typography>
                </Box>
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

          {/* User Menu (Desktop) */}
          {user && (
            <Menu
              id="user-menu"
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              sx={{ mt: 1 }}
            >
              <MenuItem component={RouterLink} to="/dashboard" onClick={handleUserMenuClose}>
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                Dashboard
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => void handleLogout()}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <Box>
              <IconButton
                size="large"
                aria-label="navigation menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMobileMenuOpen}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={mobileMenuAnchor}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(mobileMenuAnchor)}
                onClose={handleMobileMenuClose}
              >
                {user
                  ? [
                      <MenuItem
                        key="dashboard"
                        component={RouterLink}
                        to="/dashboard"
                        onClick={handleMobileMenuClose}
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
                        onClick={handleMobileMenuClose}
                      >
                        Login
                      </MenuItem>,
                      <MenuItem
                        key="register"
                        component={RouterLink}
                        to="/register"
                        onClick={handleMobileMenuClose}
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
