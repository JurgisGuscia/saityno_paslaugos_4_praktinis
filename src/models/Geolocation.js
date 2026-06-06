/**
 * Represents one geolocation record from the geolocations table.
 * Used to store and reuse coordinates for event locations.
 */
export default class Geolocation {
  #id;
  #location;
  #latitude;
  #longitude;
  /**
   * Creates a geolocation object.
   *
   * @param {string} location Location name.
   * @param {number} latitude Location latitude.
   * @param {number} longitude Location longitude.
   */
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
  /**
   * Creates a Geolocation object from a database row.
   *
   * @param {object} row Row returned from the geolocations table.
   * @returns {Geolocation} Geolocation model instance.
   */
  static fromDatabaseRow(row) {
    return new Geolocation(row.location, row.latitude, row.longitude);
  }
}
