import React, { useState, useEffect } from 'react';
import { Box, Heading, Button, Flex, Table, Tbody, Td, Th, Thead, Tr, useToast, Spinner, Input } from '@chakra-ui/react';
import axios from 'axios';
import moment from 'moment';
import * as XLSX from 'xlsx';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const AdminDashboard = () => {
  const [view, setView] = useState('realTime'); // 'realTime' or 'browseAndDownload'
  const [currentTasks, setCurrentTasks] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [realTimeSortConfig, setRealTimeSortConfig] = useState({ key: null, direction: 'ascending' });
  const [downloadSortConfig, setDownloadSortConfig] = useState({ key: null, direction: 'ascending' });

  // Helper function to format time into h m s
  const formatTimeElapsed = (seconds) => {
    const duration = moment.duration(seconds, 'seconds');
    return `${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;
  };

  // Update the requestSort function for each table
  const requestRealTimeSort = (key) => {
    let direction = 'ascending';
    if (realTimeSortConfig.key === key && realTimeSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setRealTimeSortConfig({ key, direction });
  };
  
  const requestDownloadSort = (key) => {
    let direction = 'ascending';
    if (downloadSortConfig.key === key && downloadSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setDownloadSortConfig({ key, direction });
  };
 
  // Apply Different Sorting Logic for Each Table - Real-Time Data Table Sorting
  const sortedCurrentTasks = [...currentTasks].sort((a, b) => {
    if (realTimeSortConfig.key) {
      let aValue, bValue;
  
      if (realTimeSortConfig.key === 'teamMember') {
        aValue = `${a.user.firstName} ${a.user.lastName}`;
        bValue = `${b.user.firstName} ${b.user.lastName}`;
      } else if (realTimeSortConfig.key === 'timeSpent') {
        aValue = a.activeTask ? a.activeTask.timeSpentFormatted : '';
        bValue = b.activeTask ? b.activeTask.timeSpentFormatted : '';
      } else if (realTimeSortConfig.key === 'status') {
        aValue = a.activeTask && !a.activeTask.completed ? 'Active' : 'Idle';
        bValue = b.activeTask && !b.activeTask.completed ? 'Active' : 'Idle';
      } else {
        aValue = a.activeTask ? a.activeTask[realTimeSortConfig.key] : '';
        bValue = b.activeTask ? b.activeTask[realTimeSortConfig.key] : '';
      }
  
      if (aValue < bValue) {
        return realTimeSortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return realTimeSortConfig.direction === 'ascending' ? 1 : -1;
      }
    }
    return 0;
  });
  
  // Apply Different Sorting Logic for Each Table - Download Data Table Sorting
  const sortedTasksData = [...tasksData].sort((a, b) => {
    if (downloadSortConfig.key) {
      let aValue, bValue;
  
      if (downloadSortConfig.key === 'teamMember') {
        aValue = a.teamMember;
        bValue = b.teamMember;
      } else if (downloadSortConfig.key === 'timeSpent') {
        aValue = a.timeSpent;
        bValue = b.timeSpent;
      } else if (downloadSortConfig.key === 'dateCompleted') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else {
        aValue = a[downloadSortConfig.key];
        bValue = b[downloadSortConfig.key];
      }
  
      if (aValue < bValue) {
        return downloadSortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return downloadSortConfig.direction === 'ascending' ? 1 : -1;
      }
    }
    return 0;
  });  

  // Fetch Current Tasks for Real-Time Monitoring
  const fetchCurrentTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks/current-tasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      const fetchedTasks = response.data.map((userTask) => {
        if (userTask.activeTask && !userTask.activeTask.completed) {
          // Calculate the elapsed time dynamically
          const elapsedSeconds = Math.floor((Date.now() - new Date(userTask.activeTask.createdAt).getTime()) / 1000);
          userTask.activeTask.timeSpentFormatted = formatTimeElapsed(elapsedSeconds);
        }
        return userTask;
      });

      setCurrentTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching current tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let intervalId;

    if (view === 'realTime') {
      fetchCurrentTasks();
      intervalId = setInterval(fetchCurrentTasks, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [view]);

  // Use an interval to update time spent dynamically for each active task
  useEffect(() => {
    let intervalId;

    if (view === 'realTime') {
      intervalId = setInterval(() => {
        setCurrentTasks((prevTasks) =>
          prevTasks.map((task) => {
            if (task.activeTask && !task.activeTask.completed) {
              // Calculate elapsed seconds since task was created
              const elapsedSeconds = Math.floor((Date.now() - new Date(task.activeTask.createdAt).getTime()) / 1000);
              return {
                ...task,
                activeTask: {
                  ...task.activeTask,
                  timeSpentFormatted: formatTimeElapsed(elapsedSeconds),
                },
              };
            }
            return task; // Return the task unchanged if it's completed
          })
        );
      }, 1000); // Update every second
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [view]);

  // Fetch tasks based on date range for all team members
  const fetchTasksByDateRange = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Missing Information',
        description: 'Please select a date range.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks/all-tasks-by-date`, {
        params: {
          startDate,
          endDate,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setTasksData(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Export tasks to Excel
  const exportToExcel = () => {
    if (tasksData.length === 0) {
      toast({
        title: 'No Data',
        description: 'No tasks available to export.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      tasksData.map((task) => ({
        'Task ID': task.taskId,
        'Team Member': task.teamMember,
        Queue: task.queue,
        'Time Spent (s)': task.timeSpent,
        'Date Completed': new Date(task.createdAt).toLocaleDateString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Team Member Tasks');

    const dateRange = `${moment(startDate).format('YYYYMMDD')}_to_${moment(endDate).format('YYYYMMDD')}`;
    const fileName = `tasks_all_team_members_${dateRange}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box maxW="80%" mx="auto" mt={10} p={5} borderWidth={1} borderRadius="lg">
      <Heading as="h3" size="lg" mb={6} textAlign="center">
        Admin Dashboard
      </Heading>

      {/* Panel for Selecting View */}
      <Flex justifyContent="center" mb={6}>
        <Button colorScheme="teal" mr={4} onClick={() => setView('realTime')}>
          Real-Time Data
        </Button>
        <Button colorScheme="blue" onClick={() => setView('browseAndDownload')}>
          Download Data
        </Button>
      </Flex>

      {/* Real-Time Data View */}
      {view === 'realTime' && (
        <Box>
          <Heading as="h4" size="md" mb={4}>
            Current Status of Team Members
          </Heading>
          {loading ? (
            <Spinner size="lg" />
          ) : (
            <Table variant="striped" colorScheme="teal">
              <Thead>
                <Tr>
                  <Th onClick={() => requestRealTimeSort('teamMember')} cursor="pointer">
                    Team Member {realTimeSortConfig.key === 'teamMember' ? (realTimeSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </Th>
                  <Th onClick={() => requestRealTimeSort('status')} cursor="pointer">
                    Status {realTimeSortConfig.key === 'status' ? (realTimeSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </Th>
                  <Th onClick={() => requestRealTimeSort('taskId')} cursor="pointer">
                    Task ID {realTimeSortConfig.key === 'taskId' ? (realTimeSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </Th>
                  <Th onClick={() => requestRealTimeSort('queue')} cursor="pointer">
                    Queue {realTimeSortConfig.key === 'queue' ? (realTimeSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </Th>
                  <Th onClick={() => requestRealTimeSort('timeSpent')} cursor="pointer">
                    Time Spent (so far) {realTimeSortConfig.key === 'timeSpent' ? (realTimeSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedCurrentTasks.map(({ user, activeTask }) => (
                  <Tr key={user.email}>
                    <Td>{`${user.firstName} ${user.lastName}`}</Td>
                    <Td>{activeTask && !activeTask.completed ? 'Active' : 'Idle'}</Td>
                    <Td>{activeTask && !activeTask.completed ? activeTask.taskId : '-'}</Td>
                    <Td>{activeTask && !activeTask.completed ? activeTask.queue : '-'}</Td>
                    <Td>{activeTask && !activeTask.completed ? activeTask.timeSpentFormatted : 'N/A'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>
      )}

      {/* Browse and Download Data View */}
      {view === 'browseAndDownload' && (
        <Box>
          <Heading as="h4" size="md" mb={4}>
            Download Tasks by Date Range
          </Heading>
          <Flex justifyContent="center" mb={4}>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
              mx={2}
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
              mx={2}
            />
          </Flex>
          <Button colorScheme="teal" onClick={fetchTasksByDateRange} mb={4}>
            Fetch Tasks
          </Button>

          {loading ? (
            <Spinner size="lg" />
          ) : (
            tasksData.length > 0 && (
              <Box>
                <Table variant="striped" colorScheme="teal" mt={4}>
                  <Thead>
                  <Tr>
                    <Th onClick={() => requestDownloadSort('taskId')} cursor="pointer">
                      Task ID {downloadSortConfig.key === 'taskId' ? (downloadSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </Th>
                    <Th onClick={() => requestDownloadSort('teamMember')} cursor="pointer">
                      Team Member {downloadSortConfig.key === 'teamMember' ? (downloadSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </Th>
                    <Th onClick={() => requestDownloadSort('queue')} cursor="pointer">
                      Queue {downloadSortConfig.key === 'queue' ? (downloadSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </Th>
                    <Th onClick={() => requestDownloadSort('timeSpent')} cursor="pointer">
                      Time Spent (s) {downloadSortConfig.key === 'timeSpent' ? (downloadSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </Th>
                    <Th onClick={() => requestDownloadSort('dateCompleted')} cursor="pointer">
                      Date Completed {downloadSortConfig.key === 'dateCompleted' ? (downloadSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                    </Th>
                  </Tr>
                  </Thead>
                  <Tbody>
                    {sortedTasksData.map((task) => (
                      <Tr key={task._id}>
                        <Td>{task.taskId}</Td>
                        <Td>{task.teamMember}</Td>
                        <Td>{task.queue}</Td>
                        <Td>{task.timeSpent}</Td>
                        <Td>{new Date(task.createdAt).toLocaleDateString()}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <Button colorScheme="blue" mt={4} onClick={exportToExcel}>
                  Export to Excel
                </Button>
              </Box>
            )
          )}
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;
