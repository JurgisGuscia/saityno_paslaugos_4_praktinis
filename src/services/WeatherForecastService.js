/**
 * Service responsible for fetching weather forecast data from the Open-Meteo API.
 */
export default class WeatherForecastService {
  /**
   * Fetches hourly weather forecast data for given coordinates.
   *
   * @param {number} latitude Location latitude.
   * @param {number} longitude Location longitude.
   * @returns {Promise<object|null>} Raw weather forecast data, or null if the request fails.
   */
  async getWeatherForecast(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,rain,cloud_cover,wind_speed_10m,wind_direction_10m&forecast_days=16`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  }
}
