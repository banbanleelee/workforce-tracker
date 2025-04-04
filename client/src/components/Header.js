import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Heading, Spacer, Text } from '@chakra-ui/react';
import { jwtDecode } from 'jwt-decode';

const Header = () => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem('authToken');
  let userRole = null;
  let firstName = null;

  if (authToken) {
    try {
      const decodedToken = jwtDecode(authToken);
      userRole = decodedToken.role;
      firstName = decodedToken.firstName;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      localStorage.removeItem('authToken');
      navigate('/');
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  console.log(firstName);

  return (
    <Box bg="teal.500" p={4} color="white">
      <Flex alignItems="center">
        <Heading as="h1" size="md">
          {authToken ? `Hello, ${firstName}!` : 'CCM WFM Hub'}        
        </Heading>
        <Spacer />
        {!authToken && firstName && (
          <>
            <Button as={Link} to="/" colorScheme="teal" variant="outline" mr={2}>
              Login
            </Button>
            <Button as={Link} to="/signup" colorScheme="teal" variant="outline" mr={2}>
              Sign Up
            </Button>
          </>
        )}
        {authToken && (
          <>
            {userRole !== 'admin' && (
              <Button as={Link} to="/task-tracker" target="_blank" colorScheme="teal" variant="outline" mr={2}>
                Task Tracker
              </Button>
            )}
           
              <Button as={Link} to="/provider-directory" target="_blank" colorScheme="teal" variant="outline" mr={2}>
                Provider Directory
              </Button>
            
            {/* New Button for Bulk Search */}
            <Button as={Link} to="/bulk-search" target="_blank" colorScheme="teal" variant="outline" mr={2}>
              Bulk Search
            </Button>

            {userRole === 'admin' && (
              <Button as={Link} to="/fh-referral" colorScheme="teal" variant="outline" mr={2}>
                FH Referral Portal
              </Button>
            )}

            <Button
              as={Link}
              to={userRole === 'admin' ? '/admin-dashboard' : '/user-dashboard'}
              target="_blank"
              colorScheme="teal"
              variant="outline"
              mr={2}
            >
              Dashboard
            </Button>
            
            <Button onClick={handleLogout} colorScheme="teal" variant="outline">
              Logout
            </Button>
          </>
        )}
      </Flex>
    </Box>
  );
};

export default Header;
