import DashboardPage from '@/components/pages/DashboardPage';
import FarmsPage from '@/components/pages/FarmsPage';
import CropsPage from '@/components/pages/CropsPage';
import TasksPage from '@/components/pages/TasksPage';
import WeatherPage from '@/components/pages/WeatherPage';
import ExpensesPage from '@/components/pages/ExpensesPage';
import NotFoundPage from '@/components/pages/NotFoundPage';
import FarmDetailsPage from '@/components/pages/FarmDetailsPage';
export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
component: DashboardPage
  },
  farms: {
    id: 'farms',
    label: 'Farms',
    path: '/farms',
    icon: 'MapPin',
component: FarmsPage
  },
  crops: {
    id: 'crops',
    label: 'Crops',
    path: '/crops',
    icon: 'Wheat',
component: CropsPage
  },
  tasks: {
    id: 'tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: 'CheckSquare',
component: TasksPage
  },
  weather: {
    id: 'weather',
    label: 'Weather',
    path: '/weather',
    icon: 'Cloud',
component: WeatherPage
  },
expenses: {
    id: 'expenses',
    label: 'Expenses',
    path: '/expenses',
    icon: 'DollarSign',
    component: ExpensesPage
  },
  income: {
    id: 'income',
    label: 'Income',
    path: '/income',
    icon: 'TrendingUp',
    component: () => import('@/components/pages/CropIncomePage').then(module => ({ default: module.default }))
  },
  farmDetails: {
    id: 'farmDetails',
    label: 'Farm Details',
    path: '/farms/:id',
    icon: 'MapPin',
    component: FarmDetailsPage
  },
  notfound: {
    id: 'notfound',
    label: 'Not Found',
    path: '*',
    icon: 'AlertCircle',
    component: NotFoundPage
  }
}

export const routeArray = Object.values(routes)