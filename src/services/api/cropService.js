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
      // Only include Updateable fields
      const params = {
        records: [{
          Name: cropData.name || cropData.Name,
          Tags: cropData.tags || cropData.Tags || "",
          Owner: cropData.owner || cropData.Owner,
          variety: cropData.variety,
          planting_date: cropData.plantingDate || cropData.planting_date,
          expected_harvest_date: cropData.expectedHarvestDate || cropData.expected_harvest_date,
          growth_stage: cropData.growthStage || cropData.growth_stage,
          field: cropData.field,
          farm_id: parseInt(cropData.farmId || cropData.farm_id) // Lookup field as integer
        }]
      };
      
      const response = await apperClient.createRecord('crop', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${failedRecords}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
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
      toast.error('Failed to create crop');
      return null;
    }
  }

  async update(id, updateData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: updateData.name || updateData.Name,
          Tags: updateData.tags || updateData.Tags || "",
          Owner: updateData.owner || updateData.Owner,
          variety: updateData.variety,
          planting_date: updateData.plantingDate || updateData.planting_date,
          expected_harvest_date: updateData.expectedHarvestDate || updateData.expected_harvest_date,
          growth_stage: updateData.growthStage || updateData.growth_stage,
          field: updateData.field,
          farm_id: parseInt(updateData.farmId || updateData.farm_id) // Lookup field as integer
        }]
      };
      
      const response = await apperClient.updateRecord('crop', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${failedUpdates}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
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
      toast.error('Failed to update crop');
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
          console.error(`Failed to delete ${failedDeletions.length} records:${failedDeletions}`);
          
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