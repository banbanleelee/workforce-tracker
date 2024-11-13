import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Function to get all tasks
const getTasks = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export default getTasks;
