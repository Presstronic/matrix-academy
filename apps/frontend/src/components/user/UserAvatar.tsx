/**
 * @file
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Avatar, type AvatarProps } from '@mui/material';

export interface UserAvatarProps extends Omit<AvatarProps, 'alt' | 'src'> {
  /** User's avatar URL */
  avatar?: string;
  /** User's first name for alt text */
  firstName?: string;
  /** User's last name for alt text */
  lastName?: string;
  /** Size of the avatar */
  size?: 'small' | 'medium' | 'large';
}

/**
 * Generates initials from first and last name
 */
function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0).toUpperCase() ?? '';
  const last = lastName?.charAt(0).toUpperCase() ?? '';
  return `${first}${last}`.trim();
}

/**
 * User avatar component with fallback to initials or default icon
 */
export function UserAvatar({
  avatar,
  firstName,
  lastName,
  size = 'medium',
  sx,
  ...props
}: UserAvatarProps) {
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User';
  const initials = getInitials(firstName, lastName);

  // Size mapping
  const sizeMap = {
    small: 32,
    medium: 40,
    large: 56,
  };

  const avatarSize = sizeMap[size];

  return (
    <Avatar
      alt={fullName}
      src={avatar}
      sx={{
        width: avatarSize,
        height: avatarSize,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        fontSize: size === 'small' ? '0.875rem' : size === 'medium' ? '1rem' : '1.25rem',
        fontWeight: 600,
        border: '2px solid',
        borderColor: 'primary.main',
        boxShadow: '0 0 10px rgba(0, 255, 65, 0.3)',
        ...sx,
      }}
      {...props}
    >
      {initials || <AccountCircleIcon fontSize={size} />}
    </Avatar>
  );
}
