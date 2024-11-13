import React, { useState } from 'react';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teamMember');
  const [message, setMessage] = useState('');

  const handleSignup = async () => {
    // Form validation
    if (!firstName || !lastName || !email || !password) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, { firstName, lastName, email, password, role });
      setMessage('User created successfully!');
      console.log('User created successfully:', response.data);
    } catch (error) {
      setMessage('Error signing up. Please try again.');
      console.error('Error signing up:', error);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2>Signup</h2>
      <input
        type="text"
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <input
        type="text"
        placeholder="Last Name"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '10px' }}
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{ display: 'block', width: '100%', padding: '10px', marginBottom: '20px' }}
      >
        <option value="teamMember">Team Member</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleSignup} style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>
        Sign Up
      </button>
      {message && (
        <div style={{ marginTop: '20px', color: message === 'User created successfully!' ? 'green' : 'red' }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Signup;
