import React from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import TerminalIcon from '@mui/icons-material/Terminal';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { useHealthCheck } from '../hooks/useHealthCheck.js';
import { useAuth } from '../hooks/useAuth.js';

export const RootLayout: React.FC = () => {
  const { data, isLoading, isError } = useHealthCheck();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Application Header */}
      <AppBar position="sticky" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ py: 1, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            {/* Brand Logo & Name */}
            <Box
              component={RouterLink}
              to="/"
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                }}
              >
                <HubIcon sx={{ color: '#ffffff', fontSize: 24 }} />
              </Box>
              <div>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    background: 'linear-gradient(90deg, #ffffff 30%, #a5b4fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  PLACEX
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.5, fontWeight: 500 }}>
                  Assessment Platform
                </Typography>
              </div>
            </Box>

            {/* Navigation links & Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                component={RouterLink}
                to="/"
                size="small"
                sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
              >
                System Health
              </Button>

              {isAuthenticated && (user?.role === 'SUPER_ADMIN' || user?.role === 'PLACEMENT_ADMIN') && (
                <Button
                  component={RouterLink}
                  to="/admin/dashboard"
                  size="small"
                  startIcon={<AdminPanelSettingsIcon />}
                  sx={{ color: 'primary.light' }}
                >
                  Admin Portal
                </Button>
              )}

              {isAuthenticated && user?.role === 'STUDENT' && (
                <Button
                  component={RouterLink}
                  to="/student/dashboard"
                  size="small"
                  startIcon={<SchoolIcon />}
                  sx={{ color: 'success.light' }}
                >
                  Student Portal
                </Button>
              )}

              <Chip
                label={
                  isLoading
                    ? 'Connecting...'
                    : isError
                    ? 'API Disconnected'
                    : data?.success
                    ? 'API Online'
                    : 'Degraded'
                }
                size="small"
                color={isLoading ? 'warning' : isError ? 'error' : 'success'}
                variant="outlined"
                sx={{ fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
              />

              {isAuthenticated && user ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={user.role}
                    size="small"
                    color={
                      user.role === 'SUPER_ADMIN'
                        ? 'primary'
                        : user.role === 'PLACEMENT_ADMIN'
                        ? 'secondary'
                        : 'success'
                    }
                    sx={{ fontWeight: 700 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    Logout
                  </Button>
                </Box>
              ) : (
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  size="small"
                  color="primary"
                  startIcon={<LoginIcon />}
                >
                  Sign In
                </Button>
              )}

              <Tooltip title="View Health Endpoint">
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                  component="a"
                  href="/api/health"
                  target="_blank"
                >
                  <TerminalIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Body View */}
      <Box component="main" sx={{ flexGrow: 1, py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: 'rgba(11, 15, 25, 0.9)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} College Placement Assessment Platform. All rights reserved.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Phase 1 Architecture & Phase 2 Authentication / RBAC
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
