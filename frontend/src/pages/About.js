import React from 'react';
import { Box, Typography, Divider, Container } from '@mui/material';
import NavBar from '../components/NavBar';
import UpdateFinancialData from '../components/UpdateFinancialData';
import DisplayFinancialData from '../components/DisplayFinancialData';

const About = () => {
  return (
    <>
      <NavBar />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          About This Website
        </Typography>
        <Typography variant="body1" paragraph>
          This website provides AI-powered property price predictions using machine learning. 
          It allows users to estimate the market value of a residential property based on a range 
          of inputs such as location, property type, floor area, and proximity to local amenities.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom fontWeight={600}>
          How It Works
        </Typography>
        <Typography variant="body1" paragraph>
          Our model uses a Random Forest algorithm trained on real property transaction and location data. 
          When you submit a property for analysis, the model evaluates various features that influence 
          price (e.g., floor area, local average prices, distances to schools and transport) and predicts a likely value.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom fontWeight={600}>
          How to Use It
        </Typography>
        <Typography variant="body1" paragraph>
          - Use the search or input tool to enter a property’s details.<br />
          - Submit the form to receive a price prediction.<br />
          - Click the info icon next to the price to view the key drivers behind the prediction.<br />
          - You can also update financial datasets or view the data being used behind the scenes.
        </Typography>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h5" gutterBottom fontWeight={600}>
          Disclaimer
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The information provided by this website is for informational and educational purposes only. 
          It does not constitute financial, investment, or real estate advice. Property prices are influenced 
          by many complex and unpredictable factors, and our predictions should not be relied upon for making 
          purchase, sale, or investment decisions.
          <br /><br />
          Always consult with a qualified professional before making any real estate or financial commitments.
        </Typography>
      </Container>
    </>
  );
};

export default About;
