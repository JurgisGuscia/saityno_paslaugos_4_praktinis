import { jest } from '@jest/globals';

const mockExecute = jest.fn();

jest.unstable_mockModule('../../src/config/db.js', () => ({
  default: {
    execute: mockExecute,
  },
}));

const { default: EventRepository } = await import('../../src/repositories/EventRepository.js');

describe('EventRepository', () => {
  let repository;

  const eventRow = {
    id: 1,
    url: 'https://example.com/event',
    title: 'Test Event',
    content: 'Event description',
    location: 'Vilnius',
    date: new Date('2026-06-01T18:00:00'),
    price: 10,
    type: 'Concert',
    likes: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new EventRepository();
  });

  test('findByUrl returns Event when matching URL exists', async () => {
    // Tests SELECT by event URL and conversion from DB row to Event model.
    mockExecute.mockResolvedValue([[eventRow]]);

    const result = await repository.findByUrl('https://example.com/event');

    expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('WHERE url = ?'), [
      'https://example.com/event',
    ]);
    expect(result).not.toBeNull();
    expect(result.url).toBe('https://example.com/event');
    expect(result.title).toBe('Test Event');
  });

  test('findByUrl returns null when URL does not exist', async () => {
    // Tests null result when DB returns no rows for URL.
    mockExecute.mockResolvedValue([[]]);

    const result = await repository.findByUrl('https://example.com/missing');

    expect(result).toBeNull();
  });

  test('findById returns Event when matching ID exists', async () => {
    // Tests SELECT by event ID and conversion from DB row to Event model.
    mockExecute.mockResolvedValue([[eventRow]]);

    const result = await repository.findById(1);

    expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('WHERE id = ?'), [1]);
    expect(result).not.toBeNull();
    expect(result.id).toBe(1);
    expect(result.likes).toBe(5);
  });

  test('findById returns null when ID does not exist', async () => {
    // Tests null result when DB returns no rows for ID.
    mockExecute.mockResolvedValue([[]]);

    const result = await repository.findById(999);

    expect(result).toBeNull();
  });

  test('findAll returns all upcoming events as Event models', async () => {
    // Tests SELECT all upcoming events and maps each row to Event model.
    mockExecute.mockResolvedValue([[eventRow]]);

    const result = await repository.findAll();

    expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('WHERE date >= CURDATE()'));
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test Event');
  });

  test('findByLocation returns upcoming events for given location', async () => {
    // Tests location filter query and row mapping.
    mockExecute.mockResolvedValue([[eventRow]]);

    const result = await repository.findByLocation('Vilnius');

    expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('AND location = ?'), [
      'Vilnius',
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].location).toBe('Vilnius');
  });

  test('findByType returns upcoming events for given type', async () => {
    // Tests type filter query and row mapping.
    mockExecute.mockResolvedValue([[eventRow]]);

    const result = await repository.findByType('Concert');

    expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('AND type = ?'), ['Concert']);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('Concert');
  });

  test('save inserts event and returns inserted ID', async () => {
    // Tests INSERT query and returned auto-increment insertId.
    const event = {
      url: 'https://example.com/event',
      title: 'Test Event',
      content: 'Event description',
      location: 'Vilnius',
      date: new Date('2026-06-01T18:00:00'),
      price: 10,
      type: 'Concert',
    };

    mockExecute.mockResolvedValue([{ insertId: 15 }]);

    const result = await repository.save(event);

    expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO events'), [
      event.url,
      event.title,
      event.content,
      event.location,
      event.date,
      event.price,
      event.type,
    ]);
    expect(result).toBe(15);
  });

  test('increaseLikesById returns true when event was updated', async () => {
    // Tests successful likes update when affectedRows is greater than 0.
    mockExecute.mockResolvedValue([{ affectedRows: 1 }]);

    const result = await repository.increaseLikesById(1);

    expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('SET likes = likes + 1'), [1]);
    expect(result).toBe(true);
  });

  test('increaseLikesById returns false when event was not found', async () => {
    // Tests failed likes update when no rows were affected.
    mockExecute.mockResolvedValue([{ affectedRows: 0 }]);

    const result = await repository.increaseLikesById(999);

    expect(result).toBe(false);
  });

  test('findUniqueLocations returns distinct locations', async () => {
    // Tests extraction of unique location values from DB rows.
    mockExecute.mockResolvedValue([[{ location: 'Kaunas' }, { location: 'Vilnius' }]]);

    const result = await repository.findUniqueLocations();

    expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('SELECT DISTINCT location'));
    expect(result).toEqual(['Kaunas', 'Vilnius']);
  });

  test('findUniqueTypes returns distinct event types', async () => {
    // Tests extraction of unique type values from DB rows.
    mockExecute.mockResolvedValue([[{ type: 'Concert' }, { type: 'Festival' }]]);

    const result = await repository.findUniqueTypes();

    expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('SELECT DISTINCT type'));
    expect(result).toEqual(['Concert', 'Festival']);
  });
});
