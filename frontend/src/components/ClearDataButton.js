import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const ClearDataButton = ({ buttonStyle = {} }) => {
  // State for dialog and snackbar
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  
  // Function to handle clearing local storage
  const handleClearData = () => {
    localStorage.clear();
    console.log("Local storage data cleared");
    setDialogOpen(false);
    setSnackbarOpen(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <>
      {/* Clear Data button */}
      <Button
        color="inherit"
        startIcon={<DeleteIcon />}
        onClick={handleOpenDialog}
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.1)',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.2)',
          },
          ...buttonStyle
        }}
      >
        Clear Data
      </Button>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          Clear Saved Data?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will remove all saved information including your recent searches, 
            financial data, and preferences. The page will refresh after clearing data.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            color="primary"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleClearData} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Clear Data
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Pop up */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={1000} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Data cleared successfully. Refreshing...
        </Alert>
      </Snackbar>
    </>
  );
};

export default ClearDataButton;