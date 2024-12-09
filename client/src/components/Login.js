import React, { useState } from 'react';
import { Box, FormControl, FormLabel, Input, Button, Heading, useToast, Spinner } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isServerWakingUp, setIsServerWakingUp] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const ROLE_ROUTES = {
    admin: '/admin-dashboard',
    user: '/task-tracker',
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Validation Error',
        description: 'Email and password are required.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    setIsServerWakingUp(false);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { token, role } = response.data;
      localStorage.setItem('authToken', token);

      toast({
        title: 'Login Successful',
        description: 'You have been logged in successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate(ROLE_ROUTES[role] || '/task-tracker');
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 404 && data.error === 'User not found') {
          toast({
            title: 'Login Failed',
            description: 'No account found with the provided email.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        } else if (status === 400 && data.error === 'Invalid credentials') {
          toast({
            title: 'Login Failed',
            description: 'Email or password is incorrect.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Server Error',
            description: data.error || 'An error occurred. Please try again later.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      } else if (error.request) {
        if (!isServerWakingUp) {
          // Inform user the server might be waking up
          setIsServerWakingUp(true);
          toast({
            title: 'Server Starting Up',
            description: 'The server is waking up due to inactivity. Please wait a moment and try again.',
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
        }
      } else {
        toast({
          title: 'Unexpected Error',
          description: error.message || 'Something went wrong. Please try again later.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={5} borderWidth={1} borderRadius="lg">
      <Heading as="h3" size="lg" mb={6}>
        Login
      </Heading>
      <form onSubmit={handleLogin}>
        <FormControl id="email" mb={4}>
          <FormLabel>Email Address</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </FormControl>

        <FormControl id="password" mb={4}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
        </FormControl>

        <Button colorScheme="teal" type="submit" width="full" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" /> : 'Login'}
        </Button>
      </form>
    </Box>
  );
};

export default Login;
