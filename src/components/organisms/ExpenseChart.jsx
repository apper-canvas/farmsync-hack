import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const ExpenseChart = ({ expenses, categories, filter, dateFilter }) => {
  const [chartType, setChartType] = useState('pie');

  // Helper function to convert Tailwind color classes to hex values
  const getCategoryColor = (colorClass) => {
    const colorMap = {
      'text-green-600': '#059669',
      'text-blue-600': '#2563EB',
      'text-purple-600': '#9333EA',
      'text-orange-600': '#EA580C',
      'text-red-600': '#DC2626',
      'text-gray-600': '#4B5563'
    };
    return colorMap[colorClass] || '#94A3B8';
  };

  // Transform and validate expense data for charts
  const chartData = useMemo(() => {
    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return { labels: [], series: [], hasData: false };
    }

    // Validate and clean expense data
    const validExpenses = expenses.filter(expense => {
      return expense && 
             typeof expense.amount === 'number' && 
             !isNaN(expense.amount) && 
             expense.amount > 0 &&
             expense.category &&
             typeof expense.category === 'string';
    });

    if (validExpenses.length === 0) {
      return { labels: [], series: [], hasData: false };
    }

    // Group expenses by category
    const categoryTotals = {};
    const categoryColors = {};
    
    // Initialize all categories to ensure consistent ordering
    categories.forEach(category => {
      categoryTotals[category.value] = 0;
      categoryColors[category.value] = getCategoryColor(category.color);
    });

    // Sum expenses by category
    validExpenses.forEach(expense => {
      if (categoryTotals.hasOwnProperty(expense.category)) {
        categoryTotals[expense.category] += expense.amount;
      } else {
        // Handle unknown categories
        categoryTotals[expense.category] = expense.amount;
        categoryColors[expense.category] = '#94A3B8'; // Default gray color
      }
    });

    // Filter out categories with zero amounts and prepare chart data
    const nonZeroCategories = Object.entries(categoryTotals)
      .filter(([_, amount]) => amount > 0)
      .sort(([, a], [, b]) => b - a); // Sort by amount descending

    if (nonZeroCategories.length === 0) {
      return { labels: [], series: [], hasData: false };
    }

    const labels = nonZeroCategories.map(([categoryValue]) => {
      const category = categories.find(c => c.value === categoryValue);
      return category ? category.label : categoryValue;
    });

    const series = nonZeroCategories.map(([_, amount]) => Math.round(amount * 100) / 100);
    const colors = nonZeroCategories.map(([categoryValue]) => categoryColors[categoryValue]);

    return {
      labels,
      series,
      colors,
      hasData: true,
      totalAmount: series.reduce((sum, amount) => sum + amount, 0)
    };
  }, [expenses, categories]);

  // Chart configuration for pie chart
  const pieOptions = {
    chart: {
      type: 'pie',
      height: 350,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      },
      toolbar: {
        show: false
      }
    },
    labels: chartData.labels,
    colors: chartData.colors,
    legend: {
      position: 'bottom',
      fontSize: '14px',
      fontFamily: 'Inter, ui-sans-serif, system-ui',
      markers: {
        width: 12,
        height: 12,
        radius: 6
      },
      itemMargin: {
        horizontal: 15,
        vertical: 5
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '18px',
              fontWeight: 600,
              color: '#1F2937'
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              color: '#1F2937',
              formatter: function (val) {
                return '$' + Number(val).toLocaleString();
              }
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '16px',
              fontWeight: 600,
              color: '#6B7280',
              formatter: function (w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return '$' + total.toLocaleString();
              }
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val, opts) {
        const amount = opts.w.globals.series[opts.seriesIndex];
        return '$' + amount.toLocaleString();
      },
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: ['#FFFFFF']
      },
      dropShadow: {
        enabled: true,
        blur: 2,
        opacity: 0.8
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val, opts) {
          const percentage = ((val / chartData.totalAmount) * 100).toFixed(1);
          return '$' + val.toLocaleString() + ' (' + percentage + '%)';
        }
      },
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, ui-sans-serif, system-ui'
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 300
        },
        legend: {
          position: 'bottom',
          fontSize: '12px'
        }
      }
    }]
  };

  // Chart configuration for bar chart
  const barOptions = {
    chart: {
      type: 'bar',
      height: 350,
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      },
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 8,
        dataLabels: {
          position: 'top'
        }
      }
    },
    colors: chartData.colors,
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return '$' + Number(val).toLocaleString();
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: ['#374151']
      }
    },
    xaxis: {
      categories: chartData.labels,
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, ui-sans-serif, system-ui',
          colors: '#6B7280'
        },
        rotate: -45,
        trim: true,
        maxHeight: 80
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, ui-sans-serif, system-ui',
          colors: '#6B7280'
        },
        formatter: function (val) {
          return '$' + val.toLocaleString();
        }
      }
    },
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          const percentage = ((val / chartData.totalAmount) * 100).toFixed(1);
          return '$' + val.toLocaleString() + ' (' + percentage + '%)';
        }
      },
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, ui-sans-serif, system-ui'
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 300
        },
        plotOptions: {
          bar: {
            columnWidth: '80%'
          }
        },
        dataLabels: {
          enabled: false
        }
      }
    }]
  };

  // Format filter description for display
  const getFilterDescription = () => {
    const categoryDesc = filter === 'all' ? 'All Categories' : 
      categories.find(c => c.value === filter)?.label || filter;
    
    const dateDesc = dateFilter === 'all_time' ? 'All Time' :
      dateFilter === 'this_month' ? 'This Month' :
      dateFilter === 'last_30_days' ? 'Last 30 Days' : dateFilter;
    
    return `${categoryDesc} • ${dateDesc}`;
  };

  // Empty state component
  if (!chartData.hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
      >
        <div className="text-center">
          <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ApperIcon name="BarChart3" className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Expense Data Available</h3>
          <p className="text-gray-500 mb-1">
            {expenses?.length === 0 
              ? "No expenses have been recorded yet." 
              : "No expenses match the current filters."}
          </p>
          <p className="text-sm text-gray-400">
            {getFilterDescription()}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Expense Distribution</h3>
          <p className="text-sm text-gray-500">{getFilterDescription()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={chartType === 'pie' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setChartType('pie')}
            className="px-3 py-1.5 text-sm"
          >
            <ApperIcon name="PieChart" className="h-4 w-4 mr-1" />
            Pie
          </Button>
          <Button
            variant={chartType === 'bar' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setChartType('bar')}
            className="px-3 py-1.5 text-sm"
          >
            <ApperIcon name="BarChart3" className="h-4 w-4 mr-1" />
            Bar
          </Button>
        </div>
      </div>

      <div className="w-full">
        {chartType === 'pie' ? (
          <Chart
            options={pieOptions}
            series={chartData.series}
            type="donut"
            height={350}
          />
        ) : (
          <Chart
            options={barOptions}
            series={[{ name: 'Amount', data: chartData.series }]}
            type="bar"
            height={350}
          />
        )}
      </div>

      {/* Chart summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {chartData.labels.length} {chartData.labels.length === 1 ? 'category' : 'categories'}
          </span>
          <span className="font-semibold text-gray-900">
            Total: ${chartData.totalAmount.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpenseChart;