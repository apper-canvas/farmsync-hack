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
    const [formData, setFormData] = useState({
        farmId: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
    });

    useEffect(() => {
        if (editingExpense) {
            setFormData({
                farmId: editingExpense.farmId,
                category: editingExpense.category,
                amount: editingExpense.amount.toString(),
                date: editingExpense.date,
                description: editingExpense.description
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
    }, [editingExpense]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingExpense ? 'Edit Expense' : 'Add New Expense'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                    label="Farm"
                    id="farmId"
                    name="farmId"
                    type="select"
                    value={formData.farmId}
                    onChange={handleChange}
                    options={farms.map(farm => ({ value: farm.id, label: farm.name }))}
                    placeholder="Select a farm"
                    required
                />

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