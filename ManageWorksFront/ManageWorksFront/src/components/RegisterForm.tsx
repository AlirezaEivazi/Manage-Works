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
  error: '#d32f2f',
  success: '#34a853'
};

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://localhost:7100/api/auth/register', { 
        username, 
        password 
      });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        setError('Registration failed: ' + error.response.data);
      } else {
        setError('Registration failed: Network error');
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
        // minHeight: '100vh',
        // backgroundColor: GOOGLE_COLORS.background,
        // p: 2
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
          Create Account
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

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: '8px',
              border: `1px solid ${GOOGLE_COLORS.success}`
            }}
          >
            {success}
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

          <TextField
            label="Confirm Password"
            variant="outlined"
            fullWidth
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              'Create Account'
            )}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: GOOGLE_COLORS.textSecondary }}>
              Already have an account?{' '}
              <Button 
                onClick={() => navigate('/login')}
                sx={{ 
                  color: GOOGLE_COLORS.primary,
                  textTransform: 'none',
                  p: 0,
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                Sign in
              </Button>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterForm;