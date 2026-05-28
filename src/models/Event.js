export default class Event {
  #id;
  #url;
  #title;
  #content;
  #location;
  #date;
  #price;
  #duration;
  #type;
  #likes;

  constructor(url, title, content, location, date, price, duration, type) {
    this.#url = url;
    this.#title = title;
    this.#content = content;
    this.#location = location;
    this.#date = date;
    this.#price = price;
    this.#duration = duration;
    this.#type = type;
    this.#likes = 0;
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
  get duration() {
    return this.#duration;
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
  set duration(duration) {
    this.#duration = duration;
  }
  set type(type) {
    this.#type = type;
  }
  set likes(likes) {
    this.#likes = likes;
  }

  static fromDatabaseRow(row) {
    return new Event(
      row.url,
      row.title,
      row.content,
      row.location,
      row.date,
      row.price,
      row.duration,
      row.type,
    );
  }
}
