export default class Geolocation {
  #id;
  #location;
  #latitude;
  #longitude;

  constructor(location, latitude, longitude) {
    this.#location = location;
    this.#latitude = latitude;
    this.#longitude = longitude;
  }

  get id() {
    return this.#id;
  }

  get location() {
    return this.#location;
  }

  get latitude() {
    return this.#latitude;
  }

  get longitude() {
    return this.#longitude;
  }

  set id(id) {
    this.#id = id;
  }

  set location(location) {
    this.#location = location;
  }

  set latitude(latitude) {
    this.#latitude = latitude;
  }

  set longitude(longitude) {
    this.#longitude = longitude;
  }

  static fromDatabaseRow(row) {
    return new Geolocation(row.location, row.latitude, row.longitude);
  }
}
