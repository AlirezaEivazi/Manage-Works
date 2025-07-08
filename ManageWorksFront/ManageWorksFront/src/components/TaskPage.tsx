import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
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
  Chip,
  Snackbar,
  Alert,
  Paper,
  Tooltip
} from '@mui/material';
import {
  DeleteOutline,
  EditOutlined,
  Add,
  FilterList,
  Close,
  CheckCircleOutline,
  RadioButtonUnchecked,
  ArrowBack,
  ArrowForward,
  Notifications
} from '@mui/icons-material';
import Masonry from '@mui/lab/Masonry';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

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

const TASK_COLORS = [
  '#E8F0FE', // Light blue
  '#FCE8E6', // Light red
  '#E6F4EA', // Light green
  '#FEF7E0', // Light yellow
  '#F3E8FD', // Light purple
  '#E8F5E9', // Mint green
  '#FFF3E0', // Deep orange light
  '#F1F8E9'  // Light lime
];

interface Task {
  id: string;
  text: string;
  isDone: boolean;
  createdAt: string;
  category?: string;
  color?: string;
  deadLine?: string | null;
}

interface Category {
  id: string;
  name: string;
}

const iranTimeZone = 'Asia/Tehran';

const formatInIranTime = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const iranTime = toZonedTime(date, iranTimeZone);
  return format(iranTime, 'MMM dd, yyyy HH:mm');
};

const convertToIranTime = (date: Date | null): Date | null => {
  if (!date) return null;
  const iranTime = toZonedTime(date, iranTimeZone);
  return new Date(iranTime);
};

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState<Date | null>(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [editTaskCategory, setEditTaskCategory] = useState('');
  const [editTaskDeadline, setEditTaskDeadline] = useState<Date | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<string>("Newest");
  const [deadlineFilter, setDeadlineFilter] = useState<string>("All");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [notificationUrl, setNotificationUrl] = useState('');
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get<Task[]>('https://localhost:7100/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tasksWithColors = res.data.map(task => ({
        ...task,
        color: task.color || TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)],
        category: task.category || undefined,
        deadLine: task.deadLine || null
      }));
      setTasks(tasksWithColors);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showSnackbar('Error fetching tasks');
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get<Category[]>('https://localhost:7100/api/categories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showSnackbar('Error fetching categories');
    }
  };

  const fetchNotificationUrl = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://localhost:7100/api/tasks/notification-url', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.url) {
        setNotificationUrl(res.data.url);
      }
    } catch (error) {
      console.error('Error fetching notification URL:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchCategories();
    fetchNotificationUrl();
  }, []);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = direction === 'right' ? 200 : -200;
      categoriesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAddTask = async () => {
    const trimmedText = newTaskText.trim();
    if (!trimmedText) return;

    const isDuplicate = tasks.some(
      task => task.text.toLowerCase() === trimmedText.toLowerCase() && 
             task.category === newTaskCategory
    );

    if (isDuplicate) {
      showSnackbar('A task with the same text and category already exists');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const newTask = {
        text: trimmedText,
        isDone: false,
        category: newTaskCategory || undefined,
        deadLine: newTaskDeadline ? format(newTaskDeadline, "yyyy-MM-dd'T'HH:mm:ss") : null
      };
      
      const res = await axios.post<Task>(
        'https://localhost:7100/api/tasks',
        newTask,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const taskWithFormattedDeadline = {
        ...res.data,
        color: TASK_COLORS[Math.floor(Math.random() * TASK_COLORS.length)],
        deadLine: res.data.deadLine || null
      };

      setTasks((prev) => [taskWithFormattedDeadline, ...prev]);
      setNewTaskText('');
      setNewTaskCategory('');
      setNewTaskDeadline(null);
      setIsAddingTask(false);
    } catch (error) {
      console.error('Error adding task:', error);
      showSnackbar('Error adding task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://localhost:7100/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      showSnackbar('Error deleting task');
    }
  };

  const toggleDone = async (task: Task) => {
    try {
      const token = localStorage.getItem('token');
      const updated = { ...task, isDone: !task.isDone };
      await axios.put(`https://localhost:7100/api/tasks/${task.id}`, updated, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (error) {
      console.error('Error updating task status:', error);
      showSnackbar('Error updating task status');
    }
  };

  const handleEditSave = async () => {
    if (!taskToEdit || !editTaskText.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const updated = { 
        ...taskToEdit, 
        text: editTaskText.trim(),
        category: editTaskCategory || undefined,
        deadLine: editTaskDeadline ? format(editTaskDeadline, "yyyy-MM-dd'T'HH:mm:ss") : null
      };
      await axios.put(`https://localhost:7100/api/tasks/${taskToEdit.id}`, updated, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.map((t) => (t.id === taskToEdit.id ? updated : t)));
      setTaskToEdit(null);
    } catch (error) {
      console.error('Error updating task:', error);
      showSnackbar('Error updating task');
    }
  };

  const handleSaveNotificationUrl = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'https://localhost:7100/api/tasks/set-notification-url',
        { url: notificationUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUrlDialogOpen(false);
      showSnackbar('Notification URL saved successfully');
    } catch (error) {
      console.error('Error saving notification URL:', error);
      showSnackbar('Error saving notification URL');
    }
  };

  const filteredTasks = tasks
    .filter(task => {
      if (statusFilter === "Done") return task.isDone;
      if (statusFilter === "Not Done") return !task.isDone;
      return true;
    })
    .filter(task => {
      if (selectedCategory) return task.category === selectedCategory;
      return true;
    })
    .filter(task => {
      const now = new Date();
      const deadline = task.deadLine ? new Date(task.deadLine) : null;
      
      if (deadlineFilter === "Overdue") return deadline && deadline < now && !task.isDone;
      if (deadlineFilter === "Upcoming") return deadline && deadline >= now;
      if (deadlineFilter === "No Deadline") return !deadline;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "Oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortOrder === "Newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortOrder === "Deadline (Earliest)") {
        const aDeadline = a.deadLine ? new Date(a.deadLine).getTime() : Infinity;
        const bDeadline = b.deadLine ? new Date(b.deadLine).getTime() : Infinity;
        return aDeadline - bDeadline;
      } else if (sortOrder === "Deadline (Latest)") {
        const aDeadline = a.deadLine ? new Date(a.deadLine).getTime() : 0;
        const bDeadline = b.deadLine ? new Date(b.deadLine).getTime() : 0;
        return bDeadline - aDeadline;
      }
      return 0;
    });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        backgroundColor: COLORS.background
      }}>
        {/* Header */}
        <Box sx={{
          maxWidth: 1200,
          mx: 'auto',
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            color: COLORS.onSurface
          }}>
            Task Board
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilterDialogOpen(true)}
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
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<Notifications />}
              onClick={() => setUrlDialogOpen(true)}
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
              Notification URL
            </Button>
          </Box>
        </Box>

        {/* Notification URL Dialog */}
        <Dialog open={urlDialogOpen} onClose={() => setUrlDialogOpen(false)}>
          <DialogTitle>Set Notification URL</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Notification URL"
              fullWidth
              value={notificationUrl}
              onChange={(e) => setNotificationUrl(e.target.value)}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: COLORS.border,
                  },
                  '&:hover fieldset': {
                    borderColor: COLORS.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: COLORS.primary,
                    borderWidth: 1
                  },
                },
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setUrlDialogOpen(false)}
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
              onClick={handleSaveNotificationUrl}
              sx={{
                backgroundColor: COLORS.primary,
                color: COLORS.surface,
                '&:hover': {
                  backgroundColor: '#3367D6'
                }
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Task Section */}
        <Box sx={{
          maxWidth: 1200,
          mx: 'auto',
          mb: 4,
        }}>
          {!isAddingTask ? (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsAddingTask(true)}
              sx={{
                mb: 5,
                backgroundColor: COLORS.primary,
                color: COLORS.surface,
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#3367D6',
                },
                textTransform: 'none',
                minWidth: 120
              }}
            >
              Add Task
            </Button>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                backgroundColor: COLORS.surface,
                mb: 2
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  multiline
                  label="Task"
                  minRows={3}
                  fullWidth
                  variant="outlined"
                  placeholder="Enter task description..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
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
                        borderWidth: 1
                      },
                    },
                  }}
                />
                
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: COLORS.border,
                      },
                      '&:hover fieldset': {
                        borderColor: COLORS.primary,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: COLORS.primary,
                        borderWidth: 1
                      },
                    },
                  }}
                >
                  <option value=""></option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </TextField>

                <DateTimePicker
                  label="Deadline (optional)"
                  value={newTaskDeadline}
                  onChange={(newValue) => setNewTaskDeadline(newValue)}
                  minDateTime={new Date()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined',
                      sx: {
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: COLORS.border,
                          },
                          '&:hover fieldset': {
                            borderColor: COLORS.primary,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: COLORS.primary,
                            borderWidth: 1
                          },
                        },
                      }
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTaskText('');
                      setNewTaskCategory('');
                      setNewTaskDeadline(null);
                    }}
                    sx={{
                      color: COLORS.onSurfaceMedium,
                      '&:hover': {
                        backgroundColor: COLORS.hover
                      },
                      textTransform: 'none'
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddTask}
                    disabled={!newTaskText.trim()}
                    variant="contained"
                    sx={{
                      backgroundColor: COLORS.primary,
                      '&:hover': {
                        backgroundColor: '#3367D6'
                      },
                      '&:disabled': {
                        backgroundColor: COLORS.hover,
                        color: COLORS.onSurfaceMedium
                      },
                      textTransform: 'none'
                    }}
                  >
                    Add Task
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Categories Scrollable Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={() => scrollCategories('left')} 
              sx={{ 
                color: COLORS.onSurfaceMedium,
                '&:hover': {
                  backgroundColor: COLORS.hover
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            
            <Box
              ref={categoriesScrollRef}
              sx={{
                display: 'flex',
                gap: 1,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                flexGrow: 1
              }}
            >
              <Tooltip title="Show all tasks" arrow>
                <Chip
                  label="All"
                  onClick={() => setSelectedCategory(null)}
                  variant={!selectedCategory ? "filled" : "outlined"}
                  sx={{
                    backgroundColor: !selectedCategory ? '#E8F0FE' : 'transparent',
                    color: !selectedCategory ? COLORS.primary : COLORS.onSurfaceMedium,
                    borderColor: COLORS.border,
                    borderRadius: '16px',
                    minWidth: '80px',
                    justifyContent: 'center',
                    maxWidth: 200,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                />
              </Tooltip>
              {categories.map(category => (
                <Tooltip key={category.id} title={category.name} arrow>
                  <Chip
                    label={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    variant={selectedCategory === category.name ? "filled" : "outlined"}
                    sx={{
                      backgroundColor: selectedCategory === category.name ? '#E8F0FE' : 'transparent',
                      color: selectedCategory === category.name ? COLORS.primary : COLORS.onSurfaceMedium,
                      borderColor: COLORS.border,
                      borderRadius: '16px',
                      minWidth: '80px',
                      justifyContent: 'center',
                      maxWidth: 200,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
            
            <IconButton 
              onClick={() => scrollCategories('right')} 
              sx={{ 
                color: COLORS.onSurfaceMedium,
                '&:hover': {
                  backgroundColor: COLORS.hover
                }
              }}
            >
              <ArrowForward />
            </IconButton>
          </Box>
        </Box>

        {/* Task Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress sx={{ color: COLORS.primary }} />
          </Box>
        ) : (
          <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
            <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={2}>
              {filteredTasks.map((task) => (
                <Paper
                  key={task.id}
                  elevation={0}
                  sx={{
                    backgroundColor: task.color || COLORS.surface,
                    borderRadius: '8px',
                    p: 2,
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: '0 1px 2px 0 rgba(60,64,67,0.1)',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                    '&:hover': {
                      boxShadow: '0 1px 3px 0 rgba(60,64,67,0.2)',
                      transform: 'translateY(-2px)'
                    },
                    wordWrap: 'break-word',
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <IconButton
                      onClick={() => toggleDone(task)}
                      size="small"
                      sx={{ 
                        mr: 1, 
                        color: task.isDone ? COLORS.secondary : COLORS.onSurfaceMedium,
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      {task.isDone ? <CheckCircleOutline /> : <RadioButtonUnchecked />}
                    </IconButton>
                    <Typography
                      sx={{
                        flexGrow: 1,
                        textDecoration: task.isDone ? 'line-through' : 'none',
                        color: task.isDone ? COLORS.onSurfaceMedium : COLORS.onSurface,
                        fontSize: '0.875rem',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {task.text}
                    </Typography>
                  </Box>
                  
                  {task.category && (
                    <Tooltip title={task.category} arrow>
                      <Chip
                        label={task.category}
                        size="small"
                        sx={{
                          backgroundColor: '#E8F0FE',
                          color: COLORS.primary,
                          mb: 1,
                          fontSize: '0.75rem',
                          maxWidth: '100%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      />
                    </Tooltip>
                  )}
                  
                  {task.deadLine && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ 
                        color: new Date(task.deadLine) < new Date() && !task.isDone ? COLORS.error : COLORS.onSurfaceMedium,
                        fontWeight: new Date(task.deadLine) < new Date() && !task.isDone ? 600 : 'normal'
                      }}>
                        Deadline: {formatInIranTime(task.deadLine)}
                        {new Date(task.deadLine) < new Date() && !task.isDone && ' (Overdue)'}
                      </Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: COLORS.onSurfaceMedium }}>
                      Created: {formatInIranTime(task.createdAt)}
                    </Typography>
                    <Box>
                      <IconButton
                        onClick={() => {
                          setTaskToEdit(task);
                          setEditTaskText(task.text);
                          setEditTaskCategory(task.category || '');
                          setEditTaskDeadline(task.deadLine ? convertToIranTime(new Date(task.deadLine)) : null);
                        }}
                        size="small"
                        sx={{ 
                          color: COLORS.onSurfaceMedium,
                          '&:hover': {
                            backgroundColor: COLORS.hover
                          }
                        }}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(task.id)}
                        size="small"
                        sx={{ 
                          color: COLORS.onSurfaceMedium,
                          '&:hover': {
                            backgroundColor: '#FCE8E6',
                            color: COLORS.error
                          }
                        }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              ))}
            </Masonry>
          </Box>
        )}

        {/* Filter Dialog */}
        <Dialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              backgroundColor: COLORS.surface,
              boxShadow: '0 8px 10px 1px rgba(0,0,0,0.14)'
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: `1px solid ${COLORS.border}`,
            p: 2
          }}>
            <Typography variant="subtitle1" fontWeight={500} color={COLORS.onSurface}>
              Filter Tasks
            </Typography>
            <IconButton 
              onClick={() => setFilterDialogOpen(false)} 
              size="small"
              sx={{ color: COLORS.onSurfaceMedium }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: COLORS.onSurface, mt: 2 }}>
              Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {["All", "Done", "Not Done"].map((filter) => (
                <Chip
                  key={filter}
                  label={filter}
                  onClick={() => setStatusFilter(filter)}
                  variant={statusFilter === filter ? "filled" : "outlined"}
                  sx={{
                    backgroundColor: statusFilter === filter ? '#E8F0FE' : 'transparent',
                    color: statusFilter === filter ? COLORS.primary : COLORS.onSurfaceMedium,
                    borderColor: COLORS.border,
                    borderRadius: '4px'
                  }}
                />
              ))}
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1, color: COLORS.onSurface }}>
              Deadline Status
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              {["All", "Overdue", "Upcoming", "No Deadline"].map((filter) => (
                <Chip
                  key={filter}
                  label={filter}
                  onClick={() => setDeadlineFilter(filter)}
                  variant={deadlineFilter === filter ? "filled" : "outlined"}
                  sx={{
                    backgroundColor: deadlineFilter === filter ? '#E8F0FE' : 'transparent',
                    color: deadlineFilter === filter ? COLORS.primary : COLORS.onSurfaceMedium,
                    borderColor: COLORS.border,
                    borderRadius: '4px'
                  }}
                />
              ))}
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1, color: COLORS.onSurface }}>
              Sort By
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {["Newest", "Oldest", "Deadline (Earliest)", "Deadline (Latest)"].map((sort) => (
                <Chip
                  key={sort}
                  label={sort}
                  onClick={() => setSortOrder(sort)}
                  variant={sortOrder === sort ? "filled" : "outlined"}
                  sx={{
                    backgroundColor: sortOrder === sort ? '#E8F0FE' : 'transparent',
                    color: sortOrder === sort ? COLORS.primary : COLORS.onSurfaceMedium,
                    borderColor: COLORS.border,
                    borderRadius: '4px'
                  }}
                />
              ))}
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
            <Button
              onClick={() => {
                setStatusFilter("All");
                setDeadlineFilter("All");
                setSortOrder("Newest");
              }}
              sx={{
                color: COLORS.onSurfaceMedium,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: COLORS.hover
                }
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => setFilterDialogOpen(false)}
              sx={{
                backgroundColor: COLORS.primary,
                color: COLORS.surface,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#3367D6'
                },
                px: 3
              }}
            >
              Apply
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={!!taskToEdit}
          onClose={() => setTaskToEdit(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '12px',
              backgroundColor: COLORS.surface,
              boxShadow: '0 8px 10px 1px rgba(0,0,0,0.14)'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: `1px solid ${COLORS.border}`,
            p: 2
          }}>
            <Typography variant="subtitle1" fontWeight={500} color={COLORS.onSurface}>
              Edit Task
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ p: 2 }}>
            <TextField
              label="Task"
              autoFocus
              multiline
              minRows={3}
              fullWidth
              variant="outlined"
              value={editTaskText}
              onChange={(e) => setEditTaskText(e.target.value)}
              sx={{
                mt: 2,
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: COLORS.border,
                  },
                  '&:hover fieldset': {
                    borderColor: COLORS.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: COLORS.primary,
                    borderWidth: 1
                  },
                },
              }}
            />
            <TextField
              select
              fullWidth
              label="Category"
              value={editTaskCategory}
              onChange={(e) => setEditTaskCategory(e.target.value)}
              SelectProps={{
                native: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: COLORS.border,
                  },
                  '&:hover fieldset': {
                    borderColor: COLORS.primary,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: COLORS.primary,
                    borderWidth: 1
                  },
                },
              }}
            >
              <option value=""></option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </TextField>

            <Box sx={{ mt: 2 }}>
              <DateTimePicker
                label="Deadline (optional)"
                value={editTaskDeadline}
                onChange={(newValue) => setEditTaskDeadline(newValue)}
                minDateTime={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: COLORS.border,
                        },
                        '&:hover fieldset': {
                          borderColor: COLORS.primary,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: COLORS.primary,
                          borderWidth: 1
                        },
                      },
                    }
                  }
                }}
              />
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${COLORS.border}` }}>
            <Button
              onClick={() => setTaskToEdit(null)}
              sx={{
                color: COLORS.onSurfaceMedium,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: COLORS.hover
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={!editTaskText.trim()}
              sx={{
                backgroundColor: COLORS.primary,
                color: COLORS.surface,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#3367D6'
                },
                '&:disabled': {
                  backgroundColor: COLORS.hover,
                  color: COLORS.onSurfaceMedium
                },
                px: 3
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for showing messages */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setSnackbarOpen(false)} 
            severity="warning"
            sx={{ 
              width: '100%',
              backgroundColor: '#FFF3E0',
              color: COLORS.onSurface
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default TasksPage;