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
    WHERE location = ?
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
    WHERE type = ?
    ORDER BY date ASC
  `;

    const [rows] = await db.execute(sql, [type]);

    return rows.map((row) => Event.fromDatabaseRow(row));
  }

  async findAll() {
    const sql = `
      SELECT *
      FROM events
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
    console.log({
      url: event.url,
      title: event.title,
      content: event.content,
      location: event.location,
      date: event.date,
      price: event.price,
      type: event.type,
    });
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
}
