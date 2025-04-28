import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Link,
  Paper,
  Alert,
} from '@mui/material';
import { Formik, Form } from 'formik';
import { useAppDispatch, useAppSelector } from '../hooks';
import { register } from '../store/slices/authSlice';
import { LoadingSpinner, FormField } from '../components';
import { registerSchema } from '../utils/validationSchemas';

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialValues: RegisterFormValues = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (values: RegisterFormValues) => {
    try {
      const { confirmPassword, ...registerData } = values;
      await dispatch(register(registerData)).unwrap();
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the auth slice
    }
  };

  if (loading) {
    return <LoadingSpinner message="Creating account..." />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 8,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          Create your NexusCore account
        </Typography>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}
        <Formik
          initialValues={initialValues}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form style={{ width: '100%' }}>
              <FormField
                fieldType="text"
                name="username"
                label="Username"
                helperText="Choose a unique username"
              />
              <FormField
                fieldType="text"
                name="email"
                label="Email Address"
                type="email"
                helperText="Enter your email address"
              />
              <FormField
                fieldType="text"
                name="password"
                label="Password"
                type="password"
                helperText="Password must be at least 8 characters long and include uppercase, lowercase, and numbers"
              />
              <FormField
                fieldType="text"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                helperText="Re-enter your password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isSubmitting || loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default RegisterPage; 