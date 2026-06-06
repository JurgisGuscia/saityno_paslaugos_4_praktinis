import db from '../config/db.js';
import Geolocation from '../models/Geolocation.js';
/**
 * Repository responsible for database operations related to geolocations.
 * It stores and retrieves cached coordinates for event locations.
 */
export default class GeolocationRepository {
  /**
   * Finds saved coordinates by location name.
   * Used before calling the external geocoding API, so repeated locations do not need another API request.
   *
   * @param {string} location Location name.
   * @returns {Promise<Geolocation|null>} Geolocation object if found, otherwise null.
   */
  async findByLocation(location) {
    const sql = `
      SELECT *
      FROM geolocations
      WHERE location = ?
      LIMIT 1
    `;

    const [rows] = await db.execute(sql, [location]);

    if (rows.length === 0) {
      return null;
    }

    return Geolocation.fromDatabaseRow(rows[0]);
  }
  /**
   * Saves new coordinates for a location.
   *
   * @param {Geolocation} geolocation Geolocation object to save.
   * @returns {Promise<number>} Inserted geolocation ID.
   */
  async save(geolocation) {
    const sql = `
      INSERT INTO geolocations (
        location,
        latitude,
        longitude
      )
      VALUES (?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      geolocation.location,
      geolocation.latitude,
      geolocation.longitude,
    ]);

    return result.insertId;
  }
}
