import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Divider } from "@mui/material";
import FeasibilityAssessment from "./FeasibilityAssessment";

const FeasibilityModal = ({ isOpen, onClose, propertyData }) => {
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      aria-labelledby="feasibility-assessment-dialog"
    >
      <DialogTitle sx={{ 
        fontWeight: 'bold', 
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)', 
        pb: 1 
      }}>
        Affordability Assessment
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {propertyData ? (
          <FeasibilityAssessment data={propertyData} /> 
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No data available for assessment.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary"
          sx={{ px: 3 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeasibilityModal;