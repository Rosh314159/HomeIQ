import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const MonthlyOutgoingsChart = ({ feasibilityData, houseData }) => {
  // Extract and format data
  const costData = [
    feasibilityData?.monthly_payment || 0,
    houseData?.heating_cost_current / 12|| 0,
    houseData?.hot_water_cost_current / 12 || 0,
    houseData?.lighting_cost_current / 12|| 0,
    feasibilityData?.monthly_debt_obligations || 0,
  ];
  
  // Format amounts to 2 decimal places
  const formattedData = costData.map(amount => Number(amount).toFixed(2));
  
  // Calculate total monthly outgoings
  const totalMonthlyOutgoings = costData.reduce((sum, value) => sum + Number(value), 0).toFixed(2);

  const costLabels = [
    'Mortgage Payment',
    'Heating',
    'Water',
    'Lighting',
    'Debt Obligations',
  ];

  const monthlyCostsData = {
    labels: costLabels,
    datasets: [
      {
        label: 'Monthly Cost (£)',
        data: formattedData,
        backgroundColor: [
          'rgba(56, 189, 248, 0.8)',  // Blue
          'rgba(251, 146, 60, 0.8)',  // Orange
          'rgba(96, 165, 250, 0.8)',  // Light blue
          'rgba(251, 191, 36, 0.8)',  // Amber
          'rgba(239, 68, 68, 0.8)',   // Red
        ],
        borderColor: [
          'rgba(56, 189, 248, 1)',
          'rgba(251, 146, 60, 1)',
          'rgba(96, 165, 250, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
        hoverOffset: 10,
      },
    ],
  };

  // Custom tooltip to show currency and percentages
  const tooltipOptions = {
    callbacks: {
      label: function(context) {
        const value = context.parsed;
        const total = context.dataset.data.reduce((a, b) => Number(a) + Number(b), 0);
        const percentage = ((value * 100) / total).toFixed(1);
        return `£${value} (${percentage}%)`;
      }
    }
  };

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Chart */}
        <div className="w-full md:w-1/2">
          <Doughnut 
            data={monthlyCostsData} 
            options={{ 
              responsive: true,
              cutout: '65%',
              plugins: { 
                legend: { 
                  display: true,
                  position: 'bottom',
                  labels: {
                    usePointStyle: true,
                    padding: 16,
                    boxWidth: 8,
                  }
                },
                tooltip: tooltipOptions,
              },
            }} 
          />
        </div>
        
        {/* Summary */}
        <div className="w-full md:w-1/2 flex flex-col space-y-4">
          <div className="text-center p-4 bg-blue-50 rounded">
            <p className="text-gray-500 text-sm mb-1">Total Monthly Outgoings</p>
            <p className="text-3xl font-bold text-blue-600">£{totalMonthlyOutgoings}</p>
          </div>
          
          <div className="space-y-2">
            {costLabels.map((label, index) => (
              <div key={index} className="flex justify-between border-b pb-2">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: monthlyCostsData.datasets[0].backgroundColor[index] }}
                  ></div>
                  <span className="text-sm">{label}</span>
                </div>
                <span className="font-medium">£{formattedData[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyOutgoingsChart;
