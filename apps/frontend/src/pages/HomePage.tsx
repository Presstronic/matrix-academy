/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import CodeIcon from '@mui/icons-material/Code';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function HomePage() {
  return (
    <Box>
      {/* Hero Section */}
      <Box
        component="section"
        aria-labelledby="hero-heading"
        sx={{
          minHeight: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 70px)' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Typography
              id="hero-heading"
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
                mb: 2,
              }}
            >
              Welcome to Matrix Academy
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                maxWidth: '800px',
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                textShadow: '0 0 5px rgba(0, 255, 65, 0.3)',
                mb: 2,
              }}
            >
              Master the digital realm. Learn to code, collaborate, and create the future.
            </Typography>

            <Box
              sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap', justifyContent: 'center' }}
            >
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Get Started
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 1.5 }}
              >
                Login
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        component="section"
        aria-labelledby="features-heading"
        sx={{
          py: 8,
          bgcolor: 'rgba(0, 0, 0, 0.3)',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            id="features-heading"
            variant="h2"
            component="h2"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
            }}
          >
            Why Choose Matrix Academy?
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <SchoolIcon
                  sx={{
                    fontSize: 60,
                    color: 'primary.main',
                    mb: 2,
                    filter: 'drop-shadow(0 0 10px rgba(0, 255, 65, 0.5))',
                  }}
                  aria-hidden="true"
                />
                <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                  Expert-Led Learning
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Learn from industry professionals with real-world experience in cutting-edge
                  technologies.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <CodeIcon
                  sx={{
                    fontSize: 60,
                    color: 'primary.main',
                    mb: 2,
                    filter: 'drop-shadow(0 0 10px rgba(0, 255, 65, 0.5))',
                  }}
                  aria-hidden="true"
                />
                <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                  Hands-On Projects
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Build real applications and portfolios with interactive coding challenges and
                  projects.
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <GroupsIcon
                  sx={{
                    fontSize: 60,
                    color: 'primary.main',
                    mb: 2,
                    filter: 'drop-shadow(0 0 10px rgba(0, 255, 65, 0.5))',
                  }}
                  aria-hidden="true"
                />
                <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                  Community Support
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Join a vibrant community of learners and get help when you need it.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box
        component="section"
        aria-labelledby="cta-heading"
        sx={{
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            id="cta-heading"
            variant="h2"
            component="h2"
            sx={{
              mb: 3,
              fontSize: { xs: '1.75rem', sm: '2.5rem' },
            }}
          >
            Ready to Begin Your Journey?
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              mb: 4,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Join thousands of students learning to master technology and build the future.
          </Typography>

          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            color="primary"
            size="large"
            sx={{ px: 6, py: 2 }}
          >
            Start Learning Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
