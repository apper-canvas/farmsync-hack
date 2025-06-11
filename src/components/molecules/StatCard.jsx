import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';

const StatCard = ({ title, value, icon, color, link, index }) => {
    const content = (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`p-3 rounded-full border ${color} group-hover:scale-110 transition-transform duration-200`}>
                <ApperIcon name={icon} className="h-6 w-6" />
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group"
        >
            {link ? (
                <Link 
                    to={link}
                    className="block bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                    {content}
                </Link>
            ) : (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    {content}
                </div>
            )}
        </motion.div>
    );
};

export default StatCard;