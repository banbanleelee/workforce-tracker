import React, { useState, useEffect } from 'react'; 
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { useQueues } from '../context/QueueContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const AddTask = ({ teamMembers, onTaskAdded }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [queue, setQueue] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [comment, setComment] = useState('');
  const toast = useToast();
  const queues = useQueues(); // Context-based queues

  const handleAddTask = async () => {
    console.log('Queue:', queue);
    console.log('Team Member:', selectedUser);
    console.log('Start Date:', startDate);

    if (!queue || !selectedUser || !startDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill out all required fields.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/tasks/add-task/${selectedUser}`,
        { queue, startDate, endDate, comment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        }
      );

      toast({
        title: 'Task Added',
        description: 'The task has been successfully added.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Clear form
      setQueue('');
      setSelectedUser('');
      setStartDate('');
      setEndDate('');
      setComment('');

      onTaskAdded(); // Trigger parent callback to refresh tasks
      onClose();
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: 'Error',
        description: 'Failed to add task.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Button colorScheme="green" onClick={onOpen}>
        Add Task
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Task</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Queue Selection */}
            <FormControl mb={3}>
              <FormLabel>Queue</FormLabel>
              <Select
                placeholder="Select a queue"
                value={queue} // Controlled state for queue
                onChange={(e) => setQueue(e.target.value)} // Update queue state
              >
                {queues.map((queue, index) => (
                  <option key={index} value={queue}>
                    {queue} {/* Display the queue name */}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Team Member Selection */}
            <FormControl mb={3}>
              <FormLabel>Team Member</FormLabel>
              <Select
                placeholder="Select Team Member"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {`${member.firstName} ${member.lastName}`}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Start Date */}
            <FormControl mb={3}>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormControl>

            {/* End Date */}
            <FormControl mb={3}>
              <FormLabel>End Date</FormLabel>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormControl>

            {/* Comment */}
            <FormControl mb={3}>
              <FormLabel>Comment</FormLabel>
              <Input
                placeholder="Add a comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleAddTask}>
              Add Task
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddTask;
