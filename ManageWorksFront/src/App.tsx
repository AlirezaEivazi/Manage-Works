import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm.tsx';
import RegisterForm from './components/RegisterForm.tsx';
import TaskList from './components/TaskPage.tsx';
import { Box, Button } from '@mui/material';
import { useEffect } from 'react';
import AdminPanel from './components/AdminUserList.tsx';

const HEADER_HEIGHT = 64;

const AuthHeader: React.FC = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: `${HEADER_HEIGHT}px`,
      backgroundColor: '#4b0082',
      borderBottom: '4px solid #6a0dad',
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
        backgroundColor: '#4b0082',
        borderBottom: '4px solid #6a0dad',
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

const headerButtonStyle = {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '1rem',
  '&:hover': {
    backgroundColor: '#6a0dad',
    color: '#fff',
  },
};


const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const showAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token && !showAuthPage) {
      navigate('/login');
    }
  }, [location.pathname]);
  
  useEffect(() => {
  if (location.pathname === '/login') document.title = 'Login - Task Manager';
  else if (location.pathname === '/register') document.title = 'Register - Task Manager';
  else if (location.pathname === '/') document.title = 'Tasks - Task Manager';
  else document.title = 'Task Manager';
}, [location.pathname]);


  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        backgroundColor: '#121236',
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



// const AuthHeader: React.FC = () => {
//   return (
//     <Box
//       sx={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         width: '100%',
//         backgroundColor: '#4b0082',  // رنگ بنفش پررنگ‌تر
//         borderBottom: '4px solid #6a0dad', // خط پایین بنفش روشن‌تر
//         display: 'flex',
//         justifyContent: 'center',
//         gap: 4,
//         paddingY: 1.5,
//         zIndex: 1100,
//       }}
//     >
//       <Button
//         component={Link}
//         to="/login"
//         variant="text"
//         sx={{
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '1rem',
//           '&:hover': {
//             backgroundColor: '#6a0dad',
//             color: '#fff',
//           },
//         }}
//       >
//         Login
//       </Button>
//       <Button
//         component={Link}
//         to="/register"
//         variant="text"
//         sx={{
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '1rem',
//           '&:hover': {
//             backgroundColor: '#6a0dad',
//             color: '#fff',
//           },
//         }}
//       >
//         Register
//       </Button>
//     </Box>
//   );
// };


// const LoggedInHeader: React.FC = () => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/login');
//   };

//   return (
//     <Box
//       sx={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         width: '100%',
//         backgroundColor: '#4b0082',
//         borderBottom: '4px solid #6a0dad',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         paddingY: 1.5,
//         zIndex: 1100,
//       }}
//     >
//       <Button
//         onClick={handleLogout}
//         variant="text"
//         sx={{
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '1rem',
//           '&:hover': {
//             backgroundColor: '#6a0dad',
//             color: '#fff',
//           },
//         }}
//       >
//         Logout
//       </Button>
//     </Box>
//   );
// };

// const App: React.FC = () => {
//   const location = useLocation();

//   const showAuthHeader = location.pathname === '/login' || location.pathname === '/register';

//   return (
//     <Box
//       sx={{
//         height: '100vh',
//         width: '100vw',
//         backgroundColor: '#121236',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         boxSizing: 'border-box',
//         paddingTop: '56px',  // حتماً اضافه کن تا محتوا زیر هدر بره و بهم نریزه
//       }}
//     >
//       {showAuthHeader ? <AuthHeader /> : <LoggedInHeader />}

//       <Box sx={{ width: '100%', maxWidth: 480, padding: 2 }}>
//         <Routes>
//           <Route path="/login" element={<LoginForm />} />
//           <Route path="/register" element={<RegisterForm />} />
//           <Route path="/" element={<TaskList />} />
//         </Routes>
//       </Box>
//     </Box>
//   );
// };


// const Root: React.FC = () => (
//   <Router>
//     <App />
//   </Router>
// );

// export default Root;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
// import LoginForm from './components/LoginForm.tsx';
// import RegisterForm from './components/RegisterForm.tsx';
// import TaskList from './components/TaskPage.tsx';
// import { Box, Button } from '@mui/material';

// // کامپوننت Header با دکمه Logout
// const Header: React.FC = () => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     // حذف توکن یا داده های ورود (اینجا فرض می‌کنیم توکن تو localStorage ذخیره شده)
//     localStorage.removeItem('token');
//     // هدایت به صفحه لاگین
//     navigate('/login');
//   };

//   return (
//     <Box
//       sx={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         width: '100%',
//         display: 'flex',
//         justifyContent: 'flex-end',
//         padding: 2,
//         backgroundColor: '#1E1E3F',
//         boxSizing: 'border-box',
//         zIndex: 1100,
//       }}
//     >
//       <Button
//         onClick={handleLogout}
//         variant="outlined"
//         color="primary"
//       >
//         Logout
//       </Button>
//     </Box>
//   );
// };

// const App: React.FC = () => {
//   return (
//     <Router>
//       <Box
//         sx={{
//           height: '100vh',
//           width: '100vw',
//           backgroundColor: '#121236',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           boxSizing: 'border-box',
//           paddingTop: '56px', // فاصله برای هدر ثابت
//         }}
//       >
//         <Header />
//         <Box sx={{ width: '100%', maxWidth: 480, padding: 2 }}>
//           <Routes>
//             <Route path="/login" element={<LoginForm />} />
//             <Route path="/register" element={<RegisterForm />} />
//             <Route path="/" element={<TaskList />} />
//           </Routes>
//         </Box>
//       </Box>
//     </Router>
//   );
// };

// export default App;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import LoginForm from './components/LoginForm.tsx';
// import RegisterForm from './components/RegisterForm.tsx';
// import TaskList from './components/TaskPage.tsx';
// import { Box, Button } from '@mui/material';

// const Header = () => {
//   return (
//     <Box
//       sx={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         width: '100%',
//         backgroundColor: '#4b0082',  // رنگ بنفش پررنگ‌تر
//         borderBottom: '4px solid #6a0dad', // خط پایین بنفش روشن‌تر
//         display: 'flex',
//         justifyContent: 'center',
//         gap: 4,
//         paddingY: 1.5,
//         zIndex: 1100,
//       }}
//     >
//       <Button
//         component={Link}
//         to="/login"
//         variant="text"
//         sx={{
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '1rem',
//           '&:hover': {
//             backgroundColor: '#6a0dad',
//             color: '#fff',
//           },
//         }}
//       >
//         Login
//       </Button>
//       <Button
//         component={Link}
//         to="/register"
//         variant="text"
//         sx={{
//           color: '#fff',
//           fontWeight: 'bold',
//           fontSize: '1rem',
//           '&:hover': {
//             backgroundColor: '#6a0dad',
//             color: '#fff',
//           },
//         }}
//       >
//         Register
//       </Button>
//     </Box>
//   );
// };

// const App: React.FC = () => {
//   return (
//     <Router>
//       <Box
//         sx={{
//           height: '100vh',
//           width: '100vw',
//           backgroundColor: '#121236',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           boxSizing: 'border-box',
          
//         }}
//       >
        
//         <Box
//           sx={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             width: '100%',
//             display: 'flex',
//             justifyContent: 'center',
//             gap: 2,
//             padding: 2,
//             backgroundColor: '#1E1E3F', 
            
//           }}
//         >
//           <Button component={Link} to="/login" variant="outlined" color="primary">
//             Login
//           </Button>
//           <Button component={Link} to="/register" variant="outlined" color="primary">
//             Register
//           </Button>
//         </Box>

       
//         <Routes>
//           <Route path="/login" element={<LoginForm />} />
//           <Route path="/register" element={<RegisterForm />} />
//           <Route path="/" element={<TaskList />} />
//         </Routes>
//       </Box>
//     </Router>
//   );
// };

// export default App;


// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
// import LoginForm from './components/LoginForm.tsx';
// import RegisterForm from './components/RegisterForm.tsx';
// import { Box, Button } from '@mui/material';
// import TaskList from './components/TaskPage.tsx';


// const App: React.FC = () => {
//   return (
//     <Router>
//       <Box
//         sx={{
//           height: '100vh',
//           width: '100vw',
//           backgroundColor: '#121236',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           boxSizing: 'border-box',
          
//         }}
//       >
        
//         <Box
//           sx={{
//             position: 'fixed',
//             top: 0,
//             left: 0,
//             width: '100%',
//             display: 'flex',
//             justifyContent: 'center',
//             gap: 2,
//             padding: 2,
//             backgroundColor: '#1E1E3F', 
            
//           }}
//         >
//           <Button component={Link} to="/login" variant="outlined" color="primary">
//             Login
//           </Button>
//           <Button component={Link} to="/register" variant="outlined" color="primary">
//             Register
//           </Button>
//         </Box>

       
//         <Routes>
//           <Route path="/login" element={<LoginForm />} />
//           <Route path="/register" element={<RegisterForm />} />
//           <Route path="/" element={<TaskList />} />
//         </Routes>
//       </Box>
//     </Router>
//   );
// };

// export default App;
