import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import PageHeader from '@/components/organisms/PageHeader';
import FarmFormModal from '@/components/organisms/FarmFormModal';
import FarmsGrid from '@/components/organisms/FarmsGrid';
import { farmService, cropService } from '@/services';

export default function FarmsPage() {
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]); // Needed for crop count on farm cards
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [farmData, cropData] = await Promise.all([
        farmService.getAll(),
        cropService.getAll()
      ]);
      setFarms(farmData);
      setCrops(cropData);
    } catch (err) {
      setError(err.message || 'Failed to load farms');
      toast.error('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    if (!formData.name.trim() || !formData.size || !formData.location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const farmData = {
        ...formData,
        size: parseFloat(formData.size)
      };

      if (editingFarm) {
        const updatedFarm = await farmService.update(editingFarm.id, farmData);
        setFarms(farms.map(farm => farm.id === editingFarm.id ? updatedFarm : farm));
        toast.success('Farm updated successfully!');
      } else {
        const newFarm = await farmService.create(farmData);
        setFarms([...farms, newFarm]);
        toast.success('Farm created successfully!');
      }
      resetForm();
    }
    catch (err) {
      toast.error('Failed to save farm');
    }
  };

  const handleEdit = (farm) => {
    setEditingFarm(farm);
    setShowAddForm(true);
  };

  const handleDelete = async (farmId) => {
    if (!window.confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
      return;
    }

    try {
      await farmService.delete(farmId);
      setFarms(farms.filter(farm => farm.id !== farmId));
      toast.success('Farm deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete farm');
    }
  };

  const resetForm = () => {
    setEditingFarm(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load farms</h3>
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
        title="Farms" 
        description="Manage your farm properties and locations" 
        buttonText="Add Farm" 
        buttonIcon="Plus" 
        onButtonClick={() => setShowAddForm(true)} 
      />

      <FarmFormModal 
        isOpen={showAddForm} 
        onClose={resetForm} 
        editingFarm={editingFarm} 
        onSubmit={handleSubmit}
      />

      <FarmsGrid 
        farms={farms} 
        crops={crops} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        onAddFarm={() => setShowAddForm(true)} 
      />
    </div>
  );
}