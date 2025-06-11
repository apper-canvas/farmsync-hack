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
      // Input validation
      if (!farmData) {
        console.error('Farm data is required for creation');
        toast.error('Farm data is required');
        return null;
      }

      // Validate required fields
      const farmName = farmData.name || farmData.Name || farmData.farmName;
      if (!farmName || typeof farmName !== 'string' || farmName.trim() === '') {
        console.error('Farm name is required and must be a non-empty string');
        toast.error('Farm name is required');
        return null;
      }

      const farmLocation = farmData.location;
      if (!farmLocation || typeof farmLocation !== 'string' || farmLocation.trim() === '') {
        console.error('Farm location is required and must be a non-empty string');
        toast.error('Farm location is required');
        return null;
      }

      // Validate and convert size
      let farmSize = 0;
      if (farmData.size !== undefined && farmData.size !== null && farmData.size !== '') {
        farmSize = parseFloat(farmData.size);
        if (isNaN(farmSize) || farmSize < 0) {
          console.error('Farm size must be a valid positive number');
          toast.error('Farm size must be a valid positive number');
          return null;
        }
      }

      console.log('Creating farm with validated data:', {
        name: farmName,
        location: farmLocation,
        size: farmSize
      });

      // Only include Updateable fields
      const params = {
        records: [{
          Name: farmName.trim(),
          Tags: farmData.tags || farmData.Tags || "",
          Owner: farmData.owner || farmData.Owner,
          size: farmSize,
          size_unit: farmData.sizeUnit || farmData.size_unit || "acres",
          location: farmLocation.trim(),
          created_at: new Date().toISOString().split('T')[0] // Date format YYYY-MM-DD
        }]
      };
      
      const response = await apperClient.createRecord('farm', params);
      
      if (!response.success) {
        console.error('API response indicates failure:', response.message);
        toast.error(response.message || 'Failed to create farm');
        return null;
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:`, JSON.stringify(failedRecords, null, 2));
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          console.log('Farm created successfully:', successfulRecords[0].data);
          toast.success('Farm created successfully');
          return successfulRecords[0].data;
        }
      }
      
      console.error('No results returned from API');
      return null;
    } catch (error) {
      console.error('Error creating farm:', error);
      toast.error('Failed to create farm due to unexpected error');
      return null;
    }
  }

async update(id, updateData) {
    try {
      // Input validation
      if (!id) {
        console.error('Farm ID is required for update');
        toast.error('Farm ID is required for update');
        return null;
      }

      if (!updateData) {
        console.error('Update data is required');
        toast.error('Update data is required');
        return null;
      }

      // Validate and convert ID
      const farmId = parseInt(id, 10);
      if (isNaN(farmId) || farmId <= 0) {
        console.error('Invalid farm ID format for update:', id);
        toast.error('Invalid farm ID provided');
        return null;
      }

      // Validate required fields
      const farmName = updateData.name || updateData.Name || updateData.farmName;
      if (!farmName || typeof farmName !== 'string' || farmName.trim() === '') {
        console.error('Farm name is required and must be a non-empty string');
        toast.error('Farm name is required');
        return null;
      }

      const farmLocation = updateData.location;
      if (!farmLocation || typeof farmLocation !== 'string' || farmLocation.trim() === '') {
        console.error('Farm location is required and must be a non-empty string');
        toast.error('Farm location is required');
        return null;
      }

      // Validate and convert size
      let farmSize = 0;
      if (updateData.size !== undefined && updateData.size !== null && updateData.size !== '') {
        farmSize = parseFloat(updateData.size);
        if (isNaN(farmSize) || farmSize < 0) {
          console.error('Farm size must be a valid positive number');
          toast.error('Farm size must be a valid positive number');
          return null;
        }
      }

      console.log(`Updating farm ID ${farmId} with validated data:`, {
        name: farmName,
        location: farmLocation,
        size: farmSize
      });

      // Only include Updateable fields
      const params = {
        records: [{
          Id: farmId,
          Name: farmName.trim(),
          Tags: updateData.tags || updateData.Tags || "",
          Owner: updateData.owner || updateData.Owner,
          size: farmSize,
          size_unit: updateData.sizeUnit || updateData.size_unit || "acres",
          location: farmLocation.trim(),
          created_at: updateData.created_at || new Date().toISOString().split('T')[0]
        }]
      };
      
      console.log('Sending update request with params:', JSON.stringify(params, null, 2));
      
      const response = await apperClient.updateRecord('farm', params);
      
      if (!response.success) {
        console.error('API response indicates failure:', response.message);
        toast.error(response.message || 'Failed to update farm');
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:`, JSON.stringify(failedUpdates, null, 2));
          
          failedUpdates.forEach(record => {
            if (record.errors && Array.isArray(record.errors)) {
              record.errors.forEach(error => {
                const fieldLabel = error.fieldLabel || error.field || 'Unknown field';
                const errorMessage = error.message || error.error || 'Unknown error';
                console.error(`Field validation error - ${fieldLabel}: ${errorMessage}`);
                toast.error(`${fieldLabel}: ${errorMessage}`);
              });
            } else if (record.message) {
              console.error(`Update error: ${record.message}`);
              toast.error(record.message);
            } else {
              console.error('Unknown update error:', JSON.stringify(record, null, 2));
              toast.error('Unknown error occurred during update');
            }
          });
          
          // Return null if there were failures to indicate the operation was not successful
          return null;
        }
        
        if (successfulUpdates.length > 0) {
          console.log('Farm updated successfully:', successfulUpdates[0].data);
          toast.success('Farm updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      console.error('No results returned from update API');
      toast.error('No response received from server');
      return null;
    } catch (error) {
      console.error('Error updating farm:', error);
      
      // Provide more specific error messages based on error type
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('Network error: Unable to connect to server');
      } else if (error.message?.includes('timeout')) {
        toast.error('Request timeout: Server is taking too long to respond');
      } else if (error.message?.includes('unauthorized') || error.message?.includes('forbidden')) {
        toast.error('Access denied: You do not have permission to update this farm');
      } else {
        toast.error('Failed to update farm due to unexpected error');
      }
      
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
          console.error(`Failed to delete ${failedDeletions.length} records:`, JSON.stringify(failedDeletions, null, 2));
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