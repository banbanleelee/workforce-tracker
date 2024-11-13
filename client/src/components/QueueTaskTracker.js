import React, { useState, useEffect } from 'react';
import { Box, FormControl, FormLabel, Button, Heading, useToast } from '@chakra-ui/react';
import ReactSelect from 'react-select';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import moment from 'moment-timezone';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const QueueTaskTracker = () => {
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [taskLog, setTaskLog] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [taskInProgress, setTaskInProgress] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lockedQueue, setLockedQueue] = useState(null);
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

      // Find the latest incomplete task (if it exists)
      const latestIncompleteTask = response.data.find(task => !task.completed);
      if (latestIncompleteTask) {
        setActiveTask(latestIncompleteTask);
        setTaskInProgress(true);
        setLockedQueue(latestIncompleteTask.queue); // Lock the queue for the ongoing task

        // Calculate elapsed time based on the task's creation time
        const elapsedTime = Math.floor((Date.now() - new Date(latestIncompleteTask.createdAt)) / 1000);
        setTimeElapsed(elapsedTime);
      } else {
        setActiveTask(null);
        setTaskInProgress(false);
        setTimeElapsed(0);
        setLockedQueue(null); // No task in progress, no locked queue
      }
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
    if (taskInProgress && !isPaused && activeTask) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [taskInProgress, isPaused, activeTask]);

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
    }
  };

  const handleStartTask = async () => {
    if (selectedQueue) {
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
        setActiveTask(response.data);
        setLockedQueue(selectedQueue.value); // Lock the queue to the current task's queue

        // Immediately fetch updated tasks to ensure taskLog is up to date
        await fetchTodaysTasks();
      } catch (error) {
        console.error('Error starting task:', error);
        handleTaskSaveError(error);
      }
    }
  };
  
  const handleTaskComplete = async () => {
    if (activeTask) {
      // Stop timer and calculate time spent
      try {
        const totalSeconds = timeElapsed;
        const response = await axios.put(`${API_BASE_URL}/api/tasks/complete/${activeTask.taskId}`, {
          timeSpent: totalSeconds,
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
        setActiveTask(null);
        setTimeElapsed(0);
        setLockedQueue(null);
  
        // Fetch updated task list to refresh the log
        await fetchTodaysTasks();
      } catch (error) {
        console.error('Error completing task:', error);
        handleTaskSaveError(error);
      }
    }
  }; 

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  return (
    <Box maxW={{ base: '100%', md: '66vw' }} mx="auto" mt={10} p={5} borderWidth={1} borderRadius="lg">
      <Heading as="h3" size="lg" mb={4} textAlign="center">
        Task Tracker
      </Heading>
      <Heading as="h4" size="md" mb={4} textAlign="center">
        {moment().format('dddd, MMMM Do YYYY')}
      </Heading>

      {!taskInProgress && (
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
      )}

      {lockedQueue && (
        <Box mt={4} my={6} fontWeight="bold" textAlign="center">
          Currently Tracking Task in Queue: {lockedQueue}
        </Box>
      )}

      {taskInProgress && (
        <Box mt={4} my={6} fontWeight="bold" textAlign="center">
          Time Spent on Current Task: {formatTimeElapsed(timeElapsed)}
        </Box>
      )}

      {!taskInProgress ? (
        <Button colorScheme="teal" mr={4} onClick={handleStartTask} isDisabled={!selectedQueue}>
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

      <Box my={6} overflowX="auto">
        <Heading as="h4" size="md" mb={4} textAlign="center">
          Task Log
        </Heading>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px', width: '15%' }}>Queue #</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', width: '15%' }}>Queue Type</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', width: '15%' }}>Start Time</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', width: '15%' }}>End Time</th>
              <th style={{ border: '1px solid #ccc', padding: '8px', width: '15%' }}>Time Spent</th>
            </tr>
          </thead>
          <tbody>
            {taskLog
              .filter(task => task.completed) // Only include completed tasks
              .map((task, index) => (
                <tr key={task._id}>
                  <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', fontSize: '14px', whiteSpace: 'nowrap' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '14px', whiteSpace: 'nowrap' }}>{task.queue}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '14px', whiteSpace: 'nowrap' }}>{moment(task.createdAt).tz(moment.tz.guess()).format('h:mm a z')}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '14px', whiteSpace: 'nowrap' }}>{moment(task.updatedAt).tz(moment.tz.guess()).format('h:mm a z')}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px', fontSize: '14px', whiteSpace: 'nowrap' }}>{formatTimeElapsed(task.timeSpent)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
};

export default QueueTaskTracker;
