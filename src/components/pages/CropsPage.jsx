import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { cropService, farmService } from '@/services';
import PageHeader from '@/components/organisms/PageHeader';
import FilterButton from '@/components/molecules/FilterButton';
import CropFormModal from '@/components/organisms/CropFormModal';
import CropsTable from '@/components/organisms/CropsTable';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

export default function CropsPage() {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cropData, farmData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ]);
      setCrops(cropData);
      setFarms(farmData);
    } catch (err) {
      setError(err.message || 'Failed to load crops');
      toast.error('Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    if (!formData.farmId || !formData.name.trim() || !formData.plantingDate || !formData.expectedHarvestDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingCrop) {
        const updatedCrop = await cropService.update(editingCrop.id, formData);
        setCrops(crops.map(crop => crop.id === editingCrop.id ? updatedCrop : crop));
        toast.success('Crop updated successfully!');
      } else {
        const newCrop = await cropService.create(formData);
        setCrops([...crops, newCrop]);
        toast.success('Crop added successfully!');
      }
      resetForm();
    } catch (err) {
      toast.error('Failed to save crop');
    }
  };

  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setShowAddForm(true);
  };

  const handleDelete = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) {
      return;
    }

    try {
      await cropService.delete(cropId);
      setCrops(crops.filter(crop => crop.id !== cropId));
      toast.success('Crop deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete crop');
    }
  };

  const resetForm = () => {
    setEditingCrop(null);
    setShowAddForm(false);
  };

  const filteredCrops = crops.filter(crop => {
    if (filter === 'all') return true;
    if (filter === 'ready') return crop.growthStage === 'ready_to_harvest';
    if (filter === 'growing') return ['planted', 'germinated', 'growing', 'flowering', 'fruiting'].includes(crop.growthStage);
    if (filter === 'harvested') return crop.growthStage === 'harvested';
    return true;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="flex space-x-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="grid grid-cols-6 gap-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load crops</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      <PageHeader 
        title="Crops" 
        description="Track your crop planting, growth, and harvest schedules" 
        buttonText="Add Crop" 
        buttonIcon="Plus" 
        onButtonClick={() => setShowAddForm(true)} 
      />

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Crops' },
          { key: 'growing', label: 'Growing' },
          { key: 'ready', label: 'Ready to Harvest' },
          { key: 'harvested', label: 'Harvested' }
        ].map(({ key, label }) => (
          <FilterButton
            key={key}
            label={label}
            isActive={filter === key}
            onClick={() => setFilter(key)}
          />
        ))}
      </div>

      <CropFormModal 
        isOpen={showAddForm} 
        onClose={resetForm} 
        editingCrop={editingCrop} 
        farms={farms} 
        onSubmit={handleSubmit}
      />

      <CropsTable 
        crops={filteredCrops} 
        farms={farms} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        filter={filter}
        onAddCrop={() => setShowAddForm(true)}
      />
    </div>
  );
}