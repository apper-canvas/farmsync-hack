import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';

const categories = [
    { value: 'seeds', label: 'Seeds & Plants', icon: 'Sprout', color: 'text-green-600' },
    { value: 'equipment', label: 'Equipment', icon: 'Wrench', color: 'text-blue-600' },
    { value: 'fertilizer', label: 'Fertilizer', icon: 'Beaker', color: 'text-purple-600' },
    { value: 'labor', label: 'Labor', icon: 'Users', color: 'text-orange-600' },
    { value: 'fuel', label: 'Fuel', icon: 'Zap', color: 'text-red-600' },
    { value: 'maintenance', label: 'Maintenance', icon: 'Settings', color: 'text-gray-600' },
    { value: 'other', label: 'Other', icon: 'MoreHorizontal', color: 'text-gray-600' }
];

const ExpensesList = ({ expenses, farms, filter, onEdit, onDelete, onAddExpense }) => {
    const getFarmName = (farmId) => {
        const farm = farms.find(f => f.id === farmId);
        return farm ? farm.name : 'Unknown Farm';
    };

    const getCategoryInfo = (category) => {
        return categories.find(c => c.value === category) || categories[categories.length - 1];
    };

    if (expenses.length === 0) {
        return (
            <EmptyState
                icon="Receipt"
                title="No expenses found"
                message={filter === 'all' 
                    ? 'Start by adding your first farm expense'
                    : 'No expenses found for the selected filters'}
                buttonText="Add Your First Expense"
                onButtonClick={onAddExpense}
            />
        );
    }

    return (
        <div className="space-y-4">
            {expenses.map((expense, index) => {
                const categoryInfo = getCategoryInfo(expense.category);
                
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
                                <Button
                                    onClick={() => onEdit(expense)}
                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ApperIcon name="Edit" className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={() => onDelete(expense.id)}
                                    className="p-2 text-gray-400 hover:text-error hover:bg-red-50 rounded-full"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ApperIcon name="Trash2" className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default ExpensesList;