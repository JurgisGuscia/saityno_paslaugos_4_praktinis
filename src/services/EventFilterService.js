export default class EventFilterService {
  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }

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
