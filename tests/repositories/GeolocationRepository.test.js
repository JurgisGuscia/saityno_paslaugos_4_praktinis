import { jest } from '@jest/globals';

const mockExecute = jest.fn();

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    execute: mockExecute,
  },
}));

const { default: GeolocationRepository } =
  await import('../../src/repositories/GeolocationRepository.js');

describe('GeolocationRepository', () => {
  let repository;

  const geolocationRow = {
    location: 'Vilnius',
    latitude: 54.700902,
    longitude: 25.251531,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new GeolocationRepository();
  });

  test('findByLocation returns Geolocation when location exists', async () => {
    // Tests SELECT by location and conversion from DB row to Geolocation model.
    mockExecute.mockResolvedValue([[geolocationRow]]);

    const result = await repository.findByLocation('Vilnius');

    expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('WHERE location = ?'), [
      'Vilnius',
    ]);

    expect(result).not.toBeNull();
    expect(result.location).toBe('Vilnius');
    expect(result.latitude).toBe(54.700902);
    expect(result.longitude).toBe(25.251531);
  });

  test('findByLocation returns null when location does not exist', async () => {
    // Tests null result when DB returns no rows for location.
    mockExecute.mockResolvedValue([[]]);

    const result = await repository.findByLocation('Unknown');

    expect(result).toBeNull();
  });

  test('save inserts geolocation and returns inserted ID', async () => {
    // Tests INSERT query and returned auto-increment insertId.
    const geolocation = {
      location: 'Vilnius',
      latitude: 54.700902,
      longitude: 25.251531,
    };
    mockExecute.mockResolvedValue([{ insertId: 7 }]);
    const result = await repository.save(geolocation);
    expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO geolocations'), [
      geolocation.location,
      geolocation.latitude,
      geolocation.longitude,
    ]);

    expect(result).toBe(7);
  });
});
