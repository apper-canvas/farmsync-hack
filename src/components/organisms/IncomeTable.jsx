import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import EmptyState from '@/components/molecules/EmptyState';

const incomeSourceLabels = {
  crop_sales: 'Crop Sales',
  direct_sales: 'Direct Sales',
  contracts: 'Contract Sales',
  subsidies: 'Government Subsidies',
  insurance: 'Insurance Payouts',
  grants: 'Grants',
  other: 'Other Income'
};

const IncomeTable = ({ income, crops, farms, onEdit, onDelete }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'No date';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getCropName = (cropId) => {
    if (!cropId) return '-';
    const crop = crops?.find(c => (c?.id ?? c?.Id) === cropId);
    return crop?.name ?? crop?.Name ?? 'Unknown Crop';
  };

  const getFarmName = (farmId) => {
    if (!farmId) return '-';
    const farm = farms?.find(f => (f?.id ?? f?.Id) === farmId);
    return farm?.name ?? farm?.Name ?? 'Unknown Farm';
  };

  const getSourceLabel = (source) => {
    return incomeSourceLabels[source] || 'Unknown Source';
  };

  if (!income || income.length === 0) {
    return (
      <EmptyState
        icon="DollarSign"
        title="No income records found"
        message="Start by adding your first income record to track earnings"
        buttonText="Add Income Record"
        onButtonClick={() => {}}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Income Records</h3>
        <p className="text-sm text-gray-500 mt-1">
          {income.length} record{income.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Crop/Farm
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {income.map((incomeItem, index) => (
              <motion.tr
                key={incomeItem.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {incomeItem.description}
                    </div>
                    {incomeItem.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {incomeItem.notes}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">
                    {formatCurrency(incomeItem.amount)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(incomeItem.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {getSourceLabel(incomeItem.source)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getCropName(incomeItem.cropId)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {getFarmName(incomeItem.farmId)}
                  </div>
                </td>
<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <motion.button
                      onClick={() => onEdit(incomeItem)}
                      className="text-primary hover:text-primary/80 p-1 rounded"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ApperIcon name="Edit" className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => onDelete(incomeItem.id)}
                      className="text-gray-400 hover:text-error p-1 rounded"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
<ApperIcon name="Trash2" className="h-4 w-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeTable;