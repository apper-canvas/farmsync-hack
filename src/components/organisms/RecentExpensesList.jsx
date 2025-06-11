import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';

const RecentExpensesList = ({ expenses }) => {
    // Validate and filter expenses to ensure they have valid data structure
    const validExpenses = React.useMemo(() => {
        if (!expenses || !Array.isArray(expenses)) {
            return [];
        }
        
        return expenses.filter(expense => 
            expense && 
            typeof expense === 'object' && 
            (expense.id || expense.id === 0)
        );
    }, [expenses]);

    return (
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

            {validExpenses.length === 0 ? (
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
                    {validExpenses.map((expense, index) => (
                        <motion.div
                            key={expense.id ?? `expense-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
<div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {expense?.description ?? 'Unnamed Expense'}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {expense?.category ?? 'Uncategorized'} • {expense?.date ? new Date(expense.date).toLocaleDateString() : 'No date'}
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <p className="text-sm font-semibold text-gray-900">
                                    ${(expense?.amount ?? 0).toLocaleString()}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default RecentExpensesList;