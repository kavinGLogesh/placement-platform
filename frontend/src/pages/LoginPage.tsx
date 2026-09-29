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
  FormControlLabel,
  Checkbox,
  Container,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonIcon from '@mui/icons-material/Person';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../hooks/useAuth.js';

type RoleTab = 'STUDENT' | 'PLACEMENT_ADMIN' | 'SUPER_ADMIN';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('student@placement.edu');
  const [password, setPassword] = useState('Student@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<RoleTab>('STUDENT');
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleRoleSelect = (role: RoleTab) => {
    setActiveRole(role);
    setError(null);
    setForgotPasswordNotice(false);

    if (role === 'STUDENT') {
      setEmail('student@placement.edu');
      setPassword('Student@123');
    } else if (role === 'PLACEMENT_ADMIN') {
      setEmail('placementadmin@placement.edu');
      setPassword('PlacementAdmin@123');
    } else if (role === 'SUPER_ADMIN') {
      setEmail('superadmin@placement.edu');
      setPassword('SuperAdmin@123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const loggedInUser = await login({ email: email.trim(), password });
      if (loggedInUser.role === 'STUDENT' && loggedInUser.mustChangePassword) {
        navigate('/student/change-password', { replace: true });
      } else if (from && from !== '/') {
        navigate(from, { replace: true });
      } else {
        navigate(loggedInUser.role === 'STUDENT' ? '/student/dashboard' : '/admin/dashboard', {
          replace: true,
        });
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : 'Invalid credentials. Please verify your email and password.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        py: { xs: 4, sm: 6 },
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Institutional Branding Header */}
        <Box sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: '#0f3674',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
              boxShadow: '0 2px 4px rgba(15, 54, 116, 0.2)',
            }}
          >
            <SchoolIcon sx={{ fontSize: 26 }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            VET Institute of Arts and Science
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
            Career Readiness & Campus Placement Examination Portal
          </Typography>
        </Box>

        {/* Primary Login Card */}
        <Card
          sx={{
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          }}
        >
          {/* Card Top Border Accent */}
          <Box sx={{ height: 3, bgcolor: '#0f3674', width: '100%' }} />

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color="#0f172a">
                Sign In to Your Account
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.825rem' }}>
                Select your institutional role to continue
              </Typography>
            </Box>

            {/* Role Selection Segmented Buttons */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1,
                mb: 3,
                p: 0.5,
                bgcolor: '#f1f5f9',
                borderRadius: 1.5,
                border: '1px solid #e2e8f0',
              }}
            >
              <Button
                size="small"
                onClick={() => handleRoleSelect('STUDENT')}
                startIcon={<PersonIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: activeRole === 'STUDENT' ? 700 : 500,
                  fontSize: '0.8rem',
                  py: 0.75,
                  bgcolor: activeRole === 'STUDENT' ? '#0f3674' : 'transparent',
                  color: activeRole === 'STUDENT' ? '#ffffff' : '#475569',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: activeRole === 'STUDENT' ? '#0a2550' : '#e2e8f0',
                  },
                }}
              >
                Student
              </Button>

              <Button
                size="small"
                onClick={() => handleRoleSelect('PLACEMENT_ADMIN')}
                startIcon={<PeopleAltOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: activeRole === 'PLACEMENT_ADMIN' ? 700 : 500,
                  fontSize: '0.8rem',
                  py: 0.75,
                  bgcolor: activeRole === 'PLACEMENT_ADMIN' ? '#0f3674' : 'transparent',
                  color: activeRole === 'PLACEMENT_ADMIN' ? '#ffffff' : '#475569',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: activeRole === 'PLACEMENT_ADMIN' ? '#0a2550' : '#e2e8f0',
                  },
                }}
              >
                Placement Admin
              </Button>

              <Button
                size="small"
                onClick={() => handleRoleSelect('SUPER_ADMIN')}
                startIcon={<ShieldOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: activeRole === 'SUPER_ADMIN' ? 700 : 500,
                  fontSize: '0.8rem',
                  py: 0.75,
                  bgcolor: activeRole === 'SUPER_ADMIN' ? '#0f3674' : 'transparent',
                  color: activeRole === 'SUPER_ADMIN' ? '#ffffff' : '#475569',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: activeRole === 'SUPER_ADMIN' ? '#0a2550' : '#e2e8f0',
                  },
                }}
              >
                Super Admin
              </Button>
            </Box>

            {/* Error Notification */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2.5,
                  bgcolor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '0.82rem',
                }}
              >
                {error}
              </Alert>
            )}

            {/* Password Notice */}
            {forgotPasswordNotice && (
              <Alert
                severity="info"
                sx={{
                  mb: 2.5,
                  bgcolor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  color: '#0369a1',
                  fontSize: '0.82rem',
                }}
                onClose={() => setForgotPasswordNotice(false)}
              >
                For password reset requests, please contact the Placement Cell Administrator at{' '}
                <strong>placement@vetias.edu</strong> or your department coordinator.
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Box sx={{ mb: 2 }}>
                <Typography
                  component="label"
                  variant="caption"
                  sx={{ display: 'block', mb: 0.75, fontWeight: 600, color: '#334155' }}
                >
                  Institutional Email
                </Typography>
                <TextField
                  fullWidth
                  id="email"
                  type="email"
                  placeholder="e.g. yourname@placement.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 42,
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                  <Typography
                    component="label"
                    variant="caption"
                    sx={{ fontWeight: 600, color: '#334155' }}
                  >
                    Password
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setForgotPasswordNotice(true)}
                    sx={{
                      p: 0,
                      minWidth: 'auto',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: '#0f3674',
                      textTransform: 'none',
                    }}
                  >
                    Forgot Password?
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#94a3b8' }}
                        >
                          {showPassword ? (
                            <VisibilityOffOutlinedIcon fontSize="small" />
                          ) : (
                            <VisibilityOutlinedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 42,
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 3,
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      size="small"
                      sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#0f3674' } }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#475569' }}>
                      Keep me signed in
                    </Typography>
                  }
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  height: 42,
                  bgcolor: '#0f3674',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#0a2550' },
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Sign In to Portal'
                )}
              </Button>
            </Box>

            <Divider sx={{ my: 3, borderColor: '#f1f5f9' }} />

            {/* Quick Demo Preset Chips for Easy Evaluation */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="caption"
                sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 1.25 }}
              >
                Quick Evaluation Presets:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip
                  label="Student"
                  size="small"
                  clickable
                  onClick={() => handleRoleSelect('STUDENT')}
                  variant={activeRole === 'STUDENT' ? 'filled' : 'outlined'}
                  color={activeRole === 'STUDENT' ? 'primary' : 'default'}
                  sx={{ fontSize: '0.72rem', height: 24, fontWeight: 600 }}
                />
                <Chip
                  label="Placement Admin"
                  size="small"
                  clickable
                  onClick={() => handleRoleSelect('PLACEMENT_ADMIN')}
                  variant={activeRole === 'PLACEMENT_ADMIN' ? 'filled' : 'outlined'}
                  color={activeRole === 'PLACEMENT_ADMIN' ? 'primary' : 'default'}
                  sx={{ fontSize: '0.72rem', height: 24, fontWeight: 600 }}
                />
                <Chip
                  label="Super Admin"
                  size="small"
                  clickable
                  onClick={() => handleRoleSelect('SUPER_ADMIN')}
                  variant={activeRole === 'SUPER_ADMIN' ? 'filled' : 'outlined'}
                  color={activeRole === 'SUPER_ADMIN' ? 'primary' : 'default'}
                  sx={{ fontSize: '0.72rem', height: 24, fontWeight: 600 }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Institutional Footer */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 14, color: '#059669' }} />
            Secure Enterprise Authentication • FERPA & ISO 27001 Security Standards
          </Typography>
          <Typography variant="caption" sx={{ color: '#cbd5e1', display: 'block', mt: 0.5 }}>
            © {new Date().getFullYear()} VET Institute of Arts and Science. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
