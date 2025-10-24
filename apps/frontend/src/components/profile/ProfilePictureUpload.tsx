/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * @file Profile picture upload component with drag-and-drop
 */
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { type FC, useCallback, useRef, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/lib/api';
import * as authService from '@/lib/api/services/auth.service';

interface ProfilePictureUploadProps {
  size?: number;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const ProfilePictureUpload: FC<ProfilePictureUploadProps> = ({ size = 150 }) => {
  const { user, setUser } = useAuth();
  const typedUser: User | null = user;
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload JPG, PNG, GIF, or WebP.',
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
      };
    }

    return { valid: true };
  };

  const createPreview = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;

    setError(null);

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    createPreview(file);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFileSelect(file);
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!preview || !fileInputRef.current?.files?.[0]) return;

    try {
      setIsUploading(true);
      setError(null);

      const file = fileInputRef.current.files[0];
      const formData = new FormData();
      formData.append('avatar', file);

      const updatedUser = await authService.uploadAvatar(formData);

      // Update AuthContext
      setUser(updatedUser);

      // Clear preview
      setPreview(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to upload image';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsUploading(true);
      setError(null);

      const updatedUser = await authService.removeAvatar();

      // Update AuthContext
      setUser(updatedUser);

      // Clear preview
      setPreview(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove image';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (!typedUser) {
    return null;
  }

  const currentAvatar = preview ?? typedUser.avatar;
  const userInitials = `${typedUser.firstName?.charAt(0) ?? ''}${typedUser.lastName?.charAt(0) ?? ''}`;
  const userFullName = `${typedUser.firstName ?? ''} ${typedUser.lastName ?? ''}`.trim() || 'User';

  return (
    <Box>
      <Paper
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          p: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'primary.dark',
          backgroundColor: isDragging ? 'rgba(0, 255, 65, 0.05)' : 'background.paper',
          boxShadow: isDragging
            ? '0 0 20px rgba(0, 255, 65, 0.2)'
            : '0 0 10px rgba(0, 255, 65, 0.1)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      >
        {/* Avatar Display */}
        <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
          <Avatar
            src={currentAvatar}
            alt={userFullName}
            sx={{
              width: size,
              height: size,
              border: '3px solid',
              borderColor: 'primary.main',
              boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
              fontSize: size / 3,
            }}
          >
            {!currentAvatar && userInitials}
          </Avatar>

          {isUploading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '50%',
              }}
            >
              <CircularProgress size={size / 3} sx={{ color: 'primary.main' }} />
            </Box>
          )}
        </Box>

        {/* Upload Instructions */}
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {isDragging ? 'Drop image here' : 'Click or drag image to upload'}
        </Typography>

        <Typography variant="caption" color="text.disabled" display="block">
          JPG, PNG, GIF, or WebP • Max 5MB
        </Typography>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid',
            borderColor: 'error.main',
          }}
        >
          {error}
        </Alert>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
        {preview ? (
          <>
            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={(e) => {
                e.stopPropagation();
                void handleUpload();
              }}
              disabled={isUploading}
              sx={{
                backgroundColor: 'primary.main',
                color: 'black',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  boxShadow: '0 0 15px rgba(0, 255, 65, 0.5)',
                },
              }}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>

            <Button
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelPreview();
              }}
              disabled={isUploading}
              sx={{
                borderColor: 'error.main',
                color: 'error.main',
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              startIcon={<PhotoCameraIcon />}
              onClick={handleClick}
              disabled={isUploading}
              sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.light',
                  backgroundColor: 'rgba(0, 255, 65, 0.1)',
                },
              }}
            >
              Choose File
            </Button>

            {typedUser.avatar && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  void handleRemove();
                }}
                disabled={isUploading}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 68, 68, 0.1)',
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};
