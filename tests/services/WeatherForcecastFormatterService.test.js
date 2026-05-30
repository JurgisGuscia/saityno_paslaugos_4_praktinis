import WeatherForecastFormatterService from '../../src/services/WeatherForcecastFormatterService.js';

describe('WeatherForecastFormatterService', () => {
  let service;

  beforeEach(() => {
    service = new WeatherForecastFormatterService();
  });

  function createWeatherForecast() {
    return {
      latitude: 54.7,
      longitude: 25.25,
      hourly_units: {
        temperature_2m: '°C',
        relative_humidity_2m: '%',
        apparent_temperature: '°C',
        rain: 'mm',
        cloud_cover: '%',
        wind_speed_10m: 'km/h',
        wind_direction_10m: '°',
      },
      hourly: {
        time: [
          '2026-06-01T00:00',
          '2026-06-01T01:00',
          '2026-06-01T02:00',
          '2026-06-02T00:00',
          '2026-06-02T01:00',
        ],
        temperature_2m: [10, 11, 12, 20, 21],
        relative_humidity_2m: [70, 71, 72, 80, 81],
        apparent_temperature: [9, 10, 11, 19, 20],
        rain: [0, 0.1, 0.2, 1, 1.1],
        cloud_cover: [10, 20, 30, 40, 50],
        wind_speed_10m: [5, 6, 7, 8, 9],
        wind_direction_10m: [100, 110, 120, 130, 140],
      },
    };
  }

  test('returns error object when weather forecast is missing', () => {
    // Tests missing weather API data handling.
    const result = service.format(null, new Date('2026-06-01T00:00:00'));

    expect(result).toEqual({
      error: 'Weather data failed to load',
    });
  });

  test('returns error object when event date is missing', () => {
    // Tests missing event date handling.
    const result = service.format(createWeatherForecast(), null);

    expect(result).toEqual({
      error: 'Event date is missing',
    });
  });

  test('returns formatted forecast object with location and unit metadata', () => {
    // Tests that formatter keeps latitude, longitude, and weather units.
    const result = service.format(createWeatherForecast(), new Date('2026-06-01T12:00:00'));

    expect(result.latitude).toBe(54.7);
    expect(result.longitude).toBe(25.25);
    expect(result.Temperature_units).toBe('°C');
    expect(result.Relative_humidity_units).toBe('%');
    expect(result.Rain_units).toBe('mm');
    expect(result.Wind_speed_units).toBe('km/h');
  });

  test('includes forecast entries for the event date', () => {
    // Tests that only hourly records matching the event date are formatted.
    const result = service.format(createWeatherForecast(), new Date('2026-06-01T12:00:00'));

    expect(result.Weather_forecast).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Time:2026-06-01T00:00'),
        expect.stringContaining('Time:2026-06-01T01:00'),
        expect.stringContaining('Time:2026-06-01T02:00'),
      ]),
    );
  });
});
