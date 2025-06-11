import { format } from 'date-fns';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ExportService {
    // Helper to get farm name by ID
    getFarmName(farmId, farms) {
        const farm = farms?.find(f => f.id === farmId);
        return farm ? farm.name : 'Unknown Farm';
    }

    // Convert data to CSV format
    convertToCSV(data, headers) {
        const csvHeaders = headers.join(',');
        const csvRows = data.map(row => 
            headers.map(header => {
                const value = row[header] || '';
                // Escape commas and quotes in CSV
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            }).join(',')
        );
        
        return [csvHeaders, ...csvRows].join('\n');
    }

    // Download file helper
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    // Export crops to CSV
    async exportCropsToCSV(crops, farms, filename = 'crops_export') {
        await delay(500); // Simulate processing time
        
        const headers = ['Crop Name', 'Variety', 'Farm', 'Field', 'Growth Stage', 'Planting Date', 'Expected Harvest Date'];
        
        const csvData = crops.map(crop => ({
            'Crop Name': crop.name,
            'Variety': crop.variety || '',
            'Farm': this.getFarmName(crop.farmId, farms),
            'Field': crop.field || '',
            'Growth Stage': crop.growthStage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '',
            'Planting Date': crop.plantingDate ? format(new Date(crop.plantingDate), 'yyyy-MM-dd') : '',
            'Expected Harvest Date': crop.expectedHarvestDate ? format(new Date(crop.expectedHarvestDate), 'yyyy-MM-dd') : ''
        }));

        const csvContent = this.convertToCSV(csvData, headers);
        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
        
        return true;
    }

    // Export expenses to CSV
    async exportExpensesToCSV(expenses, farms, filename = 'expenses_export') {
        await delay(500); // Simulate processing time
        
        const headers = ['Date', 'Category', 'Amount', 'Farm', 'Description'];
        
        const csvData = expenses.map(expense => ({
            'Date': expense.date ? format(new Date(expense.date), 'yyyy-MM-dd') : '',
            'Category': expense.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '',
            'Amount': expense.amount ? `$${expense.amount.toFixed(2)}` : '',
            'Farm': this.getFarmName(expense.farmId, farms),
            'Description': expense.description || ''
        }));

        const csvContent = this.convertToCSV(csvData, headers);
        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
        
        return true;
    }

    // Export crops to PDF (simplified version - in production you'd use a PDF library)
    async exportCropsToPDF(crops, farms, filename = 'crops_export') {
        await delay(800); // Simulate processing time
        
        const htmlContent = this.generateCropsHTML(crops, farms);
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Trigger print dialog
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
        
        return true;
    }

    // Export expenses to PDF (simplified version)
    async exportExpensesToPDF(expenses, farms, filename = 'expenses_export') {
        await delay(800); // Simulate processing time
        
        const htmlContent = this.generateExpensesHTML(expenses, farms);
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Trigger print dialog
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
        
        return true;
    }

    // Generate HTML for crops PDF
    generateCropsHTML(crops, farms) {
        const totalCrops = crops.length;
        const currentDate = format(new Date(), 'MMMM d, yyyy');
        
        const tableRows = crops.map(crop => `
            <tr>
                <td>${crop.name}</td>
                <td>${crop.variety || '-'}</td>
                <td>${this.getFarmName(crop.farmId, farms)}</td>
                <td>${crop.field || '-'}</td>
                <td>${crop.growthStage?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '-'}</td>
                <td>${crop.plantingDate ? format(new Date(crop.plantingDate), 'MMM d, yyyy') : '-'}</td>
                <td>${crop.expectedHarvestDate ? format(new Date(crop.expectedHarvestDate), 'MMM d, yyyy') : '-'}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Crops Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2D5016; padding-bottom: 20px; }
                    .header h1 { color: #2D5016; margin: 0; font-size: 28px; }
                    .header p { margin: 5px 0; color: #666; }
                    .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #2D5016; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                    @media print { body { margin: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>FarmSync Crops Report</h1>
                    <p>Generated on ${currentDate}</p>
                </div>
                
                <div class="summary">
                    <h3>Summary</h3>
                    <p><strong>Total Crops:</strong> ${totalCrops}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Crop Name</th>
                            <th>Variety</th>
                            <th>Farm</th>
                            <th>Field</th>
                            <th>Growth Stage</th>
                            <th>Planting Date</th>
                            <th>Expected Harvest</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Report generated by FarmSync - Farm Management System</p>
                </div>
            </body>
            </html>
        `;
    }

    // Generate HTML for expenses PDF
    generateExpensesHTML(expenses, farms) {
        const totalExpenses = expenses.length;
        const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const currentDate = format(new Date(), 'MMMM d, yyyy');
        
        const tableRows = expenses.map(expense => `
            <tr>
                <td>${expense.date ? format(new Date(expense.date), 'MMM d, yyyy') : '-'}</td>
                <td>${expense.category?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '-'}</td>
                <td>$${expense.amount?.toFixed(2) || '0.00'}</td>
                <td>${this.getFarmName(expense.farmId, farms)}</td>
                <td>${expense.description || '-'}</td>
            </tr>
        `).join('');

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Expenses Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2D5016; padding-bottom: 20px; }
                    .header h1 { color: #2D5016; margin: 0; font-size: 28px; }
                    .header p { margin: 5px 0; color: #666; }
                    .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #2D5016; color: white; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .amount { text-align: right; font-weight: bold; }
                    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                    @media print { body { margin: 20px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>FarmSync Expenses Report</h1>
                    <p>Generated on ${currentDate}</p>
                </div>
                
                <div class="summary">
                    <h3>Summary</h3>
                    <div class="summary-grid">
                        <p><strong>Total Expenses:</strong> ${totalExpenses}</p>
                        <p><strong>Total Amount:</strong> $${totalAmount.toLocaleString()}</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Farm</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>Report generated by FarmSync - Farm Management System</p>
                </div>
            </body>
            </html>
        `;
    }
}

export default new ExportService();