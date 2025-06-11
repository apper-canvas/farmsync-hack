import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '@/components/molecules/Modal';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Select from '@/components/atoms/Select';
import TextArea from '@/components/atoms/TextArea';
import ApperIcon from '@/components/ApperIcon';

const incomeSourceOptions = [
  { value: 'crop_sales', label: 'Crop Sales' },
  { value: 'direct_sales', label: 'Direct Sales' },
  { value: 'contracts', label: 'Contract Sales' },
  { value: 'subsidies', label: 'Government Subsidies' },
  { value: 'insurance', label: 'Insurance Payouts' },
  { value: 'grants', label: 'Grants' },
  { value: 'other', label: 'Other Income' }
];

export default function IncomeFormModal({ isOpen, onClose, editingIncome, crops, farms, onSubmit }) {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: '',
    source: 'crop_sales',
    cropId: '',
    farmId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingIncome) {
      setFormData({
        description: editingIncome.description || '',
        amount: editingIncome.amount?.toString() || '',
        date: editingIncome.date || '',
        source: editingIncome.source || 'crop_sales',
        cropId: editingIncome.cropId?.toString() || '',
        farmId: editingIncome.farmId?.toString() || '',
        notes: editingIncome.notes || ''
      });
    } else {
      resetForm();
    }
  }, [editingIncome, isOpen]);

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0], // Today's date
      source: 'crop_sales',
      cropId: '',
      farmId: '',
      notes: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Amount must be a positive number';
      }
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const date = new Date(formData.date);
      if (isNaN(date.getTime())) {
        newErrors.date = 'Please provide a valid date';
      }
    }

    if (!formData.source) {
      newErrors.source = 'Income source is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
        cropId: formData.cropId ? parseInt(formData.cropId) : null,
        farmId: formData.farmId ? parseInt(formData.farmId) : null
      };

      await onSubmit(submitData);
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const cropOptions = [
    { value: '', label: 'Select a crop (optional)' },
    ...(crops || []).map(crop => ({
      value: (crop.id || crop.Id).toString(),
      label: crop.name || crop.Name || 'Unnamed Crop'
    }))
  ];

  const farmOptions = [
    { value: '', label: 'Select a farm (optional)' },
    ...(farms || []).map(farm => ({
      value: (farm.id || farm.Id).toString(),
      label: farm.name || farm.Name || 'Unnamed Farm'
    }))
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal isOpen={isOpen} onClose={onClose} title={editingIncome ? 'Edit Income Record' : 'Add Income Record'}>
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Description Field */}
            <FormField
              label="Description"
              required
              error={errors.description}
              htmlFor="description"
            >
              <Input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="e.g., Corn harvest sale, Wheat contract payment"
                className={`w-full ${errors.description ? 'border-red-500' : ''}`}
              />
            </FormField>

            {/* Amount and Date Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Amount ($)"
                required
                error={errors.amount}
                htmlFor="amount"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    placeholder="0.00"
                    className={`w-full pl-8 ${errors.amount ? 'border-red-500' : ''}`}
                  />
                </div>
              </FormField>

              <FormField
                label="Date"
                required
                error={errors.date}
                htmlFor="date"
              >
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full ${errors.date ? 'border-red-500' : ''}`}
                />
              </FormField>
            </div>

            {/* Income Source */}
            <FormField
              label="Income Source"
              required
              error={errors.source}
              htmlFor="source"
            >
              <Select
                id="source"
                value={formData.source}
                onChange={(value) => handleInputChange('source', value)}
                options={incomeSourceOptions}
                className={`w-full ${errors.source ? 'border-red-500' : ''}`}
              />
            </FormField>

            {/* Crop and Farm Selection Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Associated Crop"
                htmlFor="cropId"
                helpText="Optional: Link this income to a specific crop"
              >
                <Select
                  id="cropId"
                  value={formData.cropId}
                  onChange={(value) => handleInputChange('cropId', value)}
                  options={cropOptions}
                  className="w-full"
                />
              </FormField>

              <FormField
                label="Associated Farm"
                htmlFor="farmId"
                helpText="Optional: Link this income to a specific farm"
              >
                <Select
                  id="farmId"
                  value={formData.farmId}
                  onChange={(value) => handleInputChange('farmId', value)}
                  options={farmOptions}
                  className="w-full"
                />
              </FormField>
            </div>

            {/* Notes Field */}
            <FormField
              label="Notes"
              htmlFor="notes"
              helpText="Optional: Additional details about this income"
            >
              <TextArea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes or details..."
                rows={3}
                className="w-full"
              />
            </FormField>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading && (
                  <ApperIcon name="Loader2" className="h-4 w-4 animate-spin" />
                )}
                <span>{editingIncome ? 'Update Income' : 'Add Income'}</span>
              </Button>
            </div>
          </motion.form>
        </Modal>
      )}
    </AnimatePresence>
  );
}