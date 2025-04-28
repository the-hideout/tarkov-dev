import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const botCommandSchema = Yup.object().shape({
  name: Yup.string()
    .matches(/^[!$][\w-]+$/, 'Command must start with ! or $ and contain only letters, numbers, and dashes')
    .required('Command name is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters')
    .required('Description is required'),
  cooldown: Yup.number()
    .min(0, 'Cooldown cannot be negative')
    .max(3600, 'Cooldown cannot be more than 1 hour')
    .required('Cooldown is required'),
  userLevel: Yup.string()
    .oneOf(['everyone', 'subscriber', 'moderator', 'broadcaster'], 'Invalid user level')
    .required('User level is required'),
});

export const twitchSettingsSchema = Yup.object().shape({
  username: Yup.string()
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Bot username is required'),
  channel: Yup.string()
    .matches(/^[a-zA-Z0-9_]+$/, 'Channel name can only contain letters, numbers, and underscores')
    .required('Channel name is required'),
});

export const discordSettingsSchema = Yup.object().shape({
  serverId: Yup.string()
    .matches(/^\d+$/, 'Server ID must be a valid Discord server ID')
    .required('Server ID is required'),
  permissions: Yup.object().shape({
    manageMessages: Yup.boolean(),
    manageRoles: Yup.boolean(),
    kickMembers: Yup.boolean(),
    banMembers: Yup.boolean(),
  }),
});

export const chatSettingsSchema = Yup.object({
  slowMode: Yup.boolean().defined(),
  slowModeDelay: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .when('slowMode', {
      is: true,
      then: () => Yup.number()
        .min(1, 'Delay must be at least 1 second')
        .max(120, 'Delay cannot be more than 120 seconds')
        .required('Delay is required when slow mode is enabled'),
      otherwise: () => Yup.number().optional()
    }),
  subscriberOnly: Yup.boolean().defined(),
  emoteOnly: Yup.boolean().defined(),
});

export const profileSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .notOneOf([Yup.ref('currentPassword')], 'New password must be different from current password')
    .required('New password is required'),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
}); 