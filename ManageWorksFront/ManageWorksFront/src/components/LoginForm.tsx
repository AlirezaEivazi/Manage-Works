import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Google-inspired color palette
const GOOGLE_COLORS = {
  primary: '#1a73e8',
  primaryHover: '#1765cc',
  background: '#f8f9fa',
  cardBackground: '#ffffff',
  textPrimary: '#3c4043',
  textSecondary: '#5f6368',
  border: '#dadce0',
  borderHover: '#bdc1c6',
  error: '#d32f2f'
};

interface LoginResponse {
  token: string;
  role: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        'https://localhost:7100/api/auth/login', 
        {
          username,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const { token, role } = response.data;
      
      if (!token) {
        throw new Error('No token received');
      }

      // Store token and role
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      
      // Redirect based on role
      navigate(role === 'Admin' ? '/admin' : '/');
      
    } catch (err: any) {
      setLoading(false);
      
      // Handle different error cases
      if (err.response) {
        // The request was made and the server responded with a status code
        if (err.response.status === 401) {
          setError('Invalid username or password');
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Login failed. Please try again.');
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('Network error. Please check your connection.');
      } else {
        // Something happened in setting up the request
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: '8px',
          backgroundColor: GOOGLE_COLORS.cardBackground,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
          border: `1px solid ${GOOGLE_COLORS.border}`
        }}
      >
        <Typography 
          variant="h4" 
          mb={4} 
          textAlign="center" 
          sx={{ 
            fontWeight: 'bold',
            color: GOOGLE_COLORS.textPrimary
          }}
        >
          Login
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '8px',
              border: `1px solid ${GOOGLE_COLORS.error}`
            }}
          >
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            '& .MuiTextField-root': { mb: 3 },
          }}
        >
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: GOOGLE_COLORS.border,
                },
                '&:hover fieldset': {
                  borderColor: GOOGLE_COLORS.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: GOOGLE_COLORS.primary,
                  borderWidth: 1
                },
              },
            }}
          />

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: GOOGLE_COLORS.border,
                },
                '&:hover fieldset': {
                  borderColor: GOOGLE_COLORS.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: GOOGLE_COLORS.primary,
                  borderWidth: 1
                },
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              backgroundColor: GOOGLE_COLORS.primary,
              '&:hover': { 
                backgroundColor: GOOGLE_COLORS.primaryHover 
              },
              fontWeight: 'bold',
              fontSize: 16,
              py: 1.5,
              borderRadius: '8px',
              textTransform: 'none',
              color: 'white',
              mb: 2
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              'Sign In'
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;