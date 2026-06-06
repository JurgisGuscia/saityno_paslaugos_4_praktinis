import * as cheerio from 'cheerio';
import Event from '../models/Event.js';
/**
 * Service responsible for scraping event data from the external events website.
 * It extracts event links from the main page and full event details from each event page.
 */
export default class ScraperService {
  /**
   * Scrapes the main events page and returns event URLs.
   *
   * @param {string} url Website URL to scrape.
   * @returns {Promise<string[]>} List of scraped event URLs.
   */
  async scrapeEvents(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parsedHtml = cheerio.load(html);
      return this.extractEventLinks(parsedHtml);
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }
  /**
   * Extracts event links from parsed HTML.
   *
   * @param {Function} parsedHtml Cheerio parser loaded with HTML content.
   * @returns {string[]} List of full event URLs.
   */
  extractEventLinks(parsedHtml) {
    const events = [];
    parsedHtml('.block.event-block').each((index, element) => {
      const link = parsedHtml(element).find('a').attr('href');
      if (link) {
        events.push('https://www.kaveikti.lt' + link);
      }
    });
    return events;
  }
  /**
   * Scrapes a single event page and creates an Event model from the extracted data.
   *
   * @param {string} url Event page URL.
   * @returns {Promise<Event|null>} Event object if scraping succeeds, otherwise null.
   */
  async scrapeFullEventDetails(url) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const parsedHtml = cheerio.load(html);
      const endDate = new Date(parsedHtml('meta[itemprop="endDate"]').attr('content'));

      const title = parsedHtml('h1[itemprop="name"]').text().trim();
      const content = parsedHtml('[itemprop="description"] p')
        .map((index, element) => parsedHtml(element).text().trim())
        .get()
        .join('\n\n');
      const location = parsedHtml('meta[itemprop="addressLocality"]').attr('content');
      const date = new Date(parsedHtml('meta[itemprop="startDate"]').attr('content'));
      const price =
        parsedHtml('meta[itemprop="Price"]').attr('content') ||
        parsedHtml('meta[itemprop="lowPrice"]').attr('content') ||
        parsedHtml('meta[itemprop="highPrice"]').attr('content') ||
        0;

      const type = parsedHtml('.details-wrap a').attr('title').split(' ')[0];
      const event = new Event(null, url, title, content, location, date, price, type);
      return event;
    } catch (error) {
      console.error('Error fetching event details:', error);
      return null;
    }
  }
}
