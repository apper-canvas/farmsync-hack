import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import { taskService, farmService, cropService } from '../services'
import { format, isAfter, isBefore, isToday, addDays } from 'date-fns'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [farms, setFarms] = useState([])
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [filter, setFilter] = useState('pending')
  const [formData, setFormData] = useState({
    farmId: '',
    cropId: '',
    type: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  })

  const taskTypes = [
    'Watering', 'Fertilizing', 'Weeding', 'Pruning', 'Planting', 
    'Harvesting', 'Pest Control', 'Soil Testing', 'Equipment Maintenance'
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [taskData, farmData, cropData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ])
      setTasks(taskData)
      setFarms(farmData)
      setCrops(cropData)
    } catch (err) {
      setError(err.message || 'Failed to load tasks')
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.farmId || !formData.type.trim() || !formData.dueDate) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      const TaskData = {
        ...formData,
        completed: false
      }

      if (editingTask) {
        const updatedTask = await taskService.update(editingTask.id, TaskData)
        setTasks(tasks.map(task => task.id === editingTask.id ? updatedTask : task))
        toast.success('Task updated successfully!')
      } else {
        const newTask = await taskService.create(TaskData)
        setTasks([...tasks, newTask])
        toast.success('Task created successfully!')
      }

      resetForm()
    } catch (err) {
      toast.error('Failed to save task')
    }
  }

  const handleToggleComplete = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      const updatedTask = await taskService.update(taskId, { 
        ...task, 
        completed: !task.completed 
      })
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t))
      toast.success(updatedTask.completed ? 'Task completed!' : 'Task reopened!')
    } catch (err) {
      toast.error('Failed to update task')
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      farmId: task.farmId,
      cropId: task.cropId || '',
      type: task.type,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority
    })
    setShowAddForm(true)
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      await taskService.delete(taskId)
      setTasks(tasks.filter(task => task.id !== taskId))
      toast.success('Task deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete task')
    }
  }

  const resetForm = () => {
    setFormData({
      farmId: '',
      cropId: '',
      type: '',
      description: '',
      dueDate: '',
      priority: 'medium'
    })
    setShowAddForm(false)
    setEditingTask(null)
  }

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.id === farmId)
    return farm ? farm.name : 'Unknown Farm'
  }

  const getCropName = (cropId) => {
    if (!cropId) return null
    const crop = crops.find(c => c.id === cropId)
    return crop ? crop.name : 'Unknown Crop'
  }

  const getPriorityInfo = (priority) => {
    return priorities.find(p => p.value === priority) || priorities[1]
  }

  const getTaskStatus = (task) => {
    if (task.completed) return 'completed'
    const dueDate = new Date(task.dueDate)
    const today = new Date()
    
    if (isBefore(dueDate, today)) return 'overdue'
    if (isToday(dueDate)) return 'due_today'
    if (isBefore(dueDate, addDays(today, 3))) return 'due_soon'
    return 'upcoming'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'overdue': return 'text-red-600'
      case 'due_today': return 'text-orange-600'
      case 'due_soon': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed
    if (filter === 'completed') return task.completed
    if (filter === 'overdue') return !task.completed && isBefore(new Date(task.dueDate), new Date())
    if (filter === 'today') return !task.completed && isToday(new Date(task.dueDate))
    return true
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed - b.completed
    return new Date(a.dueDate) - new Date(b.dueDate)
  })

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
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load tasks</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage your farm tasks and track completion</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>Add Task</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          { key: 'pending', label: 'Pending' },
          { key: 'today', label: 'Due Today' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'completed', label: 'Completed' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={resetForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-heading font-semibold text-gray-900">
                    {editingTask ? 'Edit Task' : 'Add New Task'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ApperIcon name="X" className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farm *
                    </label>
                    <select
                      value={formData.farmId}
                      onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select a farm</option>
                      {farms.map(farm => (
                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Related Crop (Optional)
                    </label>
                    <select
                      value={formData.cropId}
                      onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">No specific crop</option>
                      {crops
                        .filter(crop => crop.farmId === formData.farmId)
                        .map(crop => (
                          <option key={crop.id} value={crop.id}>{crop.name}</option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select task type</option>
                      {taskTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows="3"
                      placeholder="Add any additional details..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {priorities.map(priority => (
                          <option key={priority.value} value={priority.value}>{priority.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {editingTask ? 'Update' : 'Create'} Task
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <ApperIcon name="CheckSquare" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'pending' ? 'No pending tasks' : `No ${filter} tasks`}
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'pending' 
              ? 'All caught up! Create a new task to stay organized.'
              : 'Try adjusting your filter or create new tasks.'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Task
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task, index) => {
            const status = getTaskStatus(task)
            const priorityInfo = getPriorityInfo(task.priority)
            const cropName = getCropName(task.cropId)
            
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all duration-200 ${
                  task.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 min-w-0 flex-1">
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className={`mt-1 flex-shrink-0 h-5 w-5 rounded border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 ${
                        task.completed
                          ? 'bg-primary border-primary text-white'
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {task.completed && (
                        <ApperIcon name="Check" className="h-3 w-3 m-0.5" />
                      )}
                    </button>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`text-lg font-medium ${
                          task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                        }`}>
                          {task.type}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityInfo.color}`}>
                          {priorityInfo.label}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <ApperIcon name="MapPin" className="h-4 w-4 mr-1" />
                            {getFarmName(task.farmId)}
                          </span>
                          {cropName && (
                            <span className="flex items-center">
                              <ApperIcon name="Wheat" className="h-4 w-4 mr-1" />
                              {cropName}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className={`flex items-center ${getStatusColor(status)}`}>
                            <ApperIcon name="Calendar" className="h-4 w-4 mr-1" />
                            Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                            {status === 'overdue' && ' (Overdue)'}
                            {status === 'due_today' && ' (Today)'}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-gray-600 mt-2 break-words">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleEdit(task)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                    >
                      <ApperIcon name="Edit" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-gray-400 hover:text-error hover:bg-red-50 rounded-full transition-colors"
                    >
                      <ApperIcon name="Trash2" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}