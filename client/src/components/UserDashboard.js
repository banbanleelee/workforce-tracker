import React, { useEffect, useState } from 'react';
import { Box, Heading, Button, Input, Table, Tbody, Td, Th, Thead, Tr, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import moment from 'moment';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })));
  const [endDate, setEndDate] = useState(new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })));
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const toast = useToast();

  // Fetch tasks for selected date range
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/api/tasks`, {
        params: {
          startDate: startDate ? startDate.toISOString() : null,
          endDate: endDate ? endDate.toISOString() : null,
        },
        headers: {
          'Authorization': `Bearer ${token}`,
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
          'Authorization': `Bearer ${token}`,
        },
      });
      setUser(response.data);
      // Automatically fetch today's tasks when the user is authorized
      fetchTasks();
    } catch (error) {
      console.error('User verification failed:', error);
      localStorage.removeItem('authToken');
      navigate('/');
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, [navigate, toast]);

  // Format time from seconds to "h m s"
  const formatTimeElapsed = (timeSpent) => {
    const duration = moment.duration(timeSpent, 'seconds');
    return `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;
  };

  // Export tasks to Excel with a specific filename format
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      tasks.map((task) => ({
        'Task ID': task.taskId,
        Queue: task.queue,
        'Time Spent (seconds)': task.timeSpent, // Store raw seconds for time spent
        'Date Completed': XLSX.SSF.format("yyyy-mm-dd", new Date(task.createdAt)), // Format to Excel-compatible date
      }))
    );
  
    console.log(user); // confirm if user object is fetched correctly
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
  
    // Construct file name using user's first name, last name, and date range
    const start = startDate ? moment(startDate).format('YYYY-MM-DD') : '';
    const end = endDate ? moment(endDate).format('YYYY-MM-DD') : '';
    const dateRange = start && end ? `${start}_to_${end}` : start || end || 'date_range';
    const fileName = `${user.lastName}_${user.firstName}_${dateRange}.xlsx`;
  
    // Write file
    XLSX.writeFile(workbook, fileName);
  };
  

  return (
    <Box maxW="80%" mx="auto" mt={10} p={5} borderWidth={1} borderRadius="lg">
      <Heading as="h3" size="lg" mb={6} textAlign="center">
        User Dashboard
      </Heading>

      {/* Date Range Picker */}
      <Box mb={6} display="flex" justifyContent="center" alignItems="center">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Start Date"
          isClearable
        />
        <Box mx={4}>to</Box>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          placeholderText="End Date"
          isClearable
        />
        <Button colorScheme="teal" ml={4} onClick={fetchTasks}>
          Load Tasks
        </Button>
        {/* <Button colorScheme="blue" ml={4} onClick={exportToExcel}>
          Export to Excel
        </Button> */}
      </Box>

      {/* Task Log Table */}
      <Table variant="striped" colorScheme="teal" mt={4}>
        <Thead>
          <Tr>
            <Th>Task ID</Th>
            <Th>Queue</Th>
            <Th>Time Spent</Th>
            <Th>Date Completed</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasks.map((task, index) => (
            <Tr key={task._id}>
              <Td>{task.taskId}</Td>
              <Td>{task.queue}</Td>
              <Td>{formatTimeElapsed(task.timeSpent)}</Td>
              <Td>{new Date(task.createdAt).toLocaleString()}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default UserDashboard;
