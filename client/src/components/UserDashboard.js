import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch tasks for the past 7 days
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Make a GET request to the updated route that automatically handles the past 7 days
      const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fetch user information
  const fetchUserInfo = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
      // Call fetchTasks after setting the user
      fetchTasks();
    } catch (error) {
      console.error('User verification failed:', error);
      localStorage.removeItem('authToken');
      navigate('/');
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Format time from seconds to "h m s"
  const formatTimeElapsed = (timeSpent) => {
    if (typeof timeSpent !== 'number' || timeSpent <= 0) {
      return '0h 0m 0s';
    }
    const duration = moment.duration(timeSpent, 'seconds');
    return `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;
  };

  return (
    <Box maxW="80%" mx="auto" mt={10} p={5} borderWidth={1} borderRadius="lg">
      <Heading as="h3" size="lg" mb={6} textAlign="center">
        Task Log (Past 7 Days)
      </Heading>

      {/* Task Log Table */}
      <Table variant="striped" colorScheme="teal" mt={4}>
        <Thead>
          <Tr>
            <Th>Queue #</Th>
            <Th>Queue Name</Th>
            <Th>Start Time</Th>
            <Th>End Time</Th>
            <Th>Time Spent</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasks.map((task, index) => (
            <Tr key={task._id}>
              <Td>{index + 1}</Td>
              <Td>{task.queue}</Td>
              <Td>
                {task.startDate
                  ? moment(task.startDate)
                      .tz('America/New_York')
                      .format('MM/DD/YYYY h:mm a z')
                  : 'N/A'}
              </Td>
              <Td>
                {task.endDate
                  ? moment(task.endDate)
                      .tz('America/New_York')
                      .format('MM/DD/YYYY h:mm a z')
                  : 'N/A'}
              </Td>
              {/* Render the timeSpent virtual field correctly */}
              <Td>{formatTimeElapsed(task.timeSpent)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default UserDashboard;
