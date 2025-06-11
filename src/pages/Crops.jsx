import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import { cropService, farmService } from '../services'
import { format, differenceInDays } from 'date-fns'

export default function Crops() {
  const [crops, setCrops] = useState([])
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCrop, setEditingCrop] = useState(null)
  const [filter, setFilter] = useState('all')
  const [formData, setFormData] = useState({
    farmId: '',
    name: '',
    variety: '',
    plantingDate: '',
    expectedHarvestDate: '',
    growthStage: 'planted',
    field: ''
  })

  const growthStages = [
    { value: 'planted', label: 'Planted', color: 'bg-gray-100 text-gray-800' },
    { value: 'germinated', label: 'Germinated', color: 'bg-green-100 text-green-800' },
    { value: 'growing', label: 'Growing', color: 'bg-blue-100 text-blue-800' },
    { value: 'flowering', label: 'Flowering', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'fruiting', label: 'Fruiting', color: 'bg-orange-100 text-orange-800' },
    { value: 'ready_to_harvest', label: 'Ready to Harvest', color: 'bg-purple-100 text-purple-800' },
    { value: 'harvested', label: 'Harvested', color: 'bg-green-100 text-green-800' }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [cropData, farmData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ])
      setCrops(cropData)
      setFarms(farmData)
    } catch (err) {
      setError(err.message || 'Failed to load crops')
      toast.error('Failed to load crops')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.farmId || !formData.name.trim() || !formData.plantingDate || !formData.expectedHarvestDate) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      if (editingCrop) {
        const updatedCrop = await cropService.update(editingCrop.id, formData)
        setCrops(crops.map(crop => crop.id === editingCrop.id ? updatedCrop : crop))
        toast.success('Crop updated successfully!')
      } else {
        const newCrop = await cropService.create(formData)
        setCrops([...crops, newCrop])
        toast.success('Crop added successfully!')
      }

      resetForm()
    } catch (err) {
      toast.error('Failed to save crop')
    }
  }

  const handleEdit = (crop) => {
    setEditingCrop(crop)
    setFormData({
      farmId: crop.farmId,
      name: crop.name,
      variety: crop.variety,
      plantingDate: crop.plantingDate,
      expectedHarvestDate: crop.expectedHarvestDate,
      growthStage: crop.growthStage,
      field: crop.field
    })
    setShowAddForm(true)
  }

  const handleDelete = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) {
      return
    }

    try {
      await cropService.delete(cropId)
      setCrops(crops.filter(crop => crop.id !== cropId))
      toast.success('Crop deleted successfully!')
    } catch (err) {
      toast.error('Failed to delete crop')
    }
  }

  const resetForm = () => {
    setFormData({
      farmId: '',
      name: '',
      variety: '',
      plantingDate: '',
      expectedHarvestDate: '',
      growthStage: 'planted',
      field: ''
    })
    setShowAddForm(false)
    setEditingCrop(null)
  }

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.id === farmId)
    return farm ? farm.name : 'Unknown Farm'
  }

  const getStageInfo = (stage) => {
    return growthStages.find(s => s.value === stage) || growthStages[0]
  }

  const getDaysToHarvest = (harvestDate) => {
    const days = differenceInDays(new Date(harvestDate), new Date())
    if (days < 0) return 'Overdue'
    if (days === 0) return 'Today'
    return `${days} days`
  }

  const filteredCrops = crops.filter(crop => {
    if (filter === 'all') return true
    if (filter === 'ready') return crop.growthStage === 'ready_to_harvest'
    if (filter === 'growing') return ['planted', 'germinated', 'growing', 'flowering', 'fruiting'].includes(crop.growthStage)
    if (filter === 'harvested') return crop.growthStage === 'harvested'
    return true
  })

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
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="AlertCircle" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load crops</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Crops</h1>
          <p className="text-gray-600 mt-1">Track your crop planting, growth, and harvest schedules</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <ApperIcon name="Plus" className="h-4 w-4" />
          <span>Add Crop</span>
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'All Crops' },
          { key: 'growing', label: 'Growing' },
          { key: 'ready', label: 'Ready to Harvest' },
          { key: 'harvested', label: 'Harvested' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={resetForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-heading font-semibold text-gray-900">
                    {editingCrop ? 'Edit Crop' : 'Add New Crop'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ApperIcon name="X" className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Farm *
                    </label>
                    <select
                      value={formData.farmId}
                      onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select a farm</option>
                      {farms.map(farm => (
                        <option key={farm.id} value={farm.id}>{farm.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Crop Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., Tomatoes"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Variety
                      </label>
                      <input
                        type="text"
                        value={formData.variety}
                        onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="e.g., Cherry"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field/Location
                    </label>
                    <input
                      type="text"
                      value={formData.field}
                      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., North Field, Greenhouse A"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Planting Date *
                      </label>
                      <input
                        type="date"
                        value={formData.plantingDate}
                        onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Harvest *
                      </label>
                      <input
                        type="date"
                        value={formData.expectedHarvestDate}
                        onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Growth Stage
                    </label>
                    <select
                      value={formData.growthStage}
                      onChange={(e) => setFormData({ ...formData, growthStage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {growthStages.map(stage => (
                        <option key={stage.value} value={stage.value}>{stage.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {editingCrop ? 'Update' : 'Add'} Crop
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Crops Table */}
      {filteredCrops.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <ApperIcon name="Wheat" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? 'No crops planted yet' : `No ${filter} crops found`}
          </h3>
          <p className="text-gray-500 mb-4">
            {filter === 'all' 
              ? 'Start by adding your first crop to track its growth'
              : 'Try adjusting your filter or add more crops'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Add Your First Crop
          </motion.button>
        </motion.div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farm & Field
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Planted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Harvest
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCrops.map((crop, index) => {
                  const stageInfo = getStageInfo(crop.growthStage)
                  return (
                    <motion.tr
                      key={crop.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {crop.name}
                          </div>
                          {crop.variety && (
                            <div className="text-sm text-gray-500">
                              {crop.variety}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getFarmName(crop.farmId)}
                        </div>
                        {crop.field && (
                          <div className="text-sm text-gray-500">
                            {crop.field}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stageInfo.color}`}>
                          {stageInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(crop.plantingDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(crop.expectedHarvestDate), 'MMM d, yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getDaysToHarvest(crop.expectedHarvestDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(crop)}
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <ApperIcon name="Edit" className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(crop.id)}
                            className="text-gray-400 hover:text-error transition-colors"
                          >
                            <ApperIcon name="Trash2" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}