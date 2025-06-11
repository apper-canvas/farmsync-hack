import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import MainFeature from '../components/MainFeature'
import { farmService, cropService, taskService, expenseService, weatherService } from '../services'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalFarms: 0,
    activeCrops: 0,
    pendingTasks: 0,
    monthlyExpenses: 0
  })
  const [recentExpenses, setRecentExpenses] = useState([])
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [farms, crops, tasks, expenses, weatherData] = await Promise.all([
          farmService.getAll(),
          cropService.getAll(),
          taskService.getAll(),
          expenseService.getAll(),
          weatherService.getCurrentWeather()
        ])

        // Calculate stats
        const now = new Date()
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        
        const pendingTasks = tasks.filter(task => !task.completed).length
        const monthlyExpenses = expenses
          .filter(expense => {
            const expenseDate = new Date(expense.date)
            return expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear
          })
          .reduce((sum, expense) => sum + expense.amount, 0)

        setStats({
          totalFarms: farms.length,
          activeCrops: crops.length,
          pendingTasks,
          monthlyExpenses
        })

        // Get recent expenses
        const sortedExpenses = expenses
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
        setRecentExpenses(sortedExpenses)
        setWeather(weatherData)
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data')
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadDashboardData()
  }, [])

  const statCards = [
    {
      title: 'Total Farms',
      value: stats.totalFarms,
      icon: 'MapPin',
      color: 'text-primary bg-green-50 border-green-200',
      link: '/farms'
    },
    {
      title: 'Active Crops',
      value: stats.activeCrops,
      icon: 'Wheat',
      color: 'text-secondary bg-green-50 border-green-200',
      link: '/crops'
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      icon: 'CheckSquare',
      color: 'text-accent bg-orange-50 border-orange-200',
      link: '/tasks'
    },
    {
      title: 'Monthly Expenses',
      value: `$${stats.monthlyExpenses.toLocaleString()}`,
      icon: 'DollarSign',
      color: 'text-info bg-blue-50 border-blue-200',
      link: '/expenses'
    }
  ]

  const getWeatherGradient = () => {
    if (!weather) return 'from-blue-400 to-blue-600'
    
    switch (weather.condition) {
      case 'sunny':
        return 'from-yellow-400 to-orange-500'
      case 'cloudy':
        return 'from-gray-400 to-gray-600'
      case 'rainy':
        return 'from-blue-500 to-gray-600'
      case 'stormy':
        return 'from-gray-700 to-gray-900'
      default:
        return 'from-blue-400 to-blue-600'
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
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
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header with Weather-Responsive Background */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-lg bg-gradient-to-r ${getWeatherGradient()} p-6 text-white`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-heading font-bold mb-2">Farm Dashboard</h1>
            <p className="text-white/90">Welcome back! Here's what's happening on your farms today.</p>
          </div>
          {weather && (
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <ApperIcon name="MapPin" className="h-4 w-4" />
                <span className="text-sm">{weather.location}</span>
              </div>
              <p className="text-2xl font-bold">{weather.temperature}°F</p>
              <p className="text-sm text-white/80 capitalize">{weather.condition}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="group"
          >
            <Link 
              to={stat.link}
              className="block bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full border ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                  <ApperIcon name={stat.icon} className="h-6 w-6" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feature - Weather and Tasks */}
        <div className="lg:col-span-2">
          <MainFeature />
        </div>

        {/* Recent Expenses */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-heading font-semibold text-gray-900 flex items-center">
              <ApperIcon name="DollarSign" className="h-5 w-5 mr-2 text-primary" />
              Recent Expenses
            </h3>
            <Link 
              to="/expenses"
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View All
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="text-center py-8">
              <ApperIcon name="Receipt" className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No expenses recorded yet</p>
              <Link 
                to="/expenses"
                className="text-sm text-primary hover:text-primary/80 font-medium mt-2 inline-block transition-colors"
              >
                Add your first expense
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {expense.description}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">
                      ${expense.amount.toLocaleString()}
                    </p>
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