import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setSuccess('');
      return;
    }

    try {
      const response = await axios.post('https://localhost:7100/api/auth/register', { username, password });
      setSuccess('Registered successfully!');
      setError('');
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
      setSuccess('');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
     }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          maxWidth: 400,
          width: '100%',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #6a0dad 0%, #4b0082 100%)',
          color: '#fff',
        }}
      >
        <Typography variant="h4" mb={4} textAlign="center" sx={{ fontWeight: 'bold' }}>
          Register Form
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            '& .MuiTextField-root': { mb: 3 },
          }}
        >
          <TextField
            label="Username"
            variant="filled"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            InputProps={{
              sx: {
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                '& .MuiInputBase-input': { color: '#fff' },
              },
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255,255,255,0.7)' },
            }}
          />

          <TextField
            label="Password"
            variant="filled"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              sx: {
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                '& .MuiInputBase-input': { color: '#fff' },
              },
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255,255,255,0.7)' },
            }}
          />

          <TextField
            label="Confirm Password"
            variant="filled"
            fullWidth
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            InputProps={{
              sx: {
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fff',
                '& .MuiInputBase-input': { color: '#fff' },
              },
            }}
            InputLabelProps={{
              sx: { color: 'rgba(255,255,255,0.7)' },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: '#6a0dad',
              '&:hover': { backgroundColor: '#4b0082' },
              fontWeight: 'bold',
              fontSize: 16,
              py: 1.5,
            }}
          >
            Register
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default RegisterForm;
