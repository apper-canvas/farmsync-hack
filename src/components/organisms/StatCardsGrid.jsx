import React from 'react';
import StatCard from '@/components/molecules/StatCard';

const StatCardsGrid = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <StatCard 
                    key={stat.title}
                    title={stat.title}
                    value={stat.value}
                    icon={stat.icon}
                    color={stat.color}
                    link={stat.link}
                    index={index}
                />
            ))}
        </div>
    );
};

export default StatCardsGrid;