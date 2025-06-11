import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import DashboardHeader from '@/components/organisms/DashboardHeader';
import StatCardsGrid from '@/components/organisms/StatCardsGrid';
import MainFeature from '@/components/organisms/MainFeature';
import RecentExpensesList from '@/components/organisms/RecentExpensesList';
import { farmService, cropService, taskService, expenseService, weatherService } from '@/services';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalFarms: 0,
    activeCrops: 0,
    pendingTasks: 0,
    monthlyExpenses: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [farms, crops, tasks, expenses, weatherData] = await Promise.all([
          farmService.getAll(),
          cropService.getAll(),
          taskService.getAll(),
          expenseService.getAll(),
          weatherService.getCurrentWeather()
        ]);

        // Calculate stats
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const pendingTasks = tasks.filter(task => !task.completed).length;
        const monthlyExpenses = expenses
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
          })
          .reduce((sum, expense) => sum + expense.amount, 0);

        setStats({
          totalFarms: farms.length,
          activeCrops: crops.length,
          pendingTasks,
          monthlyExpenses
        });

        // Get recent expenses
        const sortedExpenses = expenses
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);
        setRecentExpenses(sortedExpenses);
        setWeather(weatherData);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const statCardsData = [
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
  ];

  const getWeatherGradient = (condition) => {
    if (!condition) return 'from-blue-400 to-blue-600';
    
    switch (condition) {
      case 'sunny':
        return 'from-yellow-400 to-orange-500';
      case 'cloudy':
        return 'from-gray-400 to-gray-600';
      case 'rainy':
        return 'from-blue-500 to-gray-600';
      case 'stormy':
        return 'from-gray-700 to-gray-900';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

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
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
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
      <DashboardHeader weather={weather} getWeatherGradient={getWeatherGradient} />
      <StatCardsGrid stats={statCardsData} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MainFeature />
        </div>
        <RecentExpensesList expenses={recentExpenses} />
      </div>
    </div>
  );
}