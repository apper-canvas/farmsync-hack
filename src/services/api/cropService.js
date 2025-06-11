import { toast } from 'react-toastify';

const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

class CropService {
  async getAll() {
    try {
      const params = {
        fields: ["Name", "Tags", "Owner", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "variety", "planting_date", "expected_harvest_date", "growth_stage", "field", "farm_id"]
      };
      
      const response = await apperClient.fetchRecords('crop', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching crops:', error);
      toast.error('Failed to fetch crops');
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ["Name", "Tags", "Owner", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "variety", "planting_date", "expected_harvest_date", "growth_stage", "field", "farm_id"]
      };
      
      const response = await apperClient.getRecordById('crop', id, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching crop with ID ${id}:`, error);
      toast.error('Failed to fetch crop');
      return null;
    }
  }

async create(cropData) {
    try {
      // Validate required fields before API call
      if (!cropData) {
        throw new Error('Crop data is required');
      }

      const name = cropData.name || cropData.Name;
      const farmId = cropData.farmId || cropData.farm_id;
      const plantingDate = cropData.plantingDate || cropData.planting_date;
      const expectedHarvestDate = cropData.expectedHarvestDate || cropData.expected_harvest_date;

      // Validate required fields
      if (!name?.trim()) {
        throw new Error('Crop name is required');
      }
      if (!farmId) {
        throw new Error('Farm selection is required');
      }
      if (!plantingDate) {
        throw new Error('Planting date is required');
      }
      if (!expectedHarvestDate) {
        throw new Error('Expected harvest date is required');
      }

      // Validate date formats (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(plantingDate)) {
        throw new Error('Planting date must be in YYYY-MM-DD format');
      }
      if (!dateRegex.test(expectedHarvestDate)) {
        throw new Error('Expected harvest date must be in YYYY-MM-DD format');
      }

      // Only include Updateable fields with proper validation
      const params = {
        records: [{
          Name: name.trim(),
          Tags: (cropData.tags || cropData.Tags || "").toString(),
          Owner: cropData.owner || cropData.Owner || "",
          variety: (cropData.variety || "").toString(),
          planting_date: plantingDate,
          expected_harvest_date: expectedHarvestDate,
          growth_stage: (cropData.growthStage || cropData.growth_stage || "planted").toString(),
          field: (cropData.field || "").toString(),
          farm_id: parseInt(farmId) // Lookup field as integer
        }]
      };

      // Validate farm_id is a valid number
      if (isNaN(params.records[0].farm_id)) {
        throw new Error('Invalid farm selection');
      }
      
      const response = await apperClient.createRecord('crop', params);
      
      if (!response.success) {
        console.error('Create crop API response:', response.message);
        toast.error(response.message || 'Failed to create crop');
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:`, JSON.stringify(failedRecords, null, 2));
          
          failedRecords.forEach(record => {
            if (record.errors?.length > 0) {
              record.errors.forEach(error => {
                toast.error(`${error.fieldLabel || 'Field'}: ${error.message || 'Invalid value'}`);
              });
            } else if (record.message) {
              toast.error(record.message);
            } else {
              toast.error('Failed to create crop - unknown error');
            }
          });
        }
        
        if (successfulRecords.length > 0) {
          toast.success('Crop created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating crop:', error);
      toast.error(error.message || 'Failed to create crop');
      return null;
    }
  }

async update(id, updateData) {
    try {
      // Validate input parameters
      if (!id) {
        throw new Error('Crop ID is required for update');
      }
      if (!updateData) {
        throw new Error('Update data is required');
      }

      const name = updateData.name || updateData.Name;
      const farmId = updateData.farmId || updateData.farm_id;
      const plantingDate = updateData.plantingDate || updateData.planting_date;
      const expectedHarvestDate = updateData.expectedHarvestDate || updateData.expected_harvest_date;

      // Validate required fields
      if (!name?.trim()) {
        throw new Error('Crop name is required');
      }
      if (!farmId) {
        throw new Error('Farm selection is required');
      }
      if (!plantingDate) {
        throw new Error('Planting date is required');
      }
      if (!expectedHarvestDate) {
        throw new Error('Expected harvest date is required');
      }

      // Validate date formats (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(plantingDate)) {
        throw new Error('Planting date must be in YYYY-MM-DD format');
      }
      if (!dateRegex.test(expectedHarvestDate)) {
        throw new Error('Expected harvest date must be in YYYY-MM-DD format');
      }

      // Only include Updateable fields with proper validation
      const params = {
        records: [{
          Id: parseInt(id),
          Name: name.trim(),
          Tags: (updateData.tags || updateData.Tags || "").toString(),
          Owner: updateData.owner || updateData.Owner || "",
          variety: (updateData.variety || "").toString(),
          planting_date: plantingDate,
          expected_harvest_date: expectedHarvestDate,
          growth_stage: (updateData.growthStage || updateData.growth_stage || "planted").toString(),
          field: (updateData.field || "").toString(),
          farm_id: parseInt(farmId) // Lookup field as integer
        }]
      };

      // Validate IDs are valid numbers
      if (isNaN(params.records[0].Id)) {
        throw new Error('Invalid crop ID');
      }
      if (isNaN(params.records[0].farm_id)) {
        throw new Error('Invalid farm selection');
      }
      
      const response = await apperClient.updateRecord('crop', params);
      
      if (!response.success) {
        console.error('Update crop API response:', response.message);
        toast.error(response.message || 'Failed to update crop');
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:`, JSON.stringify(failedUpdates, null, 2));
          
          failedUpdates.forEach(record => {
            if (record.errors?.length > 0) {
              record.errors.forEach(error => {
                toast.error(`${error.fieldLabel || 'Field'}: ${error.message || 'Invalid value'}`);
              });
            } else if (record.message) {
              toast.error(record.message);
            } else {
              toast.error('Failed to update crop - unknown error');
            }
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Crop updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating crop:', error);
      toast.error(error.message || 'Failed to update crop');
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('crop', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }
      
      if (response.results) {
const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:`, JSON.stringify(failedDeletions, null, 2));
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulDeletions.length > 0) {
          toast.success('Crop deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting crop:', error);
      toast.error('Failed to delete crop');
      return false;
    }
  }
}

export default new CropService();