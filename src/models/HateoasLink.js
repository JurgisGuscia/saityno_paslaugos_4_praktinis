/**
 * Represents a single HATEOAS link in an API response.
 * It tells the client what action is available, which HTTP method to use,
 * and where the action can be performed.
 */
export default class HateoasLink {
  #href;
  #method;
  #description;
  /**
   * Creates a HATEOAS link object.
   *
   * @param {string} href URL of the related resource or action.
   * @param {string} method HTTP method used for this action.
   * @param {string} description Short explanation of what the link does.
   */
  constructor(href, method, description) {
    this.#href = href;
    this.#method = method;
    this.#description = description;
  }

  get href() {
    return this.#href;
  }

  get method() {
    return this.#method;
  }

  get description() {
    return this.#description;
  }

  set href(href) {
    this.#href = href;
  }

  set method(method) {
    this.#method = method;
  }

  set description(description) {
    this.#description = description;
  }
  /**
   * Converts private fields into a plain object.
   * This allows Express to include the link correctly in JSON responses.
   *
   * @returns {object} JSON-safe HATEOAS link.
   */
  toJSON() {
    return {
      href: this.#href,
      method: this.#method,
      description: this.#description,
    };
  }
}
