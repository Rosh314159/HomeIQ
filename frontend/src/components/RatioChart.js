import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register Chart.js components and annotation plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

const RatioChart = ({ feasibilityData }) => {
  // Extract ratio values
  const dtiRatio = parseFloat(feasibilityData.dti_ratio) || 0;
  const ltvRatio = parseFloat(feasibilityData.ltv_ratio) || 0;
  const mortgageToIncomeRatio = parseFloat(feasibilityData.mortgage_to_income_ratio) || 0;

  // Define threshold values
  const thresholds = {
    dti: 36, // Recommended maximum DTI threshold (%)
    ltv: 95, // Recommended maximum LTV threshold (%)
    mortgageToIncome: 4.5, // Recommended maximum Mortgage-to-Income ratio
  };

  // Check if each ratio exceeds its threshold
  const isDtiRatioExceeded = dtiRatio > thresholds.dti;
  const isLtvRatioExceeded = ltvRatio > thresholds.ltv;
  const isMortgageToIncomeRatioExceeded = mortgageToIncomeRatio > thresholds.mortgageToIncome;

  // Labels for each financial ratio
  const ratioLabels = [
    'Debt-to-Income',
    'Loan-to-Value',
    'Mortgage-to-Income',
  ];

  // Ratio values
  const ratioValues = [dtiRatio, ltvRatio, mortgageToIncomeRatio];

  // Maximum values to display on the chart (for better visualization)
  const maxValues = {
    dti: Math.max(dtiRatio, thresholds.dti) * 1.2,
    ltv: Math.max(ltvRatio, thresholds.ltv) * 1.2,
    mortgageToIncome: Math.max(mortgageToIncomeRatio, thresholds.mortgageToIncome) * 1.2,
  };

  // Determine bar colors based on threshold comparison
  const getBarColor = (index, value) => {
    const thresholdValues = [thresholds.dti, thresholds.ltv, thresholds.mortgageToIncome];
    return value > thresholdValues[index] 
      ? 'rgba(239, 68, 68, 0.7)' // Red for exceeding threshold
      : 'rgba(34, 197, 94, 0.7)'; // Green for within threshold
  };

  // Configure the data for the chart
  const ratioData = {
    labels: ratioLabels,
    datasets: [
      {
        label: 'Current Ratio',
        data: ratioValues,
        backgroundColor: ratioValues.map((value, index) => getBarColor(index, value)),
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  // Chart options with annotations
  const ratioOptions = {
    indexAxis: 'y', // Makes bars horizontal
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const index = context.dataIndex;
            const value = context.parsed.x;
            const thresholdValue = [thresholds.dti, thresholds.ltv, thresholds.mortgageToIncome][index];
            return [
              `Value: ${value.toFixed(1)}%`,
              `Threshold: ${thresholdValue}%`
            ];
          }
        }
      },
      annotation: {
        annotations: {
          dtiThreshold: {
            type: 'line',
            xMin: thresholds.dti,
            xMax: thresholds.dti,
            yMin: -0.4,
            yMax: 0.4,
            borderColor: 'rgba(239, 68, 68, 0.8)',
            borderWidth: 2,
            borderDash: [5, 5],
          },
          ltvThreshold: {
            type: 'line',
            xMin: thresholds.ltv,
            xMax: thresholds.ltv,
            yMin: 0.6,
            yMax: 1.4,
            borderColor: 'rgba(239, 68, 68, 0.8)',
            borderWidth: 2,
            borderDash: [5, 5],
          },
          mortgageToIncomeThreshold: {
            type: 'line',
            xMin: thresholds.mortgageToIncome,
            xMax: thresholds.mortgageToIncome,
            yMin: 1.6,
            yMax: 2.4,
            borderColor: 'rgba(239, 68, 68, 0.8)',
            borderWidth: 2,
            borderDash: [5, 5],
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded shadow p-6">
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Chart */}
        <div className="w-full lg:w-2/3">
          <Bar data={ratioData} options={ratioOptions} height={180} />
        </div>
        
        {/* Key Indicators */}
        <div className="w-full lg:w-1/3 space-y-4">
          <div className={`p-4 rounded ${isDtiRatioExceeded ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className="flex items-center gap-2">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center ${isDtiRatioExceeded ? 'bg-red-500' : 'bg-green-500'}`}>
                <span className="text-white text-xs">{isDtiRatioExceeded ? '!' : '✓'}</span>
              </div>
              <h4 className="font-semibold">Debt-to-Income</h4>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold">{dtiRatio.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">
                Threshold: {thresholds.dti}%
                {isDtiRatioExceeded && 
                  <span className="text-red-500 block mt-1">Exceeds recommended maximum</span>
                }
              </p>
            </div>
          </div>
          
          <div className={`p-4 rounded ${isLtvRatioExceeded ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className="flex items-center gap-2">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center ${isLtvRatioExceeded ? 'bg-red-500' : 'bg-green-500'}`}>
                <span className="text-white text-xs">{isLtvRatioExceeded ? '!' : '✓'}</span>
              </div>
              <h4 className="font-semibold">Loan-to-Value</h4>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold">{ltvRatio.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">
                Threshold: {thresholds.ltv}%
                {isLtvRatioExceeded && 
                  <span className="text-red-500 block mt-1">May require PMI & higher rates</span>
                }
              </p>
            </div>
          </div>
          
          <div className={`p-4 rounded ${isMortgageToIncomeRatioExceeded ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className="flex items-center gap-2">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center ${isMortgageToIncomeRatioExceeded ? 'bg-red-500' : 'bg-green-500'}`}>
                <span className="text-white text-xs">{isMortgageToIncomeRatioExceeded ? '!' : '✓'}</span>
              </div>
              <h4 className="font-semibold">Mortgage-to-Income Ratio</h4>
            </div>
            <div className="mt-2">
              <p className="text-xl font-bold">{mortgageToIncomeRatio.toFixed(1)}</p>
              <p className="text-sm text-gray-600">
                Threshold: {thresholds.mortgageToIncome}
                {isMortgageToIncomeRatioExceeded && 
                  <span className="text-red-500 block mt-1">Potential affordability issues</span>
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatioChart;

