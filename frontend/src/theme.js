import { createTheme } from '@mui/material/styles';

// Create a custom Material UI theme
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#667eea', // Purple from existing gradient
            light: '#8b9ef5',
            dark: '#4a5fb8',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#764ba2', // Darker purple from existing gradient
            light: '#9b6bc4',
            dark: '#533471',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontSize: '2rem',
            fontWeight: 500,
        },
        h2: {
            fontSize: '1.5rem',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none', // Disable uppercase transformation
                    fontWeight: 500,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                },
            },
        },
    },
});

export default theme;
