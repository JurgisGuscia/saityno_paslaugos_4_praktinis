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

  async increaseLikesById(id) {
    const sql = `
    UPDATE events
    SET likes = likes + 1
    WHERE id = ?
  `;
    const [result] = await db.execute(sql, [id]);
    return result.affectedRows > 0;
  }
}
