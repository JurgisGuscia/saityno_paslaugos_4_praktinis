export default class HateoasLink {
  #href;
  #method;
  #description;

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

  toJSON() {
    return {
      href: this.#href,
      method: this.#method,
      description: this.#description,
    };
  }
}
