import React, { useEffect, useState } from "react";
import axios from "axios";
import MonthlyOutgoingsChart from './MonthlyOutgoingsChart';
import RatioChart from './RatioChart';

import { responsiveFontSizes } from "@mui/material";



const FeasibilityAssessment = ( houseData ) => {
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [activeTab, setActiveTab] = useState("outgoings");
  const [loading, setLoading] = useState(true);
  
  
  useEffect(() => {
    const fetchFeasibilityAssessment = async () => {
      try {
        setLoading(true);
        const userFinancialData = JSON.parse(localStorage.getItem("userFinancialData"));
        //const houseData = JSON.parse(localStorage.getItem("houseData"));
        console.log(houseData.data.predicted_price);
        if (!userFinancialData || !houseData) {
          setError("Missing user financial data or house details.");
          setLoading(false);
          return;
        }

        // Construct inputs for feasibility assessment
        const systemInputs = {
          house_price: houseData.data.predicted_price,
          loan_term_years: 30,
          interest_rate: 3.5,
          property_tax: 200,
          insurance: 100,
          utility_bills: 150,
        };

        const userInputs = {
          annual_income: userFinancialData.annual_income,
          debt_obligations: userFinancialData.debt_obligations,
          savings: userFinancialData.savings,
          is_first_home: userFinancialData.is_first_home,
        };

        // Call the backend feasibility assessment API using axios
        const response = await axios.post("http://localhost:5000/feasibility", {
          system_inputs: systemInputs,
          user_inputs: userInputs,
        });
        setAssessment(response.data.result);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to compute feasibility assessment.");
        setLoading(false);
      }
    };

    fetchFeasibilityAssessment();
  }, []);

   // Toggle information panel
   const toggleInfo = () => setShowInfo(!showInfo);
   // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-GB', { 
      style: 'currency', 
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };
  // Loading state UI
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
        <h2 className="text-2xl font-bold text-center mb-6">Feasibility Assessment</h2>
        <div className="space-y-4">
          <div className="bg-gray-200 h-8 w-full animate-pulse rounded"></div>
          <div className="bg-gray-200 h-8 w-full animate-pulse rounded"></div>
          <div className="bg-gray-200 h-8 w-full animate-pulse rounded"></div>
          <div className="bg-gray-200 h-64 w-full animate-pulse rounded"></div>
          <div className="bg-gray-200 h-64 w-full animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
        <h2 className="text-2xl font-bold text-center mb-6">Feasibility Assessment</h2>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // No assessment data
  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
        <h2 className="text-2xl font-bold text-center mb-6">Feasibility Assessment</h2>
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p className="font-bold">No Data Available</p>
          <p>We couldn't load the feasibility assessment. Please make sure you've entered all required information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        {/* <h2 className="text-2xl font-bold">Feasibility Assessment</h2> */}
        <div className="flex items-center gap-2">
          {assessment.is_affordable ? (
            <div className="bg-green-100 text-green-800 py-1 px-3 rounded-full flex items-center gap-1 text-sm font-medium">
              <span className="inline-block w-4 h-4 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</span>
              Affordable
            </div>
          ) : (
            <div className="bg-red-100 text-red-800 py-1 px-3 rounded-full flex items-center gap-1 text-sm font-medium">
              <span className="inline-block w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">✗</span>
              Not Affordable
            </div>
          )}
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 p-4 rounded shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Monthly Payment</p>
          <p className="text-2xl font-bold">{formatCurrency(assessment.monthly_payment)}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Housing Costs</p>
          <p className="text-2xl font-bold">{formatCurrency(assessment.total_housing_costs)}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Monthly Income</p>
          <p className="text-2xl font-bold">{formatCurrency(assessment.monthly_income || 0)}</p>
        </div>
      </div>
      
      {/* Information Toggle */}
        <div className="mb-6">
          <button 
            onClick={toggleInfo} 
            className="w-full flex items-center justify-between py-2 px-4 border border-blue-500 rounded bg-blue-500 text-white text-left"
          >
            <span className="flex items-center">
          <span className="inline-block w-4 h-4 mr-2 text-white">ⓘ</span>
          How is feasibility calculated?
            </span>
            <span>{showInfo ? '▲' : '▼'}</span>
          </button>
          
          {showInfo && (
            <div className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded text-sm">
          <h3 className="font-semibold mb-2">Understanding Financial Ratios</h3>
          
          <div className="mb-3">
            <p className="font-medium">Debt-to-Income Ratio (DTI)</p>
            <p className="mb-1">Measures the proportion of your gross monthly income that goes toward debt payments.</p>
            <p className="bg-slate-100 p-1 rounded text-xs mb-1">DTI = (Total Monthly Debt Payments / Gross Monthly Income) × 100%</p>
            <p>Recommended: <span className="font-medium">below 36%</span>, Maximum: <span className="font-medium">43%</span> for mortgage approval.</p>
          </div>
          
          <div className="mb-3">
            <p className="font-medium">Loan-to-Value Ratio (LTV)</p>
            <p className="mb-1">Compares the mortgage amount to the property's value.</p>
            <p className="bg-slate-100 p-1 rounded text-xs mb-1">LTV = (Loan Amount / Property Value) × 100%</p>
            <p>Preferred: <span className="font-medium">80% or lower</span>. Higher ratios may require PMI and result in higher rates.</p>
          </div>
          
          <div>
            <p className="font-medium">Mortgage-to-Income Ratio</p>
            <p className="mb-1">Assesses how much you need to borrow compared to your yearly income.</p>
            <p className="bg-slate-100 p-1 rounded text-xs mb-1">Mortgage-to-Income Ratio = Mortgage Amount / Yearly Income</p>
            <p>Recommended: <span className="font-medium">28% or lower</span>. Higher ratios may indicate affordability issues.</p>
          </div>
            </div>
          )}
        </div>
        
        {/* Tabs for Charts */}
      <div className="mb-6">
        <div className="flex border-b">
          <button 
            className={`py-2 px-4 ${activeTab === "outgoings" ? "border-b-2 border-blue-500 text-white-600 font-medium" : "text-white-600"}`}
            onClick={() => setActiveTab("outgoings")}
          >
            Monthly Outgoings
          </button>
          <button 
            className={`py-2 px-4 ${activeTab === "ratios" ? "border-b-2 border-blue-500 text-white-600 font-medium" : "text-white-600"}`}
            onClick={() => setActiveTab("ratios")}
          >
            Financial Ratios
          </button>
        </div>
        
        <div className="mt-4">
          {activeTab === "outgoings" && (
            <MonthlyOutgoingsChart feasibilityData={assessment} houseData={houseData.data} />
          )}
          
          {activeTab === "ratios" && (
            <RatioChart feasibilityData={assessment} houseData={houseData.data} />
          )}
        </div>
      </div>
      
      {/* Recommendations */}
      {assessment.recommendations && assessment.recommendations.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
          <div className={`p-4 rounded ${assessment.is_affordable ? "bg-yellow-50 border border-yellow-200" : "bg-red-50 border border-red-200"}`}>
            <p className="font-bold mb-2">Action Required</p>
            <ul className="list-disc pl-5 space-y-1">
              {assessment.recommendations.map((rec, index) => (
                <li key={index} className={assessment.is_affordable ? "text-yellow-800" : "text-red-700"}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeasibilityAssessment;