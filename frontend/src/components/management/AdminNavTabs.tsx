import React from 'react';
import { Box, Chip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

export const AdminNavTabs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Secondary sub-navigation for Student & Institutional Structure
  const structureSubNav = [
    { label: 'Students Directory', path: '/admin/students' },
    { label: 'Classes', path: '/admin/classes' },
    { label: 'Sections', path: '/admin/sections' },
    { label: 'Departments', path: '/admin/departments' },
    { label: 'Courses', path: '/admin/courses' },
    { label: 'College Profile', path: '/admin/college' },
  ];

  const isStructureRoute = structureSubNav.some((item) => location.pathname.startsWith(item.path));

  // Only render on institutional structure sub-routes to avoid duplicating the sidebar
  if (!isStructureRoute) {
    return null;
  }

  return (
    <Box
      sx={{
        mb: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.5,
        overflowX: 'auto',
      }}
    >
      <Box sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mr: 0.5, whiteSpace: 'nowrap' }}>
        Organization:
      </Box>
      {structureSubNav.map((sub) => {
        const isActive =
          location.pathname === sub.path ||
          (sub.path === '/admin/students' && location.pathname.startsWith('/admin/students'));
        return (
          <Chip
            key={sub.path}
            label={sub.label}
            size="small"
            clickable
            onClick={() => navigate(sub.path)}
            sx={{
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.78rem',
              backgroundColor: isActive ? '#0f2744' : '#ffffff',
              color: isActive ? '#ffffff' : '#475569',
              border: '1px solid',
              borderColor: isActive ? '#0f2744' : '#cbd5e1',
              borderRadius: '4px',
              height: 26,
              '&:hover': {
                backgroundColor: isActive ? '#0a1c30' : '#f1f5f9',
              },
            }}
          />
        );
      })}
    </Box>
  );
};
