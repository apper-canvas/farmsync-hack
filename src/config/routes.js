import Dashboard from '../pages/Dashboard'
import Farms from '../pages/Farms'
import Crops from '../pages/Crops'
import Tasks from '../pages/Tasks'
import Weather from '../pages/Weather'
import Expenses from '../pages/Expenses'
import NotFound from '../pages/NotFound'

export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  farms: {
    id: 'farms',
    label: 'Farms',
    path: '/farms',
    icon: 'MapPin',
    component: Farms
  },
  crops: {
    id: 'crops',
    label: 'Crops',
    path: '/crops',
    icon: 'Wheat',
    component: Crops
  },
  tasks: {
    id: 'tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: 'CheckSquare',
    component: Tasks
  },
  weather: {
    id: 'weather',
    label: 'Weather',
    path: '/weather',
    icon: 'Cloud',
    component: Weather
  },
  expenses: {
    id: 'expenses',
    label: 'Expenses',
    path: '/expenses',
    icon: 'DollarSign',
    component: Expenses
  },
  notfound: {
    id: 'notfound',
    label: 'Not Found',
    path: '*',
    icon: 'AlertCircle',
    component: NotFound
  }
}

export const routeArray = Object.values(routes)