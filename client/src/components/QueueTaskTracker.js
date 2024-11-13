import React, { useState, useEffect } from 'react';
import { Box, FormControl, FormLabel, Input, Button, Heading, useToast } from '@chakra-ui/react';
import ReactSelect from 'react-select';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const QueueTaskTracker = () => {
  const [selectedQueue, setSelectedQueue] = useState(null);
  // const [taskId, setTaskId] = useState(''); 
  // Cost Management doesn't need CSI IDs
  const [taskLog, setTaskLog] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [taskInProgress, setTaskInProgress] = useState(false);
  const [timeBeforePause, setTimeBeforePause] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const queues = [
    'Medical Records Requests',
    'Medical Records SF',
    'Programs Cases',
  ];

  // Fetch today's tasks for the logged-in user
  const fetchTodaysTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks/today`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      console.log("Fetched today's tasks:", response.data);
      setTaskLog(response.data);
    } catch (error) {
      console.error("Error fetching today's tasks:", error);

      if (error.response && error.response.status === 401) {
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });

        localStorage.removeItem('authToken');
        navigate('/');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch tasks. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Fetch tasks for today on component mount
  useEffect(() => {
    fetchTodaysTasks();
  }, [navigate, toast]);

  useEffect(() => {
    let timer;
    if (taskInProgress && !isPaused && startTime) {
      timer = setInterval(() => {
        const seconds = ((Date.now() - startTime) / 1000).toFixed(0);
        setTimeElapsed(formatTimeElapsed(seconds));
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [taskInProgress, isPaused, startTime]);

  const handleTaskSaveError = (error) => {
    if (error.response) {
      console.error('Server response with error:', error.response);
      if (error.response.status === 401) {
        toast({
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
  
        localStorage.removeItem('authToken');
        navigate('/');
      } else {
        toast({
          title: 'Error',
          description: error.response.data.error || 'Failed to save the task. Please try again.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      console.error('Request error:', error.message);
      toast({
        title: 'Network Error',
        description: 'Could not connect to the server. Please try again later.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  
  // Format time from seconds to "h m s"
  const formatTimeElapsed = (seconds) => {
    const duration = moment.duration(seconds, 'seconds');
    return `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;
  };

  const handleQueueChange = (event) => {
    if (event) {
      setSelectedQueue(event);
      // setTaskId('');
      setTaskInProgress(false);
      setTimeElapsed(0);
    }
  };

  const handleStartTask = async () => {
    if (selectedQueue) {
      setStartTime(Date.now());
      setTaskInProgress(true);
      setIsPaused(false);
      setTimeElapsed(0);
  
      // Create a new task with completed: false
      const newTask = {
        queue: selectedQueue.value,
        timeSpent: 0,
        completed: false, // Set completed as false when starting the task
      };
  
      try {
        const response = await axios.post(`${API_BASE_URL}/api/tasks`, newTask, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
  
        console.log('Task started successfully:', response.data);
      } catch (error) {
        console.error('Error starting task:', error);
        handleTaskSaveError(error);
      }
    }
  };
  
  

  const handleTaskComplete = async () => {
    if (selectedQueue) {
      // Stop timer and calculate time spent
      const endTime = Date.now();
      const totalSeconds = ((endTime - startTime) / 1000).toFixed(0);
  
      try {
        // Find the last task that matches the selected queue and is not completed
        const lastTask = taskLog.find(task => !task.completed && task.queue === selectedQueue.value);
  
        if (!lastTask) {
          // If no matching task is found, display an error message and stop here
          toast({
            title: 'No Task Found',
            description: 'No incomplete task found for the selected queue.',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
          return;
        }
  
        // Proceed to update the task with completion data
        const response = await axios.put(`${API_BASE_URL}/api/tasks/complete/${lastTask.taskId}`, {
          timeSpent: parseInt(totalSeconds, 10),
          completed: true,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
  
        console.log('Task completed successfully:', response.data);
  
        // Stop the timer and reset relevant states
        setTaskInProgress(false);
        setIsPaused(false);
        setStartTime(null);
        setTimeElapsed(0);
  
        // Fetch updated task list to refresh the log
        fetchTodaysTasks();
      } catch (error) {
        console.error('Error completing task:', error);
        handleTaskSaveError(error);
      }
    } else {
      toast({
        title: 'Invalid Action',
        description: 'Please select a queue before completing the task.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  

  


  const handlePauseResume = () => {
    if (isPaused) {
      setStartTime(Date.now() - timeBeforePause);
      setIsPaused(false);
    } else {
      setTimeBeforePause(Date.now() - startTime);
      setIsPaused(true);
    }
  };

  
  return (
    <Box maxW={{ base: '100%', md: '66vw' }} mx="auto" mt={10} p={5} borderWidth={1} borderRadius="lg">
      <Heading as="h3" size="lg" mb={4} textAlign="center">
        Task Tracker
      </Heading>

      <FormControl id="queue-selection" mb={4}>
        <FormLabel>Select Queue</FormLabel>
        <ReactSelect
          placeholder="Type Your Queue Name"
          value={selectedQueue}
          onChange={handleQueueChange}
          options={queues.map((queue) => ({ value: queue, label: queue }))}
          isSearchable
        />
      </FormControl>

      {selectedQueue && (
        <>
          {taskInProgress && (
            <Box mt={4} my={6} fontWeight="bold" textAlign="center">
              Time Spent on Current Task: {timeElapsed}
            </Box>
          )}

          {!taskInProgress ? (
            <Button colorScheme="teal" mr={4} onClick={handleStartTask}>
              Start Task
            </Button>
          ) : (
            <Button colorScheme="teal" mr={4} onClick={handleTaskComplete}>
              Finish Task
            </Button>
          )}
          
          <Button colorScheme="teal" onClick={handlePauseResume} isDisabled={!taskInProgress}>
            {isPaused ? 'Resume Timer' : 'Pause Timer'}
          </Button>
        </>
      )}

      <Box my={6} overflowX="auto">
        <Heading as="h4" size="md" mb={4} textAlign="center">
          Task Log
        </Heading>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px', width: '15%' }}>Task ID</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', width: '15%' }}>Queue</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', width: '15%' }}>Time Spent</th>
            </tr>
          </thead>
          <tbody>
            {taskLog.map((task, index) => (
              <tr key={task._id}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{task.taskId}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{task.queue}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{formatTimeElapsed(task.timeSpent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default QueueTaskTracker;
