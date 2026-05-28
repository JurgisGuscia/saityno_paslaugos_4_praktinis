import * as cheerio from 'cheerio';

export async function scrapeEvents() {
  try {
    const response = await fetch('https://www.kaveikti.lt/');
    const html = await response.text();
    const parsedHtml = cheerio.load(html);
    const events = [];

    parsedHtml('.block.event-block').each((index, element) => {
      const link = parsedHtml(element).find('a').attr('href');
      if (link) events.push('https://www.kaveikti.lt' + link);
    });
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}
