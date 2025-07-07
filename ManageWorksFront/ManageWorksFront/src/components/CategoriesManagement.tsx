import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import {
  Add,
  DeleteOutline,
  EditOutlined,
  ArrowBack
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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

interface Category {
  id: string;
  name: string;
}

const CategoriesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get<Category[]>('https://localhost:7100/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://localhost:7100/api/categories', {
        name: newCategoryName
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewCategoryName('');
      setSuccess('Category added successfully');
      fetchCategories();
    } catch (err) {
      setError('Failed to add category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editName.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(`https://localhost:7100/api/categories/${editingCategory.id}`, {
        name: editName
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingCategory(null);
      setSuccess('Category updated successfully');
      fetchCategories();
    } catch (err) {
      setError('Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://localhost:7100/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      p: { xs: 2, md: 4 },
      backgroundColor: COLORS.background
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 4,
        borderBottom: `1px solid ${COLORS.border}`,
        pb: 2
      }}>
        <IconButton 
          onClick={() => navigate('/admin')} 
          sx={{ 
            mr: 1,
            color: COLORS.onSurfaceMedium,
            '&:hover': {
              backgroundColor: COLORS.hover
            }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: COLORS.onSurface }}>
          Manage Categories
        </Typography>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }} 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }} 
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {/* Add Category */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          backgroundColor: COLORS.surface
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: COLORS.onSurface }}>
          Add New Category
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: COLORS.surface,
                '& fieldset': {
                  borderColor: COLORS.border,
                },
                '&:hover fieldset': {
                  borderColor: COLORS.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.primary,
                },
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddCategory}
            disabled={!newCategoryName.trim()}
            sx={{
              backgroundColor: COLORS.primary,
              color: COLORS.surface,
              '&:hover': {
                backgroundColor: '#3367D6',
              },
              '&:disabled': {
                backgroundColor: COLORS.hover,
                color: COLORS.onSurfaceMedium
              },
              textTransform: 'none',
              minWidth: 120
            }}
          >
            Add
          </Button>
        </Box>
      </Paper>

      {/* Categories List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: COLORS.primary }} />
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fill, minmax(300px, 1fr))' },
          gap: 2
        }}>
          {categories.map(category => (
            <Paper
              key={category.id}
              elevation={0}
              sx={{
                backgroundColor: COLORS.surface,
                p: 2,
                borderRadius: '8px',
                boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1)',
                border: `1px solid ${COLORS.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 1px 3px 0 rgba(60,64,67,0.2)',
                  borderColor: COLORS.primary
                }
              }}
            >
              <Typography sx={{ color: COLORS.onSurface }}>{category.name}</Typography>
              <Box>
                <IconButton
                  onClick={() => {
                    setEditingCategory(category);
                    setEditName(category.name);
                  }}
                  sx={{ 
                    color: COLORS.onSurfaceMedium,
                    '&:hover': {
                      backgroundColor: '#E8F0FE',
                      color: COLORS.primary
                    }
                  }}
                >
                  <EditOutlined />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteCategory(category.id)}
                  sx={{ 
                    color: COLORS.onSurfaceMedium,
                    '&:hover': {
                      backgroundColor: '#FCE8E6',
                      color: COLORS.error
                    }
                  }}
                >
                  <DeleteOutline />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            backgroundColor: COLORS.surface,
            boxShadow: '0 8px 10px 1px rgba(0,0,0,0.14)',
            border: `1px solid ${COLORS.border}`
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 500,
          borderBottom: `1px solid ${COLORS.border}`,
          color: COLORS.onSurface
        }}>
          Edit Category
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Category Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            sx={{
              mt : 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: COLORS.border,
                },
                '&:hover fieldset': {
                  borderColor: COLORS.primary,
                },
                '&.Mui-focused fieldset': {
                  borderColor: COLORS.primary,
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${COLORS.border}`,
          p: 2
        }}>
          <Button 
            onClick={() => setEditingCategory(null)}
            sx={{
              color: COLORS.onSurfaceMedium,
              '&:hover': {
                backgroundColor: COLORS.hover
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateCategory}
            variant="contained"
            disabled={!editName.trim()}
            sx={{
              backgroundColor: COLORS.primary,
              color: COLORS.surface,
              '&:hover': {
                backgroundColor: '#3367D6',
              },
              '&:disabled': {
                backgroundColor: COLORS.hover,
                color: COLORS.onSurfaceMedium
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesManagement;