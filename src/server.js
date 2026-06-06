import dotenv from 'dotenv';
import app from './app.js';
import ScraperService from './services/EventScraperService.js';
import EventFilterService from './services/EventFilterService.js';
import EventRepository from './repositories/EventRepository.js';
import GeocodingService from './services/GeocodingService.js';
import GeolocationRepository from './repositories/GeolocationRepository.js';
dotenv.config();

const PORT = process.env.PORT || 3000;
const ScrapeInterval = 600000; // 10 minutes
const EventScraper = new ScraperService();
const EventRepo = new EventRepository();
const EventFilter = new EventFilterService(EventRepo);
const geolocationRepository = new GeolocationRepository();
const Geocoder = new GeocodingService(geolocationRepository);
/**
 * Starts the Express server.
 * When the server starts, scraping is run once immediately,
 * then repeated every 10 minutes.
 */
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await runScraping();
  setInterval(() => {
    runScraping();
  }, ScrapeInterval);
});
/**
 * Runs one scraping cycle.
 * It scrapes event URLs, filters out events that already exist in the database,
 * saves new event details, and stores location coordinates if they are missing.
 *
 * @returns {Promise<void>}
 */
async function runScraping() {
  const eventUrlList = await EventScraper.scrapeEvents('https://www.kaveikti.lt');
  const newEvents = await EventFilter.filterNewEvents(eventUrlList);
  console.log('================================');
  console.log('New events found:');
  console.log(newEvents);
  for (const url of newEvents) {
    const eventDetails = await EventScraper.scrapeFullEventDetails(url);
    if (eventDetails) {
      await EventRepo.save(eventDetails);
      await Geocoder.geocodeLocation(eventDetails.location);
    }
  }
  console.log('New event scraping finished.');
  console.log('================================');
}
