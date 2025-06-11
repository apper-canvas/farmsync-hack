import React from 'react';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const FilterButton = ({ label, isActive, onClick, icon, ...rest }) => {
    return (
        <Button
            onClick={onClick}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
                isActive
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } flex items-center space-x-1`}
            whileHover={{}} // Override default scaling as it might conflict with whitespace-nowrap and flex
            whileTap={{}} // Override default scaling
            {...rest}
        >
            {icon && <ApperIcon name={icon} className="h-4 w-4" />}
            <span>{label}</span>
        </Button>
    );
};

export default FilterButton;