import React from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import { Link } from 'react-router-dom';

const FarmCard = ({ farm, cropCount, onEdit, onDelete, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-heading font-semibold text-gray-900 truncate">
                        {farm.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                        <ApperIcon name="MapPin" className="h-4 w-4 mr-1" />
                        {farm.location}
                    </p>
                </div>
                <div className="flex space-x-1 flex-shrink-0 ml-2">
                    <Button
                        onClick={() => onEdit(farm)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ApperIcon name="Edit" className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={() => onDelete(farm.id)}
                        className="p-2 text-gray-400 hover:text-error hover:bg-red-50 rounded-full"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ApperIcon name="Trash2" className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Size</span>
                    <span className="text-sm font-medium text-gray-900">
                        {farm.size} {farm.sizeUnit}
                    </span>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Crops</span>
                    <span className="text-sm font-medium text-gray-900">
                        {cropCount}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-medium text-gray-900">
                        {new Date(farm.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                    <Link to={`/farms/${farm.id}`} className="flex-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                        View Details
                    </Link>
                    <Link to={`/crops?farmId=${farm.id}`} className="flex-1 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
                        View Crops
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default FarmCard;