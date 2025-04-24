import React from 'react';
import HouseList from '../components/HouseList';
import { Typography } from '@mui/material';

const Browse = () => {
    return (
        <div>
            <HouseList />
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
        </div>
        
    );
};

export default Browse;