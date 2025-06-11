import React, { useState, useEffect } from 'react';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';

const categories = [
    { value: 'seeds', label: 'Seeds & Plants' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'fertilizer', label: 'Fertilizer' },
    { value: 'labor', label: 'Labor' },
    { value: 'fuel', label: 'Fuel' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'other', label: 'Other' }
];

const ExpenseFormModal = ({ isOpen, onClose, editingExpense, farms, onSubmit }) => {
    // Validate and sanitize farms prop with comprehensive error handling
    const validatedFarms = React.useMemo(() => {
        if (!farms) {
            console.warn('ExpenseFormModal: farms prop is null or undefined');
            return [];
        }
        
        if (!Array.isArray(farms)) {
            console.error('ExpenseFormModal: farms prop is not an array:', typeof farms);
            return [];
        }
        
        // Filter out invalid farm entries and ensure required properties exist
        return farms.filter(farm => {
            if (!farm) {
                console.warn('ExpenseFormModal: Found null/undefined farm in farms array');
                return false;
            }
            
            // Check for required ID field (handle both 'id' and 'Id' cases)
            const farmId = farm.id || farm.Id;
            if (!farmId) {
                console.warn('ExpenseFormModal: Farm missing required ID field:', farm);
                return false;
            }
            
            // Check for required name field (handle multiple name variations)
            const farmName = farm.name || farm.Name || farm.farmName;
            if (!farmName || typeof farmName !== 'string' || farmName.trim() === '') {
                console.warn('ExpenseFormModal: Farm missing valid name field:', farm);
                return false;
            }
            
            return true;
        }).map(farm => ({
            // Normalize farm data structure for consistent access
            id: farm.id || farm.Id,
            name: (farm.name || farm.Name || farm.farmName || '').trim(),
            // Preserve original farm object for additional data if needed
            originalData: farm
        }));
    }, [farms]);

    const [formData, setFormData] = useState({
        farmId: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    const [farmDataError, setFarmDataError] = useState(null);
useEffect(() => {
        // Validate farm data availability and set error state
        if (!farms) {
            setFarmDataError('Farm data is not available. Please refresh the page and try again.');
        } else if (!Array.isArray(farms)) {
            setFarmDataError('Invalid farm data format. Please contact support.');
        } else if (farms.length === 0) {
            setFarmDataError('No farms available. Please create a farm first before adding expenses.');
        } else if (validatedFarms.length === 0) {
            setFarmDataError('Farm data is corrupted. Please refresh the page and try again.');
        } else {
            setFarmDataError(null);
        }

        if (editingExpense) {
            // Enhanced validation for editing expense data
            const editingFarmId = editingExpense.farmId || editingExpense.farm_id || '';
            const editingAmount = editingExpense.amount;
            
            // Validate amount field and convert to string safely
            let amountString = '';
            if (editingAmount !== null && editingAmount !== undefined) {
                if (typeof editingAmount === 'number') {
                    amountString = editingAmount.toString();
                } else if (typeof editingAmount === 'string') {
                    amountString = editingAmount;
                } else {
                    console.warn('ExpenseFormModal: Invalid amount format in editingExpense:', editingAmount);
                }
            }
            
            setFormData({
                farmId: editingFarmId,
                category: editingExpense.category || '',
                amount: amountString,
                date: editingExpense.date || new Date().toISOString().split('T')[0],
                description: editingExpense.description || ''
            });
        } else {
            setFormData({
                farmId: '',
                category: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                description: ''
            });
        }
    }, [editingExpense, farms, validatedFarms.length]);

const handleChange = (e) => {
        // Enhanced validation for form field changes
        if (!e || !e.target) {
            console.error('ExpenseFormModal: Invalid event object in handleChange');
            return;
        }
        
        const { name, value } = e.target;
        
        // Additional validation for farmId field
        if (name === 'farmId' && value) {
            const selectedFarm = validatedFarms.find(farm => farm.id.toString() === value.toString());
            if (!selectedFarm) {
                console.warn('ExpenseFormModal: Selected farm ID not found in validated farms list:', value);
            }
        }
        
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate farm selection before submission
        if (!formData.farmId) {
            console.error('ExpenseFormModal: Farm selection is required');
            return;
        }
        
        if (farmDataError) {
            console.error('ExpenseFormModal: Cannot submit form due to farm data error:', farmDataError);
            return;
        }
        
        if (validatedFarms.length === 0) {
            console.error('ExpenseFormModal: No valid farms available for submission');
            return;
        }
        
        onSubmit(formData);
    };
return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingExpense ? 'Edit Expense' : 'Add New Expense'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Enhanced Farm field with comprehensive error handling */}
                <div>
                    <FormField
                        label="Farm"
                        id="farmId"
                        name="farmId"
                        type="select"
                        value={formData.farmId}
                        onChange={handleChange}
                        options={validatedFarms.length > 0 ? 
                            validatedFarms.map(farm => ({ 
                                value: farm.id, 
                                label: farm.name 
                            })) : 
                            []
                        }
                        placeholder={
                            farmDataError ? 
                            "Farm data unavailable" : 
                            validatedFarms.length === 0 ? 
                            "No farms available" : 
                            "Select a farm"
                        }
                        required
                        disabled={farmDataError || validatedFarms.length === 0}
                    />
                    {farmDataError && (
                        <p className="mt-1 text-sm text-error bg-error/10 p-2 rounded border border-error/20">
                            ⚠️ {farmDataError}
                        </p>
                    )}
                    {!farmDataError && validatedFarms.length === 0 && farms && farms.length > 0 && (
                        <p className="mt-1 text-sm text-warning bg-warning/10 p-2 rounded border border-warning/20">
                            ⚠️ Some farm data could not be loaded properly. Please refresh the page.
                        </p>
                    )}
                </div>

                <FormField
                    label="Category"
                    id="category"
                    name="category"
                    type="select"
                    value={formData.category}
                    onChange={handleChange}
                    options={categories}
                    placeholder="Select category"
                    required
                />

                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        label="Amount"
                        id="amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                        prefixText="$"
                    />
                    <FormField
                        label="Date"
                        id="date"
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>

                <FormField
                    label="Description"
                    id="description"
                    name="description"
                    type="textarea"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="What was this expense for?"
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
                        {editingExpense ? 'Update' : 'Add'} Expense
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ExpenseFormModal;