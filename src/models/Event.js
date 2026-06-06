/**
 * Represents one event record from the events table.
 * This model is used as a DTO between the database layer and API responses.
 */
export default class Event {
  #id;
  #url;
  #title;
  #content;
  #location;
  #date;
  #price;
  #type;
  #likes;
  /**
   * Creates an Event object.
   *
   * @param {number|null} id Event ID from the database. Null before the event is inserted.
   * @param {string} url Original event URL.
   * @param {string} title Event title.
   * @param {string} content Event description/content.
   * @param {string} location Event location/city.
   * @param {Date|string} date Event start date.
   * @param {number|string} price Event price.
   * @param {string} type Event type/category.
   * @param {number} likes Number of likes. Defaults to 0.
   */
  constructor(id = null, url, title, content, location, date, price, type, likes) {
    this.#id = id;
    this.#url = url;
    this.#title = title;
    this.#content = content;
    this.#location = location;
    this.#date = date;
    this.#price = price;
    this.#type = type;
    this.#likes = likes || 0;
  }

  get id() {
    return this.#id;
  }
  get url() {
    return this.#url;
  }
  get title() {
    return this.#title;
  }
  get content() {
    return this.#content;
  }
  get location() {
    return this.#location;
  }
  get date() {
    return this.#date;
  }
  get price() {
    return this.#price;
  }
  get type() {
    return this.#type;
  }
  get likes() {
    return this.#likes;
  }

  set id(id) {
    this.#id = id;
  }
  set url(url) {
    this.#url = url;
  }
  set title(title) {
    this.#title = title;
  }
  set content(content) {
    this.#content = content;
  }
  set location(location) {
    this.#location = location;
  }
  set date(date) {
    this.#date = date;
  }
  set price(price) {
    this.#price = price;
  }
  set type(type) {
    this.#type = type;
  }
  set likes(likes) {
    this.#likes = likes;
  }
  /**
   * Creates an Event object from a database row.
   * Converts raw SQL result data into the Event model.
   *
   * @param {object} row Row returned from the events table.
   * @returns {Event} Event model instance.
   */
  static fromDatabaseRow(row) {
    return new Event(
      row.id,
      row.url,
      row.title,
      row.content,
      row.location,
      row.date,
      row.price,
      row.type,
      row.likes,
    );
  }
  /**
   * Converts private class fields into a plain object.
   * Express uses this when sending the model as JSON.
   *
   * @returns {object} JSON-safe event data.
   */
  toJSON() {
    return {
      id: this.#id,
      url: this.#url,
      title: this.#title,
      content: this.#content,
      location: this.#location,
      date: this.#date,
      price: this.#price,
      type: this.#type,
      likes: this.#likes,
    };
  }
}
