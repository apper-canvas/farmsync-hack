import { toast } from 'react-toastify';

const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

class FarmService {
  async getAll() {
    try {
      const params = {
        fields: ["Name", "Tags", "Owner", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "size", "size_unit", "location", "created_at"]
      };
      
      const response = await apperClient.fetchRecords('farm', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching farms:', error);
      toast.error('Failed to fetch farms');
      return [];
    }
  }

async getById(id) {
    try {
      // Enhanced input validation
      if (!id) {
        console.error('Farm ID is required');
        return null;
      }
      
      // Convert ID to appropriate format and validate
      const farmId = parseInt(id, 10);
      if (isNaN(farmId) || farmId <= 0) {
        console.error('Invalid farm ID format:', id);
        return null;
      }
      
      console.log(`Fetching farm with ID: ${farmId}`);
      
      const params = {
        fields: ["Name", "Tags", "Owner", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "size", "size_unit", "location", "created_at"]
      };
      
      const response = await apperClient.getRecordById('farm', farmId, params);
      
      // Enhanced response validation
      if (!response) {
        console.error('No response received from API for farm ID:', farmId);
        return null;
      }
      
      if (!response.success) {
        const errorMessage = response?.message || 'Farm record not found';
        console.error(`Farm API error for ID ${farmId}:`, errorMessage);
        
        // Check for specific error types
        if (errorMessage.toLowerCase().includes('not found') || 
            errorMessage.toLowerCase().includes('does not exist') ||
            errorMessage.toLowerCase().includes('no record found')) {
          console.log(`Farm with ID ${farmId} does not exist in database`);
          // Don't show toast for record not found - let the UI handle it gracefully
          return null;
        }
        
        // For other API errors, show toast notification
        if (errorMessage.toLowerCase().includes('unauthorized') || 
            errorMessage.toLowerCase().includes('forbidden')) {
          toast.error('Access denied: You do not have permission to view this farm');
        } else if (errorMessage.toLowerCase().includes('timeout') || 
                   errorMessage.toLowerCase().includes('network')) {
          toast.error('Network error: Please check your connection and try again');
        } else {
          toast.error(`API Error: ${errorMessage}`);
        }
        return null;
      }
      
      // Validate response data structure
      if (!response.data) {
        console.error(`No farm data returned for ID ${farmId}, but API response was successful`);
        return null;
      }
      
      // Validate essential farm data fields
      if (typeof response.data !== 'object') {
        console.error(`Invalid farm data format for ID ${farmId}:`, typeof response.data);
        return null;
      }
      
      // Ensure the farm has required identifiers
      if (!response.data.Id && !response.data.id) {
        console.error(`Farm data missing ID field for requested ID ${farmId}:`, response.data);
        return null;
      }
      
      console.log(`Successfully fetched farm: ${response.data.Name || response.data.name || farmId}`);
      return response.data;
      
    } catch (error) {
      console.error(`Error fetching farm with ID ${id}:`, error);
      
      // Enhanced error categorization
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error: Unable to connect to server');
      } else if (error.name === 'AbortError') {
        console.log('Farm fetch request was cancelled');
        return null;
      } else if (error.message?.includes('timeout')) {
        toast.error('Request timeout: Server is taking too long to respond');
      } else {
        toast.error('Unexpected error occurred while fetching farm details');
      }
      
      return null;
    }
  }

async create(farmData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Name: farmData.name || farmData.Name || farmData.farmName || "",
          Tags: farmData.tags || farmData.Tags || "",
          Owner: farmData.owner || farmData.Owner,
          size: parseFloat(farmData.size) || 0,
          size_unit: farmData.sizeUnit || farmData.size_unit || "acres",
          location: farmData.location || "",
          created_at: new Date().toISOString().split('T')[0] // Date format YYYY-MM-DD
        }]
      };
      
      const response = await apperClient.createRecord('farm', params);
      
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
          toast.success('Farm created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating farm:', error);
      toast.error('Failed to create farm');
      return null;
    }
  }

async update(id, updateData) {
    try {
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: updateData.name || updateData.Name || updateData.farmName || "",
          Tags: updateData.tags || updateData.Tags || "",
          Owner: updateData.owner || updateData.Owner,
          size: parseFloat(updateData.size) || 0,
          size_unit: updateData.sizeUnit || updateData.size_unit || "acres",
          location: updateData.location || "",
          created_at: updateData.created_at || new Date().toISOString().split('T')[0]
        }]
      };
      
      const response = await apperClient.updateRecord('farm', params);
      
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
          toast.success('Farm updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating farm:', error);
      toast.error('Failed to update farm');
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('farm', params);
      
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
          toast.success('Farm deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting farm:', error);
      toast.error('Failed to delete farm');
      return false;
    }
  }
}

export default new FarmService();