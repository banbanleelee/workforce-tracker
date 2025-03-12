import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup'
import QueueTaskTracker from './components/QueueTaskTracker';
import Header from './components/Header';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProviderDirectory from './components/ProviderDirectory';
import BulkSearch from './components/BulkSearch';
import ProtectedRoute from './components/ProtectedRoute';
import { ProviderContextProvider } from './context/ProviderContext';


function App() {
  return (
    <ChakraProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />}/>
          {/* Protect the routes with ProtectedRoute component */}
          <Route
            path="/task-tracker"
            element={
              <ProtectedRoute>
                <QueueTaskTracker />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider-directory"
            element={
              <ProtectedRoute>
                <ProviderContextProvider>
                  <ProviderDirectory />
                </ProviderContextProvider>
              </ProtectedRoute>
            }
          />
          {/* New Route for Bulk Name & State Search */}
          <Route
            path="/bulk-search"
            element={
              <ProtectedRoute>
                <BulkSearch />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
