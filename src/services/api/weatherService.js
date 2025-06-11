import weatherData from '../mockData/weather.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

class WeatherService {
  constructor() {
    this.currentWeather = weatherData.current
    this.forecast = weatherData.forecast
  }

  async getCurrentWeather() {
    await delay(250)
    return { ...this.currentWeather }
  }

  async getForecast() {
    await delay(300)
    return [...this.forecast]
  }

  async getWeatherAlerts() {
    await delay(200)
    // Generate dynamic alerts based on current conditions
    const alerts = []
    
    if (this.currentWeather.condition === 'stormy') {
      alerts.push({
        id: 'storm-warning',
        type: 'warning',
        title: 'Storm Warning',
        message: 'Thunderstorms expected. Secure equipment and avoid fieldwork.',
        validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
      })
    }
    
    if (this.currentWeather.temperature > 90) {
      alerts.push({
        id: 'heat-advisory',
        type: 'warning',
        title: 'Heat Advisory',
        message: 'Extreme heat conditions. Increase watering frequency and protect livestock.',
        validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()
      })
    }
    
    return alerts
  }
}

export default new WeatherService()