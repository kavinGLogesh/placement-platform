import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BusinessIcon from '@mui/icons-material/Business';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ClassIcon from '@mui/icons-material/Class';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuizIcon from '@mui/icons-material/Quiz';
import BarChartIcon from '@mui/icons-material/BarChart';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';

export const AdminNavTabs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: <DashboardIcon fontSize="small" /> },
    { label: 'Reports', path: '/admin/reports', icon: <DescriptionIcon fontSize="small" /> },
    { label: 'Analytics', path: '/admin/analytics', icon: <BarChartIcon fontSize="small" /> },
    { label: 'Results', path: '/admin/results', icon: <FactCheckIcon fontSize="small" /> },
    { label: 'Assessments', path: '/admin/assessments', icon: <AssignmentIcon fontSize="small" /> },
    { label: 'Questions', path: '/admin/questions', icon: <QuizIcon fontSize="small" /> },
    { label: 'Students', path: '/admin/students', icon: <PeopleAltIcon fontSize="small" /> },
    { label: 'College', path: '/admin/college', icon: <AccountBalanceIcon fontSize="small" /> },
    { label: 'Departments', path: '/admin/departments', icon: <BusinessIcon fontSize="small" /> },
    { label: 'Courses', path: '/admin/courses', icon: <MenuBookIcon fontSize="small" /> },
    { label: 'Classes', path: '/admin/classes', icon: <ClassIcon fontSize="small" /> },
    { label: 'Sections', path: '/admin/sections', icon: <ViewModuleIcon fontSize="small" /> },
  ];

  const currentTab = navItems.findIndex((item) => location.pathname.startsWith(item.path));

  return (
    <Box
      sx={{
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        mb: 4,
        overflowX: 'auto',
      }}
    >
      <Tabs
        value={currentTab !== -1 ? currentTab : 0}
        variant="scrollable"
        scrollButtons="auto"
        textColor="primary"
        indicatorColor="primary"
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            minHeight: 48,
            px: 2,
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
            alignItems: 'center',
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.light',
            },
          },
        }}
      >
        {navItems.map((item) => (
          <Tab
            key={item.path}
            icon={item.icon}
            iconPosition="start"
            label={item.label}
            onClick={() => navigate(item.path)}
          />
        ))}
      </Tabs>
    </Box>
  );
};
