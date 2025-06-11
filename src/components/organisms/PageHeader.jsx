import React from 'react';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const PageHeader = ({ title, description, buttonText, onButtonClick, buttonIcon }) => {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-heading font-bold text-gray-900">{title}</h1>
                <p className="text-gray-600 mt-1">{description}</p>
            </div>
            {buttonText && onButtonClick && (
                <Button
                    onClick={onButtonClick}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center space-x-2"
                >
                    {buttonIcon && <ApperIcon name={buttonIcon} className="h-4 w-4" />}
                    <span>{buttonText}</span>
                </Button>
            )}
        </div>
    );
};

export default PageHeader;