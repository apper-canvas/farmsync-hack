import React, { useState, useEffect } from 'react';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';

const growthStages = [
    { value: 'planted', label: 'Planted' },
    { value: 'germinated', label: 'Germinated' },
    { value: 'growing', label: 'Growing' },
    { value: 'flowering', label: 'Flowering' },
    { value: 'fruiting', label: 'Fruiting' },
    { value: 'ready_to_harvest', label: 'Ready to Harvest' },
    { value: 'harvested', label: 'Harvested' }
];

const CropFormModal = ({ isOpen, onClose, editingCrop, farms, onSubmit }) => {
    const [formData, setFormData] = useState({
        id: '',
        farmId: '',
        name: '',
        variety: '',
        plantingDate: '',
        expectedHarvestDate: '',
        growthStage: 'planted',
        field: ''
    });

    useEffect(() => {
        if (editingCrop) {
            // Transform database response data to form field names
            setFormData({
                id: editingCrop.id || editingCrop.Id || '',
                farmId: editingCrop.farm_id || editingCrop.farmId || '',
                name: editingCrop.Name || editingCrop.name || '',
                variety: editingCrop.variety || '',
                plantingDate: editingCrop.planting_date || editingCrop.plantingDate || '',
                expectedHarvestDate: editingCrop.expected_harvest_date || editingCrop.expectedHarvestDate || '',
                growthStage: editingCrop.growth_stage || editingCrop.growthStage || 'planted',
                field: editingCrop.field || ''
            });
        } else {
            // Reset form for new crop
            setFormData({
                id: '',
                farmId: '',
                name: '',
                variety: '',
                plantingDate: '',
                expectedHarvestDate: '',
                growthStage: 'planted',
                field: ''
            });
        }
    }, [editingCrop]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingCrop && formData.id) {
            // For updates, pass ID separately from the data
            const { id, ...updateData } = formData;
            onSubmit(id, updateData);
        } else {
            // For creates, pass all form data
            onSubmit(formData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingCrop ? 'Edit Crop' : 'Add New Crop'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                    label="Farm"
                    id="farmId"
                    name="farmId"
                    type="select"
value={formData.farmId ?? ''}
                    onChange={handleChange}
                    options={farms?.map((farm, index) => ({ 
                        value: String(farm?.id ?? farm?.Id ?? index), 
                        label: farm?.name ?? farm?.Name ?? `Farm ${index + 1}`,
                        id: farm?.id ?? farm?.Id ?? index
                    })) || []}
                    placeholder="Select a farm"
                    required
                />

                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        label="Crop Name"
                        id="name"
                        name="name"
                        type="text"
value={formData.name ?? ''}
                        onChange={handleChange}
                        placeholder="e.g., Tomatoes"
                        required
                    />
                    <FormField
                        label="Variety"
                        id="variety"
                        name="variety"
                        type="text"
                        value={formData.variety ?? ''}
                        onChange={handleChange}
                        placeholder="e.g., Cherry"
                    />
                </div>

                <FormField
                    label="Field/Location"
                    id="field"
                    name="field"
                    type="text"
value={formData.field ?? ''}
                    onChange={handleChange}
                    placeholder="e.g., North Field, Greenhouse A"
                />

                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        label="Planting Date"
                        id="plantingDate"
                        name="plantingDate"
                        type="date"
value={formData.plantingDate ?? ''}
                        onChange={handleChange}
                        required
                    />
                    <FormField
                        label="Expected Harvest"
                        id="expectedHarvestDate"
                        name="expectedHarvestDate"
                        type="date"
                        value={formData.expectedHarvestDate ?? ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                <FormField
                    label="Growth Stage"
                    id="growthStage"
                    name="growthStage"
                    type="select"
value={formData.growthStage ?? 'planted'}
                    onChange={handleChange}
                    options={growthStages}
                />

                <div className="flex space-x-3 pt-4">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                    >
                        {editingCrop ? 'Update' : 'Add'} Crop
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CropFormModal;