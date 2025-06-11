import React from 'react';

const Select = ({ value, onChange, options, className = '', required = false, placeholder, ...rest }) => {
    return (
        <select
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
            required={required}
            {...rest}
        >
            {placeholder && (
                <option value="" disabled={value !== ""}>
                    {placeholder}
                </option>
            )}
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label || option.value}
                </option>
            ))}
        </select>
    );
};

export default Select;