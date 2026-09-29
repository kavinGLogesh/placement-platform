import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f2744', // Authoritative Deep Navy / Professional Blue
      light: '#1e3a8a', // Restrained Corporate Blue
      dark: '#0a1c30',  // Deep Midnight Navy
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#475569', // Professional Slate 600
      light: '#64748b',
      dark: '#334155',
      contrastText: '#ffffff',
    },
    success: {
      main: '#15803d', // Restrained Professional Green (Emerald 700)
      light: '#16a34a',
      dark: '#14532d',
      contrastText: '#ffffff',
    },
    error: {
      main: '#b91c1c', // Controlled Crimson Red (Red 700)
      light: '#dc2626',
      dark: '#7f1d1d',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#b45309', // Muted Amber (Amber 700)
      light: '#d97706',
      dark: '#78350f',
      contrastText: '#ffffff',
    },
    info: {
      main: '#1d4ed8', // Restrained Information Blue
      light: '#2563eb',
      dark: '#1e3a8a',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Clean off-white canvas (Slate 50)
      paper: '#ffffff',   // Crisp Pure White dominant surface
    },
    text: {
      primary: '#0f172a',   // Dark Charcoal / Slate 900
      secondary: '#475569', // Readable Subdued Slate 600
    },
    divider: '#e2e8f0', // Soft neutral gray border (Slate 200)
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
      color: '#0f172a',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0f172a',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0f172a',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0f172a',
      fontSize: '1.45rem',
      lineHeight: 1.25,
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
      color: '#0f172a',
      fontSize: '1.2rem',
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#0f172a',
      fontSize: '1rem',
      lineHeight: 1.35,
    },
    subtitle1: {
      fontWeight: 600,
      color: '#1e293b',
      fontSize: '0.9rem',
    },
    subtitle2: {
      fontWeight: 600,
      color: '#475569',
      fontSize: '0.825rem',
    },
    body1: {
      color: '#1e293b',
      fontSize: '0.875rem',
      lineHeight: 1.55,
    },
    body2: {
      color: '#475569',
      fontSize: '0.825rem',
      lineHeight: 1.5,
    },
    caption: {
      color: '#64748b',
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.005em',
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f8fafc',
          color: '#0f172a',
          minHeight: '100vh',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: 6,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          '&:hover': {
            borderColor: '#cbd5e1',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation0: {
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '6px 16px',
          boxShadow: 'none',
          fontWeight: 600,
          fontSize: '0.84rem',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#0f2744',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#0a1c30',
          },
        },
        outlinedPrimary: {
          borderColor: '#cbd5e1',
          color: '#0f2744',
          backgroundColor: '#ffffff',
          '&:hover': {
            borderColor: '#0f2744',
            backgroundColor: '#f8fafc',
          },
        },
        outlinedSecondary: {
          borderColor: '#cbd5e1',
          color: '#475569',
          backgroundColor: '#ffffff',
          '&:hover': {
            borderColor: '#94a3b8',
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 4,
          fontSize: '0.74rem',
          height: 24,
        },
        outlined: {
          borderColor: '#cbd5e1',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: 'none',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafc',
          '& .MuiTableCell-head': {
            backgroundColor: '#f8fafc',
            color: '#475569',
            fontWeight: 600,
            fontSize: '0.74rem',
            borderBottom: '1px solid #e2e8f0',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '10px 16px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f1f5f9',
          color: '#1e293b',
          fontSize: '0.84rem',
          padding: '11px 16px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRadius: 6,
          border: '1px solid #e2e8f0',
          boxShadow: '0 12px 24px -4px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.03)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          fontWeight: 600,
          fontSize: '1.05rem',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 20px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: '#1e293b',
          padding: '20px !important',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '12px 20px',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#475569',
          fontWeight: 500,
          fontSize: '0.85rem',
          '&.Mui-focused': {
            color: '#0f2744',
            fontWeight: 600,
          },
          '&.Mui-error': {
            color: '#b91c1c',
            fontWeight: 600,
          },
          '&.MuiInputLabel-shrink': {
            backgroundColor: '#ffffff',
            padding: '0 4px',
            borderRadius: '2px',
            fontWeight: 600,
            zIndex: 2,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#ffffff',
          color: '#0f172a',
          fontSize: '0.85rem',
          fontWeight: 400,
          '& fieldset': {
            borderColor: '#cbd5e1',
          },
          '&:hover fieldset': {
            borderColor: '#94a3b8',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#0f2744',
            borderWidth: '1.5px',
          },
          '&.Mui-error fieldset': {
            borderColor: '#b91c1c',
            borderWidth: '1.5px',
          },
          '&.Mui-disabled': {
            backgroundColor: '#f8fafc',
            color: '#94a3b8',
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
          },
        },
        input: {
          color: '#0f172a',
          padding: '9px 13px',
          '&::placeholder': {
            color: '#94a3b8',
            opacity: 1,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: '#64748b',
          fontSize: '0.74rem',
          marginTop: '3px',
          '&.Mui-error': {
            color: '#b91c1c',
            fontWeight: 500,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 40,
        },
        indicator: {
          backgroundColor: '#0f2744',
          height: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.85rem',
          minHeight: 40,
          padding: '6px 16px',
          color: '#64748b',
          '&.Mui-selected': {
            color: '#0f2744',
            fontWeight: 600,
          },
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.84rem',
          color: '#1e293b',
          fontWeight: 400,
          padding: '8px 14px',
          '&.Mui-selected': {
            backgroundColor: '#f0f4f9',
            color: '#0f2744',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#e5ecf5',
            },
          },
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: '0.84rem',
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: '#f0fdf4',
          color: '#14532d',
          borderColor: '#bbf7d0',
          '& .MuiAlert-icon': { color: '#15803d' },
        },
        standardError: {
          backgroundColor: '#fef2f2',
          color: '#7f1d1d',
          borderColor: '#fecaca',
          '& .MuiAlert-icon': { color: '#b91c1c' },
        },
        standardWarning: {
          backgroundColor: '#fffbeb',
          color: '#78350f',
          borderColor: '#fde68a',
          '& .MuiAlert-icon': { color: '#b45309' },
        },
        standardInfo: {
          backgroundColor: '#eff6ff',
          color: '#1e3a8a',
          borderColor: '#bfdbfe',
          '& .MuiAlert-icon': { color: '#1d4ed8' },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
