import React from 'react';
import UploadFinancialData from '../components/UploadFinancialData';
import DisplayFinancialData from '../components/DisplayFinancialData';
import NavBar from '../components/NavBar'
const FinancialDetails = () => {
    return (
        <div>
            <div>
                <NavBar />
                <UploadFinancialData />
            </div>
            
            
        </div>
    );
};

export default FinancialDetails;