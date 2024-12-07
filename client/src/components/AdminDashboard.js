import React, { useState, useEffect } from 'react';
import { Box, Heading, Button, Flex, Table, Tbody, Td, Th, Thead, Tr, useToast, Spinner, Input } from '@chakra-ui/react';
import axios from 'axios';
import moment from 'moment-timezone';
import * as XLSX from 'xlsx';
import AddTask from './AddTask';

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
  const [editableTasks, setEditableTasks] = useState({});
  const [teamMembers, setTeamMembers] = useState([]);

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
        } else if (downloadSortConfig.key === 'dateStarted') {
            aValue = new Date(a.startDate);
            bValue = new Date(b.startDate);
        } else if (downloadSortConfig.key === 'dateCompleted') {
            aValue = new Date(a.endDate);
            bValue = new Date(b.endDate);
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
 
  console.log('sortedTasksData:', sortedTasksData);

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
          // Calculate the elapsed time dynamically based on startDate
          const elapsedSeconds = Math.floor((Date.now() - new Date(userTask.activeTask.startDate).getTime()) / 1000);
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

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks/team-members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setTeamMembers(response.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
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
              // Calculate elapsed seconds since task was started
              const elapsedSeconds = Math.floor((Date.now() - new Date(task.activeTask.startDate).getTime()) / 1000);
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

  useEffect(() => {
    fetchTeamMembers();
  }, []);

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
      console.log("tasks are", response.data.tasks);
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
        'Team Member': task.teamMember,
        Queue: task.queue,
        'Time Spent (s)': task.timeSpent,
        'Date Completed': XLSX.SSF.format('yyyy-mm-dd', new Date(task.endDate)), // Excel date format (yyyy-mm-dd)
        'Start Time': new Date(task.startDate).toLocaleTimeString('en-US', { hour12: false }), // Format as hh:mm:ss
        'End Time': new Date(task.endDate).toLocaleTimeString('en-US', { hour12: false }), // Format as hh:mm:ss
      }))
    );
   

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Team Member Tasks');

    const dateRange = `${moment(startDate).format('YYYYMMDD')}_to_${moment(endDate).format('YYYYMMDD')}`;
    const fileName = `tasks_all_team_members_${dateRange}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handleInputChange = (taskId, field, value) => {
    setEditableTasks((prev) => {
        const taskToEdit = prev[taskId] || tasksData.find(task => task._id === taskId) || {};

        let newStartDate = taskToEdit.startDate ? moment(taskToEdit.startDate) : moment();
        let newEndDate = taskToEdit.endDate ? moment(taskToEdit.endDate) : moment();

        if (field === 'startDateDate') {
            // Update only the YYYY-MM-DD part of startDate
            const timePart = newStartDate.format('HH:mm:ss');
            newStartDate = moment(`${value} ${timePart}`, 'YYYY-MM-DD HH:mm:ss');
        } else if (field === 'startDateTime') {
            // Update only the HH:mm:ss part of startDate
            const datePart = newStartDate.format('YYYY-MM-DD');
            newStartDate = moment(`${datePart} ${value}`, 'YYYY-MM-DD HH:mm:ss');
        } else if (field === 'endDateDate') {
            // Update only the YYYY-MM-DD part of endDate
            const timePart = newEndDate.format('HH:mm:ss');
            newEndDate = moment(`${value} ${timePart}`, 'YYYY-MM-DD HH:mm:ss');
        } else if (field === 'endDateTime') {
            // Update only the HH:mm:ss part of endDate
            const datePart = newEndDate.format('YYYY-MM-DD');
            newEndDate = moment(`${datePart} ${value}`, 'YYYY-MM-DD HH:mm:ss');
        }

        // Logic: If newStartDate is later than newEndDate, update newEndDate to match newStartDate
        if (newStartDate.isAfter(newEndDate)) {
            newEndDate = newStartDate.clone();
        }

        return {
            ...prev,
            [taskId]: {
                ...taskToEdit,
                startDate: newStartDate.toISOString(),
                endDate: newEndDate.toISOString(),
            },
        };
    });
  };


  const handleSaveTask = async (taskId) => {
    if (!editableTasks[taskId]) return;
  
    const originalTask = tasksData.find(task => task._id === taskId);
    const updatedTask = editableTasks[taskId];
  
    // Check if there are actual changes
    if (
      moment(originalTask.startDate).isSame(updatedTask.startDate) &&
      moment(originalTask.endDate).isSame(updatedTask.endDate)
    ) {
      return; // No changes, do not call the API
    }
  
    try {
      // Log to verify data before sending
      console.log('Sending updated task data:', {
        startDate: updatedTask.startDate,
        endDate: updatedTask.endDate,
      });
  
      await axios.put(`${API_BASE_URL}/api/tasks/update-task/${taskId}`, {
        startDate: updatedTask.startDate,
        endDate: updatedTask.endDate,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
      });
  
      toast({
        title: 'Success',
        description: 'Task updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
  
      // Re-fetch tasks to reflect the update
      fetchTasksByDateRange();
    } catch (error) {
      console.error('Error updating task:', error.response ? error.response.data : error.message);
      toast({
        title: 'Error',
        description: `Failed to update task: ${error.response ? error.response.data.error : 'Unknown error'}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Automatically calculates the time spent between two dates in hh:mm:ss format
  const calculateTimeSpent = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
      const totalSeconds = Math.floor((end - start) / 1000);

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Format as hh:mm:ss
      const formattedTime = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0'),
      ].join(':');

      return formattedTime;
    }

    return '00:00:00'; // Default value if invalid
  };
 

  const handleDeleteTask = async (taskId) => {
    console.log('Deleting task with ID:', taskId); // Add this line to check the value of taskId
    
    if (!taskId) {
      toast({
        title: 'Error',
        description: 'Task ID is invalid or missing!!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/delete-task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      toast({
        title: 'Success',
        description: 'Task deleted successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
  
      // Re-fetch tasks if needed
      fetchTasksByDateRange();
    } catch (error) {
      console.error('Error deleting task:', error.response ? error.response.data : error.message);
      toast({
        title: 'Error',
        description: `Failed to delete task: ${error.response ? error.response.data.error : 'Unknown error'}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  const refreshTasks = () => {
    if (view === 'realTime') {
      fetchCurrentTasks(); // Refresh real-time tasks
    } else if (view === 'browseAndDownload') {
      fetchTasksByDateRange(); // Refresh tasks for download
    }
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
        <Button colorScheme="blue" mr={4} onClick={() => setView('browseAndDownload')}>
          Download Data
        </Button>
        <AddTask teamMembers={teamMembers} onTaskAdded={refreshTasks} />
      </Flex>

      {/* Real-Time Data View */}
      {view === 'realTime' && (
        <Box>
          <Heading as="h4" size="md" mb={4} textAlign="left">
            Current Status of Team Members
          </Heading>
          {loading ? (
            <Spinner size="lg" />
          ) : (
            <Table variant="striped" colorScheme="teal" mt={4}>
              <Thead>
                <Tr>
                  <Th
                    onClick={() => requestRealTimeSort('teamMember')}
                    cursor="pointer"
                    whiteSpace="nowrap"
                    textAlign="center"
                  >
                    Team Member {realTimeSortConfig.key === 'teamMember' ? (realTimeSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </Th>
                  <Th
                    onClick={() => requestRealTimeSort('status')}
                    cursor="pointer"
                    whiteSpace="nowrap"
                    textAlign="center"
                  >
                    Status {realTimeSortConfig.key === 'status' ? (realTimeSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </Th>
                  <Th
                    onClick={() => requestRealTimeSort('queue')}
                    cursor="pointer"
                    whiteSpace="nowrap"
                    textAlign="center"
                  >
                    Queue {realTimeSortConfig.key === 'queue' ? (realTimeSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </Th>
                  <Th
                    onClick={() => requestRealTimeSort('timeSpent')}
                    cursor="pointer"
                    whiteSpace="nowrap"
                    textAlign="center"
                  >
                    Time Spent (so far) {realTimeSortConfig.key === 'timeSpent' ? (realTimeSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedCurrentTasks.map(({ user, activeTask }) => (
                  <Tr key={user.email}>
                    <Td whiteSpace="nowrap" textAlign="center" fontSize="sm">
                      {`${user.firstName} ${user.lastName}`}
                    </Td>
                    <Td whiteSpace="nowrap" textAlign="center" fontSize="sm">
                      {activeTask && !activeTask.completed ? 'Active' : 'Idle'}
                    </Td>
                    <Td whiteSpace="nowrap" textAlign="center" fontSize="sm">
                      {activeTask && !activeTask.completed ? activeTask.queue : '-'}
                    </Td>
                    <Td whiteSpace="nowrap" textAlign="center" fontSize="sm">
                      {activeTask && !activeTask.completed ? activeTask.timeSpentFormatted : 'N/A'}
                    </Td>
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
              <Box border="1px" borderColor="gray.200" borderRadius="md" boxShadow="lg" p={4} mt={4}>
                <Table variant="simple" colorScheme="teal" size="sm" mt={4}>
                  <Thead bg="teal.600">
                    <Tr>
                      <Th
                        color="white"
                        onClick={() => requestDownloadSort('teamMember')}
                        cursor="pointer"
                        textAlign="center"
                        whiteSpace="nowrap"
                      >
                        Team Member {downloadSortConfig.key === 'teamMember' ? (downloadSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                      </Th>
                      <Th
                        color="white"
                        onClick={() => requestDownloadSort('queue')}
                        cursor="pointer"
                        textAlign="center"
                        whiteSpace="nowrap"
                      >
                        Queue {downloadSortConfig.key === 'queue' ? (downloadSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                      </Th>
                      <Th
                        color="white"
                        onClick={() => requestDownloadSort('dateStarted')}
                        cursor="pointer"
                        textAlign="center"
                        whiteSpace="nowrap"
                      >
                        Start Date {downloadSortConfig.key === 'dateStarted' ? (downloadSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                      </Th>
                      <Th
                        color="white"
                        onClick={() => requestDownloadSort('dateStarted')}
                        cursor="pointer"
                        textAlign="center"
                        whiteSpace="nowrap"
                      >
                        Start Time {downloadSortConfig.key === 'dateStarted' ? (downloadSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                      </Th>
                      <Th
                        color="white"
                        onClick={() => requestDownloadSort('dateCompleted')}
                        cursor="pointer"
                        textAlign="center"
                        whiteSpace="nowrap"
                      >
                        End Time {downloadSortConfig.key === 'dateCompleted' ? (downloadSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                      </Th>
                      <Th
                        color="white"
                        onClick={() => requestDownloadSort('timeSpent')}
                        cursor="pointer"
                        textAlign="center"
                        whiteSpace="nowrap"
                      >
                        Time Spent {downloadSortConfig.key === 'timeSpent' ? (downloadSortConfig.direction === 'ascending' ? '↑' : '↓') : ''}
                      </Th>
                      <Th
                        color="white"
                        cursor="pointer"
                        textAlign="center"
                        whiteSpace="nowrap"
                      >
                        Delete Task
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {sortedTasksData && sortedTasksData.length === 0 ? (
                      <Tr>
                        <Td colSpan="6" textAlign="center" fontWeight="bold" py={4}>
                          No tasks found for the selected date range.
                        </Td>
                      </Tr>
                    ) : (
                      sortedTasksData.map((task, index) => {
                        const taskInEdit = editableTasks[task._id] || task;

                        return (
                          <Tr key={task._id}>
                            <Td textAlign="center" fontSize="sm" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">
                              {task.teamMember}
                            </Td>
                            <Td textAlign="center" fontSize="sm" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">
                              {task.queue}
                            </Td>
                            <Td textAlign="center" fontSize="sm" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">
                              <Input
                                type="date"
                                value={moment(taskInEdit.startDate).format('YYYY-MM-DD')}
                                onChange={(e) => handleInputChange(task._id, 'startDateDate', e.target.value)}
                                onBlur={() => handleSaveTask(task._id)}
                                size="sm" // Ensure input is smaller for limited space
                                width="100%" // Make sure input does not exceed cell boundaries
                              />
                            </Td>
                            <Td textAlign="center" fontSize="sm" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">
                              <Input
                                type="time"
                                value={moment(taskInEdit.startDate).format('HH:mm:ss')}
                                onChange={(e) => handleInputChange(task._id, 'startDateTime', e.target.value)}
                                onBlur={() => handleSaveTask(task._id)}
                                size="sm"
                                width="100%"
                              />
                            </Td>
                            <Td textAlign="center" fontSize="sm" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">
                              <Input
                                type="time"
                                value={moment(taskInEdit.endDate).format('HH:mm:ss')}
                                onChange={(e) => handleInputChange(task._id, 'endDateTime', e.target.value)}
                                onBlur={() => handleSaveTask(task._id)}
                                size="sm"
                                width="100%"
                              />
                            </Td>
                            <Td textAlign="center" fontSize="sm" whiteSpace="normal" overflow="hidden" textOverflow="ellipsis">
                              {calculateTimeSpent(taskInEdit.startDate, taskInEdit.endDate)}
                            </Td>
                            <Td>
                            <Button
                              colorScheme="red"
                              onClick={() => handleDeleteTask(task._id)} // Ensure task._id is being passed here
                              size="sm"
                            >
                              Delete
                            </Button>
                            </Td>
                          </Tr>
                        );
                      })
                    )}
                  </Tbody>
                </Table>

                <Button colorScheme="blue" mt={4} onClick={exportToExcel} size="sm">
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
