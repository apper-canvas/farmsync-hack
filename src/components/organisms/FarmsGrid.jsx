import React from 'react';
import FarmCard from '@/components/molecules/FarmCard';
import EmptyState from '@/components/molecules/EmptyState';

const FarmsGrid = ({ farms, crops, onEdit, onDelete, onAddFarm }) => {
    const getCropCountForFarm = (farmId) => {
        return crops.filter(crop => crop.farm_id === farmId).length;
    };

    if (farms.length === 0) {
        return (
            <EmptyState
                icon="MapPin"
                title="No farms yet"
                message="Get started by adding your first farm property"
                buttonText="Add Your First Farm"
                onButtonClick={onAddFarm}
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{farms.map((farm, index) => (
                <FarmCard
                    key={farm.Id || farm.id || index}
                    farm={farm}
                    cropCount={getCropCountForFarm(farm.Id || farm.id)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    index={index}
                />
            ))}
        </div>
    );
};

export default FarmsGrid;