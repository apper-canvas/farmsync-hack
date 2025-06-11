import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import { expenseService, farmService } from '../services'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [filter, setFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('this_month')
  const [formData, setFormData] = useState({
    farmId: '',
    category: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })

  const categories = [
    { value: 'seeds', label: 'Seeds & Plants', icon: 'Sprout', color: 'text-green-600' },
    { value: 'equipment', label: 'Equipment', icon: 'Wrench', color: 'text-blue-600' },
    { value: 'fertilizer', label: 'Fertilizer', icon: 'Beaker', color: 'text-purple-600' },
    { value: 'labor', label: 'Labor', icon: 'Users', color: 'text-orange-600' },
    { value: 'fuel', label: 'Fuel', icon: 'Zap', color: 'text-red-600' },
    { value: 'maintenance', label: 'Maintenance', icon: 'Settings', color: 'text-gray-600' },
    { value: 'other', label: 'Other', icon: 'MoreHorizontal', color: 'text-gray-600' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [expenseData, farmData] = await Promise.all([
        expenseService.getAll(),
        farmService.getAll()
      ])
      setExpenses(expenseData)
      setFarms(farmData)
    } catch (err) {
      setError(err.message || 'Failed to load expenses')
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.farmId || !formData.category || !formData.amount || !formData.date) {
      toast.error('Please fill in all required fields')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      const expenseData = {
        ...formData,
        amount
      }

      if (editingExpense) {
        const updatedExpense = await expenseService.update(editingExpense.id, expenseData)
        setExpenses(expenses.map(expense => expense.id === editingExpense.id ? updatedExpense : expense))
        toast.success('Expense updated successfully!')
      } else {
        const newExpense = await expenseService.create(expenseData)
        setExpenses([...expenses, newExpense])
        toast.success('Expense added successfully!')
      }

      resetForm()
    } catch (err) {
      toast.error('Failed to save expense')
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setFormData({
      farmId: expense.farmId,
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date,
      description: expense.description
    })
    setShowAddForm(true)
  }

  const handleDelete = async (expenseId) => {
    const expense = expenses.find(e => e.id === expenseId)
    const confirmMessage = expense && expense.amount > 1000 
      ? `Are you sure you want to delete this $${expense.amount.toLocaleString()} expense? This action cannot be undone.`
      : 'Are you sure you want to delete this expense?'
    
    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      await expenseService.delete(expenseId)
      setExpenses(expenses.filter(expense => expense.id !== expenseId))
      toast.success('Expense deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete expense')
    }
  }

  const resetForm = () => {
    setFormData({
      farmId: '',
      category: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: ''
    })
    setShowAddForm(false)
    setEditingExpense(null)
  }

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.id === farmId)
    return farm ? farm.name : 'Unknown Farm'
  }

  const getCategoryInfo = (category) => {
    return categories.find(c => c.value === category) || categories[categories.length - 1]
  }

  const getFilteredExpenses = () => {
    let filtered = expenses

    // Category filter
    if (filter !== 'all') {
      filtered = filtered.filter(expense => expense.category === filter)
    }

    // Date filter
    const now = new Date()
    switch (dateFilter) {
      case 'this_month':
        filtered = filtered.filter(expense => 
          isWithinInterval(new Date(expense.date), {
            start: startOfMonth(now),
            end: endOfMonth(now)
          })
        )
        break
      case 'last_30_days':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(expense => 
          new Date(expense.date) >= thirtyDaysAgo
        )
        break
      // 'all_time' shows all expenses
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const getExpenseStats = () => {
    const filtered = getFilteredExpenses()
    const total = filtered.reduce((sum, expense) => sum + expense.amount, 0)
    
    const byCategory = categories.map(category => {
      const categoryExpenses = filtered.filter(expense => expense.category === category.value)
      const categoryTotal = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
      return {
        ...category,
        total: categoryTotal,
        count: categoryExpenses.length
      }
    }).filter(category => category.total > 0)

    return { total, byCategory }
  }

  const filteredExpenses = getFilteredExpenses()
  const stats = getExpenseStats()

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
        
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        
        {/* Expenses Skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load expenses</h3>
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
          <h1 className="text-2xl font-heading font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track and manage your farm expenses</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>Add Expense</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category.value}
              onClick={() => setFilter(category.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors flex items-center space-x-1 ${
                filter === category.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ApperIcon name={category.icon} className="h-4 w-4" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="this_month">This Month</option>
          <option value="last_30_days">Last 30 Days</option>
          <option value="all_time">All Time</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.total.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <ApperIcon name="DollarSign" className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </motion.div>

        {stats.byCategory.slice(0, 3).map((category, index) => (
          <motion.div
            key={category.value}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (index + 1) * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{category.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${category.total.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{category.count} expenses</p>
              </div>
              <div className={`p-3 bg-gray-50 rounded-full`}>
                <ApperIcon name={category.icon} className={`h-6 w-6 ${category.color}`} />
              </div>
            </div>
          </motion.div>
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
                    {editingExpense ? 'Edit Expense' : 'Add New Expense'}
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
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
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
                      placeholder="What was this expense for?"
                    />
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
                      {editingExpense ? 'Update' : 'Add'} Expense
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <ApperIcon name="Receipt" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No expenses found
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? 'Start by adding your first farm expense'
              : 'No expenses found for the selected filters'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Your First Expense
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense, index) => {
            const categoryInfo = getCategoryInfo(expense.category)
            
            return (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
                    <div className={`p-3 bg-gray-50 rounded-full`}>
                      <ApperIcon 
                        name={categoryInfo.icon} 
                        className={`h-6 w-6 ${categoryInfo.color}`}
                      />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {categoryInfo.label}
                        </h3>
                        <span className="text-2xl font-bold text-gray-900">
                          ${expense.amount.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <ApperIcon name="MapPin" className="h-4 w-4 mr-1" />
                          {getFarmName(expense.farmId)}
                        </span>
                        <span className="flex items-center">
                          <ApperIcon name="Calendar" className="h-4 w-4 mr-1" />
                          {format(new Date(expense.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      
                      {expense.description && (
                        <p className="text-gray-600 mt-2 break-words">
                          {expense.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                    >
                      <ApperIcon name="Edit" className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
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