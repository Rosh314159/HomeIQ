import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#673AB7", // Fallback solid color (Deep Purple)
    },
    secondary: {
      main: "#03A9F4", // Light Blue
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "radial-gradient(circle, #F5F5F5 20%, #D3D3D3 80%)",
          minHeight: "100vh",
          margin: 0,
          padding: 0,
          width: "100%",
          overflowX: "hidden",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          background: "radial-gradient(circle, #F5F5F5 20%, #D3D3D3 80%)",
          color: "#fff",
          padding: "10px 20px",
          fontWeight: "bold",
          textTransform: "none",
          borderRadius: "8px",
          transition: "0.3s",
          "&:hover": {
            background: "linear-gradient(45deg, #3F51B5 30%, #1A237E 90%)",
          },
        },
      },
    },
  },
});

export default theme;
