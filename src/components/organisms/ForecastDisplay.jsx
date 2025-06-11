import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const ForecastDisplay = ({ forecast, getWeatherIcon }) => {
    if (!forecast || forecast.length === 0) {
        return <p className="text-gray-500">7-day forecast data unavailable.</p>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
            <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4 flex items-center">
                <ApperIcon name="Calendar" className="h-5 w-5 mr-2 text-primary" />
                7-Day Forecast
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {forecast.map((day, index) => (
                    <motion.div
                        key={day.date}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200"
                    >
                        <p className="text-sm font-medium text-gray-600 mb-2">
                            {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                            {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </p>
                        
                        <div className="p-3 bg-white rounded-full mb-3 mx-auto w-fit">
                            <ApperIcon 
                                name={getWeatherIcon(day.condition)}
                                className="h-8 w-8 text-blue-600"
                            />
                        </div>
                        
                        <div className="space-y-1">
                            <p className="text-lg font-bold text-gray-900">
                                {day.high}°
                            </p>
                            <p className="text-sm text-gray-500">
                                {day.low}°
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                                {day.condition}
                            </p>
                            {day.precipitation > 0 && (
                                <div className="flex items-center justify-center space-x-1 text-xs text-blue-600">
                                    <ApperIcon name="Droplets" className="h-3 w-3" />
                                    <span>{day.precipitation}%</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default ForecastDisplay;