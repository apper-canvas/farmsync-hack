import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const CurrentWeatherDisplay = ({ weather, getWeatherIcon, getWeatherGradient }) => {
    if (!weather) {
        return <p className="text-gray-500">Current weather data unavailable.</p>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg bg-gradient-to-r ${getWeatherGradient(weather.condition)} p-8 text-white`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <ApperIcon name="MapPin" className="h-5 w-5" />
                        <span className="text-lg font-medium">{weather.location}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div>
                            <p className="text-5xl font-bold mb-2">{weather.temperature}°F</p>
                            <p className="text-xl text-white/90 capitalize">{weather.condition}</p>
                            <p className="text-white/80">Feels like {weather.feelsLike}°F</p>
                        </div>
                        <div className="p-4 bg-white/20 rounded-full">
                            <ApperIcon 
                                name={getWeatherIcon(weather.condition)} 
                                className="h-16 w-16"
                            />
                        </div>
                    </div>
                </div>
                
                <div className="text-right space-y-4">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                            <p className="text-white/80">Humidity</p>
                            <p className="text-2xl font-semibold">{weather.humidity}%</p>
                        </div>
                        <div>
                            <p className="text-white/80">Wind</p>
                            <p className="text-2xl font-semibold">{weather.windSpeed} mph</p>
                        </div>
                        <div>
                            <p className="text-white/80">Pressure</p>
                            <p className="text-2xl font-semibold">{weather.pressure}"</p>
                        </div>
                        <div>
                            <p className="text-white/80">UV Index</p>
                            <p className="text-2xl font-semibold">{weather.uvIndex}</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CurrentWeatherDisplay;