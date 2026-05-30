import db from '../config/db.js';
import Event from '../models/Event.js';

export default class EventRepository {
  async findByUrl(eventUrl) {
    const sql = `
      SELECT *
      FROM events
      WHERE url = ?
      LIMIT 1
    `;

    const [rows] = await db.execute(sql, [eventUrl]);

    if (rows.length === 0) {
      return null;
    }

    return Event.fromDatabaseRow(rows[0]);
  }

  async findByLocation(location) {
    const sql = `
    SELECT *
    FROM events
    WHERE date >= CURDATE()
    AND location = ?
    ORDER BY date ASC
  `;

    const [rows] = await db.execute(sql, [location]);

    return rows.map((row) => Event.fromDatabaseRow(row));
  }

  async findById(id) {
    const sql = `
    SELECT *
    FROM events
    WHERE id = ?
    LIMIT 1
  `;

    const [rows] = await db.execute(sql, [id]);

    if (rows.length === 0) {
      return null;
    }

    return Event.fromDatabaseRow(rows[0]);
  }

  async findByType(type) {
    const sql = `
    SELECT *
    FROM events
    WHERE date >= CURDATE()
    AND type = ?
    ORDER BY date ASC
  `;

    const [rows] = await db.execute(sql, [type]);

    return rows.map((row) => Event.fromDatabaseRow(row));
  }

  async findAll() {
    const sql = `
      SELECT *
      FROM events
      WHERE date >= CURDATE()
      ORDER BY date DESC
    `;

    const [rows] = await db.execute(sql);

    return rows.map((row) => Event.fromDatabaseRow(row));
  }

  async save(event) {
    const sql = `
      INSERT INTO events (
        url,
        title,
        content,
        location,
        date,
        price,
        type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      event.url,
      event.title,
      event.content,
      event.location,
      event.date,
      event.price,
      event.type,
    ]);

    return result.insertId;
  }

  async increaseLikesById(id) {
    const sql = `
    UPDATE events
    SET likes = likes + 1
    WHERE id = ?
  `;
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows > 0;
  }

  async findUniqueLocations() {
    const sql = `
    SELECT DISTINCT location
    FROM events
    WHERE location IS NOT NULL
      AND date >= CURDATE()
    ORDER BY location ASC
  `;

    const [rows] = await db.execute(sql);

    return rows.map((row) => row.location);
  }

  async findUniqueTypes() {
    const sql = `
    SELECT DISTINCT type
    FROM events
    WHERE type IS NOT NULL
     AND date >= CURDATE()
    ORDER BY type ASC
  `;

    const [rows] = await db.execute(sql);

    return rows.map((row) => row.type);
  }
}
