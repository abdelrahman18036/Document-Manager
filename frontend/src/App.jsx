import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import axios from 'axios';

// Layouts
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import DocumentsList from './pages/DocumentsList';
import DocumentDetail from './pages/DocumentDetail';
import DocumentUpload from './pages/DocumentUpload';
import Login from './pages/Login';
import Register from './pages/Register';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Context
import { AuthProvider } from './context/AuthContext';

// Configure Axios
axios.defaults.baseURL = 'http://localhost:8000';
// Do not set withCredentials to true for token auth as it can cause CORS issues
axios.defaults.withCredentials = false;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor for debugging
axios.interceptors.request.use(
  config => {
    console.log('Request URL:', config.baseURL + config.url);
    console.log('Request Method:', config.method.toUpperCase());
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

function App() {
  // Interceptor to handle authentication errors
  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Setting auth token from localStorage');
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    }

    const responseInterceptor = axios.interceptors.response.use(
      response => {
        console.log('Response Status:', response.status);
        return response;
      },
      error => {
        console.error('Response error:', error.response?.status, error.message);
        if (error.response && error.response.status === 401) {
          // Handle unauthorized access - redirect to login
          console.error('Authentication error, redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="documents"
              element={
                <ProtectedRoute>
                  <DocumentsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="documents/:id"
              element={
                <ProtectedRoute>
                  <DocumentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="upload"
              element={
                <ProtectedRoute>
                  <DocumentUpload />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
