import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ApperIcon from './components/ApperIcon'
import { routes } from './config/routes'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const mainNavRoutes = [
    routes.dashboard,
    routes.farms,
    routes.crops,
    routes.tasks,
    routes.weather,
    routes.expenses
  ]

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="h-screen flex overflow-hidden bg-surface-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-primary">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <ApperIcon name="Wheat" className="h-8 w-8 text-secondary" />
                <span className="ml-2 text-xl font-heading font-bold text-white">
                  FarmSync
                </span>
              </div>
              <nav className="mt-8 flex-1 px-2 space-y-1">
                {mainNavRoutes.map((route) => (
                  <NavLink
                    key={route.id}
                    to={route.path}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'bg-secondary text-white'
                          : 'text-gray-300 hover:bg-primary/80 hover:text-white'
                      }`
                    }
                  >
                    <ApperIcon
                      name={route.icon}
                      className="mr-3 h-5 w-5 flex-shrink-0"
                    />
                    {route.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={toggleMobileMenu}
            />
            
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative flex-1 flex flex-col max-w-xs w-full bg-primary z-50"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={toggleMobileMenu}
                >
                  <ApperIcon name="X" className="h-6 w-6 text-white" />
                </button>
              </div>
              
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <ApperIcon name="Wheat" className="h-8 w-8 text-secondary" />
                  <span className="ml-2 text-xl font-heading font-bold text-white">
                    FarmSync
                  </span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {mainNavRoutes.map((route) => (
                    <NavLink
                      key={route.id}
                      to={route.path}
                      onClick={toggleMobileMenu}
                      className={({ isActive }) =>
                        `group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors duration-200 ${
                          isActive
                            ? 'bg-secondary text-white'
                            : 'text-gray-300 hover:bg-primary/80 hover:text-white'
                        }`
                      }
                    >
                      <ApperIcon
                        name={route.icon}
                        className="mr-4 h-6 w-6 flex-shrink-0"
                      />
                      {route.label}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 z-40">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              type="button"
              className="border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={toggleMobileMenu}
            >
              <ApperIcon name="Menu" className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <ApperIcon name="Wheat" className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-heading font-bold text-primary">
                FarmSync
              </span>
            </div>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}