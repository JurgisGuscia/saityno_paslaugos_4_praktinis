import Geolocation from '../../src/models/Geolocation.js';

describe('Geolocation model', () => {
  test('creates Geolocation from database row', () => {
    const row = {
      location: 'Vilnius',
      latitude: 54.700902,
      longitude: 25.251531,
    };

    const geolocation = Geolocation.fromDatabaseRow(row);

    expect(geolocation.location).toBe('Vilnius');
    expect(geolocation.latitude).toBe(54.700902);
    expect(geolocation.longitude).toBe(25.251531);
  });
});
