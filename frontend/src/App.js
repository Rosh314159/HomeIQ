import React from "react";
//import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/Home";
import HouseDetails from "./pages/HouseDetails";
import YourFinancialData from "./pages/YourFinancialData";
import FeasibilityAssessment from "./components/FeasibilityAssessment";
import UpdateFinancialData from "./components/UpdateFinancialData";
import EnhancedSearch from "./pages/EnhancedSearch";
import About from "./pages/About"
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme"; // Import the theme
import { useEffect } from "react";
const App = () => {
  //Clear localStorage when website is refreshed
  useEffect(() => {
    const handleTabClose = (event) => {
        // This ensures localStorage is cleared only on full website close, not refresh
        localStorage.clear();
    };

    // Attach event listener when the tab/window is closing
    window.addEventListener("beforeunload", handleTabClose);

    return () => {
        window.removeEventListener("beforeunload", handleTabClose);
    };
}, []);
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normalizes styles across browsers */}
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/details" element={<HouseDetails />} />
          <Route path="/search" element={<EnhancedSearch />} />
          <Route path="/your-financial-data" element={<YourFinancialData />} />
          <Route path="/update-financial-data" element={<UpdateFinancialData />} />
          <Route path="/feasibility" element={<FeasibilityAssessment />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
    </div>
  );
};

export default App;


