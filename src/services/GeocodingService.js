import Geolocation from '../models/Geolocation.js';
/**
 * Service responsible for converting location names into coordinates.
 * It first checks the local database cache and only calls the external API
 * if coordinates for the location are not already saved.
 */
export default class GeocodingService {
  #geolocationRepository;
  /**
   * Creates the geocoding service.
   *
   * @param {GeolocationRepository} geolocationRepository Repository used to read and save geolocations.
   */
  constructor(geolocationRepository) {
    this.#geolocationRepository = geolocationRepository;
  }
  /**
   * Gets latitude and longitude for a given location.
   * Existing coordinates are reused from the database. New coordinates are fetched
   * from the Positionstack API and then saved for future requests.
   *
   * @param {string} location Location name.
   * @returns {Promise<Geolocation|null>} Geolocation object if found, otherwise null.
   */
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
