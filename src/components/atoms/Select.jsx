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
{options.map((option, index) => {
                // Ensure we have a unique key for each option
                const optionKey = option?.value ?? option?.id ?? index;
                const optionValue = option?.value ?? option?.id ?? '';
                const optionLabel = option?.label ?? option?.name ?? option?.value ?? option?.id ?? '';
                
                return (
                    <option key={`option-${optionKey}-${index}`} value={optionValue}>
                        {optionLabel}
                    </option>
                );
            })}
        </select>
    );
};

export default Select;