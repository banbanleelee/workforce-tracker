import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Flex, Heading, Spacer } from '@chakra-ui/react';
import { jwtDecode } from 'jwt-decode';

const Header = () => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem('authToken');
  let userRole = null;

  if (authToken) {
    try {
      const decodedToken = jwtDecode(authToken);
      userRole = decodedToken.role;
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

  return (
    <Box bg="teal.500" p={4} color="white">
      <Flex alignItems="center">
        <Heading as="h1" size="md">
          Workforce Tracker
        </Heading>
        <Spacer />
        {!authToken && (
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
