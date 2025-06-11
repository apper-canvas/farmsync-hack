import React from 'react';
import FarmCard from '@/components/molecules/FarmCard';
import EmptyState from '@/components/molecules/EmptyState';

const FarmsGrid = ({ farms, crops, onEdit, onDelete, onAddFarm }) => {
    const getCropCountForFarm = (farmId) => {
        // Enhanced input validation and null checking
        if (!farmId || !crops || !Array.isArray(crops)) {
            return 0;
        }
        
        try {
            return crops.filter(crop => crop?.farm_id === farmId).length;
        } catch (error) {
            console.error('Error counting crops for farm:', farmId, error);
            return 0;
        }
    };

    // Enhanced farms array validation with null/undefined checking
    if (!farms || !Array.isArray(farms) || farms.length === 0) {
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
                // Comprehensive farm data validation
                if (!farm || typeof farm !== 'object') {
                    console.warn(`Invalid farm data at index ${index}:`, farm);
                    return null;
                }

                // Safe ID extraction with multiple fallback options
                const farmId = farm?.Id || farm?.id || null;
                
                // Safe name extraction with multiple fallback options
                const farmName = farm?.Name || farm?.name || farm?.farmName || 'Unnamed Farm';
                
                // Safe location extraction
                const farmLocation = farm?.location || farm?.Location || 'Unknown Location';
                
                // Safe size extraction with validation
                const farmSize = farm?.size || farm?.Size || 0;
                const farmSizeUnit = farm?.size_unit || farm?.sizeUnit || farm?.Size_Unit || 'acres';
                
                // Safe date extraction
                const farmCreatedAt = farm?.created_at || farm?.createdAt || farm?.CreatedOn || new Date().toISOString();

                // Skip rendering if critical data is missing
                if (!farmId) {
                    console.warn(`Farm at index ${index} missing required ID field:`, farm);
                    return null;
                }

                // Create safe farm object with all required properties
                const safeFarm = {
                    id: farmId,
                    Id: farmId,
                    name: farmName,
                    Name: farmName,
                    location: farmLocation,
                    Location: farmLocation,
                    size: farmSize,
                    Size: farmSize,
                    sizeUnit: farmSizeUnit,
                    size_unit: farmSizeUnit,
                    createdAt: farmCreatedAt,
                    created_at: farmCreatedAt,
                    CreatedOn: farmCreatedAt,
                    // Include any other original properties
                    ...farm
                };

                return (
                    <FarmCard
                        key={`farm-${farmId}-${index}`}
                        farm={safeFarm}
                        cropCount={getCropCountForFarm(farmId)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        index={index}
                    />
                );
            }).filter(Boolean)} {/* Filter out null entries */}
        </div>
    );
};

export default FarmsGrid;