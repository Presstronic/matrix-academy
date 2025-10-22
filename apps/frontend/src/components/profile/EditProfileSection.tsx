/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Edit Profile Section Component
 */
import { Edit as EditIcon } from '@mui/icons-material';
import { Alert, Box, Button, Paper, TextField, Typography } from '@mui/material';
import type { FC, FormEvent } from 'react';
import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';

import { ValidationError } from '../../lib/api/errors';
import { updateProfile } from '../../lib/api/services/auth.service';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  bio: string;
}

interface ProfileErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  bio?: string;
}

export const EditProfileSection: FC = () => {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    username: user?.username ?? '',
    phoneNumber: user?.phoneNumber ?? '',
    bio: user?.bio ?? '',
  });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFieldChange =
    (field: keyof ProfileFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear errors for this field
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }

      if (submitError) {
        setSubmitError(null);
      }
    };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
    return usernameRegex.test(username);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: ProfileErrors = {};

    // First name validation
    if (formData.firstName && formData.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (formData.firstName && formData.firstName.length > 50) {
      newErrors.firstName = 'First name must be less than 50 characters';
    }

    // Last name validation
    if (formData.lastName && formData.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (formData.lastName && formData.lastName.length > 50) {
      newErrors.lastName = 'Last name must be less than 50 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Username validation
    if (formData.username && !validateUsername(formData.username)) {
      newErrors.username =
        'Username must be 3-50 characters (letters, numbers, underscore, hyphen)';
    }

    // Phone number validation
    if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    // Bio validation
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void handleSubmitAsync();
  };

  const handleSubmitAsync = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(false);

      // Only send fields that have changed
      const updates: Partial<ProfileFormData> = {};
      if (formData.firstName !== (user?.firstName ?? '')) updates.firstName = formData.firstName;
      if (formData.lastName !== (user?.lastName ?? '')) updates.lastName = formData.lastName;
      if (formData.email !== (user?.email ?? '')) updates.email = formData.email;
      if (formData.username !== (user?.username ?? '')) updates.username = formData.username;
      if (formData.phoneNumber !== (user?.phoneNumber ?? ''))
        updates.phoneNumber = formData.phoneNumber;
      if (formData.bio !== (user?.bio ?? '')) updates.bio = formData.bio;

      // Check if there are any changes
      if (Object.keys(updates).length === 0) {
        setSubmitError('No changes to save');
        return;
      }

      await updateProfile(updates);

      // Refresh user data from server
      await refreshUser();

      setSubmitSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      if (err instanceof ValidationError) {
        setSubmitError(err.message);
      } else {
        const message = err instanceof Error ? err.message : 'Failed to update profile';
        setSubmitError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <EditIcon sx={{ color: 'primary.main', mr: 2 }} />
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'monospace',
            color: 'primary.main',
          }}
        >
          Edit Profile
        </Typography>
      </Box>

      {submitSuccess && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            backgroundColor: 'rgba(0, 255, 65, 0.1)',
            border: '1px solid',
            borderColor: 'primary.main',
            color: 'primary.light',
          }}
        >
          Profile updated successfully!
        </Alert>
      )}

      {submitError && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid',
            borderColor: 'error.main',
            color: 'error.light',
          }}
        >
          {submitError}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {/* First Name */}
        <TextField
          label="First Name"
          value={formData.firstName}
          onChange={handleFieldChange('firstName')}
          error={Boolean(errors.firstName)}
          helperText={errors.firstName}
          fullWidth
          disabled={isSubmitting}
          sx={{ mb: 3 }}
          InputLabelProps={{
            sx: {
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.875rem',
            },
          }}
        />

        {/* Last Name */}
        <TextField
          label="Last Name"
          value={formData.lastName}
          onChange={handleFieldChange('lastName')}
          error={Boolean(errors.lastName)}
          helperText={errors.lastName}
          fullWidth
          disabled={isSubmitting}
          sx={{ mb: 3 }}
          InputLabelProps={{
            sx: {
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.875rem',
            },
          }}
        />

        {/* Email */}
        <TextField
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={handleFieldChange('email')}
          error={Boolean(errors.email)}
          helperText={errors.email}
          required
          fullWidth
          disabled={isSubmitting}
          sx={{ mb: 3 }}
          InputLabelProps={{
            sx: {
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.875rem',
            },
          }}
        />

        {/* Username */}
        <TextField
          label="Username"
          value={formData.username}
          onChange={handleFieldChange('username')}
          error={Boolean(errors.username)}
          helperText={errors.username ?? '3-50 characters (letters, numbers, underscore, hyphen)'}
          fullWidth
          disabled={isSubmitting}
          sx={{ mb: 3 }}
          InputLabelProps={{
            sx: {
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.875rem',
            },
          }}
        />

        {/* Phone Number */}
        <TextField
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={handleFieldChange('phoneNumber')}
          error={Boolean(errors.phoneNumber)}
          helperText={errors.phoneNumber ?? 'Optional (E.164 format, e.g., +1234567890)'}
          fullWidth
          disabled={isSubmitting}
          sx={{ mb: 3 }}
          InputLabelProps={{
            sx: {
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.875rem',
            },
          }}
        />

        {/* Bio */}
        <TextField
          label="Bio"
          value={formData.bio}
          onChange={handleFieldChange('bio')}
          error={Boolean(errors.bio)}
          helperText={errors.bio ?? `${formData.bio.length}/500 characters`}
          fullWidth
          multiline
          rows={4}
          disabled={isSubmitting}
          sx={{ mb: 3 }}
          InputLabelProps={{
            sx: {
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: '0.875rem',
            },
          }}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          sx={{
            backgroundColor: 'primary.main',
            color: 'black',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: 'primary.light',
              boxShadow: '0 0 15px rgba(0, 255, 65, 0.5)',
            },
            '&:disabled': {
              backgroundColor: 'primary.dark',
              color: 'text.disabled',
            },
          }}
        >
          {isSubmitting ? 'Saving Changes...' : 'Save Profile'}
        </Button>
      </Box>
    </Paper>
  );
};
