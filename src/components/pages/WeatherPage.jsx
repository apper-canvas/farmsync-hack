import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import PageHeader from '@/components/organisms/PageHeader';
import CurrentWeatherDisplay from '@/components/organisms/CurrentWeatherDisplay';
import FarmingAdviceList from '@/components/organisms/FarmingAdviceList';
import ForecastDisplay from '@/components/organisms/ForecastDisplay';
import WeatherStatsGrid from '@/components/organisms/WeatherStatsGrid';
import { weatherService } from '@/services';

export default function WeatherPage() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWeatherData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [current, forecastData] = await Promise.all([
          weatherService.getCurrentWeather(),
          weatherService.getForecast()
        ]);
        setCurrentWeather(current);
        setForecast(forecastData);
      } catch (err) {
        setError(err.message || 'Failed to load weather data');
        toast.error('Failed to load weather data');
      } finally {
        setLoading(false);
      }
    };
    loadWeatherData();
  }, []);

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return 'Sun';
      case 'cloudy': return 'Cloud';
      case 'rainy': return 'CloudRain';
      case 'stormy': return 'CloudLightning';
      case 'snowy': return 'CloudSnow';
      case 'windy': return 'Wind';
      default: return 'Cloud';
    }
  };

  const getWeatherGradient = (condition) => {
    switch (condition) {
      case 'sunny':
        return 'from-yellow-400 to-orange-500';
      case 'cloudy':
        return 'from-gray-400 to-gray-600';
      case 'rainy':
        return 'from-blue-500 to-gray-600';
      case 'stormy':
        return 'from-gray-700 to-gray-900';
      case 'snowy':
        return 'from-blue-200 to-gray-400';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  const getFarmingAdvice = (weather) => {
    const advice = [];
    
    if (weather.condition === 'rainy') {
      advice.push({
        icon: 'Droplets',
        text: 'Good day for indoor tasks. Avoid heavy fieldwork.',
        type: 'info'
      });
    } else if (weather.condition === 'sunny' && weather.temperature > 85) {
      advice.push({
        icon: 'Sun',
        text: 'Hot day ahead. Water crops early morning or evening.',
        type: 'warning'
      });
    } else if (weather.condition === 'sunny') {
      advice.push({
        icon: 'Sun',
        text: 'Perfect weather for outdoor farm work!',
        type: 'success'
      });
    }

    if (weather.humidity > 80) {
      advice.push({
        icon: 'Droplets',
        text: 'High humidity may increase disease risk. Monitor crops.',
        type: 'warning'
      });
    }

    if (weather.windSpeed > 15) {
      advice.push({
        icon: 'Wind',
        text: 'Windy conditions. Secure equipment and check plant supports.',
        type: 'warning'
      });
    }

    return advice;
  };

  const getAdviceColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

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
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <ApperIcon name="CloudOff" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Weather data unavailable</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-full overflow-hidden">
      <PageHeader 
        title="Weather" 
        description="Current conditions and 7-day farming forecast" 
      />

      <CurrentWeatherDisplay 
        weather={currentWeather} 
        getWeatherIcon={getWeatherIcon} 
        getWeatherGradient={getWeatherGradient} 
      />

      <FarmingAdviceList 
        weather={currentWeather} 
        getFarmingAdvice={getFarmingAdvice} 
        getAdviceColor={getAdviceColor} 
      />

      <ForecastDisplay 
        forecast={forecast} 
        getWeatherIcon={getWeatherIcon} 
      />

      <WeatherStatsGrid forecast={forecast} />
    </div>
  );
}