import React from 'react';

const Input = ({ type = 'text', value, onChange, placeholder, className = '', required = false, min, step, ...rest }) => {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
            required={required}
            min={min}
            step={step}
            {...rest}
        />
    );
};

export default Input;