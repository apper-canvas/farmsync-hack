import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const DashboardHeader = ({ weather, getWeatherGradient }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg bg-gradient-to-r ${getWeatherGradient(weather?.condition)} p-6 text-white`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-heading font-bold mb-2">Farm Dashboard</h1>
                    <p className="text-white/90">Welcome back! Here's what's happening on your farms today.</p>
                </div>
                {weather && (
                    <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                            <ApperIcon name="MapPin" className="h-4 w-4" />
                            <span className="text-sm">{weather.location}</span>
                        </div>
                        <p className="text-2xl font-bold">{weather.temperature}°F</p>
                        <p className="text-sm text-white/80 capitalize">{weather.condition}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default DashboardHeader;