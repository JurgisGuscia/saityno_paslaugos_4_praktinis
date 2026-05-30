import Event from '../../src/models/Event.js';

describe('Event model', () => {
  test('creates Event from database row', () => {
    const row = {
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

    const event = Event.fromDatabaseRow(row);

    expect(event.id).toBe(1);
    expect(event.url).toBe('https://example.com/event');
    expect(event.title).toBe('Test Event');
    expect(event.location).toBe('Vilnius');
    expect(event.likes).toBe(5);
  });

  test('converts Event to JSON', () => {
    const event = new Event(
      1,
      'https://example.com/event',
      'Test Event',
      'Event description',
      'Vilnius',
      new Date('2026-06-01T18:00:00'),
      10,
      'Concert',
      5,
    );

    expect(event.toJSON()).toEqual({
      id: 1,
      url: 'https://example.com/event',
      title: 'Test Event',
      content: 'Event description',
      location: 'Vilnius',
      date: new Date('2026-06-01T18:00:00'),
      price: 10,
      type: 'Concert',
      likes: 5,
    });
  });
});
