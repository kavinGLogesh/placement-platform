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
  FormControlLabel,
  Checkbox,
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
import campusPhoto from '../assets/vetias-campus-bg.png';

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

  const roleButtonSx = (selected: boolean) => ({
    minWidth: 0,
    py: 1,
    px: { xs: 0.5, sm: 1 },
    borderRadius: 1,
    fontSize: { xs: '0.68rem', sm: '0.78rem' },
    fontWeight: selected ? 700 : 500,
    color: selected ? '#ffffff' : '#566663',
    bgcolor: selected ? '#176B66' : 'transparent',
    boxShadow: 'none',
    '&:hover': {
      bgcolor: selected ? '#104F4B' : '#DFE8E4',
      boxShadow: 'none',
    },
  });

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(390px, 0.92fr) minmax(500px, 1.08fr)' },
        bgcolor: '#F4F7F5',
      }}
    >
      <Box
        component="section"
        sx={{
          minHeight: { xs: 'auto', md: '100dvh' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: { xs: 3, md: 4 },
          px: { xs: 3, sm: 5, lg: 7 },
          py: { xs: 3, sm: 4, lg: 5 },
          color: '#ffffff',
          bgcolor: '#104F4B',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 1.5,
              color: '#104F4B',
              bgcolor: '#ffffff',
            }}
          >
            <SchoolIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography
              sx={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.2 }}
            >
              VET Institute of Arts and Science
            </Typography>
            <Typography sx={{ mt: 0.4, color: 'rgba(255,255,255,0.72)', fontSize: '0.72rem' }}>
              CAREER READINESS & CAMPUS PLACEMENTS
            </Typography>
          </Box>
        </Box>

        <Box sx={{ maxWidth: 560, my: { xs: 0, md: 'auto' } }}>
          <Typography
            variant="overline"
            sx={{ color: '#D9A276', fontWeight: 700, letterSpacing: '0.12em' }}
          >
            YOUR NEXT CHAPTER STARTS HERE
          </Typography>
          <Typography
            component="h1"
            sx={{
              mt: 1,
              mb: 2,
              maxWidth: 520,
              color: '#ffffff',
              fontSize: { xs: '1.8rem', sm: '2.15rem', lg: '2.8rem' },
              fontWeight: 750,
              lineHeight: 1.12,
            }}
          >
            Find your place in what comes next.
          </Typography>
          <Typography
            sx={{
              maxWidth: 480,
              color: 'rgba(255,255,255,0.78)',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              lineHeight: 1.75,
            }}
          >
            One campus for your assessments, placement opportunities, and professional growth.
          </Typography>
          <Box
            component="img"
            src={campusPhoto}
            alt="VET Institute campus"
            sx={{
              display: { xs: 'none', sm: 'block' },
              width: '100%',
              height: { sm: 150, lg: 215 },
              mt: { sm: 3, lg: 4 },
              objectFit: 'fill',
              objectPosition: 'center 55%',
              borderRadius: 1,
            }}
          />
        </Box>

        <Typography sx={{ color: 'rgba(255,255,255,0.62)', fontSize: '0.72rem' }}>
          © {new Date().getFullYear()} VET Institute of Arts and Science
        </Typography>
      </Box>

      <Box
        component="section"
        sx={{
          minHeight: { xs: 'auto', md: '100dvh' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 4, lg: 7 },
          py: { xs: 4, sm: 5 },
          // backgroundColor: '#0D3028',
          // backgroundImage:
          //   'linear-gradient(rgba(8, 35, 30, 0.38), rgba(8, 35, 30, 0.38)), url("/greenbg.png")',
          // backgroundSize: 'cover',
          // backgroundPosition: 'left',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 470,
            border: '1px solid #E5ECE8',
            borderRadius: '10px',
            boxShadow: '0 18px 50px rgba(32, 45, 43, 0.08)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Box sx={{ mb: 3.5 }}>
              <Typography
                component="h2"
                sx={{ color: '#202D2B', fontSize: '1.75rem', fontWeight: 750 }}
              >
                Welcome back
              </Typography>
              <Typography sx={{ mt: 0.75, color: '#71817E', fontSize: '0.9rem' }}>
                Sign in to your placement portal
              </Typography>
            </Box>

            <Typography
              variant="caption"
              sx={{ display: 'block', mb: 0.75, color: '#566663', fontWeight: 700 }}
            >
              SIGN IN AS
            </Typography>
            <Box
              role="group"
              aria-label="Choose account type"
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 0.5,
                mb: 3,
                p: 0.5,
                bgcolor: '#F4F7F5',
                border: '1px solid #DFE8E4',
                borderRadius: 1.5,
              }}
            >
              <Button
                size="small"
                onClick={() => handleRoleSelect('STUDENT')}
                startIcon={
                  <PersonIcon sx={{ display: { xs: 'none', sm: 'inline-flex' }, fontSize: 16 }} />
                }
                sx={roleButtonSx(activeRole === 'STUDENT')}
              >
                Student
              </Button>
              <Button
                size="small"
                onClick={() => handleRoleSelect('PLACEMENT_ADMIN')}
                startIcon={
                  <PeopleAltOutlinedIcon
                    sx={{ display: { xs: 'none', sm: 'inline-flex' }, fontSize: 16 }}
                  />
                }
                sx={roleButtonSx(activeRole === 'PLACEMENT_ADMIN')}
              >
                Placement Admin
              </Button>
              <Button
                size="small"
                onClick={() => handleRoleSelect('SUPER_ADMIN')}
                startIcon={
                  <ShieldOutlinedIcon
                    sx={{ display: { xs: 'none', sm: 'inline-flex' }, fontSize: 16 }}
                  />
                }
                sx={roleButtonSx(activeRole === 'SUPER_ADMIN')}
              >
                Super Admin
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, fontSize: '0.82rem' }}>
                {error}
              </Alert>
            )}

            {forgotPasswordNotice && (
              <Alert
                severity="info"
                sx={{ mb: 2.5, fontSize: '0.82rem' }}
                onClose={() => setForgotPasswordNotice(false)}
              >
                For password reset requests, please contact the Placement Cell Administrator at{' '}
                <strong>placement@vetias.edu</strong> or your department coordinator.
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Box sx={{ mb: 2.25 }}>
                <Typography
                  component="label"
                  htmlFor="email"
                  variant="caption"
                  sx={{ display: 'block', mb: 0.8, color: '#566663', fontWeight: 700 }}
                >
                  EMAIL ADDRESS
                </Typography>
                <TextField
                  fullWidth
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon sx={{ color: '#71817E', fontSize: 19 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: 54,
                      borderRadius: 1.5,
                      bgcolor: '#F8FAF9',
                      fontSize: '0.9rem',
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 0.8,
                  }}
                >
                  <Typography
                    component="label"
                    htmlFor="password"
                    variant="caption"
                    sx={{ color: '#566663', fontWeight: 700 }}
                  >
                    PASSWORD
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setForgotPasswordNotice(true)}
                    sx={{ p: 0, minWidth: 'auto', fontSize: '0.75rem', color: '#176B66' }}
                  >
                    Forgot password?
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
                        <LockOutlinedIcon sx={{ color: '#71817E', fontSize: 19 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#71817E' }}
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
                      height: 54,
                      borderRadius: 1.5,
                      bgcolor: '#F8FAF9',
                      fontSize: '0.9rem',
                    },
                  }}
                />
              </Box>

              <FormControlLabel
                sx={{ mb: 2.5, ml: -0.5 }}
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{ color: '#8A9995', '&.Mui-checked': { color: '#176B66' } }}
                  />
                }
                label={
                  <Typography sx={{ color: '#566663', fontSize: '0.82rem' }}>
                    Keep me signed in
                  </Typography>
                }
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{
                  height: 54,
                  borderRadius: 1.5,
                  bgcolor: '#176B66',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  '&:hover': { bgcolor: '#104F4B' },
                }}
              >
                {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Secure Sign In'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Box
          sx={{
            mt: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            color: '#71817E',
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 15, color: '#15803d' }} />
          <Typography variant="caption" sx={{ textAlign: 'center' }}>
            Secure access to the VET campus placement portal
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
