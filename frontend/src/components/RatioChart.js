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
import {
  Box,
  Paper,
  Typography,
  Grid,
  useTheme
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

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
  const theme = useTheme();
  
  // Extract ratio values
  const dtiRatio = parseFloat(feasibilityData.dti_ratio) || 0;
  const ltvRatio = parseFloat(feasibilityData.ltv_ratio) || 0;
  const mortgageToIncomeRatio = parseFloat(feasibilityData.mortgage_to_income_ratio) || 0;

 
  const thresholds = {
    dti: 36, // maxi DTI threshold
    ltv: 95, //  max LTV threshold
    mortgageToIncome: 4.5, 
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

  const ratioValues = [dtiRatio, ltvRatio, mortgageToIncomeRatio];

  // Maximum values to display on the chart
  const maxValues = {
    dti: Math.max(dtiRatio, thresholds.dti) * 1.2,
    ltv: Math.max(ltvRatio, thresholds.ltv) * 1.2,
    mortgageToIncome: Math.max(mortgageToIncomeRatio, thresholds.mortgageToIncome) * 1.2,
  };

  // Determine bar colors based on threshold comparison
  const getBarColor = (index, value) => {
    const thresholdValues = [thresholds.dti, thresholds.ltv, thresholds.mortgageToIncome];
    return value > thresholdValues[index] 
      ? 'red' 
      : 'green';
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
    <Paper 
      elevation={1}
      sx={{ 
        p: 3, 
        borderRadius: 1, 
        bgcolor: 'background.paper'
      }}
    >
      <Grid container spacing={3} alignItems="flex-start">
        {/* Chart */}
        <Grid item xs={12} lg={8}>
          <Bar data={ratioData} options={ratioOptions} height={180} />
        </Grid>
        
        {/* Key Indicators */}
        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* DTI Ratio */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 1, 
                bgcolor: isDtiRatioExceeded ? 'error.light' : 'success.light' 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    height: 20, 
                    width: 20, 
                    borderRadius: '50%', 
                    bgcolor: isDtiRatioExceeded ? 'error.main' : 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isDtiRatioExceeded ? (
                    <PriorityHighIcon sx={{ color: 'white', fontSize: '0.75rem' }} />
                  ) : (
                    <CheckIcon sx={{ color: 'white', fontSize: '0.75rem' }} />
                  )}
                </Box>
                <Typography variant="subtitle2" fontWeight="medium">
                  Debt-to-Income
                </Typography>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  {dtiRatio.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Threshold: {thresholds.dti}%
                </Typography>
                {isDtiRatioExceeded && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'error.main', 
                      mt: 0.5 
                    }}
                  >
                    Exceeds recommended maximum
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* LTV Ratio */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 1, 
                bgcolor: isLtvRatioExceeded ? 'error.light' : 'success.light' 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    height: 20, 
                    width: 20, 
                    borderRadius: '50%', 
                    bgcolor: isLtvRatioExceeded ? 'error.main' : 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isLtvRatioExceeded ? (
                    <PriorityHighIcon sx={{ color: 'white', fontSize: '0.75rem' }} />
                  ) : (
                    <CheckIcon sx={{ color: 'white', fontSize: '0.75rem' }} />
                  )}
                </Box>
                <Typography variant="subtitle2" fontWeight="medium">
                  Loan-to-Value
                </Typography>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  {ltvRatio.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Threshold: {thresholds.ltv}%
                </Typography>
                {isLtvRatioExceeded && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'error.main', 
                      mt: 0.5 
                    }}
                  >
                    May require PMI & higher rates
                  </Typography>
                )}
              </Box>
            </Paper>

            {/* Mortgage-to-Income Ratio */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 2, 
                borderRadius: 1, 
                bgcolor: isMortgageToIncomeRatioExceeded ? 'error.light' : 'success.light' 
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box 
                  sx={{ 
                    height: 20, 
                    width: 20, 
                    borderRadius: '50%', 
                    bgcolor: isMortgageToIncomeRatioExceeded ? 'error.main' : 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {isMortgageToIncomeRatioExceeded ? (
                    <PriorityHighIcon sx={{ color: 'white', fontSize: '0.75rem' }} />
                  ) : (
                    <CheckIcon sx={{ color: 'white', fontSize: '0.75rem' }} />
                  )}
                </Box>
                <Typography variant="subtitle2" fontWeight="medium">
                  Mortgage-to-Income Ratio
                </Typography>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  {mortgageToIncomeRatio.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Threshold: {thresholds.mortgageToIncome}
                </Typography>
                {isMortgageToIncomeRatioExceeded && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'error.main', 
                      mt: 0.5 
                    }}
                  >
                    Potential affordability issues
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default RatioChart;
