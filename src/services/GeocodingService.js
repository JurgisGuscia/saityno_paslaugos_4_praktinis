import Geolocation from '../models/Geolocation.js';
export default class GeocodingService {
  #geolocationRepository;
  constructor(geolocationRepository) {
    this.#geolocationRepository = geolocationRepository;
  }

  async geocodeLocation(location) {
    const existingGeolocation = await this.#geolocationRepository.findByLocation(location);
    if (existingGeolocation) {
      return existingGeolocation;
    }
    try {
      const response = await fetch(
        `http://api.positionstack.com/v1/forward?access_key=${process.env.GEOCODING_API_KEY}&query=${encodeURIComponent(location)}`,
      );
      const data = await response.json();
      const firstResult = data.data?.[0];
      if (!firstResult) {
        return null;
      }
      const geolocation = new Geolocation(location, firstResult.latitude, firstResult.longitude);
      await this.#geolocationRepository.save(geolocation);
      return geolocation;
    } catch (error) {
      console.error('Error geocoding location:', error);
      return null;
    }
  }
}
