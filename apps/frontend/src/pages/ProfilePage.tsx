/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Profile page component
 */
import { Box, Container, Paper, Typography } from '@mui/material';

import { ChangePasswordSection } from '@/components/profile/ChangePasswordSection';
import { EditProfileSection } from '@/components/profile/EditProfileSection';
import { ProfilePictureUpload } from '@/components/profile/ProfilePictureUpload';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const firstName = user.firstName ?? '';
  const lastName = user.lastName ?? '';

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontFamily: 'monospace',
            color: 'primary.main',
            textShadow: '0 0 10px rgba(0, 255, 65, 0.5)',
          }}
        >
          My Profile
        </Typography>

        {/* Profile Information */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 3,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'primary.dark',
            boxShadow: '0 0 15px rgba(0, 255, 65, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 4, gap: 3 }}>
            <Box sx={{ flexShrink: 0 }}>
              <ProfilePictureUpload size={120} />
            </Box>

            <Box sx={{ flex: 1, pt: 1 }}>
              <Typography variant="h4" sx={{ fontFamily: 'monospace' }}>
                {firstName} {lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {user.email}
              </Typography>
              {user.username && (
                <Typography variant="body2" color="text.disabled">
                  @{user.username}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography
              variant="caption"
              component="div"
              sx={{
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: 1,
                mb: 0.5,
                fontWeight: 'bold',
              }}
            >
              First Name
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {firstName !== '' ? firstName : 'Not set'}
            </Typography>

            <Typography
              variant="caption"
              component="div"
              sx={{
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: 1,
                mb: 0.5,
                fontWeight: 'bold',
              }}
            >
              Last Name
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {lastName !== '' ? lastName : 'Not set'}
            </Typography>

            <Typography
              variant="caption"
              component="div"
              sx={{
                color: 'primary.main',
                textTransform: 'uppercase',
                letterSpacing: 1,
                mb: 0.5,
                fontWeight: 'bold',
              }}
            >
              Email Address
            </Typography>
            <Typography variant="body1">{user.email}</Typography>
          </Box>
        </Paper>

        {/* Edit Profile Section */}
        <EditProfileSection />

        {/* Change Password Section */}
        <ChangePasswordSection />
      </Box>
    </Container>
  );
}
