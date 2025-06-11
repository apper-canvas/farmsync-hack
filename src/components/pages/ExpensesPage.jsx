import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import PageHeader from '@/components/organisms/PageHeader';
import ExpenseFilters from '@/components/organisms/ExpenseFilters';
import ExpenseStatsGrid from '@/components/organisms/ExpenseStatsGrid';
import ExpenseFormModal from '@/components/organisms/ExpenseFormModal';
import ExpensesList from '@/components/organisms/ExpensesList';
import ExportModal from '@/components/organisms/ExportModal';
import { expenseService, farmService } from '@/services';
export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
const [editingExpense, setEditingExpense] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('this_month');
  const [showExportModal, setShowExportModal] = useState(false);

  const categories = [
    { value: 'seeds', label: 'Seeds & Plants', icon: 'Sprout', color: 'text-green-600' },
    { value: 'equipment', label: 'Equipment', icon: 'Wrench', color: 'text-blue-600' },
    { value: 'fertilizer', label: 'Fertilizer', icon: 'Beaker', color: 'text-purple-600' },
    { value: 'labor', label: 'Labor', icon: 'Users', color: 'text-orange-600' },
    { value: 'fuel', label: 'Fuel', icon: 'Zap', color: 'text-red-600' },
    { value: 'maintenance', label: 'Maintenance', icon: 'Settings', color: 'text-gray-600' },
    { value: 'other', label: 'Other', icon: 'MoreHorizontal', color: 'text-gray-600' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expenseData, farmData] = await Promise.all([
        expenseService.getAll(),
        farmService.getAll()
      ]);
      setExpenses(expenseData);
      setFarms(farmData);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    if (!formData.farmId || !formData.category || !formData.amount || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const expenseData = {
        ...formData,
        amount
      };

      if (editingExpense) {
        const updatedExpense = await expenseService.update(editingExpense.id, expenseData);
        setExpenses(expenses.map(expense => expense.id === editingExpense.id ? updatedExpense : expense));
        toast.success('Expense updated successfully!');
      } else {
        const newExpense = await expenseService.create(expenseData);
        setExpenses([...expenses, newExpense]);
        toast.success('Expense added successfully!');
      }

      resetForm();
    } catch (err) {
      toast.error('Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowAddForm(true);
  };

  const handleDelete = async (expenseId) => {
    const expense = expenses.find(e => e.id === expenseId);
    const confirmMessage = expense && expense.amount > 1000 
      ? `Are you sure you want to delete this $${expense.amount.toLocaleString()} expense? This action cannot be undone.`
      : 'Are you sure you want to delete this expense?';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await expenseService.delete(expenseId);
      setExpenses(expenses.filter(expense => expense.id !== expenseId));
      toast.success('Expense deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const resetForm = () => {
    setEditingExpense(null);
    setShowAddForm(false);
  };

  const getFilteredExpenses = () => {
    let filtered = expenses;

    // Category filter
    if (filter !== 'all') {
      filtered = filtered.filter(expense => expense.category === filter);
    }

    // Date filter
    const now = new Date();
    switch (dateFilter) {
      case 'this_month':
        filtered = filtered.filter(expense => 
          isWithinInterval(new Date(expense.date), {
            start: startOfMonth(now),
            end: endOfMonth(now)
          })
        );
        break;
      case 'last_30_days':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(expense => 
          new Date(expense.date) >= thirtyDaysAgo
        );
        break;
      // 'all_time' shows all expenses
      default:
        break;
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getExpenseStats = () => {
    const filtered = getFilteredExpenses();
    const total = filtered.reduce((sum, expense) => sum + expense.amount, 0);
    
    const byCategory = categories.map(category => {
      const categoryExpenses = filtered.filter(expense => expense.category === category.value);
      const categoryTotal = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      return {
        ...category,
        total: categoryTotal,
        count: categoryExpenses.length
      };
    }).filter(category => category.total > 0);

    return { total, byCategory };
  };

  const filteredExpenses = getFilteredExpenses();
  const stats = getExpenseStats();

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
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load expenses</h3>
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
        title="Expenses" 
        description="Track and manage your farm expenses" 
        buttonText="Add Expense" 
        buttonIcon="Plus" 
        onButtonClick={() => setShowAddForm(true)} 
      />

      <ExpenseFilters 
        categories={categories} 
        currentFilter={filter} 
        onFilterChange={setFilter} 
        dateFilter={dateFilter} 
        onDateFilterChange={setDateFilter} 
      />

      <ExpenseStatsGrid totalExpenses={stats.total} categorizedExpenses={stats.byCategory} />

      <ExpenseFormModal 
        isOpen={showAddForm} 
        onClose={resetForm} 
        editingExpense={editingExpense} 
        farms={farms} 
        categories={categories}
        onSubmit={handleSubmit}
      />

<ExpensesList 
        expenses={filteredExpenses} 
        farms={farms} 
        categories={categories}
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        filter={filter}
        onAddExpense={(action) => {
          if (action?.type === 'export') {
            setShowExportModal(true);
          } else {
            setShowAddForm(true);
          }
        }}
      />

      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          dataType="expenses"
          data={filteredExpenses}
          farms={farms}
        />
      )}
    </div>
  );
}