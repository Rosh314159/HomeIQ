import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const SectionHeader = styled(Box)(({ theme, bgcolor }) => ({
  backgroundColor: bgcolor || theme.palette.primary.main,
  color: 'white',
  padding: theme.spacing(1.5, 2),
  borderTopLeftRadius: theme.shape.borderRadius,
  borderTopRightRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
}));

const SectionContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
}));

const PropertySection = ({ title, icon, bgcolor, children }) => {
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        borderRadius: 2, 
        overflow: 'hidden',
        height: '100%',
        transition: 'box-shadow 0.3s ease',
        '&:hover': {
          boxShadow: 4
        }
      }}
    >
      <SectionHeader bgcolor={bgcolor}>
        <Box component="span" sx={{ mr: 1 }}>{icon}</Box>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      </SectionHeader>
      <SectionContent>
        {children}
      </SectionContent>
    </Paper>
  );
};

// Helper component for consistent list items
export const PropertyListItem = ({ icon, primary, secondary }) => {
  return (
    <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
      <ListItemIcon sx={{ minWidth: 42 }}>
        {icon}
      </ListItemIcon>
      <ListItemText 
        primary={
          <Typography variant="subtitle2" fontWeight={500}>
            {primary}
          </Typography>
        } 
        secondary={secondary}
      />
    </ListItem>
  );
};

export default PropertySection;