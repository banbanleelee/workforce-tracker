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

  // Adjust the dates to match the range where tasks exist
  const [startDate] = useState(
    new Date('2024-11-11T00:00:00-05:00') // November 11, 2024
  );
  const [endDate] = useState(
    new Date('2024-11-16T23:59:59-05:00') // November 16, 2024
  );

  // Log the current date and adjusted start and end dates
  console.log(
    'Current date according to moment:',
    moment.tz('America/New_York').format()
  );
  console.log('Adjusted startDate:', startDate);
  console.log('Adjusted endDate:', endDate);

  // Fetch tasks for the selected date range
  const fetchTasks = async () => {
    console.log('fetchTasks called');
    try {
      const token = localStorage.getItem('authToken');
      console.log('Auth token in fetchTasks:', token);
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formattedStartDate = moment(startDate).format('YYYY-MM-DD');
      const formattedEndDate = moment(endDate).format('YYYY-MM-DD');

      console.log('Fetching tasks with the following parameters:');
      console.log('Start Date:', formattedStartDate);
      console.log('End Date:', formattedEndDate);

      const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
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
            <Th>Time Spent</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasks.map((task, index) => (
              <Tr key={task._id}>
                <Td>{index + 1}</Td>
                <Td>{task.queue}</Td>
                <Td>
                  {moment(task.createdAt)
                    .tz('America/New_York')
                    .format('MM/DD/YYYY h:mm a z')}
                </Td>
                <Td>{formatTimeElapsed(task.timeSpent)}</Td>
              </Tr>
            ))
          }
        </Tbody>
      </Table>
    </Box>
  );
};

export default UserDashboard;
