import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const WeatherStatsGrid = ({ forecast }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Today's High</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {forecast.length > 0 ? `${forecast[0].high}°F` : '--'}
                        </p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full">
                        <ApperIcon name="TrendingUp" className="h-6 w-6 text-red-600" />
                    </div>
                </div>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Today's Low</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {forecast.length > 0 ? `${forecast[0].low}°F` : '--'}
                        </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                        <ApperIcon name="TrendingDown" className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
            </motion.div>
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">Rain Chance</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {forecast.length > 0 ? `${forecast[0].precipitation}%` : '--'}
                        </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                        <ApperIcon name="Droplets" className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default WeatherStatsGrid;