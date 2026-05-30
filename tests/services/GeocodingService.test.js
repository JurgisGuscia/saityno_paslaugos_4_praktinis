import { jest } from '@jest/globals';
import GeocodingService from '../../src/services/GeocodingService.js';

describe('GeocodingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    process.env.GEOCODING_API_KEY = 'test-api-key';
  });

  test('returns existing geolocation when location already exists in database', async () => {
    // Tests that API is not called when geolocation is already cached in DB.
    const existingGeolocation = {
      location: 'Vilnius',
      latitude: 54.700902,
      longitude: 25.251531,
    };

    const mockGeolocationRepository = {
      findByLocation: jest.fn().mockResolvedValue(existingGeolocation),
      save: jest.fn(),
    };

    const service = new GeocodingService(mockGeolocationRepository);

    const result = await service.geocodeLocation('Vilnius');

    expect(mockGeolocationRepository.findByLocation).toHaveBeenCalledWith('Vilnius');
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockGeolocationRepository.save).not.toHaveBeenCalled();
    expect(result).toBe(existingGeolocation);
  });

  test('fetches geolocation, saves it, and returns it when location does not exist in database', async () => {
    // Tests API call and save when geolocation is not found in DB.
    const mockGeolocationRepository = {
      findByLocation: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(1),
    };

    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: [
          {
            latitude: 54.700902,
            longitude: 25.251531,
          },
        ],
      }),
    });

    const service = new GeocodingService(mockGeolocationRepository);

    const result = await service.geocodeLocation('Vilnius');

    expect(mockGeolocationRepository.findByLocation).toHaveBeenCalledWith('Vilnius');
    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.positionstack.com/v1/forward?access_key=test-api-key&query=Vilnius',
    );
    expect(mockGeolocationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        location: 'Vilnius',
        latitude: 54.700902,
        longitude: 25.251531,
      }),
    );

    expect(result.location).toBe('Vilnius');
    expect(result.latitude).toBe(54.700902);
    expect(result.longitude).toBe(25.251531);
  });

  test('encodes location before sending it to geocoding API', async () => {
    // Tests that spaces and special characters in location are URL-encoded.
    const mockGeolocationRepository = {
      findByLocation: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(1),
    };

    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: [
          {
            latitude: 54.8985,
            longitude: 23.9036,
          },
        ],
      }),
    });

    const service = new GeocodingService(mockGeolocationRepository);

    await service.geocodeLocation('Kaunas City');

    expect(global.fetch).toHaveBeenCalledWith(
      'http://api.positionstack.com/v1/forward?access_key=test-api-key&query=Kaunas%20City',
    );
  });

  test('returns null when API response has no results', async () => {
    // Tests null result when geocoding API returns empty data array.
    const mockGeolocationRepository = {
      findByLocation: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };

    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({
        data: [],
      }),
    });

    const service = new GeocodingService(mockGeolocationRepository);

    const result = await service.geocodeLocation('Unknown location');

    expect(result).toBeNull();
    expect(mockGeolocationRepository.save).not.toHaveBeenCalled();
  });

  test('returns null when API request fails', async () => {
    // Tests error handling when fetch throws an error.
    const mockGeolocationRepository = {
      findByLocation: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };

    global.fetch.mockRejectedValue(new Error('API error'));

    const service = new GeocodingService(mockGeolocationRepository);

    const result = await service.geocodeLocation('Vilnius');

    expect(result).toBeNull();
    expect(mockGeolocationRepository.save).not.toHaveBeenCalled();
  });
});
