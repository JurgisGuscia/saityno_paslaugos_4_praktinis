import { jest } from '@jest/globals';

const mockFindAll = jest.fn();
const mockFindByLocation = jest.fn();
const mockFindByType = jest.fn();
const mockFindById = jest.fn();
const mockFindUniqueLocations = jest.fn();
const mockFindUniqueTypes = jest.fn();
const mockIncreaseLikesById = jest.fn();
const mockFindGeolocationByLocation = jest.fn();
const mockGetWeatherForecast = jest.fn();
const mockFormatWeather = jest.fn();

jest.unstable_mockModule('../../src/repositories/EventRepository.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    findAll: mockFindAll,
    findByLocation: mockFindByLocation,
    findByType: mockFindByType,
    findById: mockFindById,
    findUniqueLocations: mockFindUniqueLocations,
    findUniqueTypes: mockFindUniqueTypes,
    increaseLikesById: mockIncreaseLikesById,
  })),
}));

jest.unstable_mockModule('../../src/repositories/GeolocationRepository.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    findByLocation: mockFindGeolocationByLocation,
  })),
}));

jest.unstable_mockModule('../../src/services/WeatherForecastService.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    getWeatherForecast: mockGetWeatherForecast,
  })),
}));

jest.unstable_mockModule('../../src/services/WeatherForecastFormatterService.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    format: mockFormatWeather,
  })),
}));

const { default: EventController } = await import('../../src/controllers/EventController.js');

function createMockResponse() {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
}

describe('EventController', () => {
  let controller;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new EventController();
  });

  test('getEvents returns all events with status 200 when no filters are provided', async () => {
    // Tests GET /events without query parameters.
    const req = {
      query: {},
    };

    const res = createMockResponse();

    const events = [
      {
        id: 1,
        location: 'Vilnius',
        type: 'Concert',
      },
    ];

    mockFindAll.mockResolvedValue(events);
    mockFindUniqueLocations.mockResolvedValue(['Vilnius']);
    mockFindUniqueTypes.mockResolvedValue(['Concert']);

    await controller.getEvents(req, res);

    expect(mockFindAll).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        _links: expect.any(Object),
        data: expect.any(Array),
      }),
    );
  });

  test('getEvents filters events by location when location query is provided', async () => {
    // Tests GET /events?location=Vilnius.
    const req = {
      query: {
        location: 'Vilnius',
      },
    };

    const res = createMockResponse();

    mockFindByLocation.mockResolvedValue([
      {
        id: 1,
        location: 'Vilnius',
        type: 'Concert',
      },
    ]);
    mockFindUniqueLocations.mockResolvedValue(['Vilnius']);
    mockFindUniqueTypes.mockResolvedValue(['Concert']);

    await controller.getEvents(req, res);

    expect(mockFindByLocation).toHaveBeenCalledWith('Vilnius');
    expect(mockFindByType).not.toHaveBeenCalled();
    expect(mockFindAll).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getEvents filters events by type when type query is provided', async () => {
    // Tests GET /events?type=Concert.
    const req = {
      query: {
        type: 'Concert',
      },
    };

    const res = createMockResponse();

    mockFindByType.mockResolvedValue([
      {
        id: 1,
        location: 'Vilnius',
        type: 'Concert',
      },
    ]);
    mockFindUniqueLocations.mockResolvedValue(['Vilnius']);
    mockFindUniqueTypes.mockResolvedValue(['Concert']);

    await controller.getEvents(req, res);

    expect(mockFindByType).toHaveBeenCalledWith('Concert');
    expect(mockFindByLocation).not.toHaveBeenCalled();
    expect(mockFindAll).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('getEvents returns status 500 when repository throws error', async () => {
    // Tests server error handling for GET /events.
    const req = {
      query: {},
    };

    const res = createMockResponse();

    mockFindAll.mockRejectedValue(new Error('Database error'));

    await controller.getEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to fetch events',
    });
  });

  test('getEventById returns status 400 when id is invalid', async () => {
    // Tests GET /events/:id with invalid id.
    const req = {
      params: {
        id: 'abc',
      },
    };

    const res = createMockResponse();

    await controller.getEventById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid event id',
    });
    expect(mockFindById).not.toHaveBeenCalled();
  });

  test('getEventById returns status 404 when event does not exist', async () => {
    // Tests GET /events/:id when repository returns null.
    const req = {
      params: {
        id: '999',
      },
    };

    const res = createMockResponse();

    mockFindById.mockResolvedValue(null);

    await controller.getEventById(req, res);

    expect(mockFindById).toHaveBeenCalledWith(999);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Event not found',
    });
  });

  test('getEventById returns event with weather forecast and status 200', async () => {
    // Tests successful GET /events/:id including geolocation and weather formatting.
    const req = {
      params: {
        id: '1',
      },
    };

    const res = createMockResponse();

    const event = {
      id: 1,
      location: 'Vilnius',
      date: new Date('2026-06-01T18:00:00'),
      type: 'Concert',
    };

    const geolocation = {
      latitude: 54.700902,
      longitude: 25.251531,
    };

    const rawWeatherForecast = {
      hourly: {
        time: [],
      },
    };

    const formattedWeatherForecast = {
      temperature: 20,
      rain: 0,
    };

    mockFindById.mockResolvedValue(event);
    mockFindUniqueLocations.mockResolvedValue(['Vilnius']);
    mockFindUniqueTypes.mockResolvedValue(['Concert']);
    mockFindGeolocationByLocation.mockResolvedValue(geolocation);
    mockGetWeatherForecast.mockResolvedValue(rawWeatherForecast);
    mockFormatWeather.mockReturnValue(formattedWeatherForecast);

    await controller.getEventById(req, res);

    expect(mockFindById).toHaveBeenCalledWith(1);
    expect(mockFindGeolocationByLocation).toHaveBeenCalledWith('Vilnius');
    expect(mockGetWeatherForecast).toHaveBeenCalledWith(54.700902, 25.251531);
    expect(mockFormatWeather).toHaveBeenCalledWith(rawWeatherForecast, event.date);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        _links: expect.any(Object),
        data: event,
        weatherForecast: formattedWeatherForecast,
      }),
    );
  });

  test('getEventById returns status 500 when unexpected error happens', async () => {
    // Tests server error handling for GET /events/:id.
    const req = {
      params: {
        id: '1',
      },
    };

    const res = createMockResponse();

    mockFindById.mockRejectedValue(new Error('Database error'));

    await controller.getEventById(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to fetch event',
    });
  });

  test('likeEvent returns status 400 when id is invalid', async () => {
    // Tests PATCH /events/:id/like with invalid id.
    const req = {
      params: {
        id: 'abc',
      },
    };

    const res = createMockResponse();

    await controller.likeEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid event id',
    });
    expect(mockIncreaseLikesById).not.toHaveBeenCalled();
  });

  test('likeEvent returns status 404 when event does not exist', async () => {
    // Tests PATCH /events/:id/like when no event is updated.
    const req = {
      params: {
        id: '999',
      },
    };

    const res = createMockResponse();

    mockIncreaseLikesById.mockResolvedValue(false);

    await controller.likeEvent(req, res);

    expect(mockIncreaseLikesById).toHaveBeenCalledWith(999);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Event not found',
    });
  });

  test('likeEvent returns status 200 when event likes are increased', async () => {
    // Tests successful PATCH /events/:id/like.
    const req = {
      params: {
        id: '1',
      },
    };

    const res = createMockResponse();

    mockIncreaseLikesById.mockResolvedValue(true);

    await controller.likeEvent(req, res);

    expect(mockIncreaseLikesById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Event liked',
        _links: expect.objectContaining({
          self: expect.any(Object),
          allEvents: expect.any(Object),
        }),
      }),
    );
  });

  test('likeEvent returns status 500 when repository throws error', async () => {
    // Tests server error handling for PATCH /events/:id/like.
    const req = {
      params: {
        id: '1',
      },
    };

    const res = createMockResponse();

    mockIncreaseLikesById.mockRejectedValue(new Error('Database error'));

    await controller.likeEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Failed to like event',
    });
  });
});
