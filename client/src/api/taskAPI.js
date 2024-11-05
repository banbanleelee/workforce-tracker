import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks'; // Replace this with actual server URL later

// Function to get all tasks
const getTasks = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export default getTasks;
