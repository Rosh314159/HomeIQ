import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Box, Paper, Typography, Grid, useTheme } from '@mui/material';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const MonthlyOutgoingsChart = ({ feasibilityData, houseData }) => {
  const theme = useTheme();
  
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
    <Paper 
      elevation={1}
      sx={{ 
        p: 3, 
        borderRadius: 1, 
        bgcolor: 'background.paper'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: 3 
        }}
      >
        {/* Chart */}
        <Box sx={{ width: '100%', maxWidth: { md: '50%' } }}>
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
        </Box>
        
        {/* Summary */}
        <Box 
          sx={{ 
            width: '100%', 
            maxWidth: { md: '50%' },
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <Box 
            sx={{ 
              textAlign: 'center', 
              p: 2, 
              bgcolor: theme.palette.primary.light, 
              borderRadius: 1 
            }}
          >
            <Typography 
              variant="body2" 
              color='white' 
              sx={{ mb: 0.5 }}
            >
              Total Monthly Outgoings
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}
            >
              £{totalMonthlyOutgoings}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {costLabels.map((label, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  borderBottom: 1, 
                  borderColor: 'divider', 
                  pb: 1
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{
                      width: 12, 
                      height: 12, 
                      borderRadius: '50%', 
                      mr: 1,
                      bgcolor: monthlyCostsData.datasets[0].backgroundColor[index]
                    }}
                  />
                  <Typography variant="body2">{label}</Typography>
                </Box>
                <Typography variant="body2" fontWeight="medium">
                  £{formattedData[index]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default MonthlyOutgoingsChart;
