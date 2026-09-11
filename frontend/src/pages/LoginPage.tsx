import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import { useAuth } from '../hooks/useAuth.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await login({ email: email.trim(), password });
      if (from && from !== '/') {
        navigate(from, { replace: true });
      } else {
        const isStudent = email.toLowerCase().includes('student');
        navigate(isStudent ? '/student/dashboard' : '/admin/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Login failed. Please verify credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <Box sx={{ maxWidth: 460, mx: 'auto', mt: { xs: 2, md: 4 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'primary.light',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5,
              }}
            >
              <LockOutlinedIcon />
            </Box>
            <Typography variant="h5" fontWeight={800} letterSpacing="-0.02em">
              Platform Authentication
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access your role-authorized workspace
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" variant="outlined" sx={{ mb: 3, backgroundColor: 'rgba(239, 68, 68, 0.08)' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="login-email"
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              sx={{ mb: 2.5 }}
              placeholder="user@placement.edu"
              autoComplete="email"
            />

            <TextField
              id="login-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              sx={{ mb: 3 }}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              id="login-submit-btn"
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ py: 1.3, fontWeight: 700 }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Quick Demo Credentials */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5, fontWeight: 600 }}>
              <SecurityIcon fontSize="inherit" /> QUICK DEMO PRESETS (PHASE 2)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label="Super Admin"
                size="small"
                color="primary"
                variant="outlined"
                clickable
                onClick={() => fillDemoAccount('superadmin@placement.edu', 'SuperAdmin@123')}
              />
              <Chip
                label="Placement Admin"
                size="small"
                color="secondary"
                variant="outlined"
                clickable
                onClick={() => fillDemoAccount('placementadmin@placement.edu', 'PlacementAdmin@123')}
              />
              <Chip
                label="Student"
                size="small"
                color="success"
                variant="outlined"
                clickable
                onClick={() => fillDemoAccount('student@placement.edu', 'Student@123')}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
