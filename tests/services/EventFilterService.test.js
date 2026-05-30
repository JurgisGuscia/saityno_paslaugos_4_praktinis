import { jest } from '@jest/globals';
import EventFilterService from '../../src/services/EventFilterService.js';

describe('EventFilterService', () => {
  test('returns only URLs that do not exist in database', async () => {
    // Tests that existing event URLs are removed from the result.
    const mockEventRepository = {
      findByUrl: jest.fn(),
    };

    mockEventRepository.findByUrl
      .mockResolvedValueOnce({ id: 1, url: 'https://example.com/event-1' })
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const service = new EventFilterService(mockEventRepository);

    const result = await service.filterNewEvents([
      'https://example.com/event-1',
      'https://example.com/event-2',
      'https://example.com/event-3',
    ]);

    expect(result).toEqual(['https://example.com/event-2', 'https://example.com/event-3']);
  });

  test('returns empty array when all URLs already exist', async () => {
    // Tests that no URLs are returned when every URL is already saved.
    const mockEventRepository = {
      findByUrl: jest.fn().mockResolvedValue({ id: 1 }),
    };

    const service = new EventFilterService(mockEventRepository);

    const result = await service.filterNewEvents([
      'https://example.com/event-1',
      'https://example.com/event-2',
    ]);

    expect(result).toEqual([]);
  });

  test('returns all URLs when none exist in database', async () => {
    // Tests that all URLs are returned when repository finds no saved events.
    const mockEventRepository = {
      findByUrl: jest.fn().mockResolvedValue(null),
    };

    const service = new EventFilterService(mockEventRepository);

    const urls = ['https://example.com/event-1', 'https://example.com/event-2'];

    const result = await service.filterNewEvents(urls);

    expect(result).toEqual(urls);
  });

  test('checks every provided URL against repository', async () => {
    // Tests that findByUrl is called once for each URL.
    const mockEventRepository = {
      findByUrl: jest.fn().mockResolvedValue(null),
    };

    const service = new EventFilterService(mockEventRepository);

    const urls = [
      'https://example.com/event-1',
      'https://example.com/event-2',
      'https://example.com/event-3',
    ];

    await service.filterNewEvents(urls);

    expect(mockEventRepository.findByUrl).toHaveBeenCalledTimes(3);
    expect(mockEventRepository.findByUrl).toHaveBeenNthCalledWith(1, 'https://example.com/event-1');
    expect(mockEventRepository.findByUrl).toHaveBeenNthCalledWith(2, 'https://example.com/event-2');
    expect(mockEventRepository.findByUrl).toHaveBeenNthCalledWith(3, 'https://example.com/event-3');
  });
});
