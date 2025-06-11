import { motion } from 'framer-motion';
import StatCard from '@/components/molecules/StatCard';

export default function IncomeStatsGrid({ totalIncome, totalExpenses, netProfit, profitMargin }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatPercentage = (percentage) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const getProfitColor = (profit) => {
    if (profit > 0) return 'text-green-600';
    if (profit < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getProfitIcon = (profit) => {
    if (profit > 0) return 'TrendingUp';
    if (profit < 0) return 'TrendingDown';
    return 'Minus';
  };

  const stats = [
    {
      id: 'income',
      title: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: 'DollarSign',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      trend: totalIncome > 0 ? 'positive' : 'neutral'
    },
    {
      id: 'expenses',
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: 'CreditCard',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      trend: 'neutral'
    },
    {
      id: 'profit',
      title: 'Net Profit',
      value: formatCurrency(netProfit),
      icon: getProfitIcon(netProfit),
      color: getProfitColor(netProfit),
      bgColor: netProfit >= 0 ? 'bg-green-50' : 'bg-red-50',
      iconColor: getProfitColor(netProfit),
      trend: netProfit > 0 ? 'positive' : netProfit < 0 ? 'negative' : 'neutral'
    },
    {
      id: 'margin',
      title: 'Profit Margin',
      value: formatPercentage(profitMargin),
      icon: 'Percent',
      color: getProfitColor(netProfit),
      bgColor: profitMargin >= 0 ? 'bg-blue-50' : 'bg-red-50',
      iconColor: getProfitColor(netProfit),
      trend: profitMargin > 0 ? 'positive' : profitMargin < 0 ? 'negative' : 'neutral'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatCard
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            className={`${stat.bgColor} border-gray-200`}
            iconClassName={stat.iconColor}
            valueClassName={stat.color}
          />
        </motion.div>
      ))}
    </div>
  );
}