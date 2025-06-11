// Mock task data - replace with actual API calls
const mockTasks = [
  {
    id: '1',
    type: 'Watering',
    description: 'Water tomato plants in greenhouse',
    priority: 'high',
    dueDate: new Date().toISOString(),
    completed: false,
    farmId: 'farm1',
    cropId: 'crop1'
  },
  {
    id: '2',
    type: 'Fertilizing',
    description: 'Apply organic fertilizer to corn field',
    priority: 'medium',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    farmId: 'farm1',
    cropId: 'crop2'
  },
  {
    id: '3',
    type: 'Pest Control',
    description: 'Check for aphids on pepper plants',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    farmId: 'farm1',
    cropId: 'crop3'
  },
  {
    id: '4',
    type: 'Harvesting',
    description: 'Harvest ripe strawberries',
    priority: 'low',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    farmId: 'farm2',
    cropId: 'crop4'
  },
  {
    id: '5',
    type: 'Soil Testing',
    description: 'Test pH levels in field section A',
    priority: 'medium',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    completed: true,
    farmId: 'farm1',
    cropId: 'crop1'
  }
];

const taskService = {
  // Get all tasks
  async getAll() {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return Promise.resolve([...mockTasks]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch tasks');
    }
  },

  // Get task by ID
  async getById(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const task = mockTasks.find(t => t.id === id);
      if (!task) {
        throw new Error('Task not found');
      }
      return Promise.resolve({ ...task });
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  // Create new task
  async create(taskData) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const newTask = {
        id: Date.now().toString(),
        completed: false,
        ...taskData,
        dueDate: taskData.dueDate || new Date().toISOString()
      };
      mockTasks.push(newTask);
      return Promise.resolve({ ...newTask });
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  },

  // Update existing task
  async update(id, updates) {
    try {
      await new Promise(resolve => setTimeout(resolve, 250));
      const taskIndex = mockTasks.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      
      mockTasks[taskIndex] = { ...mockTasks[taskIndex], ...updates };
      return Promise.resolve({ ...mockTasks[taskIndex] });
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete task
  async delete(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const taskIndex = mockTasks.findIndex(t => t.id === id);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      
      const deletedTask = mockTasks.splice(taskIndex, 1)[0];
      return Promise.resolve({ ...deletedTask });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Get tasks by status
  async getByStatus(completed = false) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const filteredTasks = mockTasks.filter(t => t.completed === completed);
      return Promise.resolve([...filteredTasks]);
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      throw new Error('Failed to fetch tasks by status');
    }
  },

  // Get tasks by priority
  async getByPriority(priority) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const filteredTasks = mockTasks.filter(t => t.priority === priority);
      return Promise.resolve([...filteredTasks]);
    } catch (error) {
      console.error('Error fetching tasks by priority:', error);
      throw new Error('Failed to fetch tasks by priority');
    }
  },

  // Get upcoming tasks (next N days)
  async getUpcoming(days = 7) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      
      const upcomingTasks = mockTasks.filter(task => {
        if (task.completed) return false;
        const taskDate = new Date(task.dueDate);
        return taskDate >= now && taskDate <= futureDate;
      }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      
      return Promise.resolve([...upcomingTasks]);
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      throw new Error('Failed to fetch upcoming tasks');
    }
  }
};

export default taskService;