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
            {farms.map((farm, index) => {
                // Ensure farm has required data before rendering
                const farmId = farm.Id || farm.id;
                const farmName = farm.Name || farm.name;
                
                return (
                    <FarmCard
                        key={farmId || `farm-${index}`}
                        farm={{
                            ...farm,
                            Name: farmName || 'Unnamed Farm',
                            Id: farmId
                        }}
                        cropCount={getCropCountForFarm(farmId)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        index={index}
                    />
                );
            })}
        </div>
    );
};

export default FarmsGrid;