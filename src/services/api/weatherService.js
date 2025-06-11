// Mock weather data - replace with actual weather API calls
const mockWeatherConditions = [
  { condition: 'sunny', temperature: 75, humidity: 45 },
  { condition: 'cloudy', temperature: 68, humidity: 60 },
  { condition: 'rainy', temperature: 62, humidity: 85 },
  { condition: 'stormy', temperature: 58, humidity: 90 }
];

const weatherService = {
  // Get current weather
  async getCurrentWeather(location = null) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Simulate random weather condition
      const randomWeather = mockWeatherConditions[
        Math.floor(Math.random() * mockWeatherConditions.length)
      ];
      
      const currentWeather = {
        ...randomWeather,
        location: location || 'Current Location',
        timestamp: new Date().toISOString(),
        windSpeed: Math.round(Math.random() * 15 + 5), // 5-20 mph
        pressure: Math.round(Math.random() * 5 + 29.5), // 29.5-34.5 inHg
        visibility: Math.round(Math.random() * 5 + 5), // 5-10 miles
        uvIndex: Math.round(Math.random() * 10 + 1) // 1-11
      };
      
      return Promise.resolve(currentWeather);
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw new Error('Failed to fetch current weather');
    }
  },

  // Get weather forecast
  async getForecast(days = 5, location = null) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const forecast = [];
      const baseDate = new Date();
      
      for (let i = 0; i < days; i++) {
        const forecastDate = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000);
        const randomWeather = mockWeatherConditions[
          Math.floor(Math.random() * mockWeatherConditions.length)
        ];
        
        forecast.push({
          date: forecastDate.toISOString(),
          ...randomWeather,
          highTemp: randomWeather.temperature + Math.round(Math.random() * 10),
          lowTemp: randomWeather.temperature - Math.round(Math.random() * 15),
          chanceOfRain: Math.round(Math.random() * 100),
          windSpeed: Math.round(Math.random() * 20 + 5)
        });
      }
      
      return Promise.resolve({
        location: location || 'Current Location',
        forecast: forecast
      });
    } catch (error) {
      console.error('Error fetching weather forecast:', error);
      throw new Error('Failed to fetch weather forecast');
    }
  },

  // Get weather alerts
  async getAlerts(location = null) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Simulate occasional weather alerts
      const alerts = [];
      if (Math.random() < 0.3) { // 30% chance of alert
        const alertTypes = [
          { type: 'frost', severity: 'warning', message: 'Frost warning tonight - protect sensitive plants' },
          { type: 'wind', severity: 'advisory', message: 'High wind advisory - secure equipment' },
          { type: 'rain', severity: 'watch', message: 'Heavy rain expected - check drainage' },
          { type: 'heat', severity: 'warning', message: 'Excessive heat warning - increase watering frequency' }
        ];
        
        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        alerts.push({
          id: Date.now().toString(),
          ...randomAlert,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          location: location || 'Current Location'
        });
      }
      
      return Promise.resolve(alerts);
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      throw new Error('Failed to fetch weather alerts');
    }
  },

  // Get historical weather data
  async getHistorical(startDate, endDate, location = null) {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const historicalData = [];
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const randomWeather = mockWeatherConditions[
          Math.floor(Math.random() * mockWeatherConditions.length)
        ];
        
        historicalData.push({
          date: new Date(date).toISOString(),
          ...randomWeather,
          highTemp: randomWeather.temperature + Math.round(Math.random() * 10),
          lowTemp: randomWeather.temperature - Math.round(Math.random() * 15),
          precipitation: randomWeather.condition === 'rainy' ? Math.random() * 0.5 : 0,
          windSpeed: Math.round(Math.random() * 25 + 5)
        });
      }
      
      return Promise.resolve({
        location: location || 'Current Location',
        period: { startDate, endDate },
        data: historicalData
      });
    } catch (error) {
      console.error('Error fetching historical weather:', error);
      throw new Error('Failed to fetch historical weather data');
    }
  }
};

export default weatherService;