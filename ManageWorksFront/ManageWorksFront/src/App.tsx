import React, { useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import LoginForm from './components/LoginForm.tsx';
import RegisterForm from './components/RegisterForm.tsx';
import TaskList from './components/TaskPage.tsx';
import AdminPanel from './components/AdminUserList.tsx';
import CategoriesManagement from './components/CategoriesManagement.tsx';
import { Box, Button } from '@mui/material';

// Google theme colors
const GOOGLE_COLORS = {
  primary: '#1a73e8',
  primaryHover: '#1765cc',
  background: '#f8f9fa',
  header: '#1a73e8',
  headerBorder: '#1765cc'
};

const HEADER_HEIGHT = 64;

const headerButtonStyle = {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '1rem',
  '&:hover': {
    backgroundColor: GOOGLE_COLORS.primaryHover,
    color: '#fff',
  },
};

const AuthHeader: React.FC = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: `${HEADER_HEIGHT}px`,
      backgroundColor: GOOGLE_COLORS.header,
      borderBottom: `4px solid ${GOOGLE_COLORS.headerBorder}`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      zIndex: 1100,
    }}
  >
    <Button component={Link} to="/login" sx={headerButtonStyle}>Login</Button>
    <Button component={Link} to="/register" sx={headerButtonStyle}>Register</Button>
  </Box>
);

const LoggedInHeader: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: `${HEADER_HEIGHT}px`,
        backgroundColor: GOOGLE_COLORS.header,
        borderBottom: `4px solid ${GOOGLE_COLORS.headerBorder}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1100,
      }}
    >
      <Button onClick={handleLogout} sx={headerButtonStyle}>Logout</Button>
    </Box>
  );
};

type DecodedToken = {
  username: string;
  role: 'User' | 'Admin';
  exp: number;
};

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const decoded: DecodedToken | null = useMemo(() => {
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }, [token]);

  const role = decoded?.role;

  const showAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    if (!token && !showAuthPage) {
      navigate('/login');
    } else if (token && showAuthPage) {
      if (role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else if (location.pathname === '/admin' && role !== 'Admin') {
      navigate('/');
    } else if (location.pathname === '/' && role === 'Admin') {
      navigate('/admin');
    }
  }, [location.pathname, token, role, navigate]);

  useEffect(() => {
    if (location.pathname === '/login') document.title = 'Login - Task Manager';
    else if (location.pathname === '/register') document.title = 'Register - Task Manager';
    else if (location.pathname === '/') document.title = 'Tasks - Task Manager';
    else if (location.pathname === '/admin') document.title = 'Admin Panel - Task Manager';
    else document.title = 'Task Manager';
  }, [location.pathname]);

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        backgroundColor: GOOGLE_COLORS.background,
        overflow: 'hidden',
      }}
    >
      {showAuthPage ? <AuthHeader /> : <LoggedInHeader />}

      {showAuthPage ? (
        <Box
          sx={{
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: `${HEADER_HEIGHT}px`,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 2,
              boxShadow: 3,
              zIndex: 100,
            }}
          >
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
            </Routes>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            width: '100%',
            paddingTop: `${HEADER_HEIGHT}px`,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: '100%',
              overflowY: 'auto',
            }}
          >
            <Routes>
              <Route path="/" element={<TaskList />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/categories" element={<CategoriesManagement />} />
            </Routes>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const Root: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default Root;