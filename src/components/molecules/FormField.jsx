import React from 'react';
import Label from '@/components/atoms/Label';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import TextArea from '@/components/atoms/TextArea';
import ApperIcon from '@/components/ApperIcon';

const FormField = ({ label, id, type, value, onChange, options, placeholder, required, min, step, rows, children, prefixIcon, prefixText, ...rest }) => {
    const inputProps = { id, value, onChange, placeholder, required, ...rest };

    const renderInput = () => {
        switch (type) {
            case 'select':
                return (
                    <Select options={options} {...inputProps} placeholder={placeholder} />
                );
            case 'textarea':
                return (
                    <TextArea rows={rows} {...inputProps} />
                );
            case 'number':
                return (
                    <div className="relative">
                        {(prefixIcon || prefixText) && (
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                {prefixIcon && <ApperIcon name={prefixIcon} className="h-5 w-5 text-gray-500" />}
                                {prefixText && <span className="text-gray-500 sm:text-sm">{prefixText}</span>}
                            </div>
                        )}
                        <Input 
                            type="number" 
                            min={min} 
                            step={step} 
                            className={prefixIcon || prefixText ? "pl-7" : ""} 
                            {...inputProps} 
                        />
                    </div>
                );
            default:
                return (
                    <Input type={type} {...inputProps} />
                );
        }
    };

    return (
        <div>
            {label && (
                <Label htmlFor={id}>
                    {label} {required && '*'}
                </Label>
            )}
            {children ? children : renderInput()}
        </div>
    );
};

export default FormField;