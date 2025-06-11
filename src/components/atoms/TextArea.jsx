import React from 'react';

const TextArea = ({ value, onChange, placeholder, className = '', rows = 3, ...rest }) => {
    return (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${className}`}
            rows={rows}
            {...rest}
        />
    );
};

export default TextArea;