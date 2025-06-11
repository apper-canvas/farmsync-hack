import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from '../components/ApperIcon'
import { weatherService } from '../services'

export default function Weather() {
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadWeatherData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [current, forecastData] = await Promise.all([
          weatherService.getCurrentWeather(),
          weatherService.getForecast()
        ])
        setCurrentWeather(current)
        setForecast(forecastData)
      } catch (err) {
        setError(err.message || 'Failed to load weather data')
        toast.error('Failed to load weather data')
      } finally {
        setLoading(false)
      }
    }
    loadWeatherData()
  }, [])

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return 'Sun'
      case 'cloudy': return 'Cloud'
      case 'rainy': return 'CloudRain'
      case 'stormy': return 'CloudLightning'
      case 'snowy': return 'CloudSnow'
      case 'windy': return 'Wind'
      default: return 'Cloud'
    }
  }

  const getWeatherGradient = (condition) => {
    switch (condition) {
      case 'sunny':
        return 'from-yellow-400 to-orange-500'
      case 'cloudy':
        return 'from-gray-400 to-gray-600'
      case 'rainy':
        return 'from-blue-500 to-gray-600'
      case 'stormy':
        return 'from-gray-700 to-gray-900'
      case 'snowy':
        return 'from-blue-200 to-gray-400'
      default:
        return 'from-blue-400 to-blue-600'
    }
  }

  const getFarmingAdvice = (weather) => {
    const advice = []
    
    if (weather.condition === 'rainy') {
      advice.push({
        icon: 'Droplets',
        text: 'Good day for indoor tasks. Avoid heavy fieldwork.',
        type: 'info'
      })
    } else if (weather.condition === 'sunny' && weather.temperature > 85) {
      advice.push({
        icon: 'Sun',
        text: 'Hot day ahead. Water crops early morning or evening.',
        type: 'warning'
      })
    } else if (weather.condition === 'sunny') {
      advice.push({
        icon: 'Sun',
        text: 'Perfect weather for outdoor farm work!',
        type: 'success'
      })
    }

    if (weather.humidity > 80) {
      advice.push({
        icon: 'Droplets',
        text: 'High humidity may increase disease risk. Monitor crops.',
        type: 'warning'
      })
    }

    if (weather.windSpeed > 15) {
      advice.push({
        icon: 'Wind',
        text: 'Windy conditions. Secure equipment and check plant supports.',
        type: 'warning'
      })
    }

    return advice
  }

  const getAdviceColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        </div>
        
        {/* Current Weather Skeleton */}
        <div className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
        
        {/* Forecast Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="CloudOff" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Weather data unavailable</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">Weather</h1>
        <p className="text-gray-600 mt-1">Current conditions and 7-day farming forecast</p>
      </div>

      {/* Current Weather */}
      {currentWeather && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg bg-gradient-to-r ${getWeatherGradient(currentWeather.condition)} p-8 text-white`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <ApperIcon name="MapPin" className="h-5 w-5" />
                <span className="text-lg font-medium">{currentWeather.location}</span>
              </div>
              <div className="flex items-center space-x-6">
                <div>
                  <p className="text-5xl font-bold mb-2">{currentWeather.temperature}°F</p>
                  <p className="text-xl text-white/90 capitalize">{currentWeather.condition}</p>
                  <p className="text-white/80">Feels like {currentWeather.feelsLike}°F</p>
                </div>
                <div className="p-4 bg-white/20 rounded-full">
                  <ApperIcon 
                    name={getWeatherIcon(currentWeather.condition)} 
                    className="h-16 w-16"
                  />
                </div>
              </div>
            </div>
            
            <div className="text-right space-y-4">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-white/80">Humidity</p>
                  <p className="text-2xl font-semibold">{currentWeather.humidity}%</p>
                </div>
                <div>
                  <p className="text-white/80">Wind</p>
                  <p className="text-2xl font-semibold">{currentWeather.windSpeed} mph</p>
                </div>
                <div>
                  <p className="text-white/80">Pressure</p>
                  <p className="text-2xl font-semibold">{currentWeather.pressure}"</p>
                </div>
                <div>
                  <p className="text-white/80">UV Index</p>
                  <p className="text-2xl font-semibold">{currentWeather.uvIndex}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Farming Advice */}
      {currentWeather && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4 flex items-center">
            <ApperIcon name="Lightbulb" className="h-5 w-5 mr-2 text-primary" />
            Farming Recommendations
          </h2>
          
          <div className="space-y-3">
            {getFarmingAdvice(currentWeather).map((advice, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${getAdviceColor(advice.type)}`}
              >
                <ApperIcon name={advice.icon} className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{advice.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 7-Day Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-heading font-semibold text-gray-900 mb-4 flex items-center">
          <ApperIcon name="Calendar" className="h-5 w-5 mr-2 text-primary" />
          7-Day Forecast
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {forecast.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200"
            >
              <p className="text-sm font-medium text-gray-600 mb-2">
                {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
              </p>
              <p className="text-xs text-gray-500 mb-3">
                {new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </p>
              
              <div className="p-3 bg-white rounded-full mb-3 mx-auto w-fit">
                <ApperIcon 
                  name={getWeatherIcon(day.condition)}
                  className="h-8 w-8 text-blue-600"
                />
              </div>
              
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-900">
                  {day.high}°
                </p>
                <p className="text-sm text-gray-500">
                  {day.low}°
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {day.condition}
                </p>
                {day.precipitation > 0 && (
                  <div className="flex items-center justify-center space-x-1 text-xs text-blue-600">
                    <ApperIcon name="Droplets" className="h-3 w-3" />
                    <span>{day.precipitation}%</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Weather Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's High</p>
              <p className="text-2xl font-bold text-gray-900">
                {forecast.length > 0 ? `${forecast[0].high}°F` : '--'}
              </p>
            </div>
            <div className="p-3 bg-red-50 rounded-full">
              <ApperIcon name="TrendingUp" className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Low</p>
              <p className="text-2xl font-bold text-gray-900">
                {forecast.length > 0 ? `${forecast[0].low}°F` : '--'}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <ApperIcon name="TrendingDown" className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rain Chance</p>
              <p className="text-2xl font-bold text-gray-900">
                {forecast.length > 0 ? `${forecast[0].precipitation}%` : '--'}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <ApperIcon name="Droplets" className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}