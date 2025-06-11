import { toast } from 'react-toastify';

const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

const taskService = {
  // Get all tasks
  async getAll() {
    try {
      const params = {
        fields: ["Name", "Tags", "Owner", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "farm_id", "crop_id", "type", "description", "due_date", "priority", "completed"]
      };
      
      const response = await apperClient.fetchRecords('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
      return [];
    }
  },

  // Get task by ID
  async getById(id) {
    try {
      const params = {
        fields: ["Name", "Tags", "Owner", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "farm_id", "crop_id", "type", "description", "due_date", "priority", "completed"]
      };
      
      const response = await apperClient.getRecordById('task', id, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching task with ID ${id}:`, error);
      toast.error('Failed to fetch task');
      return null;
    }
  },

// Create new task
  async create(taskData) {
    try {
      // Validate required fields
      if (!taskData) {
        toast.error('Task data is required');
        return null;
      }

      const taskName = taskData.name || taskData.Name || taskData.type;
      if (!taskName || typeof taskName !== 'string' || taskName.trim() === '') {
        toast.error('Task name is required');
        return null;
      }

      const farmId = taskData.farmId || taskData.farm_id;
      if (!farmId) {
        toast.error('Farm selection is required');
        return null;
      }

      if (!taskData.type || typeof taskData.type !== 'string' || taskData.type.trim() === '') {
        toast.error('Task type is required');
        return null;
      }

      const dueDate = taskData.dueDate || taskData.due_date;
      if (!dueDate) {
        toast.error('Due date is required');
        return null;
      }

      if (!taskData.priority) {
        toast.error('Task priority is required');
        return null;
      }

      // Only include Updateable fields
      const params = {
        records: [{
          Name: taskName.trim(),
          Tags: taskData.tags || taskData.Tags || "",
          Owner: taskData.owner || taskData.Owner,
          farm_id: parseInt(farmId), // Lookup field as integer
          crop_id: taskData.cropId || taskData.crop_id ? parseInt(taskData.cropId || taskData.crop_id) : null, // Optional lookup field
          type: taskData.type.trim(),
          description: taskData.description || "", // MultilineText field
          due_date: dueDate, // Date format YYYY-MM-DD
          priority: taskData.priority, // Picklist field
          completed: taskData.completed !== undefined ? taskData.completed : false // Boolean field
        }]
      };

      // Validate farmId is a valid number
      if (isNaN(params.records[0].farm_id)) {
        toast.error('Invalid farm selection');
        return null;
      }
      
      const response = await apperClient.createRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
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
          toast.success('Task created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      return null;
    }
  },

// Update existing task
  async update(id, updateData) {
    try {
      // Validate required fields
      if (!id) {
        toast.error('Task ID is required for update');
        return null;
      }

      if (!updateData) {
        toast.error('Update data is required');
        return null;
      }

      const taskName = updateData.name || updateData.Name || updateData.type;
      if (!taskName || typeof taskName !== 'string' || taskName.trim() === '') {
        toast.error('Task name is required');
        return null;
      }

      const farmId = updateData.farmId || updateData.farm_id;
      if (!farmId) {
        toast.error('Farm selection is required');
        return null;
      }

      if (!updateData.type || typeof updateData.type !== 'string' || updateData.type.trim() === '') {
        toast.error('Task type is required');
        return null;
      }

      const dueDate = updateData.dueDate || updateData.due_date;
      if (!dueDate) {
        toast.error('Due date is required');
        return null;
      }

      if (!updateData.priority) {
        toast.error('Task priority is required');
        return null;
      }

      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: taskName.trim(),
          Tags: updateData.tags || updateData.Tags || "",
          Owner: updateData.owner || updateData.Owner,
          farm_id: parseInt(farmId), // Lookup field as integer
          crop_id: updateData.cropId || updateData.crop_id ? parseInt(updateData.cropId || updateData.crop_id) : null, // Optional lookup field
          type: updateData.type.trim(),
          description: updateData.description || "", // MultilineText field
          due_date: dueDate, // Date format YYYY-MM-DD
          priority: updateData.priority, // Picklist field
          completed: updateData.completed !== undefined ? updateData.completed : false // Boolean field
        }]
      };

      // Validate IDs are valid numbers
      if (isNaN(params.records[0].Id)) {
        toast.error('Invalid task ID');
        return null;
      }
      if (isNaN(params.records[0].farm_id)) {
        toast.error('Invalid farm selection');
        return null;
      }
      
      const response = await apperClient.updateRecord('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:`, JSON.stringify(failedUpdates, null, 2));
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) toast.error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          toast.success('Task updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      return null;
    }
  },

  // Delete task
  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('task', params);
      
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
          toast.success('Task deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      return false;
    }
  },

  // Get tasks by status
  async getByStatus(completed = false) {
    try {
      const params = {
        fields: ["Name", "Tags", "Owner", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "farm_id", "crop_id", "type", "description", "due_date", "priority", "completed"],
        where: [
          {
            fieldName: "completed",
            operator: "ExactMatch",
            values: [completed.toString()]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tasks by status:', error);
      toast.error('Failed to fetch tasks by status');
      return [];
    }
  },

  // Get tasks by priority
  async getByPriority(priority) {
    try {
      const params = {
        fields: ["Name", "Tags", "Owner", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "farm_id", "crop_id", "type", "description", "due_date", "priority", "completed"],
        where: [
          {
            fieldName: "priority",
            operator: "ExactMatch",
            values: [priority]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching tasks by priority:', error);
      toast.error('Failed to fetch tasks by priority');
      return [];
    }
  },

  // Get upcoming tasks (next N days)
  async getUpcoming(days = 7) {
    try {
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      
      const params = {
        fields: ["Name", "Tags", "Owner", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "farm_id", "crop_id", "type", "description", "due_date", "priority", "completed"],
        where: [
          {
            fieldName: "completed",
            operator: "ExactMatch",
            values: ["false"]
          },
          {
            fieldName: "due_date",
            operator: "GreaterThanOrEqualTo",
            values: [now.toISOString().split('T')[0]]
          },
          {
            fieldName: "due_date",
            operator: "LessThanOrEqualTo",
            values: [futureDate.toISOString().split('T')[0]]
          }
        ],
        orderBy: [
          {
            fieldName: "due_date",
            SortType: "ASC"
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('task', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      toast.error('Failed to fetch upcoming tasks');
      return [];
    }
  }
};

export default taskService;