import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import { taskService, weatherService } from '../services'

export default function MainFeature() {
  const [tasks, setTasks] = useState([])
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [taskData, weatherData] = await Promise.all([
          taskService.getAll(),
          weatherService.getCurrentWeather()
        ])
        
        // Get pending tasks for today and next 3 days
        const now = new Date()
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
        
        const upcomingTasks = taskData.filter(task => {
          if (task.completed) return false
          const taskDate = new Date(task.dueDate)
          return taskDate >= now && taskDate <= threeDaysFromNow
        }).slice(0, 5)
        
        setTasks(upcomingTasks)
        setWeather(weatherData)
      } catch (err) {
        setError(err.message || 'Failed to load data')
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleCompleteTask = async (taskId) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      await taskService.update(taskId, { ...task, completed: true })
      setTasks(tasks.filter(t => t.id !== taskId))
      toast.success('Task completed!')
    } catch (err) {
      toast.error('Failed to complete task')
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-error bg-red-50 border-red-200'
      case 'medium': return 'text-warning bg-yellow-50 border-yellow-200'
      default: return 'text-info bg-blue-50 border-blue-200'
    }
  }

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return 'Sun'
      case 'cloudy': return 'Cloud'
      case 'rainy': return 'CloudRain'
      case 'stormy': return 'CloudLightning'
      default: return 'Cloud'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weather Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
          
          {/* Tasks Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="AlertCircle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4 flex items-center">
            <ApperIcon name="Cloud" className="h-5 w-5 mr-2 text-primary" />
            Current Weather
          </h3>
          
          {weather ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <ApperIcon 
                    name={getWeatherIcon(weather.condition)} 
                    className="h-8 w-8 text-blue-600"
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {weather.temperature}°F
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    {weather.condition}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Humidity</p>
                <p className="text-lg font-semibold text-gray-900">
                  {weather.humidity}%
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Weather data unavailable</p>
          )}
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4 flex items-center">
            <ApperIcon name="CheckSquare" className="h-5 w-5 mr-2 text-primary" />
            Upcoming Tasks
          </h3>
          
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="CheckCircle" className="h-12 w-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500">All caught up! No pending tasks.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="flex-shrink-0 h-5 w-5 rounded border-2 border-gray-300 hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.type}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}