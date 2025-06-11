import { toast } from 'react-toastify';

// Mock data storage for income records
let incomeData = [];

// Utility function to add delay for realistic API simulation
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Load initial data from JSON file
async function loadInitialData() {
  if (incomeData.length === 0) {
    try {
      const response = await import('../mockData/income.json');
      incomeData = [...response.default];
    } catch (error) {
      console.error('Error loading initial income data:', error);
      incomeData = [];
    }
  }
}

class IncomeService {
  async getAll() {
    await delay(300);
    await loadInitialData();
    
    try {
      return [...incomeData];
    } catch (error) {
      console.error('Error fetching income records:', error);
      toast.error('Failed to fetch income records');
      return [];
    }
  }

  async getById(id) {
    await delay(300);
    await loadInitialData();
    
    try {
      const income = incomeData.find(item => item.id === parseInt(id));
      if (!income) {
        toast.error('Income record not found');
        return null;
      }
      return { ...income };
    } catch (error) {
      console.error(`Error fetching income record with ID ${id}:`, error);
      toast.error('Failed to fetch income record');
      return null;
    }
  }

  async create(incomeRecord) {
    await delay(300);
    await loadInitialData();
    
    try {
      // Validate required fields
      if (!incomeRecord.description || !incomeRecord.amount || !incomeRecord.date) {
        toast.error('Please fill in all required fields');
        return null;
      }

      // Validate amount is positive number
      const amount = parseFloat(incomeRecord.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Amount must be a positive number');
        return null;
      }

      // Validate date format
      const date = new Date(incomeRecord.date);
      if (isNaN(date.getTime())) {
        toast.error('Please provide a valid date');
        return null;
      }

      const newIncome = {
        id: Date.now(),
        description: incomeRecord.description.trim(),
        amount: amount,
        date: incomeRecord.date,
        source: incomeRecord.source || 'crop_sales',
        cropId: incomeRecord.cropId ? parseInt(incomeRecord.cropId) : null,
        farmId: incomeRecord.farmId ? parseInt(incomeRecord.farmId) : null,
        notes: incomeRecord.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      incomeData.push(newIncome);
      toast.success('Income record created successfully');
      return { ...newIncome };
    } catch (error) {
      console.error('Error creating income record:', error);
      toast.error('Failed to create income record');
      return null;
    }
  }

  async update(id, updateData) {
    await delay(300);
    await loadInitialData();
    
    try {
      const index = incomeData.findIndex(item => item.id === parseInt(id));
      if (index === -1) {
        toast.error('Income record not found');
        return null;
      }

      // Validate required fields if provided
      if (updateData.description !== undefined && !updateData.description.trim()) {
        toast.error('Description is required');
        return null;
      }

      if (updateData.amount !== undefined) {
        const amount = parseFloat(updateData.amount);
        if (isNaN(amount) || amount <= 0) {
          toast.error('Amount must be a positive number');
          return null;
        }
      }

      if (updateData.date !== undefined) {
        const date = new Date(updateData.date);
        if (isNaN(date.getTime())) {
          toast.error('Please provide a valid date');
          return null;
        }
      }

      const updatedIncome = {
        ...incomeData[index],
        ...updateData,
        id: parseInt(id), // Ensure ID remains as integer
        cropId: updateData.cropId ? parseInt(updateData.cropId) : incomeData[index].cropId,
        farmId: updateData.farmId ? parseInt(updateData.farmId) : incomeData[index].farmId,
        amount: updateData.amount ? parseFloat(updateData.amount) : incomeData[index].amount,
        updatedAt: new Date().toISOString()
      };

      incomeData[index] = updatedIncome;
      toast.success('Income record updated successfully');
      return { ...updatedIncome };
    } catch (error) {
      console.error('Error updating income record:', error);
      toast.error('Failed to update income record');
      return null;
    }
  }

  async delete(id) {
    await delay(300);
    await loadInitialData();
    
    try {
      const index = incomeData.findIndex(item => item.id === parseInt(id));
      if (index === -1) {
        toast.error('Income record not found');
        return false;
      }

      incomeData.splice(index, 1);
      toast.success('Income record deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting income record:', error);
      toast.error('Failed to delete income record');
      return false;
    }
  }

  // Additional utility methods for income analysis
  async getIncomeByDateRange(startDate, endDate) {
    await delay(200);
    await loadInitialData();
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const filteredIncome = incomeData.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate >= start && incomeDate <= end;
      });

      return [...filteredIncome];
    } catch (error) {
      console.error('Error fetching income by date range:', error);
      return [];
    }
  }

  async getIncomeByFarm(farmId) {
    await delay(200);
    await loadInitialData();
    
    try {
      const farmIncome = incomeData.filter(income => income.farmId === parseInt(farmId));
      return [...farmIncome];
    } catch (error) {
      console.error('Error fetching income by farm:', error);
      return [];
    }
  }

  async getIncomeByCrop(cropId) {
    await delay(200);
    await loadInitialData();
    
    try {
      const cropIncome = incomeData.filter(income => income.cropId === parseInt(cropId));
      return [...cropIncome];
    } catch (error) {
      console.error('Error fetching income by crop:', error);
      return [];
    }
  }

  // Calculate total income for a specific period
  async getTotalIncomeForPeriod(year, month = null) {
    await delay(200);
    await loadInitialData();
    
    try {
      let total = 0;
      
      incomeData.forEach(income => {
        const incomeDate = new Date(income.date);
        const incomeYear = incomeDate.getFullYear();
        const incomeMonth = incomeDate.getMonth() + 1;
        
        if (year && incomeYear === parseInt(year)) {
          if (month === null || incomeMonth === parseInt(month)) {
            total += parseFloat(income.amount);
          }
        }
      });

      return total;
    } catch (error) {
      console.error('Error calculating total income:', error);
      return 0;
    }
  }
}

export default new IncomeService();