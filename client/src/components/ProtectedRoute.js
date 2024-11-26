import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';

const ProtectedRoute = ({ children }) => {
  const toast = useToast();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('authToken');

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: 'Unauthorized Access',
        description: 'You need to log in to access this page.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [isAuthenticated, toast]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
