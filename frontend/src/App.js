import React from "react";
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/Home";
import HouseDetails from "./pages/HouseDetails";
import Browse from "./pages/Browse";
import FinancialDetails from "./pages/FinancialDetails";
import FeasibilityAssessment from "./components/FeasibilityAssessment";
import EnhancedSearch from "./pages/EnhancedSearch";
const App = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/" element={<Home />} />
          <Route path="/details" element={<HouseDetails />} />
          <Route path="/search" element={<EnhancedSearch />} />
          <Route path="/upload" element={<FinancialDetails />} />
          <Route path="/feasibility" element={<FeasibilityAssessment />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;


