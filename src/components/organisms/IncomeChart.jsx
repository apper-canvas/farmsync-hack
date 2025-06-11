import { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

export default function IncomeChart({ data }) {
  const [chartOptions, setChartOptions] = useState({});
  const [chartSeries, setChartSeries] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const months = data.map(item => item.month);
    const incomeData = data.map(item => item.income);
    const expenseData = data.map(item => item.expenses);
    const profitData = data.map(item => item.profit);

    setChartSeries([
      {
        name: 'Income',
        data: incomeData,
        type: 'column'
      },
      {
        name: 'Expenses',
        data: expenseData,
        type: 'column'
      },
      {
        name: 'Net Profit',
        data: profitData,
        type: 'line'
      }
    ]);

    setChartOptions({
      chart: {
        type: 'line',
        height: 350,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: false
          }
        },
        background: 'transparent'
      },
      colors: ['#2D5016', '#F57C00', '#7CB342'],
      stroke: {
        curve: 'smooth',
        width: [0, 0, 3]
      },
      fill: {
        opacity: [0.8, 0.8, 1]
      },
      plotOptions: {
        bar: {
          columnWidth: '60%',
          borderRadius: 4
        }
      },
      dataLabels: {
        enabled: false
      },
      grid: {
        borderColor: '#E5E7EB',
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: false
          }
        }
      },
      xaxis: {
        categories: months,
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        title: {
          text: 'Amount ($)',
          style: {
            color: '#6B7280',
            fontSize: '12px'
          }
        },
        labels: {
          style: {
            colors: '#6B7280',
            fontSize: '12px'
          },
          formatter: function (value) {
            return '$' + value.toLocaleString();
          }
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'center',
        offsetY: -10,
        labels: {
          colors: '#374151'
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: function (value) {
            return '$' + value.toLocaleString();
          }
        }
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 300
            },
            legend: {
              position: 'bottom',
              offsetY: 10
            }
          }
        }
      ]
    });
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <ApperIcon name="BarChart3" className="h-12 w-12 mb-2" />
        <p className="text-lg font-medium mb-1">No data available</p>
        <p className="text-sm">Add some income records to see the chart</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="line"
        height={350}
      />
    </motion.div>
  );
}