import dotenv from 'dotenv';
import app from './app.js';
import { scrapeEvents } from './services/eventListScraper.js';
import db from './config/db.js';
dotenv.config();

const PORT = process.env.PORT || 3000;
//const ScrapeInterval = 600000; // 10 minutes
const ScrapeInterval = 50000;

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  const eventUrlList = await scrapeEvents();

  console.log(eventUrlList);
  //   setInterval(() => {
  //     scrapeEvents();
  //   }, ScrapeInterval);
  try {
    const [rows] = await db.query('SELECT 1 AS test');
    console.log('Database connected:', rows);
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
});
