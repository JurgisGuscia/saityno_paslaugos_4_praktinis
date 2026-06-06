/**
 * Service responsible for filtering scraped event URLs.
 * It checks which events are already saved in the database
 * and returns only URLs for new events.
 */
export default class EventFilterService {
  /**
   * Creates the service with an event repository dependency.
   *
   * @param {EventRepository} eventRepository Repository used to search existing events.
   */
  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }
  /**
   * Filters out event URLs that already exist in the database.
   *
   * @param {string[]} urls List of scraped event URLs.
   * @returns {Promise<string[]>} URLs that are not saved in the database yet.
   */
  async filterNewEvents(urls) {
    const newUrls = [];
    for (const url of urls) {
      const existingEvent = await this.eventRepository.findByUrl(url);
      if (!existingEvent) {
        newUrls.push(url);
      }
    }
    return newUrls;
  }
}
