import React, { useState, useEffect } from "react";

const UpdateFinancialData = () => {
  const [userData, setUserData] = useState({
    annual_income: "",
    debt_obligations: "",
    savings: "",
    credit_score: "",
    is_first_home: false,
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = localStorage.getItem("userFinancialData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      console.log(typeof parsedData.annual_income);
      setUserData({
        ...parsedData,
        annual_income: typeof parsedData.annual_income === "string" ? parseInt(parsedData.annual_income.replace(/,/g, ""), 10) : parsedData.annual_income,
        debt_obligations: typeof parsedData.debt_obligations === "string" ? (isNaN(parseInt(parsedData.debt_obligations.replace(/,/g, ""), 10)) ? "" : parseInt(parsedData.debt_obligations.replace(/,/g, ""), 10)) : parsedData.debt_obligations,
        savings: typeof parsedData.savings === "string" ? (isNaN(parseInt(parsedData.savings.replace(/,/g, ""), 10)) ? "" : parseInt(parsedData.savings.replace(/,/g, ""), 10)) : parsedData.savings,
        credit_score: typeof parsedData.credit_score === "string" ? (isNaN(parseInt(parsedData.credit_score.replace(/,/g, ""), 10)) ? "" : parseInt(parsedData.credit_score.replace(/,/g, ""), 10)) : parsedData.credit_score,
      });
    }
  }, []);

  // Restrict input to numbers and commas only
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setUserData((prevData) => ({ ...prevData, [name]: checked }));
    } else {
      // Allow only numbers and commas
      const formattedValue = value.replace(/[^0-9,]/g, "");
      setUserData((prevData) => ({ ...prevData, [name]: formattedValue }));
    }
  };

  const saveToLocalStorage = () => {
    const convertedUserData = {
      ...userData,
      annual_income: typeof userData.annual_income === "string" ? parseInt(userData.annual_income.replace(/,/g, ""), 10) : userData.annual_income,
      debt_obligations: typeof userData.debt_obligations === "string" ? parseInt(userData.debt_obligations.replace(/,/g, ""), 10) : userData.debt_obligations,
      savings: typeof userData.savings === "string" ? parseInt(userData.savings.replace(/,/g, ""), 10) : userData.savings,
      credit_score: typeof userData.credit_score === "string" ? parseInt(userData.credit_score.replace(/,/g, ""), 10) : userData.credit_score,
    };
    localStorage.setItem("userFinancialData", JSON.stringify(convertedUserData));
    alert("Data Saved! " + localStorage.getItem("userFinancialData"));
    //navigateToHome();
  };

  const navigateToHome = () => {
    window.location.href = "/your-financial-data";
  };
  

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white shadow-xl rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Update Your Financial Data
        </h2>
  
        {/* Annual Income */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Annual Income (£)</label>
          <input
            type="text"
            name="annual_income"
            value={userData.annual_income}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your annual income"
          />
        </div>
  
        {/* Monthly Debt Obligations */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Monthly Debt Obligations (£)</label>
          <input
            type="text"
            name="debt_obligations"
            value={userData.debt_obligations}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your debt obligations"
          />
        </div>
  
        {/* Savings */}
        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Savings (£)</label>
          <input
            type="text"
            name="savings"
            value={userData.savings}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your savings"
          />
        </div>
  
        {/* First Time Home Buyer Checkbox */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            name="is_first_home"
            checked={userData.is_first_home}
            onChange={handleChange}
            className="w-5 h-5 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-3 text-gray-700 font-medium">
            First Time Home Buyer?
          </label>
        </div>
  
        {/* Save Button */}
        <button
          onClick={() => {
            saveToLocalStorage();
            navigateToHome();
          }}
          className="w-full p-3 bg-blue-500 text-white text-lg font-semibold rounded-2xl shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          Save Data
        </button>
      </div>
    </div>
  );
  
};

export default UpdateFinancialData;

