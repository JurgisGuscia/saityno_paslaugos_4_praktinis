export default class EventFilterService {
  constructor(eventRepository) {
    this.eventRepository = eventRepository;
  }
  //filter events that are not in db yet
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
