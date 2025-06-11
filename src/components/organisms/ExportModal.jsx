import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import Modal from '@/components/molecules/Modal';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import { exportService } from '@/services';

const ExportModal = ({ isOpen, onClose, dataType, data, farms }) => {
    const [selectedFormat, setSelectedFormat] = useState('csv');
    const [dateRange, setDateRange] = useState('this_month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const formats = [
        { value: 'csv', label: 'CSV', icon: 'FileText', description: 'Comma-separated values for spreadsheets' },
        { value: 'pdf', label: 'PDF', icon: 'FileImage', description: 'Formatted document for printing' }
    ];

    const dateRanges = [
        { value: 'this_month', label: 'This Month' },
        { value: 'last_30_days', label: 'Last 30 Days' },
        { value: 'last_90_days', label: 'Last 90 Days' },
        { value: 'all_time', label: 'All Time' },
        { value: 'custom', label: 'Custom Range' }
    ];

    const getFilteredData = () => {
        if (!data || data.length === 0) return [];

        const now = new Date();
        let startDate, endDate;

        switch (dateRange) {
            case 'this_month':
                startDate = startOfMonth(now);
                endDate = endOfMonth(now);
                break;
            case 'last_30_days':
                startDate = subDays(now, 30);
                endDate = now;
                break;
            case 'last_90_days':
                startDate = subDays(now, 90);
                endDate = now;
                break;
            case 'custom':
                if (!customStartDate || !customEndDate) return data;
                startDate = new Date(customStartDate);
                endDate = new Date(customEndDate);
                break;
            case 'all_time':
            default:
                return data;
        }

        return data.filter(item => {
            const itemDate = new Date(dataType === 'crops' ? item.plantingDate : item.date);
            return itemDate >= startDate && itemDate <= endDate;
        });
    };

    const handleExport = async () => {
        const filteredData = getFilteredData();
        
        if (filteredData.length === 0) {
            toast.error('No data found for the selected date range');
            return;
        }

        setIsExporting(true);
        
        try {
            const filename = `${dataType}_export_${format(new Date(), 'yyyy-MM-dd')}`;
            
            if (selectedFormat === 'csv') {
                if (dataType === 'crops') {
                    await exportService.exportCropsToCSV(filteredData, farms, filename);
                } else {
                    await exportService.exportExpensesToCSV(filteredData, farms, filename);
                }
            } else if (selectedFormat === 'pdf') {
                if (dataType === 'crops') {
                    await exportService.exportCropsToPDF(filteredData, farms, filename);
                } else {
                    await exportService.exportExpensesToPDF(filteredData, farms, filename);
                }
            }
            
            toast.success(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} exported successfully!`);
            onClose();
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const resetForm = () => {
        setSelectedFormat('csv');
        setDateRange('this_month');
        setCustomStartDate('');
        setCustomEndDate('');
        setIsExporting(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const filteredCount = getFilteredData().length;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`Export ${dataType.charAt(0).toUpperCase() + dataType.slice(1)} Data`}>
            <div className="space-y-6">
                {/* Format Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Export Format
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                        {formats.map((format) => (
                            <div key={format.value}>
                                <label className="relative flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="format"
                                        value={format.value}
                                        checked={selectedFormat === format.value}
                                        onChange={(e) => setSelectedFormat(e.target.value)}
                                        className="sr-only"
                                    />
                                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 mt-0.5 ${
                                        selectedFormat === format.value
                                            ? 'bg-primary border-primary'
                                            : 'border-gray-300'
                                    }`}>
                                        {selectedFormat === format.value && (
                                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1.5"></div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-3 flex-1">
                                        <ApperIcon name={format.icon} className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {format.label}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {format.description}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Date Range Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Date Range
                    </label>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    >
                        {dateRanges.map((range) => (
                            <option key={range.value} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Custom Date Range */}
                {dateRange === 'custom' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>
                )}

                {/* Preview Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <ApperIcon name="Info" className="h-4 w-4" />
                        <span>
                            {filteredCount} {dataType} record{filteredCount !== 1 ? 's' : ''} will be exported
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                    <Button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={isExporting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting || filteredCount === 0}
                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                        {isExporting ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                >
                                    <ApperIcon name="Loader2" className="h-4 w-4" />
                                </motion.div>
                                <span>Exporting...</span>
                            </>
                        ) : (
                            <>
                                <ApperIcon name="Download" className="h-4 w-4" />
                                <span>Export {selectedFormat.toUpperCase()}</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;