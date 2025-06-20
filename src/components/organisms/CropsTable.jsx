import React from 'react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';

// Utility function to check if a date value is valid
const isValidDate = (date) => {
    if (!date) return false;
    if (date === '' || date === null || date === undefined) return false;
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

// Safe date formatting function with validation
const safeFormatDate = (date, formatString = 'MMM d, yyyy', fallback = 'Invalid date') => {
    if (!isValidDate(date)) return fallback;
    try {
        return format(new Date(date), formatString);
    } catch (error) {
        console.warn('Date formatting error:', error);
        return fallback;
    }
};
const growthStages = [
    { value: 'planted', label: 'Planted', color: 'bg-gray-100 text-gray-800' },
    { value: 'germinated', label: 'Germinated', color: 'bg-green-100 text-green-800' },
    { value: 'growing', label: 'Growing', color: 'bg-blue-100 text-blue-800' },
    { value: 'flowering', label: 'Flowering', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'fruiting', label: 'Fruiting', color: 'bg-orange-100 text-orange-800' },
    { value: 'ready_to_harvest', label: 'Ready to Harvest', color: 'bg-purple-100 text-purple-800' },
    { value: 'harvested', label: 'Harvested', color: 'bg-green-100 text-green-800' }
];

const CropsTable = ({ crops, farms, onEdit, onDelete, filter, onAddCrop }) => {
    const getFarmName = (farmId) => {
        const farm = farms?.find(f => (f?.id ?? f?.Id) === farmId);
        return farm?.name ?? farm?.Name ?? 'Unknown Farm';
    };

    const getStageInfo = (stage) => {
        return growthStages.find(s => s.value === stage) || growthStages[0];
    };
const getDaysToHarvest = (harvestDate) => {
        // Validate the harvest date before processing
        if (!isValidDate(harvestDate)) {
            return 'N/A';
        }
        
        try {
            const harvestDateObj = new Date(harvestDate);
            const currentDate = new Date();
            
            // Additional check to ensure the date object is valid
            if (isNaN(harvestDateObj.getTime())) {
                return 'Invalid date';
            }
            
            const days = differenceInDays(harvestDateObj, currentDate);
            if (days < 0) return 'Overdue';
            if (days === 0) return 'Today';
            return `${days} days`;
        } catch (error) {
            console.warn('Error calculating days to harvest:', error);
            return 'N/A';
        }
    };
    if (crops.length === 0) {
        return (
            <EmptyState
                icon="Wheat"
                title={filter === 'all' ? 'No crops planted yet' : `No ${filter} crops found`}
                message={filter === 'all' 
                    ? 'Start by adding your first crop to track its growth'
                    : 'Try adjusting your filter or add more crops'}
                buttonText="Add Your First Crop"
                onButtonClick={onAddCrop}
            />
        );
    }

return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Crops Overview</h3>
                <Button
                    onClick={() => onAddCrop({ type: 'export', data: crops })}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-surface-100 text-gray-700 rounded-lg hover:bg-surface-200 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <ApperIcon name="Download" className="h-4 w-4" />
                    <span>Export</span>
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Crop
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Farm & Field
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Growth Stage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Planted
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Harvest
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
{crops.map((crop, index) => {
                            // Validate crop object exists before accessing properties
                            if (!crop) {
                                return null;
                            }
                            
                            // Safely get stage info with fallback for different property formats
                            const stageInfo = getStageInfo(crop?.growth_stage ?? crop?.growthStage);
                            return (
                                <motion.tr
                                    key={crop.id || crop.Id || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
<td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {crop?.name ?? crop?.Name ?? 'Unknown Crop'}
                                            </div>
                                            {crop?.variety && (
                                                <div className="text-sm text-gray-500">
                                                    {crop.variety}
                                                </div>
                                            )}
                                        </div>
                                    </td>
<td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {getFarmName(crop?.farmId ?? crop?.farm_id)}
                                        </div>
                                        {crop?.field && (
                                            <div className="text-sm text-gray-500">
                                                {crop.field}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stageInfo.color}`}>
                                            {stageInfo.label}
                                        </span>
                                    </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {safeFormatDate(crop?.plantingDate ?? crop?.planting_date, 'MMM d, yyyy', 'No date set')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {safeFormatDate(crop?.expectedHarvestDate ?? crop?.expected_harvest_date, 'MMM d, yyyy', 'No date set')}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {getDaysToHarvest(crop?.expectedHarvestDate ?? crop?.expected_harvest_date)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
<Button
                                                onClick={() => onEdit(crop)}
                                                className="text-primary hover:text-primary/80"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <ApperIcon name="Edit" className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => onDelete(crop?.id ?? crop?.Id)}
                                                className="text-gray-400 hover:text-error"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <ApperIcon name="Trash2" className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CropsTable;