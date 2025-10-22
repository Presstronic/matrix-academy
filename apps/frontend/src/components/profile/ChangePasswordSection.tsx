/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Change Password Section Component
 */
import {
  Check as CheckIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import type { FC, FormEvent } from 'react';
import { useState } from 'react';

import { AuthenticationError } from '../../lib/api/errors';
import { changePassword } from '../../lib/api/services/auth.service';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const ChangePasswordSection: FC = () => {
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleFieldChange =
    (field: keyof PasswordFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const validationErrors: string[] = [];

    if (password.length < 8) {
      validationErrors.push('At least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      validationErrors.push('One uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      validationErrors.push('One lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      validationErrors.push('One number');
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      validationErrors.push('One special character');
    }

    return { valid: validationErrors.length === 0, errors: validationErrors };
  };

  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 10;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const validateForm = (): boolean => {
    const newErrors: PasswordErrors = {};

    // Current password validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else {
      const validation = validatePassword(formData.newPassword);
      if (!validation.valid) {
        newErrors.newPassword = `Password must contain: ${validation.errors.join(', ')}`;
      }

      // Check if new password is same as current
      if (formData.newPassword === formData.currentPassword) {
        newErrors.newPassword = 'New password must be different from current password';
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setSubmitSuccess(true);

      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      if (err instanceof AuthenticationError) {
        setErrors({ currentPassword: 'Current password is incorrect' });
        setSubmitError('Current password is incorrect');
      } else {
        const message = err instanceof Error ? err.message : 'Failed to change password';
        setSubmitError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);
  const strengthColor =
    passwordStrength < 40 ? 'error' : passwordStrength < 70 ? 'warning' : 'success';
  const strengthLabel =
    passwordStrength < 40 ? 'Weak' : passwordStrength < 70 ? 'Medium' : 'Strong';

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
        <LockIcon sx={{ color: 'primary.main', mr: 2 }} />
        <Typography
          variant="h5"
          sx={{
            fontFamily: 'monospace',
            color: 'primary.main',
          }}
        >
          Change Password
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
          Password changed successfully! Your account is now more secure.
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
        {/* Current Password */}
        <TextField
          label="Current Password"
          type={showPasswords.current ? 'text' : 'password'}
          value={formData.currentPassword}
          onChange={handleFieldChange('currentPassword')}
          error={Boolean(errors.currentPassword)}
          helperText={errors.currentPassword}
          required
          fullWidth
          disabled={isSubmitting}
          sx={{ mb: 3 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => togglePasswordVisibility('current')}
                  edge="end"
                  size="small"
                >
                  {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* New Password */}
        <TextField
          label="New Password"
          type={showPasswords.new ? 'text' : 'password'}
          value={formData.newPassword}
          onChange={handleFieldChange('newPassword')}
          error={Boolean(errors.newPassword)}
          helperText={errors.newPassword}
          required
          fullWidth
          disabled={isSubmitting}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => togglePasswordVisibility('new')} edge="end" size="small">
                  {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Password Strength Indicator */}
        {formData.newPassword && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Password Strength:
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: `${strengthColor}.main`,
                  fontWeight: 'bold',
                }}
              >
                {strengthLabel}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={passwordStrength}
              color={strengthColor}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />

            {/* Password Requirements Checklist */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Password must contain:
              </Typography>
              {[
                { label: 'At least 8 characters', test: formData.newPassword.length >= 8 },
                { label: 'One uppercase letter', test: /[A-Z]/.test(formData.newPassword) },
                { label: 'One lowercase letter', test: /[a-z]/.test(formData.newPassword) },
                { label: 'One number', test: /[0-9]/.test(formData.newPassword) },
                {
                  label: 'One special character',
                  test: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.newPassword),
                },
              ].map((req, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: req.test ? 'success.main' : 'text.disabled',
                    fontSize: '0.75rem',
                  }}
                >
                  <CheckIcon sx={{ fontSize: 16, mr: 1 }} />
                  {req.label}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Confirm Password */}
        <TextField
          label="Confirm New Password"
          type={showPasswords.confirm ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleFieldChange('confirmPassword')}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword}
          required
          fullWidth
          disabled={isSubmitting}
          sx={{ mb: 3 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => togglePasswordVisibility('confirm')}
                  edge="end"
                  size="small"
                >
                  {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
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
          {isSubmitting ? 'Changing Password...' : 'Change Password'}
        </Button>
      </Box>
    </Paper>
  );
};
