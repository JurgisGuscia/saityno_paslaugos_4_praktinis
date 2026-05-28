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

  async findAll() {
    const sql = `
      SELECT *
      FROM events
      ORDER BY date ASC, time ASC
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
        duration,
        type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(sql, [
      event.url,
      event.title,
      event.content,
      event.location,
      event.date,
      event.price,
      event.duration,
      event.type,
    ]);

    return result.insertId;
  }
}
