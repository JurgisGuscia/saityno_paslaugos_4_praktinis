import dotenv from 'dotenv';
import app from './app.js';
import { scrapeEvents } from './services/eventListScraper.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
//const ScrapeInterval = 600000; // 10 minutes
const ScrapeInterval = 50000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);

  scrapeEvents();

  //   setInterval(() => {
  //     scrapeEvents();
  //   }, ScrapeInterval);
});
