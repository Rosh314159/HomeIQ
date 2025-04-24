import React from 'react';
import UploadFinancialData from '../components/UpdateFinancialData';
import DisplayFinancialData from '../components/DisplayFinancialData';
import NavBar from '../components/NavBar'
const YourFinancialData = () => {
    const navigateToUpdate = () => {
        window.location.href = '/update-financial-data';
    };

    return (
        <div>
            <div>
                <NavBar />
                <DisplayFinancialData />
            </div>
        </div>
    );
};

export default YourFinancialData;  