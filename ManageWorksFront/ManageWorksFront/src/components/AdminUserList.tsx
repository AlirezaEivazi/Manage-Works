import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CategoryIcon from '@mui/icons-material/Category';
import { useNavigate } from 'react-router-dom';
import { MenuItem } from '@mui/material';

// Google Material Design colors
const COLORS = {
  primary: '#4285F4',
  secondary: '#34A853',
  error: '#EA4335',
  warning: '#FBBC05',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  onSurface: '#3C4043',
  onSurfaceMedium: '#5F6368',
  border: '#DADCE0',
  hover: '#F1F3F4'
};

interface User {
  username: string;
  role: string;
  passwordHash?: string;
  tasks?: any[];
}

const AdminUserPanel: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    role: '',
    password: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'User'
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get<User[]>('https://localhost:7100/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      role: user.role,
      password: ''
    });
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `https://localhost:7100/api/admin/users/${editingUser.username}`,
        {
          username: editForm.username,
          password: editForm.password,
          role: editForm.role
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map(u => 
        u.username === editingUser.username ? { ...u, ...editForm } : u
      ));
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDelete = async (username: string) => {
    if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://localhost:7100/api/admin/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter(u => u.username !== username));
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.username.trim() || !newUser.password.trim()) {
      alert('Username and password are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://localhost:7100/api/admin/users',
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchUsers();
      setNewUser({ username: '', password: '', role: 'User' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        backgroundColor: COLORS.background
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        borderBottom: `1px solid ${COLORS.border}`,
        pb: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.onSurface }}>
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<CategoryIcon />}
            onClick={() => navigate('/admin/categories')}
            variant="outlined"
            sx={{
              color: COLORS.onSurfaceMedium,
              borderColor: COLORS.border,
              '&:hover': {
                borderColor: COLORS.onSurfaceMedium,
                backgroundColor: COLORS.hover
              },
              textTransform: 'none'
            }}
          >
            Manage Categories
          </Button>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setShowCreateForm(true)}
            variant="contained"
            sx={{
              backgroundColor: COLORS.primary,
              '&:hover': { backgroundColor: '#3367D6' },
              color: COLORS.surface,
              fontWeight: 'bold',
              textTransform: 'none'
            }}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Create User Form */}
      {showCreateForm && (
        <Box sx={{ 
          bgcolor: COLORS.surface, 
          p: 3, 
          borderRadius: '8px', 
          mb: 4,
          boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
          border: `1px solid ${COLORS.border}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              onClick={() => setShowCreateForm(false)} 
              sx={{ color: COLORS.onSurfaceMedium, mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: COLORS.onSurface }}>
              Create New User
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: COLORS.border },
                  '&:hover fieldset': { borderColor: COLORS.primary },
                  '&.Mui-focused fieldset': { borderColor: COLORS.primary }
                }
              }}
            />
            <TextField
              label="Password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: COLORS.border },
                  '&:hover fieldset': { borderColor: COLORS.primary },
                  '&.Mui-focused fieldset': { borderColor: COLORS.primary }
                }
              }}
            />
            <TextField
              select
              label="Role"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: COLORS.border },
                  '&:hover fieldset': { borderColor: COLORS.primary },
                  '&.Mui-focused fieldset': { borderColor: COLORS.primary }
                }
              }}
            >
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </TextField>
            <Button
              onClick={handleCreateUser}
              variant="contained"
              sx={{
                backgroundColor: COLORS.primary,
                '&:hover': { backgroundColor: '#3367D6' },
                color: COLORS.surface,
                fontWeight: 'bold',
                mt: 2,
                py: 1.5,
                textTransform: 'none'
              }}
            >
              Create User
            </Button>
          </Box>
        </Box>
      )}

      {/* User List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
      ) : users.length === 0 ? (
        <Typography align="center" sx={{ mt: 4, color: COLORS.onSurfaceMedium }}>
          No users found
        </Typography>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gap: 2,
          '@media (min-width: 600px)': {
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))'
          }
        }}>
          {users.map((user) => (
            <Box
              key={user.username}
              sx={{
                backgroundColor: COLORS.surface,
                p: 3,
                borderRadius: '8px',
                boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3)',
                border: `1px solid ${COLORS.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 1px 3px 0 rgba(60,64,67,0.2)',
                  borderColor: COLORS.primary
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: user.role === 'Admin' ? COLORS.error : COLORS.primary,
                  fontWeight: 'bold',
                  color: COLORS.surface
                }}>
                  {user.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 'bold', color: COLORS.onSurface }}>
                    {user.username}
                  </Typography>
                  <Chip
                    label={user.role}
                    size="small"
                    sx={{
                      bgcolor: user.role === 'Admin' ? '#FCE8E6' : '#E8F0FE',
                      color: user.role === 'Admin' ? COLORS.error : COLORS.primary,
                      mt: 0.5,
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={() => handleEditClick(user)} 
                  sx={{ 
                    color: COLORS.onSurfaceMedium,
                    '&:hover': { 
                      color: COLORS.primary,
                      bgcolor: '#E8F0FE'
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                {user.role !== 'Admin' && (
                  <IconButton 
                    onClick={() => handleDelete(user.username)} 
                    sx={{ 
                      color: COLORS.onSurfaceMedium,
                      '&:hover': { 
                        color: COLORS.error,
                        bgcolor: '#FCE8E6'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog 
        open={!!editingUser} 
        onClose={() => setEditingUser(null)}
        PaperProps={{
          sx: {
            bgcolor: COLORS.surface,
            borderRadius: '12px',
            width: '100%',
            maxWidth: '450px',
            boxShadow: '0 8px 10px 1px rgba(0,0,0,0.14)',
            border: `1px solid ${COLORS.border}`
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold', 
          borderBottom: `1px solid ${COLORS.border}`,
          color: COLORS.onSurface
        }}>
          Edit User
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Username"
              value={editForm.username}
              onChange={(e) => setEditForm({...editForm, username: e.target.value})}
              fullWidth
              variant="outlined"
              sx={{
                mt : 3,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: COLORS.border },
                  '&:hover fieldset': { borderColor: COLORS.primary },
                  '&.Mui-focused fieldset': { borderColor: COLORS.primary }
                }
              }}
            />
            <TextField
              label="New Password"
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({...editForm, password: e.target.value})}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: COLORS.border },
                  '&:hover fieldset': { borderColor: COLORS.primary },
                  '&.Mui-focused fieldset': { borderColor: COLORS.primary }
                }
              }}
            />
            <TextField
              select
              label="Role"
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              fullWidth
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: COLORS.border },
                  '&:hover fieldset': { borderColor: COLORS.primary },
                  '&.Mui-focused fieldset': { borderColor: COLORS.primary }
                }
              }}
            >
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${COLORS.border}`, 
          p: 2 
        }}>
          <Button 
            onClick={() => setEditingUser(null)}
            sx={{ 
              color: COLORS.onSurfaceMedium,
              '&:hover': {
                bgcolor: COLORS.hover
              },
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSave}
            sx={{ 
              bgcolor: COLORS.primary,
              '&:hover': { bgcolor: '#3367D6' },
              color: COLORS.surface,
              fontWeight: 'bold',
              px: 3,
              textTransform: 'none'
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserPanel;