import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ClearDataButton from './ClearDataButton';

const Navbar = () => {
  // Navigation items
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Search', path: '/search' },
    { name: 'Your Financial Data', path: '/your-financial-data' },
    { name: 'About', path: '/about' }
  ];
  
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {/* Logo and brand name */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <HomeIcon sx={{ mr: 1 }} />
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ 
              textDecoration: 'none',
              color: 'white',
              fontWeight: 600
            }}
          >
            HomeIQ
          </Typography>
        </Box>
        
        {/* Navigation buttons */}
        <Box sx={{ display: 'flex' }}>
          {navItems.map((item) => (
            <Button 
              key={item.name}
              component={RouterLink}
              to={item.path}
              color="inherit"
              sx={{ mx: 1 }}
            >
              {item.name}
            </Button>
          ))}
          
          {/* Clear Data button component */}
          <ClearDataButton buttonStyle={{ ml: 2 }} />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;