import React, { useState, useEffect } from 'react';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';

const FarmFormModal = ({ isOpen, onClose, editingFarm, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        size: '',
        sizeUnit: 'acres',
        location: ''
    });

    useEffect(() => {
        if (editingFarm) {
            setFormData({
                name: editingFarm.name,
                size: editingFarm.size.toString(),
                sizeUnit: editingFarm.sizeUnit,
                location: editingFarm.location
            });
        } else {
            setFormData({
                name: '',
                size: '',
                sizeUnit: 'acres',
                location: ''
            });
        }
    }, [editingFarm]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingFarm ? 'Edit Farm' : 'Add New Farm'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                    label="Farm Name"
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter farm name"
                    required
                />

                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        label="Size"
                        id="size"
                        name="size"
                        type="number"
                        value={formData.size}
                        onChange={handleChange}
                        placeholder="0.0"
                        required
                        min="0"
                        step="0.1"
                    />
                    <FormField
                        label="Unit"
                        id="sizeUnit"
                        name="sizeUnit"
                        type="select"
                        value={formData.sizeUnit}
                        onChange={handleChange}
                        options={[
                            { value: 'acres', label: 'Acres' },
                            { value: 'hectares', label: 'Hectares' },
                            { value: 'sq ft', label: 'Square Feet' }
                        ]}
                    />
                </div>

                <FormField
                    label="Location"
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter farm location"
                    required
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
                        {editingFarm ? 'Update' : 'Create'} Farm
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default FarmFormModal;