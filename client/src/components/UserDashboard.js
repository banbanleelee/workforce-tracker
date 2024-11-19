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
    console.log('fetchTasks called');
    try {
      const token = localStorage.getItem('authToken');
      console.log('Auth token in fetchTasks:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching tasks for the past 7 days');

      // Make a GET request to the updated route that automatically handles the past 7 days
      const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response data:', response.data);
      setTasks(response.data);
      console.log('Tasks state updated:', response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
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
    console.log('fetchUserInfo called');
    const token = localStorage.getItem('authToken');
    console.log('Auth token:', token);
    if (!token) {
      navigate('/');
      return;
    }

    try {
      console.log('Fetching user info...');
      const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Received response:', response);
      console.log('User info response:', response.data);
      setUser(response.data);
      // Call fetchTasks after setting the user
      fetchTasks();
    } catch (error) {
      console.error('User verification failed:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received from server:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      localStorage.removeItem('authToken');
      navigate('/');
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Format time from seconds to "h m s"
  const formatTimeElapsed = (timeSpent) => {
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
          {tasks.map((task, index) => {
            // Log each task that is being rendered
            console.log("Rendering Task:", {
              queue: task.queue,
              startDate: task.startDate,
              endDate: task.endDate,
              timeSpent: task.timeSpent,
            });

            return (
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
                <Td>{formatTimeElapsed(task.timeSpent)}</Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default UserDashboard;
