import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Checkbox,
  TextField,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Task {
  id: string;
  text: string;
  isDone: boolean;
  createdAt: string;
}

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [editTaskText, setEditTaskText] = useState('');
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get<Task[]>('https://localhost:7100/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch {
      alert('Error fetching tasks');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post<Task>(
        'https://localhost:7100/api/tasks',
        { text: newTaskText, isDone: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) => [...prev, res.data]);
      setNewTaskText('');
    } catch {
      alert('Error adding task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://localhost:7100/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert('Error deleting task');
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
    } catch {
      alert('Error editing task');
    }
  };

  const handleEditClick = (task: Task) => {
    setTaskToEdit(task);
    setEditTaskText(task.text);
  };

  const handleEditSave = async () => {
    if (!taskToEdit) return;
    try {
      const token = localStorage.getItem('token');
      const updated = { ...taskToEdit, text: editTaskText };
      await axios.put(`https://localhost:7100/api/tasks/${taskToEdit.id}`, updated, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskToEdit.id ? updated : t))
      );
      setTaskToEdit(null);
    } catch {
      alert('Error editing task');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: 4,
        color: 'white',
        fontFamily: "'Vazirmatn', sans-serif",
        background: `radial-gradient(circle at top left, #3c2a6e, #1b1030),
                     radial-gradient(circle at bottom right, #5a3f91, #2b1f4b)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Shapes */}
      <Box sx={{ position: 'absolute', width: 220, height: 220, bgcolor: '#7a63c9', opacity: 0.15, borderRadius: '50%', filter: 'blur(90px)', top: 40, left: 30, transform: 'rotate(45deg)', zIndex: 0 }} />
      <Box sx={{ position: 'absolute', width: 320, height: 320, bgcolor: '#a291ff', opacity: 0.1, borderRadius: '40% 60% 70% 30% / 50% 30% 70% 50%', filter: 'blur(110px)', bottom: 60, right: 20, zIndex: 0 }} />

      <Typography variant="h3" align="center" fontWeight="bold" sx={{ position: 'relative', zIndex: 1, mb: 5 }}>
        Task Management
      </Typography>

      {/* New Task Input */}
      <Box sx={{ display: 'flex', gap: 1, maxWidth: 820, mx: 'auto', mb: 4, zIndex: 1, position: 'relative' }}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          label="New Task"
          variant="outlined"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          InputProps={{
            style: {
              backgroundColor: '#4a3679',
              color: 'white',
              borderRadius: 14,
              boxShadow: '0 0 20px rgba(120, 95, 200, 0.85)',
              paddingLeft: 12,
              paddingTop: 12,
              paddingBottom: 12,
              fontSize: '1rem',
            },
          }}
          InputLabelProps={{ style: { color: 'rgba(255,255,255,0.75)', fontWeight: '600' } }}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#8867d1' },
              '&:hover fieldset': { borderColor: '#b8a1ff' },
              '&.Mui-focused fieldset': { borderColor: '#d0b3ff' },
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleAddTask}
          sx={{
            bgcolor: '#8867d1',
            '&:hover': { bgcolor: '#7354bf' },
            borderRadius: 4,
            boxShadow: '0 5px 20px rgba(136, 103, 209, 0.85)',
            px: 3,
            fontWeight: '600',
            fontSize: '1.1rem',
          }}
        >
          Add
        </Button>
      </Box>

      {/* Task List */}
      {loading ? (
        <Typography align="center" sx={{ mt: 6, zIndex: 1, position: 'relative' }}>Loading...</Typography>
      ) : (
        <Box
          sx={{
            columnCount: [1, 2, 3],
            columnGap: '2rem',
            maxWidth: 1000,
            mx: 'auto',
            zIndex: 1,
            position: 'relative',
          }}
        >
          {tasks.map((task) => (
            <Box
              key={task.id}
              sx={{
                breakInside: 'avoid',
                background: '#5a4980',
                borderRadius: 6,
                p: 2,
                mb: 4,
                boxShadow: '0 0 6px rgba(90, 73, 128, 0.3)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Checkbox
                  checked={task.isDone}
                  onChange={() => toggleDone(task)}
                  sx={{ color: 'white', '&.Mui-checked': { color: '#b6a8ff' } }}
                  size="small"
                />
                <Typography sx={{ textDecoration: task.isDone ? 'line-through' : 'none', fontWeight: '700', fontSize: '0.95rem', ml: 1, color: 'white' }}>
                  {task.text}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#cbc3ff' }}>
                Created at: {new Date(task.createdAt).toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <IconButton onClick={() => handleEditClick(task)} sx={{ color: 'white' }} size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => handleDelete(task.id)} sx={{ color: 'white' }} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!taskToEdit} onClose={() => setTaskToEdit(null)} PaperProps={{ sx: { bgcolor: '#4b3b91', borderRadius: 6, boxShadow: '0 0 25px rgba(90, 70, 150, 0.85)', color: 'white' } }}>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            minRows={2}
            value={editTaskText}
            onChange={(e) => setEditTaskText(e.target.value)}
            fullWidth
            variant="filled"
            InputProps={{ style: { backgroundColor: '#5a4980', color: 'white', borderRadius: 10, fontSize: '1rem' } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskToEdit(null)} sx={{ color: '#d6cfff' }}>Cancel</Button>
          <Button onClick={handleEditSave} sx={{ bgcolor: '#8867d1', '&:hover': { bgcolor: '#7354bf' }, color: 'white' }}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TasksPage;
