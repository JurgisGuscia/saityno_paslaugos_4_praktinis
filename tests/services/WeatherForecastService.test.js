import { jest } from '@jest/globals';
import WeatherForecastService from '../../src/services/WeatherForecastService.js';

describe('WeatherForecastService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    service = new WeatherForecastService();
  });

  test('returns weather data when API request succeeds', async () => {
    // Tests successful fetch and JSON parsing from Open-Meteo API.
    const weatherData = {
      latitude: 54.7,
      longitude: 25.25,
      hourly: {
        time: ['2026-06-01T18:00'],
        temperature_2m: [20],
      },
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(weatherData),
    });

    const result = await service.getWeatherForecast(54.7, 25.25);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.open-meteo.com/v1/forecast?latitude=54.7&longitude=25.25&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,rain,cloud_cover,wind_speed_10m,wind_direction_10m&forecast_days=16',
    );

    expect(result).toEqual(weatherData);
  });

  test('returns null when API response is not successful', async () => {
    // Tests handling of non-OK HTTP responses from weather API.
    global.fetch.mockResolvedValue({
      ok: false,
      json: jest.fn(),
    });

    const result = await service.getWeatherForecast(54.7, 25.25);

    expect(result).toBeNull();
  });

  test('returns null when fetch throws an error', async () => {
    // Tests handling of network/API failure.
    global.fetch.mockRejectedValue(new Error('Network error'));

    const result = await service.getWeatherForecast(54.7, 25.25);

    expect(result).toBeNull();
  });
});
