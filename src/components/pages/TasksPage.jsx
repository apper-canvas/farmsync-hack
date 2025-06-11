import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import PageHeader from '@/components/organisms/PageHeader';
import FilterButton from '@/components/molecules/FilterButton';
import TaskFormModal from '@/components/organisms/TaskFormModal';
import TasksList from '@/components/organisms/TasksList';
import { taskService, farmService, cropService } from '@/services';
import { isBefore, isToday, addDays } from 'date-fns';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState('pending');

  const taskTypes = [
    'Watering', 'Fertilizing', 'Weeding', 'Pruning', 'Planting', 
    'Harvesting', 'Pest Control', 'Soil Testing', 'Equipment Maintenance'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [taskData, farmData, cropData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ]);
      setTasks(taskData);
      setFarms(farmData);
      setCrops(cropData);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    if (!formData.farmId || !formData.type.trim() || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const taskData = {
        ...formData,
        completed: false
      };

      if (editingTask) {
        const updatedTask = await taskService.update(editingTask.id, taskData);
        setTasks(tasks.map(task => task.id === editingTask.id ? updatedTask : task));
        toast.success('Task updated successfully!');
      } else {
        const newTask = await taskService.create(taskData);
        setTasks([...tasks, newTask]);
        toast.success('Task created successfully!');
      }

      resetForm();
    } catch (err) {
      toast.error('Failed to save task');
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedTask = await taskService.update(taskId, { 
        ...task, 
        completed: !task.completed 
      });
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
      toast.success(updatedTask.completed ? 'Task completed!' : 'Task reopened!');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setShowAddForm(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.delete(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const resetForm = () => {
    setEditingTask(null);
    setShowAddForm(false);
  };

const filteredTasks = tasks?.filter(task => {
    // Validate task object exists
    if (!task) {
      console.warn('TasksPage: Encountered null/undefined task in filter');
      return false;
    }

    // Safe access to completed property with fallback
    const isCompleted = task?.completed ?? false;
    
    if (filter === 'pending') return !isCompleted;
    if (filter === 'completed') return isCompleted;
    
    // Safe date handling for overdue and today filters
    if (filter === 'overdue') {
      const dueDate = task?.dueDate || task?.due_date;
      if (!dueDate) return false;
      
      try {
        const taskDueDate = new Date(dueDate);
        if (isNaN(taskDueDate.getTime())) return false;
        
        return !isCompleted && isBefore(taskDueDate, new Date()) && !isToday(taskDueDate);
      } catch (error) {
        console.warn('TasksPage: Invalid due date for overdue filter:', dueDate);
        return false;
      }
    }
    
    if (filter === 'today') {
      const dueDate = task?.dueDate || task?.due_date;
      if (!dueDate) return false;
      
      try {
        const taskDueDate = new Date(dueDate);
        if (isNaN(taskDueDate.getTime())) return false;
        
        return !isCompleted && isToday(taskDueDate);
      } catch (error) {
        console.warn('TasksPage: Invalid due date for today filter:', dueDate);
        return false;
      }
    }
    
    return true;
  })?.sort((a, b) => {
    // Safe comparison with null checks
    const aCompleted = a?.completed ?? false;
    const bCompleted = b?.completed ?? false;
    
    if (aCompleted !== bCompleted) return aCompleted - bCompleted;
    
    // Safe date comparison
    try {
      const aDate = new Date(a?.dueDate || a?.due_date || '9999-12-31');
      const bDate = new Date(b?.dueDate || b?.due_date || '9999-12-31');
      
      if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) {
        return 0; // Keep original order if dates are invalid
      }
      
      return aDate - bDate;
    } catch (error) {
      console.warn('TasksPage: Error sorting tasks by date:', error);
      return 0;
    }
  }) || [];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex space-x-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load tasks</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      <PageHeader 
        title="Tasks" 
        description="Manage your farm tasks and track completion" 
        buttonText="Add Task" 
        buttonIcon="Plus" 
        onButtonClick={() => setShowAddForm(true)} 
      />

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Tasks' }, // Added 'all' filter for completeness
          { key: 'pending', label: 'Pending' },
          { key: 'today', label: 'Due Today' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'completed', label: 'Completed' }
        ].map(({ key, label }) => (
          <FilterButton
            key={key}
            label={label}
            isActive={filter === key}
            onClick={() => setFilter(key)}
          />
        ))}
      </div>

      <TaskFormModal 
        isOpen={showAddForm} 
        onClose={resetForm} 
        editingTask={editingTask} 
        farms={farms} 
        crops={crops} 
        taskTypes={taskTypes} 
        priorities={priorities} 
        onSubmit={handleSubmit} 
      />

      <TasksList 
        tasks={filteredTasks} 
        farms={farms} 
        crops={crops} 
        priorities={priorities}
        onToggleComplete={handleToggleComplete} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        filter={filter}
        onAddTask={() => setShowAddForm(true)}
      />
    </div>
  );
}