import React, { useState, useEffect } from 'react';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';

const TaskFormModal = ({ isOpen, onClose, editingTask, farms, crops, taskTypes, priorities, onSubmit }) => {
    const statusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'on_hold', label: 'On Hold' }
    ];

    const [formData, setFormData] = useState({
        farmId: '',
        cropId: '',
        type: '',
        description: '',
status: 'pending',
        dueDate: '',
        priority: 'medium'
    });

    useEffect(() => {
        if (editingTask) {
            setFormData({
                farmId: editingTask.farmId,
                cropId: editingTask.cropId || '',
                type: editingTask.type,
                description: editingTask.description,
status: editingTask.status || 'pending',
                dueDate: editingTask.dueDate,
                priority: editingTask.priority
            });
        } else {
            setFormData({
                farmId: '',
                cropId: '',
                type: '',
                description: '',
                status: 'pending',
                dueDate: '',
                priority: 'medium'
            });
        }
    }, [editingTask]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
};

    const filteredCrops = crops?.filter(crop => crop?.farmId === formData.farmId) || [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editingTask ? 'Edit Task' : 'Add New Task'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                    label="Farm"
                    id="farmId"
                    name="farmId"
type="select"
                    value={formData.farmId}
                    onChange={handleChange}
                    options={farms?.map(farm => ({ value: farm.id, label: farm.name })) || []}
                    placeholder="Select a farm"
                    required
                />

                <FormField
                    label="Related Crop (Optional)"
                    id="cropId"
                    name="cropId"
                    type="select"
                    value={formData.cropId}
                    onChange={handleChange}
                    options={filteredCrops.map(crop => ({ value: crop.id, label: crop.name }))}
                    placeholder="No specific crop"
                    disabled={!formData.farmId || filteredCrops.length === 0}
                />

                <FormField
                    label="Task Type"
                    id="type"
name="type"
                    type="select"
                    value={formData.type}
                    onChange={handleChange}
                    options={taskTypes?.map(type => ({ value: type, label: type })) || []}
                    placeholder="Select task type"
                    required
                />
                <FormField
                    label="Description"
                    id="description"
                    name="description"
                    type="textarea"
                    value={formData.description}
                    onChange={handleChange}
rows="3"
                    placeholder="Add any additional details..."
                />

                <FormField
                    label="Status"
                    id="status"
                    name="status"
                    type="select"
                    value={formData.status}
                    onChange={handleChange}
                    options={statusOptions}
                    required
/>

                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        label="Due Date"
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleChange}
                        required
                    />
                    <FormField
                        label="Priority"
                        id="priority"
                        name="priority"
type="select"
                        value={formData.priority}
                        onChange={handleChange}
                        options={priorities?.map(p => ({ value: p.value, label: p.label })) || []}
                    />
                </div>
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
                        {editingTask ? 'Update' : 'Create'} Task
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TaskFormModal;