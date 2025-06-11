import React from 'react';
import { motion } from 'framer-motion';
import { format, isBefore, isToday, addDays } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';

const TasksList = ({ tasks, farms, crops, priorities, onToggleComplete, onEdit, onDelete, filter, onAddTask }) => {
    // Helper function to validate if a date is valid
    const isValidDate = (date) => {
        return date instanceof Date && !isNaN(date.getTime());
    };

    // Safe date validation and formatting function with comprehensive error handling
    const validateAndFormatDate = (dateValue, formatString = 'MMM d, yyyy') => {
        // Check for null, undefined, or empty string
        if (!dateValue || dateValue === '') {
            console.warn('TasksList: Date value is null, undefined, or empty:', dateValue);
            return 'No date';
        }

        // Try to create a Date object
        let date;
        try {
            date = new Date(dateValue);
        } catch (error) {
            console.error('TasksList: Error creating Date object:', error, 'Value:', dateValue);
            return 'Invalid date';
        }

        // Validate the date
        if (!isValidDate(date)) {
            console.warn('TasksList: Invalid date value:', dateValue);
            return 'Invalid date';
        }

        // Format the date safely
        try {
            return format(date, formatString);
        } catch (error) {
            console.error('TasksList: Error formatting date:', error, 'Date:', date);
            return 'Invalid date';
        }
    };

    // Safe farm name retrieval with null checks
    const getFarmName = (farmId) => {
        if (!farmId) {
            console.warn('TasksList: Farm ID is null or undefined');
            return 'No Farm Selected';
        }
        
        if (!farms || !Array.isArray(farms)) {
            console.warn('TasksList: Farms data is not available or not an array');
            return 'Unknown Farm';
        }
        
        const farm = farms.find(f => f?.id === farmId || f?.Id === farmId);
        return farm?.name || farm?.Name || 'Unknown Farm';
    };

    // Safe crop name retrieval with null checks
    const getCropName = (cropId) => {
        if (!cropId) return null;
        
        if (!crops || !Array.isArray(crops)) {
            console.warn('TasksList: Crops data is not available or not an array');
            return 'Unknown Crop';
        }
        
        const crop = crops.find(c => c?.id === cropId || c?.Id === cropId);
        return crop?.name || crop?.Name || 'Unknown Crop';
    };

    // Safe priority info retrieval with fallback
    const getPriorityInfo = (priority) => {
        if (!priority) {
            console.warn('TasksList: Priority is null or undefined');
            return { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
        }
        
        if (!priorities || !Array.isArray(priorities)) {
            console.warn('TasksList: Priorities data is not available or not an array');
            return { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
        }
        
        return priorities.find(p => p?.value === priority) || 
               priorities[1] || 
               { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    };

    // Enhanced task status determination with comprehensive validation
    const getTaskStatus = (task) => {
        // Validate task object
        if (!task || typeof task !== 'object') {
            console.warn('TasksList: Task object is null, undefined, or invalid:', task);
            return 'invalid_task';
        }

        // Check completed status with safe access
        const isCompleted = task?.completed ?? false;
        if (isCompleted === true) return 'completed';
        
        // Validate due date before processing
        const dueDateValue = task?.dueDate || task?.due_date;
        if (!dueDateValue || dueDateValue === '') {
            console.warn('TasksList: Task has no due date set:', task?.id || task?.Id || 'unknown');
            return 'no_date';
        }

        let dueDate;
        try {
            dueDate = new Date(dueDateValue);
        } catch (error) {
            console.error('TasksList: Error creating due date:', error, 'Value:', dueDateValue);
            return 'invalid_date';
        }

        if (!isValidDate(dueDate)) {
            console.warn('TasksList: Invalid due date value:', dueDateValue);
            return 'invalid_date';
        }

        const today = new Date();
        
        try {
            if (isBefore(dueDate, today) && !isToday(dueDate)) return 'overdue';
            if (isToday(dueDate)) return 'due_today';
            if (isBefore(dueDate, addDays(today, 3))) return 'due_soon';
            return 'upcoming';
        } catch (error) {
            console.error('TasksList: Error comparing dates:', error);
            return 'invalid_date';
        }
    };
// Enhanced status color mapping with additional status types
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600';
            case 'overdue': return 'text-red-600';
            case 'due_today': return 'text-orange-600';
            case 'due_soon': return 'text-yellow-600';
            case 'invalid_date': return 'text-red-500';
            case 'no_date': return 'text-gray-400';
            case 'invalid_task': return 'text-red-500';
            default: return 'text-gray-600';
        }
    };
// Enhanced empty state handling with data validation
    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
        const emptyMessage = !tasks ? 'Unable to load tasks data' :
                           !Array.isArray(tasks) ? 'Invalid tasks data format' :
                           filter === 'pending' ? 'All caught up! Create a new task to stay organized.' :
                           'Try adjusting your filter or create new tasks.';
        
        return (
            <EmptyState
                icon="CheckSquare"
                title={!tasks || !Array.isArray(tasks) ? 'Tasks Data Error' : 
                       filter === 'pending' ? 'No pending tasks' : `No ${filter} tasks`}
                message={emptyMessage}
                buttonText={!tasks || !Array.isArray(tasks) ? 'Refresh Page' : 'Create Task'}
                onButtonClick={!tasks || !Array.isArray(tasks) ? () => window.location.reload() : onAddTask}
            />
        );
    }

return (
        <div className="space-y-4">
            {tasks.map((task, index) => {
                // Comprehensive task validation with detailed logging
                if (!task || typeof task !== 'object') {
                    console.warn('TasksList: Encountered null/undefined or invalid task at index:', index, 'Task:', task);
                    return null;
                }

                // Validate task has required ID
                const taskId = task?.id || task?.Id;
                if (!taskId) {
                    console.warn('TasksList: Task missing ID at index:', index, 'Task:', task);
                    return null;
                }

                const status = getTaskStatus(task);
                const priorityInfo = getPriorityInfo(task?.priority);
                const cropName = getCropName(task?.cropId || task?.crop_id);
                const farmName = getFarmName(task?.farmId || task?.farm_id);
                const isCompleted = task?.completed ?? false;

                return (
                    <motion.div
                        key={taskId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-all duration-200 ${
                            isCompleted ? 'opacity-75' : ''
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 min-w-0 flex-1">
                                <Button
                                    onClick={() => onToggleComplete?.(taskId)}
                                    className={`mt-1 flex-shrink-0 h-5 w-5 rounded border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 ${
                                        isCompleted
                                            ? 'bg-primary border-primary text-white'
                                            : 'border-gray-300 hover:border-primary'
                                    }`}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {isCompleted && (
                                        <ApperIcon name="Check" className="h-3 w-3 m-0.5" />
                                    )}
                                </Button>
                                
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <h3 className={`text-lg font-medium ${
                                            isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                                        }`}>
                                            {task?.type || task?.Name || 'Unnamed Task'}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                                            {priorityInfo?.label || 'Unknown Priority'}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div className="flex items-center space-x-4">
                                            <span className="flex items-center">
                                                <ApperIcon name="MapPin" className="h-4 w-4 mr-1" />
                                                {farmName}
                                            </span>
                                            {cropName && cropName !== 'Unknown Crop' && (
                                                <span className="flex items-center">
                                                    <ApperIcon name="Wheat" className="h-4 w-4 mr-1" />
                                                    {cropName}
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center space-x-4">
                                            <span className={`flex items-center ${getStatusColor(status)}`}>
                                                <ApperIcon name="Calendar" className="h-4 w-4 mr-1" />
                                                Due: {validateAndFormatDate(task?.dueDate || task?.due_date)}
                                                {status === 'overdue' && ' (Overdue)'}
                                                {status === 'due_today' && ' (Today)'}
                                                {status === 'due_soon' && ' (Due Soon)'}
                                                {status === 'invalid_date' && ' (Invalid Date)'}
                                                {status === 'no_date' && ' (No Date Set)'}
                                                {status === 'invalid_task' && ' (Invalid Task)'}
                                            </span>
                                        </div>

                                        {(task?.description || task?.Description) && (
                                            <p className="text-gray-600 mt-2 break-words">
                                                {task?.description || task?.Description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                                <Button
                                    onClick={() => onEdit?.(task)}
                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-full"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ApperIcon name="Edit" className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={() => onDelete?.(taskId)}
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
            }).filter(Boolean)} {/* Filter out null entries */}
        </div>
    );
};

export default TasksList;