import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('https://localhost:7100/api/auth/login', {
        username,
        password,
      });
      setLoading(false);


      const token = response.data.token;
      if (token) {
        localStorage.setItem('token', token);
        alert('Login successful!');
        navigate('/');
      } else {
        setError('Login failed: Invalid response from server.');
      }
    } catch (err: any) {
      setLoading(false);
      if (err.response && err.response.data) {
        setError(`Login failed: ${err.response.data}`);
      } else {
        setError('Login failed: Network error');
      }
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
          Login Form
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              backgroundColor: '#6a0dad',
              '&:hover': { backgroundColor: '#4b0082' },
              fontWeight: 'bold',
              fontSize: 16,
              py: 1.5,
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;
