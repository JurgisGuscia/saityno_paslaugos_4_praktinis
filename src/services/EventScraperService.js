import * as cheerio from 'cheerio';
import Event from '../models/Event.js';
export default class ScraperService {
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
