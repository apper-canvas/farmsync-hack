import React from 'react';
import FilterButton from '@/components/molecules/FilterButton';
import Select from '@/components/atoms/Select';

const ExpenseFilters = ({ categories, currentFilter, onFilterChange, dateFilter, onDateFilterChange }) => {
    const dateOptions = [
        { value: 'this_month', label: 'This Month' },
        { value: 'last_30_days', label: 'Last 30 Days' },
        { value: 'all_time', label: 'All Time' }
    ];

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex space-x-2 overflow-x-auto pb-2">
                <FilterButton
                    label="All Categories"
                    isActive={currentFilter === 'all'}
                    onClick={() => onFilterChange('all')}
                />
                {categories.map(category => (
                    <FilterButton
                        key={category.value}
                        label={category.label}
                        isActive={currentFilter === category.value}
                        onClick={() => onFilterChange(category.value)}
                        icon={category.icon}
                    />
                ))}
            </div>

            <Select
                value={dateFilter}
                onChange={(e) => onDateFilterChange(e.target.value)}
                options={dateOptions}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
        </div>
    );
};

export default ExpenseFilters;