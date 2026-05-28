import dotenv from 'dotenv';
import app from './app.js';
import ScraperService from './services/EventScraperService.js';
import EventFilterService from './services/EventFilterService.js';
import EventRepository from './repositories/EventRepository.js';
import db from './config/db.js';
dotenv.config();

const PORT = process.env.PORT || 3000;
const ScrapeInterval = 600000; // 10 minutes
const EventScraper = new ScraperService();
const EventRepo = new EventRepository();
const EventFilter = new EventFilterService(EventRepo);

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  runScraping();
  setInterval(() => {
    runScraping();
  }, ScrapeInterval);
});

async function runScraping() {
  const eventUrlList = await EventScraper.scrapeEvents('https://www.kaveikti.lt');
  const newEvents = await EventFilter.filterNewEvents(eventUrlList);
  console.log('================================');
  console.log('New events found:');
  console.log(newEvents);
  newEvents.forEach(async (url) => {
    const eventDetails = await EventScraper.scrapeFullEventDetails(url);
    if (eventDetails) {
      await EventRepo.save(eventDetails);
    }
  });
  console.log('New event scraping finished.');
  console.log('================================');
}
