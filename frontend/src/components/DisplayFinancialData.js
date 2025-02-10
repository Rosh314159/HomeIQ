import React, { useState, useEffect } from 'react';

const DisplayFinancialData = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem('userFinancialData');
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  if (!userData) {
    return <p>No financial data found. Please enter your data first.</p>;
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-2xl">
      <h2 className="text-xl font-bold text-center mb-4">Your Financial Data</h2>
      <ul className="space-y-2">
        <li><strong>Annual Income:</strong> £{userData.annual_income}</li>
        <li><strong>Monthly Debt Obligations:</strong> £{userData.debt_obligations}</li>
        <li><strong>Savings:</strong> £{userData.savings}</li>
        <li><strong>First Time Home Buyer:</strong> {userData.is_first_home ? 'Yes' : 'No'}</li>
      </ul>
    </div>
  );
};

export default DisplayFinancialData;
