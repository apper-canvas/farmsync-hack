import { toast } from 'react-toastify';

const { ApperClient } = window.ApperSDK;

const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

class ExpenseService {
  async getAll() {
    try {
      const params = {
        fields: ["Name", "Tags", "Owner", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "category", "amount", "date", "description", "farm_id"]
      };
      
      const response = await apperClient.fetchRecords('expense', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: ["Name", "Tags", "Owner", "CreatedOn", "CreatedBy", "ModifiedOn", "ModifiedBy", "category", "amount", "date", "description", "farm_id"]
      };
      
      const response = await apperClient.getRecordById('expense', id, params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching expense with ID ${id}:`, error);
      toast.error('Failed to fetch expense');
      return null;
    }
  }

async create(expenseData) {
    try {
      // Validate required fields
      if (!expenseData) {
        toast.error('Expense data is required');
        return null;
      }

      const expenseName = expenseData.name || expenseData.Name || expenseData.description;
      if (!expenseName || typeof expenseName !== 'string' || expenseName.trim() === '') {
        toast.error('Expense name or description is required');
        return null;
      }

      if (!expenseData.category || typeof expenseData.category !== 'string' || expenseData.category.trim() === '') {
        toast.error('Expense category is required');
        return null;
      }

      if (!expenseData.amount) {
        toast.error('Expense amount is required');
        return null;
      }

      const amount = parseFloat(expenseData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Amount must be a positive number');
        return null;
      }

      if (!expenseData.date) {
        toast.error('Expense date is required');
        return null;
      }

      const farmId = expenseData.farmId || expenseData.farm_id;
      if (!farmId) {
        toast.error('Farm selection is required');
        return null;
      }

      // Only include Updateable fields
      const params = {
        records: [{
          Name: expenseName.trim(),
          Tags: expenseData.tags || expenseData.Tags || "",
          Owner: expenseData.owner || expenseData.Owner,
          category: expenseData.category.trim(),
          amount: amount, // Currency field as float
          date: expenseData.date, // Date format YYYY-MM-DD
          description: expenseData.description || "",
          farm_id: parseInt(farmId) // Lookup field as integer
        }]
      };

      // Validate farmId is a valid number
      if (isNaN(params.records[0].farm_id)) {
        toast.error('Invalid farm selection');
        return null;
      }
      
      const response = await apperClient.createRecord('expense', params);
      
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
          toast.success('Expense created successfully');
          return successfulRecords[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to create expense');
      return null;
    }
  }

async update(id, updateData) {
    try {
      // Validate required fields
      if (!id) {
        toast.error('Expense ID is required for update');
        return null;
      }

      if (!updateData) {
        toast.error('Update data is required');
        return null;
      }

      const expenseName = updateData.name || updateData.Name || updateData.description;
      if (!expenseName || typeof expenseName !== 'string' || expenseName.trim() === '') {
        toast.error('Expense name or description is required');
        return null;
      }

      if (!updateData.category || typeof updateData.category !== 'string' || updateData.category.trim() === '') {
        toast.error('Expense category is required');
        return null;
      }

      if (!updateData.amount) {
        toast.error('Expense amount is required');
        return null;
      }

      const amount = parseFloat(updateData.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Amount must be a positive number');
        return null;
      }

      if (!updateData.date) {
        toast.error('Expense date is required');
        return null;
      }

      const farmId = updateData.farmId || updateData.farm_id;
      if (!farmId) {
        toast.error('Farm selection is required');
        return null;
      }

      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: expenseName.trim(),
          Tags: updateData.tags || updateData.Tags || "",
          Owner: updateData.owner || updateData.Owner,
          category: updateData.category.trim(),
          amount: amount, // Currency field as float
          date: updateData.date, // Date format YYYY-MM-DD
          description: updateData.description || "",
          farm_id: parseInt(farmId) // Lookup field as integer
        }]
      };

      // Validate IDs are valid numbers
      if (isNaN(params.records[0].Id)) {
        toast.error('Invalid expense ID');
        return null;
      }
      if (isNaN(params.records[0].farm_id)) {
        toast.error('Invalid farm selection');
        return null;
      }
      
      const response = await apperClient.updateRecord('expense', params);
      
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
          toast.success('Expense updated successfully');
          return successfulUpdates[0].data;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('expense', params);
      
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
          toast.success('Expense deleted successfully');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
      return false;
    }
  }
}

export default new ExpenseService();