import { jest } from '@jest/globals';
import * as cheerio from 'cheerio';
import ScraperService from '../../src/services/EventScraperService.js';

describe('ScraperService', () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ScraperService();
  });

  test('extractEventLinks returns full event URLs from event blocks', () => {
    // Tests extracting relative event links and converting them to full URLs.
    const html = `
      <div class="block event-block">
        <a href="/renginys/event-one">Event one</a>
      </div>
      <div class="block event-block">
        <a href="/renginys/event-two">Event two</a>
      </div>
    `;

    const parsedHtml = cheerio.load(html);

    const result = service.extractEventLinks(parsedHtml);

    expect(result).toEqual([
      'https://www.kaveikti.lt/renginys/event-one',
      'https://www.kaveikti.lt/renginys/event-two',
    ]);
  });

  test('extractEventLinks skips event blocks without href', () => {
    // Tests that invalid event blocks without links are ignored.
    const html = `
      <div class="block event-block">
        <a>Missing href</a>
      </div>
      <div class="block event-block">
        <a href="/renginys/event-two">Event two</a>
      </div>
    `;

    const parsedHtml = cheerio.load(html);

    const result = service.extractEventLinks(parsedHtml);

    expect(result).toEqual(['https://www.kaveikti.lt/renginys/event-two']);
  });

  test('scrapeEvents fetches page HTML and returns extracted event links', async () => {
    // Tests that scrapeEvents fetches HTML and delegates link extraction correctly.
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(`
        <div class="block event-block">
          <a href="/renginys/test-event">Test event</a>
        </div>
      `),
    });

    const result = await service.scrapeEvents('https://www.kaveikti.lt');

    expect(global.fetch).toHaveBeenCalledWith('https://www.kaveikti.lt');
    expect(result).toEqual(['https://www.kaveikti.lt/renginys/test-event']);
  });

  test('scrapeEvents returns empty array when fetch fails', async () => {
    // Tests error handling when the events page cannot be fetched.
    global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

    const result = await service.scrapeEvents('https://www.kaveikti.lt');

    expect(result).toEqual([]);
  });

  test('scrapeFullEventDetails returns Event model from event details page', async () => {
    // Tests extraction of title, description, location, date, price, and type.
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(`
        <html>
          <head>
            <meta itemprop="startDate" content="2026-06-01 18:00:00">
            <meta itemprop="endDate" content="2026-06-01 20:00:00">
            <meta itemprop="addressLocality" content="Vilnius">
            <meta itemprop="Price" content="15">
          </head>
          <body>
            <h1 itemprop="name">Test Event</h1>

            <div itemprop="description">
              <p>First paragraph.</p>
              <p>Second paragraph.</p>
            </div>

            <div class="details-wrap">
              <div>
                <a title="Concert Vilnius" href="/renginiai/koncertai">Concert</a>
              </div>
            </div>
          </body>
        </html>
      `),
    });

    const result = await service.scrapeFullEventDetails(
      'https://www.kaveikti.lt/renginys/test-event',
    );

    expect(result).not.toBeNull();
    expect(result.url).toBe('https://www.kaveikti.lt/renginys/test-event');
    expect(result.title).toBe('Test Event');
    expect(result.content).toBe('First paragraph.\n\nSecond paragraph.');
    expect(result.location).toBe('Vilnius');
    expect(result.date).toEqual(new Date('2026-06-01 18:00:00'));
    expect(result.price).toBe('15');
    expect(result.type).toBe('Concert');
  });

  test('scrapeFullEventDetails uses lowPrice when Price is missing', async () => {
    // Tests fallback price extraction from lowPrice meta tag.
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(`
        <html>
          <head>
            <meta itemprop="startDate" content="2026-06-01 18:00:00">
            <meta itemprop="addressLocality" content="Kaunas">
            <meta itemprop="lowPrice" content="5">
          </head>
          <body>
            <h1 itemprop="name">Cheap Event</h1>
            <div itemprop="description"><p>Description.</p></div>
            <div class="details-wrap">
              <a title="Festival Kaunas">Festival</a>
            </div>
          </body>
        </html>
      `),
    });

    const result = await service.scrapeFullEventDetails(
      'https://www.kaveikti.lt/renginys/cheap-event',
    );

    expect(result.price).toBe('5');
    expect(result.type).toBe('Festival');
  });

  test('scrapeFullEventDetails uses price 0 when no price meta tags exist', async () => {
    // Tests default price value when no price information exists.
    global.fetch = jest.fn().mockResolvedValue({
      text: jest.fn().mockResolvedValue(`
        <html>
          <head>
            <meta itemprop="startDate" content="2026-06-01 18:00:00">
            <meta itemprop="addressLocality" content="Kaunas">
          </head>
          <body>
            <h1 itemprop="name">Free Event</h1>
            <div itemprop="description"><p>Description.</p></div>
            <div class="details-wrap">
              <a title="Exhibition Kaunas">Exhibition</a>
            </div>
          </body>
        </html>
      `),
    });

    const result = await service.scrapeFullEventDetails(
      'https://www.kaveikti.lt/renginys/free-event',
    );

    expect(result.price).toBe(0);
  });

  test('scrapeFullEventDetails returns null when fetch fails', async () => {
    // Tests error handling when event details page cannot be fetched.
    global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

    const result = await service.scrapeFullEventDetails('https://www.kaveikti.lt/renginys/missing');

    expect(result).toBeNull();
  });
});
