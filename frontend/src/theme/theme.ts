import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f3674', // Authoritative deep institutional navy
      light: '#1e5bb8',
      dark: '#0a2550',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#475569', // Subtle slate accent
      light: '#64748b',
      dark: '#334155',
      contrastText: '#ffffff',
    },
    success: {
      main: '#047857', // Crisp emerald 700
      light: '#10b981',
      dark: '#065f46',
      contrastText: '#ffffff',
    },
    error: {
      main: '#b91c1c', // Controlled crimson 700
      light: '#ef4444',
      dark: '#991b1b',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#b45309', // Warm ochre 700
      light: '#f59e0b',
      dark: '#92400e',
      contrastText: '#ffffff',
    },
    info: {
      main: '#0369a1', // Sky blue 700
      light: '#38bdf8',
      dark: '#075985',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Ultra clean slate-50 canvas
      paper: '#ffffff',   // Crisp pure white surfaces
    },
    text: {
      primary: '#0f172a',   // Deep readable Slate 900
      secondary: '#475569', // Clear secondary Slate 600
    },
    divider: '#e2e8f0', // Crisp Slate 200 border
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
      fontSize: '1.5rem',
      lineHeight: 1.25,
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
      color: '#0f172a',
      fontSize: '1.25rem',
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: '#0f172a',
      fontSize: '1.05rem',
      lineHeight: 1.35,
    },
    subtitle1: {
      fontWeight: 600,
      color: '#1e293b',
      fontSize: '0.9375rem',
    },
    subtitle2: {
      fontWeight: 600,
      color: '#475569',
      fontSize: '0.85rem',
    },
    body1: {
      color: '#1e293b',
      fontSize: '0.9rem',
      lineHeight: 1.55,
    },
    body2: {
      color: '#475569',
      fontSize: '0.84rem',
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
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          '&:hover': {
            borderColor: '#cbd5e1',
            boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '7px 16px',
          boxShadow: 'none',
          fontWeight: 600,
          fontSize: '0.85rem',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#0f3674',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#0a2550',
          },
        },
        outlinedPrimary: {
          borderColor: '#cbd5e1',
          color: '#0f3674',
          '&:hover': {
            borderColor: '#0f3674',
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
          fontSize: '0.75rem',
          height: 24,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)',
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
            fontSize: '0.75rem',
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
          fontSize: '0.85rem',
          padding: '11px 16px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          boxShadow: '0 12px 24px -6px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#0f172a',
          fontWeight: 600,
          fontSize: '1.15rem',
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
            color: '#0f3674',
            fontWeight: 600,
          },
          '&.Mui-error': {
            color: '#b91c1c',
            fontWeight: 600,
          },
          '&.MuiInputLabel-shrink': {
            backgroundColor: '#ffffff',
            padding: '0 5px',
            borderRadius: '3px',
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
          fontSize: '0.875rem',
          fontWeight: 400,
          '& fieldset': {
            borderColor: '#cbd5e1',
          },
          '&:hover fieldset': {
            borderColor: '#94a3b8',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#0f3674',
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
          padding: '10px 14px',
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
          fontSize: '0.75rem',
          fontWeight: 400,
          marginTop: '3px',
          '&.Mui-error': {
            color: '#b91c1c',
            fontWeight: 500,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          color: '#0f172a',
          fontWeight: 400,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '0.85rem',
          color: '#1e293b',
          fontWeight: 400,
          padding: '8px 14px',
          '&.Mui-selected': {
            backgroundColor: '#f0f4fa',
            color: '#0f3674',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#e3ecf8',
            },
          },
          '&:hover': {
            backgroundColor: '#f8fafc',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#cbd5e1',
            },
            '&:hover fieldset': {
              borderColor: '#94a3b8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0f3674',
              borderWidth: '1.5px',
            },
          },
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
