import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const FarmingAdviceList = ({ weather, getFarmingAdvice, getAdviceColor }) => {
    if (!weather) return null;

    const adviceItems = getFarmingAdvice(weather);

    if (adviceItems.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
                No specific farming recommendations for current conditions.
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4 flex items-center">
                <ApperIcon name="Lightbulb" className="h-5 w-5 mr-2 text-primary" />
                Farming Recommendations
            </h2>
            
            <div className="space-y-3">
                {adviceItems.map((advice, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center space-x-3 p-3 rounded-lg border ${getAdviceColor(advice.type)}`}
                    >
                        <ApperIcon name={advice.icon} className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{advice.text}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default FarmingAdviceList;