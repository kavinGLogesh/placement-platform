import React, { useState, useMemo } from 'react';
import { Outlet, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Breadcrumbs,
  Link,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import BarChartIcon from '@mui/icons-material/BarChart';
import DescriptionIcon from '@mui/icons-material/Description';
import InsightsIcon from '@mui/icons-material/Insights';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import BusinessIcon from '@mui/icons-material/Business';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useHealthCheck } from '../hooks/useHealthCheck.js';
import { useAuth } from '../hooks/useAuth.js';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactElement;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 68;

export const RootLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isLoading: isHealthLoading, isError: isHealthError } = useHealthCheck();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isExamMode = location.pathname.startsWith('/student/attempt/');
  const isLoginPage = location.pathname === '/login';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Nav sections tailored by role
  const navSections: NavSection[] = useMemo(() => {
    if (!isAuthenticated || !user) return [];

    if (user.role === 'SUPER_ADMIN') {
      return [
        {
          title: 'GOVERNANCE',
          items: [
            { label: 'Executive Dashboard', path: '/admin/dashboard', icon: <DashboardIcon fontSize="small" /> },
            { label: 'System Health', path: '/admin/health', icon: <HealthAndSafetyIcon fontSize="small" /> },
            { label: 'Analytics Hub', path: '/admin/analytics', icon: <BarChartIcon fontSize="small" /> },
            { label: 'Audit Reports', path: '/admin/reports', icon: <DescriptionIcon fontSize="small" /> },
          ],
        },
        {
          title: 'CAMPUS DIRECTORY',
          items: [
            { label: 'Students Directory', path: '/admin/students', icon: <PeopleAltIcon fontSize="small" /> },
            { label: 'Company Profiles', path: '/admin/companies', icon: <BusinessIcon fontSize="small" /> },
            { label: 'Departments & Setup', path: '/admin/departments', icon: <AccountBalanceIcon fontSize="small" /> },
          ],
        },
        {
          title: 'EVALUATION OVERSIGHT',
          items: [
            { label: 'GD Rounds', path: '/admin/gd', icon: <GroupsIcon fontSize="small" /> },
            { label: 'Interviews', path: '/admin/interviews', icon: <WorkOutlineIcon fontSize="small" /> },
            { label: 'Scoring & Results', path: '/admin/results', icon: <FactCheckIcon fontSize="small" /> },
          ],
        },
      ];
    }

    if (user.role === 'PLACEMENT_ADMIN') {
      return [
        {
          title: 'RECRUITMENT & TESTING',
          items: [
            { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardIcon fontSize="small" /> },
            { label: 'Company Assessment', path: '/admin/companies', icon: <BusinessIcon fontSize="small" /> },
            { label: 'Assessments', path: '/admin/assessments', icon: <AssignmentIcon fontSize="small" /> },
            { label: 'Question Bank', path: '/admin/questions', icon: <QuizIcon fontSize="small" /> },
          ],
        },
        {
          title: 'EVALUATION & DRIVES',
          items: [
            { label: 'GD Rounds', path: '/admin/gd', icon: <GroupsIcon fontSize="small" /> },
            { label: 'Technical Interviews', path: '/admin/interviews', icon: <WorkOutlineIcon fontSize="small" /> },
            { label: 'Results & Scoring', path: '/admin/results', icon: <FactCheckIcon fontSize="small" /> },
          ],
        },
        {
          title: 'CAMPUS STRUCTURE',
          items: [
            { label: 'Students Directory', path: '/admin/students', icon: <PeopleAltIcon fontSize="small" /> },
            { label: 'Institutional Setup', path: '/admin/departments', icon: <AccountBalanceIcon fontSize="small" /> },
          ],
        },
        {
          title: 'INTELLIGENCE & AUDIT',
          items: [
            { label: 'Analytics Hub', path: '/admin/analytics', icon: <BarChartIcon fontSize="small" /> },
            { label: 'Reports & Exports', path: '/admin/reports', icon: <DescriptionIcon fontSize="small" /> },
          ],
        },
      ];
    }

    if (user.role === 'STUDENT') {
      return [
        {
          title: 'MY WORKSPACE',
          items: [
            { label: 'Dashboard', path: '/student/dashboard', icon: <DashboardIcon fontSize="small" /> },
            { label: 'My Assessments', path: '/student/tests', icon: <AssignmentIcon fontSize="small" /> },
            { label: 'GD Rounds', path: '/student/gd', icon: <GroupsIcon fontSize="small" /> },
            { label: 'Technical Interviews', path: '/student/interviews', icon: <WorkOutlineIcon fontSize="small" /> },
          ],
        },
        {
          title: 'PERFORMANCE & RECORDS',
          items: [
            { label: 'Results & Feedback', path: '/student/results', icon: <FactCheckIcon fontSize="small" /> },
            { label: 'Performance Analytics', path: '/student/performance', icon: <InsightsIcon fontSize="small" /> },
            { label: 'Scorecards & Reports', path: '/student/reports', icon: <DescriptionIcon fontSize="small" /> },
          ],
        },
        {
          title: 'ACCOUNT',
          items: [
            { label: 'My Profile', path: '/student/profile', icon: <PersonOutlineIcon fontSize="small" /> },
          ],
        },
      ];
    }

    return [];
  }, [user, isAuthenticated]);

  // Compute active breadcrumbs
  const breadcrumbs = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return [{ label: 'Home', path: '/' }];

    return parts.map((part, index) => {
      const path = '/' + parts.slice(0, index + 1).join('/');
      const label = part
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { label, path };
    });
  }, [location.pathname]);

  // If login or locked exam attempt mode, render edge-to-edge
  if (isLoginPage || isExamMode) {
    return <Outlet />;
  }

  // Sidebar content component (reused for desktop and mobile drawer)
  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid #e2e8f0',
          minHeight: 64,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: '#0f2744',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <SchoolIcon sx={{ fontSize: 20 }} />
        </Box>
        {(!sidebarCollapsed || isMobile) && (
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: '#0f172a',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              VET Institute
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#64748b',
                display: 'block',
                lineHeight: 1.2,
                fontSize: '0.72rem',
                whiteSpace: 'nowrap',
              }}
            >
              Placement Assessment Portal
            </Typography>
          </Box>
        )}
      </Box>

      {/* Role Pill Banner */}
      {(!sidebarCollapsed || isMobile) && user && (
        <Box sx={{ px: 2, py: 1.25, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Chip
              label={
                user.role === 'SUPER_ADMIN'
                  ? 'Super Administrator'
                  : user.role === 'PLACEMENT_ADMIN'
                  ? 'Placement Admin'
                  : 'Student Candidate'
              }
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 600,
                borderRadius: '4px',
                bgcolor:
                  user.role === 'SUPER_ADMIN'
                    ? '#f8fafc'
                    : user.role === 'PLACEMENT_ADMIN'
                    ? '#f0f4f9'
                    : '#f0fdf4',
                color:
                  user.role === 'SUPER_ADMIN'
                    ? '#0f2744'
                    : user.role === 'PLACEMENT_ADMIN'
                    ? '#0f2744'
                    : '#15803d',
                border: '1px solid',
                borderColor:
                  user.role === 'SUPER_ADMIN'
                    ? '#cbd5e1'
                    : user.role === 'PLACEMENT_ADMIN'
                    ? '#cbd5e1'
                    : '#bbf7d0',
              }}
            />
            <Tooltip
              title={
                isHealthLoading ? 'Connecting to API...' : isHealthError ? 'System API Offline' : 'API Online'
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: isHealthLoading ? '#b45309' : isHealthError ? '#b91c1c' : '#15803d',
                  }}
                />
              </Box>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Navigation Links */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        {navSections.map((section, sIdx) => (
          <Box key={section.title} sx={{ mb: 2 }}>
            {(!sidebarCollapsed || isMobile) && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  px: 2.25,
                  mb: 0.5,
                  color: '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  letterSpacing: '0.06em',
                }}
              >
                {section.title}
              </Typography>
            )}
            <List dense disablePadding>
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/admin/dashboard' &&
                    item.path !== '/student/dashboard' &&
                    location.pathname.startsWith(item.path));

                return (
                  <ListItem key={item.path} disablePadding sx={{ px: 1, mb: 0.25 }}>
                    <Tooltip title={sidebarCollapsed && !isMobile ? item.label : ''} placement="right">
                      <ListItemButton
                        component={RouterLink}
                        to={item.path}
                        onClick={() => isMobile && setMobileDrawerOpen(false)}
                        sx={{
                          borderRadius: 1,
                          py: 0.85,
                          px: sidebarCollapsed && !isMobile ? 1.5 : 1.75,
                          justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                          bgcolor: isActive ? '#f0f4f9' : 'transparent',
                          color: isActive ? '#0f2744' : '#475569',
                          fontWeight: isActive ? 600 : 500,
                          borderLeft: isActive ? '3px solid #0f2744' : '3px solid transparent',
                          '&:hover': {
                            bgcolor: isActive ? '#e7eef6' : '#f8fafc',
                            color: '#0f172a',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: sidebarCollapsed && !isMobile ? 'auto' : 32,
                            color: isActive ? '#0f2744' : '#64748b',
                            justifyContent: 'center',
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>
                        {(!sidebarCollapsed || isMobile) && (
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{
                              fontSize: '0.84rem',
                              fontWeight: isActive ? 600 : 500,
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                            }}
                          />
                        )}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                );
              })}
            </List>
            {sIdx < navSections.length - 1 && <Divider sx={{ my: 1.5, borderColor: '#e2e8f0' }} />}
          </Box>
        ))}
      </Box>

      {/* User Footer Profile & Sign Out */}
      <Box sx={{ p: 1.5, borderTop: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        {(!sidebarCollapsed || isMobile) ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Box
              component={user?.role === 'STUDENT' ? RouterLink : 'div'}
              to={user?.role === 'STUDENT' ? '/student/profile' : undefined}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                overflow: 'hidden',
                textDecoration: 'none',
                color: 'inherit',
                cursor: user?.role === 'STUDENT' ? 'pointer' : 'default',
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#0f2744',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    color: '#0f172a',
                    lineHeight: 1.2,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.email?.split('@')[0]}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                  {user?.role === 'STUDENT' ? 'Candidate' : 'Staff Admin'}
                </Typography>
              </Box>
            </Box>

            <Tooltip title="Sign Out">
              <IconButton size="small" onClick={handleLogout} sx={{ color: '#64748b' }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Tooltip title="Sign Out">
              <IconButton size="small" onClick={handleLogout} sx={{ color: '#64748b' }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            flexShrink: 0,
            transition: 'width 0.2s ease',
          }}
        >
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              bottom: 0,
              width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
              zIndex: 1100,
              transition: 'width 0.2s ease',
            }}
          >
            {sidebarContent}
          </Box>
        </Box>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          PaperProps={{ sx: { width: SIDEBAR_WIDTH } }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <Box
          component="header"
          sx={{
            height: 52,
            px: { xs: 2, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
          }}
        >
          {/* Left: Sidebar Toggle & Breadcrumbs */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
            {isMobile ? (
              <IconButton
                size="small"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ color: '#475569' }}
              >
                <MenuIcon fontSize="small" />
              </IconButton>
            ) : (
              <IconButton
                size="small"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                sx={{ color: '#475569' }}
              >
                {sidebarCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
              </IconButton>
            )}

            <Breadcrumbs
              separator="/"
              sx={{
                fontSize: '0.825rem',
                color: '#64748b',
                display: { xs: 'none', sm: 'flex' },
                '& .MuiBreadcrumbs-separator': { mx: 0.75, color: '#cbd5e1' },
              }}
            >
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return isLast ? (
                  <Typography
                    key={crumb.path}
                    sx={{ color: '#0f172a', fontWeight: 600, fontSize: '0.825rem' }}
                  >
                    {crumb.label}
                  </Typography>
                ) : (
                  <Link
                    key={crumb.path}
                    component={RouterLink}
                    to={crumb.path}
                    underline="hover"
                    sx={{ color: '#64748b', fontSize: '0.825rem' }}
                  >
                    {crumb.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          </Box>

          {/* Right Header Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label="Academic Drive 2025–26"
              size="small"
              sx={{
                display: { xs: 'none', md: 'inline-flex' },
                height: 24,
                fontSize: '0.72rem',
                fontWeight: 600,
                bgcolor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
              }}
            />

            <Tooltip title="Placement Platform Connected">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#15803d' }} />
                <Typography
                  variant="caption"
                  sx={{ color: '#15803d', fontWeight: 600, display: { xs: 'none', lg: 'inline' } }}
                >
                  Secure
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* Page Content Viewport */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 2.5, md: 3.5 },
            maxWidth: 1600,
            width: '100%',
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
