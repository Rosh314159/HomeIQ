// src/theme.js
import { createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1f2937', // matches bg-gray-800 from the navbar
      light: '#374151', // matches hover:bg-gray-700 from the navbar
      dark: '#111827', // matches bg-gray-900 from the navbar
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc2626', // matches bg-red-600 from the Clear All Data button
      dark: '#b91c1c', // matches hover:bg-red-700
    },
    background: {
      default: '#f9fafb', // light gray background
      paper: '#ffffff',
    },
    text: {
      primary: '#111827', // dark text matching the navbar's dark theme
      secondary: '#6b7280', // gray-500 for secondary text
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f2937', // Match navbar color
        },
      },
    },
  },
});

export default theme;