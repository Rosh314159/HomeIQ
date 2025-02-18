import React, { useEffect, useState } from "react";
import axios from "axios";

const FeasibilityAssessment = ( houseData ) => {
  const [assessment, setAssessment] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeasibilityAssessment = async () => {
      try {
        const userFinancialData = JSON.parse(localStorage.getItem("userFinancialData"));
        //const houseData = JSON.parse(localStorage.getItem("houseData"));
        console.log(houseData.data.predicted_price);
        if (!userFinancialData || !houseData) {
          setError("Missing user financial data or house details.");
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
      } catch (err) {
        console.error(err);
        setError("Failed to compute feasibility assessment.");
      }
    };

    fetchFeasibilityAssessment();
  }, []);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!assessment) return <p>Loading assessment...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold text-center mb-4">Feasibility Assessment</h2>
      <ul className="space-y-2">
        <li><strong>Monthly Payment:</strong> £{assessment.monthly_payment}</li>
        <li><strong>Total Housing Costs:</strong> £{assessment.total_housing_costs}</li>
        <li><strong>Debt-to-Income Ratio:</strong> {assessment.dti_ratio}%</li>
        <li><strong>Loan-to-Value Ratio:</strong> {assessment.ltv_ratio}%</li>
        <li><strong>Affordable:</strong> {assessment.is_affordable ? "Yes" : "No"}</li>
      </ul>
      {assessment.recommendations.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Recommendations:</h3>
          <ul className="list-disc pl-5 text-red-600">
            {assessment.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FeasibilityAssessment;

