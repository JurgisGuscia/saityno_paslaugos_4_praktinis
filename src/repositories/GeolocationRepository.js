import db from '../config/db.js';
import Geolocation from '../models/Geolocation.js';

export default class GeolocationRepository {
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
