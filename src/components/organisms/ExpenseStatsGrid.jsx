import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const ExpenseStatsGrid = ({ totalExpenses, categorizedExpenses }) => {
    return (
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
                            ${totalExpenses.toLocaleString()}
                        </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full">
                        <ApperIcon name="DollarSign" className="h-6 w-6 text-red-600" />
                    </div>
                </div>
            </motion.div>

            {categorizedExpenses.slice(0, 3).map((category, index) => (
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
    );
};

export default ExpenseStatsGrid;