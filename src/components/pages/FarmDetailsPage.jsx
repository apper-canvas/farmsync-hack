import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { farmService, cropService, taskService, expenseService } from '@/services';

export default function FarmDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState(null);
  const [crops, setCrops] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

useEffect(() => {
    let isMounted = true; // Track component mount state to prevent race conditions
    
    if (id) {
      loadFarmDetails(isMounted);
    }
    
    // Cleanup function to handle component unmount
    return () => {
      isMounted = false;
    };
  }, [id]);

  const loadFarmDetails = async (isMounted = true) => {
    if (!isMounted) return; // Prevent execution if component is unmounted
    
    setLoading(true);
    setError(null);
    
    try {
      // Enhanced ID validation to handle various edge cases
      if (!id || id === 'undefined' || id === 'null') {
        setError("No farm ID provided. Please select a valid farm.");
        return;
      }
      
      const farmId = parseInt(id, 10);
      if (isNaN(farmId) || farmId <= 0) {
        setError("Invalid farm ID format. Please check the URL and try again.");
        return;
      }

      // Validate component is still mounted before proceeding
      if (!isMounted) return;

      // Load farm details first to validate existence
      console.log(`Loading farm details for ID: ${farmId}`);
      const farmData = await farmService.getById(farmId);

      // Check if component is still mounted after async operation
      if (!isMounted) return;

      if (!farmData) {
        setError("Farm not found. This farm might have been deleted, moved, or the ID might be incorrect.");
        return;
      }

      // Validate farm data structure
      if (typeof farmData !== 'object' || !farmData.Id) {
        setError("Invalid farm data received. Please try refreshing the page.");
        return;
      }

      setFarm(farmData);
      console.log(`Successfully loaded farm: ${farmData.Name || farmData.name}`);
      
      // Load related data in parallel after confirming farm exists
      // Only proceed if component is still mounted
      if (!isMounted) return;
      
      try {
        const [allCrops, allTasks, allExpenses] = await Promise.all([
          cropService.getAll().catch(err => {
            console.warn('Failed to load crops:', err);
            return [];
          }),
          taskService.getAll().catch(err => {
            console.warn('Failed to load tasks:', err);
            return [];
          }),
          expenseService.getAll().catch(err => {
            console.warn('Failed to load expenses:', err);
            return [];
          })
        ]);
        
        // Final check if component is still mounted
        if (!isMounted) return;
        
        // Filter related data by farm ID - handle both string and numeric IDs
        const farmCrops = (allCrops || []).filter(crop => {
          const cropFarmId = crop?.farm_id;
          return cropFarmId == farmId || cropFarmId == id; // Use loose equality for type flexibility
        });
        
        const farmTasks = (allTasks || []).filter(task => {
          const taskFarmId = task?.farm_id;
          return taskFarmId == farmId || taskFarmId == id;
        });
        
        const farmExpenses = (allExpenses || []).filter(expense => {
          const expenseFarmId = expense?.farm_id;
          return expenseFarmId == farmId || expenseFarmId == id;
        });
        
        setCrops(farmCrops);
        setTasks(farmTasks);
        setExpenses(farmExpenses);
        
        console.log(`Loaded related data - Crops: ${farmCrops.length}, Tasks: ${farmTasks.length}, Expenses: ${farmExpenses.length}`);
        
      } catch (relatedDataError) {
        console.warn('Error loading related data, but farm details loaded successfully:', relatedDataError);
        // Set empty arrays for related data but don't fail the entire operation
        setCrops([]);
        setTasks([]);
        setExpenses([]);
        toast.warning('Some related data could not be loaded');
      }
      
    } catch (err) {
      console.error('Error loading farm details:', err);
      
      // Categorize different types of errors for better user feedback
      if (err.message?.includes('Network Error') || err.message?.includes('fetch')) {
        setError('Network connection error. Please check your internet connection and try again.');
        toast.error('Network connection error');
      } else if (err.message?.includes('unauthorized') || err.message?.includes('forbidden')) {
        setError('You do not have permission to view this farm.');
        toast.error('Access denied');
      } else if (err.message?.includes('timeout')) {
        setError('Request timed out. The server might be busy. Please try again.');
        toast.error('Request timed out');
      } else {
        setError('Failed to load farm details. Please try again or contact support if the problem persists.');
        toast.error('Failed to load farm details');
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    navigate('/farms', { state: { editFarm: farm } });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Farm Not Found</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <p className="text-sm text-gray-400 mb-6">
            The farm you're looking for might have been moved, deleted, or the URL might be incorrect.
          </p>
          <div className="space-x-4">
            <Button
              onClick={() => navigate('/farms')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Back to Farms
            </Button>
            <Button
              onClick={loadFarmDetails}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

if (!farm && !loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Farm Not Available</h3>
          <p className="text-gray-500 mb-4">Unable to load farm details at this time.</p>
          <Button
            onClick={() => navigate('/farms')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Back to Farms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/farms" className="hover:text-gray-700 transition-colors">
          Farms
        </Link>
        <ApperIcon name="ChevronRight" className="h-4 w-4" />
        <span className="text-gray-900">
          {loading ? 'Loading...' : (farm?.Name || farm?.name || 'Farm Details')}
        </span>
      </nav>

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-heading font-bold text-gray-900 mb-2"
          >
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-64 rounded"></div>
            ) : (
              farm?.Name || farm?.name || 'Farm Details'
            )}
          </motion.h1>
          <div className="flex items-center text-gray-500">
            <ApperIcon name="MapPin" className="h-4 w-4 mr-1" />
            <span>{farm?.location || 'Location not specified'}</span>
          </div>
        </div>
        <div className="flex space-x-3 flex-shrink-0 ml-4">
          <Button
            onClick={handleEdit}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <ApperIcon name="Edit" className="h-4 w-4 mr-2" />
            Edit Farm
          </Button>
          <Button
            onClick={() => navigate('/farms')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center"
          >
            <ApperIcon name="ArrowLeft" className="h-4 w-4 mr-2" />
            Back to Farms
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farm Details */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-xl font-heading font-semibold text-gray-900 mb-4">
              Farm Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farm Name
                </label>
                <p className="text-gray-900">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
                  ) : (
                    farm?.Name || farm?.name || 'N/A'
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <p className="text-gray-900">{farm?.location || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Size
                </label>
                <p className="text-gray-900">
                  {farm?.size ? `${farm.size} ${farm?.size_unit || 'units'}` : 'Not specified'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created Date
                </label>
                <p className="text-gray-900">
                  {farm?.created_at ? new Date(farm.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              {farm?.Tags && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {farm.Tags.split(',').filter(tag => tag?.trim()).map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Active Crops */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-semibold text-gray-900">
Active Crops ({crops?.length || 0})
              </h2>
              <Link 
                to={`/crops?farmId=${farm?.Id || id}`}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                View All Crops →
              </Link>
            </div>
            {crops.length > 0 ? (
              <div className="space-y-4">
                {crops.slice(0, 3).map((crop, index) => (
                  <div key={crop.Id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{crop.Name}</h3>
                        <p className="text-sm text-gray-500">{crop.variety}</p>
                        <p className="text-sm text-gray-500">Field: {crop.field}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Growth Stage</p>
                        <p className="font-medium text-gray-900">{crop.growth_stage}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {crops.length > 3 && (
                  <p className="text-center text-sm text-gray-500 pt-2">
                    And {crops.length - 3} more crops...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <ApperIcon name="Wheat" className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No crops planted yet</p>
                <Link 
                  to="/crops"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Add your first crop →
                </Link>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
              Farm Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Crops</span>
                <span className="text-lg font-semibold text-gray-900">{crops.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Tasks</span>
                <span className="text-lg font-semibold text-gray-900">
                  {tasks.filter(task => !task.completed).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <span className="text-lg font-semibold text-gray-900">
                  {formatCurrency(expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0))}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Recent Tasks */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-gray-900">
Recent Tasks
              </h3>
              <Link 
                to={`/tasks?farmId=${farm?.Id || id}`}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                View All →
              </Link>
            </div>
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.slice(0, 3).map((task) => (
                  <div key={task.Id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      task.completed ? 'bg-success' : 
                      task.priority === 'high' ? 'bg-error' :
                      task.priority === 'medium' ? 'bg-warning' : 'bg-gray-400'
                    }`}></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.Name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <ApperIcon name="CheckSquare" className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No tasks yet</p>
              </div>
            )}
          </motion.div>

          {/* Recent Expenses */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold text-gray-900">
Recent Expenses
              </h3>
              <Link 
                to={`/expenses?farmId=${farm?.Id || id}`}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                View All →
              </Link>
            </div>
            {expenses.length > 0 ? (
              <div className="space-y-3">
                {expenses.slice(0, 3).map((expense) => (
                  <div key={expense.Id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {expense.Name}
                      </p>
                      <p className="text-xs text-gray-500">{expense.category}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <ApperIcon name="DollarSign" className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No expenses recorded</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}