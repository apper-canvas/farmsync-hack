import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ 
              rotate: [0, -10, 10, -5, 5, 0],
              scale: [1, 1.1, 1] 
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3 
            }}
            className="mb-8"
          >
            <ApperIcon name="Wheat" className="h-24 w-24 text-primary mx-auto" />
          </motion.div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Looks like this field hasn't been planted yet. 
            Let's get you back to your farm dashboard.
          </p>
          
          <div className="space-y-4">
            <Button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 space-x-2">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2"
              >
                <ApperIcon name="Home" className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
            </Button>
            
            <div className="flex items-center justify-center space-x-4 text-sm">
              <Link 
                to="/farms" 
                className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
              >
                <ApperIcon name="MapPin" className="h-4 w-4" />
                <span>View Farms</span>
              </Link>
              <span className="text-gray-300">•</span>
              <Link 
                to="/crops" 
                className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
              >
                <ApperIcon name="Wheat" className="h-4 w-4" />
                <span>View Crops</span>
              </Link>
              <span className="text-gray-300">•</span>
              <Link 
                to="/tasks" 
                className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
              >
                <ApperIcon name="CheckSquare" className="h-4 w-4" />
                <span>View Tasks</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}