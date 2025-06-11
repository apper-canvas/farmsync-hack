import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import incomeService from '@/services/api/incomeService';
import expenseService from '@/services/api/expenseService';
import cropService from '@/services/api/cropService';
import farmService from '@/services/api/farmService';
import PageHeader from '@/components/organisms/PageHeader';
import IncomeStatsGrid from '@/components/organisms/IncomeStatsGrid';
import IncomeChart from '@/components/organisms/IncomeChart';
import IncomeTable from '@/components/organisms/IncomeTable';
import IncomeFormModal from '@/components/organisms/IncomeFormModal';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import ApperIcon from '@/components/ApperIcon';

export default function CropIncomePage() {
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  
  // Date filter states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('');
  
  // Get available years from data
  const getAvailableYears = () => {
    const years = new Set();
    [...income, ...expenses].forEach(item => {
      if (item.date) {
        const year = new Date(item.date).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [incomeData, expenseData, cropData, farmData] = await Promise.all([
        incomeService.getAll(),
        expenseService.getAll(),
        cropService.getAll(),
        farmService.getAll()
      ]);
      
      setIncome(incomeData || []);
      setExpenses(expenseData || []);
      setCrops(cropData || []);
      setFarms(farmData || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load income data');
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on selected year and month
  const getFilteredData = (data) => {
    if (!data || data.length === 0) return [];
    
    return data.filter(item => {
      if (!item.date) return false;
      
      const itemDate = new Date(item.date);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth() + 1;
      
      // Filter by year
      if (selectedYear && itemYear !== parseInt(selectedYear)) {
        return false;
      }
      
      // Filter by month if selected
      if (selectedMonth && itemMonth !== parseInt(selectedMonth)) {
        return false;
      }
      
      return true;
    });
  };

  const filteredIncome = getFilteredData(income);
  const filteredExpenses = getFilteredData(expenses);

  // Calculate totals
  const totalIncome = filteredIncome.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  const handleSubmit = async (formData) => {
    if (!formData.description?.trim() || !formData.amount || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingIncome) {
        const updatedIncome = await incomeService.update(editingIncome.id, formData);
        if (updatedIncome) {
          setIncome(income.map(item => item.id === editingIncome.id ? updatedIncome : item));
        }
      } else {
        const newIncome = await incomeService.create(formData);
        if (newIncome) {
          setIncome([...income, newIncome]);
        }
      }
      resetForm();
    } catch (err) {
      console.error('Error saving income:', err);
    }
  };

  const handleEdit = (incomeItem) => {
    setEditingIncome(incomeItem);
    setShowAddForm(true);
  };

  const handleDelete = async (incomeId) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) {
      return;
    }

    try {
      const success = await incomeService.delete(incomeId);
      if (success) {
        setIncome(income.filter(item => item.id !== incomeId));
      }
    } catch (err) {
      console.error('Error deleting income:', err);
    }
  };

  const resetForm = () => {
    setEditingIncome(null);
    setShowAddForm(false);
  };

  // Prepare chart data
  const getChartData = () => {
    const months = {};
    
    // Initialize months for the selected year
    const year = parseInt(selectedYear);
    for (let i = 1; i <= 12; i++) {
      const monthKey = `${year}-${i.toString().padStart(2, '0')}`;
      months[monthKey] = { income: 0, expenses: 0 };
    }
    
    // Aggregate income data
    filteredIncome.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (months[monthKey]) {
        months[monthKey].income += parseFloat(item.amount) || 0;
      }
    });
    
    // Aggregate expense data
    filteredExpenses.forEach(item => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (months[monthKey]) {
        months[monthKey].expenses += parseFloat(item.amount) || 0;
      }
    });
    
    return Object.entries(months).map(([monthKey, data]) => ({
      month: format(new Date(monthKey + '-01'), 'MMM'),
      income: data.income,
      expenses: data.expenses,
      profit: data.income - data.expenses
    }));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load income data</h3>
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

  const availableYears = getAvailableYears();

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      <PageHeader 
        title="Crop Income" 
        description="Track your farm earnings and analyze profitability across crops and time periods" 
        buttonText="Add Income" 
        buttonIcon="Plus" 
        onButtonClick={() => setShowAddForm(true)} 
      />

      {/* Date Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <ApperIcon name="Calendar" className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by Date:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="min-w-[120px]">
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                options={availableYears.map(year => ({ value: year.toString(), label: year.toString() }))}
                placeholder="Select Year"
                className="text-sm"
              />
            </div>
            
            <div className="min-w-[140px]">
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                options={months}
                placeholder="Select Month"
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Showing {filteredIncome.length} income records</span>
            {selectedMonth && <span>for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</span>}
            {!selectedMonth && selectedYear && <span>for {selectedYear}</span>}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <IncomeStatsGrid 
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        profitMargin={profitMargin}
      />

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Income vs Expenses Trend</h3>
        <IncomeChart data={getChartData()} />
      </div>

      {/* Income Table */}
      <IncomeTable 
        income={filteredIncome}
        crops={crops}
        farms={farms}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Income Form Modal */}
      <IncomeFormModal 
        isOpen={showAddForm} 
        onClose={resetForm} 
        editingIncome={editingIncome} 
        crops={crops}
        farms={farms}
        onSubmit={handleSubmit}
      />
    </div>
  );
}