import { extendTheme } from '@mui/joy/styles';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          solidBg: '#1976d2',
          solidHoverBg: '#115293',
          solidActiveBg: '#0d3c61',
        },
        neutral: {
          outlinedBg: '#f5f5f5',
          outlinedHoverBg: '#e0e0e0',
          outlinedActiveBg: '#d5d5d5',
        },
        warning: {
          solidBg: '#f57c00',
          solidHoverBg: '#d96c00',
          solidActiveBg: '#b85c00',
        },
        danger: {
          solidBg: '#d32f2f',
          solidHoverBg: '#b71c1c',
          solidActiveBg: '#9a0007',
        },
        background: {
          body: '#f8fafc',
          surface: '#ffffff',
        },
      },
    },
  },
  typography: {
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#1e293b',
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1e293b',
    },
    body1: {
      fontSize: '1rem',
      color: '#475569',
    },
  },
  components: {
    JoySheet: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    JoyButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          fontWeight: 500,
        },
      },
    },
    JoyInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          transition: 'border-color 0.2s',
          '&:hover': {
            borderColor: '#1976d2',
          },
        },
      },
    },
    JoyTable: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          overflow: 'hidden',
        },
      },
    },
  },
});

export default theme;