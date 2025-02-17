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
      setUserData(JSON.parse(storedData));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const saveToLocalStorage = () => {
    localStorage.setItem("userFinancialData", JSON.stringify(userData));
    alert("Data Saved! " + localStorage.getItem("userFinancialData"));
    //navigateToHome();
  };

  const navigateToHome = () => {
    window.location.href = "/your-financial-data";
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-xl font-bold text-center mb-4">Update Your Financial Data</h2>
        <input
          type="number"
          name="annual_income"
          placeholder="Annual Income (£)"
          value={userData.annual_income}
          onChange={handleChange}
          className="w-full p-2 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          name="debt_obligations"
          placeholder="Monthly Debt Obligations (£)"
          value={userData.debt_obligations}
          onChange={handleChange}
          className="w-full p-2 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          name="savings"
          placeholder="Savings (£)"
          value={userData.savings}
          onChange={handleChange}
          className="w-full p-2 border rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            name="is_first_home"
            checked={userData.is_first_home}
            onChange={handleChange}
            className="w-4 h-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="text-sm">First Time Home Buyer?</label>
        </div>
        <button
          onClick={() => {
            saveToLocalStorage();
            navigateToHome();
          }}
          className="w-full p-2 bg-blue-500 text-white rounded-2xl shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Save Data
        </button>
      </div>
    </div>
  );
};

export default UpdateFinancialData;

