import EventRepository from '../repositories/EventRepository.js';
import HateoasLink from '../models/HateoasLink.js';
import WeatherForecastService from '../services/WeatherForecastService.js';
import GeolocationRepository from '../repositories/GeolocationRepository.js';
import WeatherForecastFormatterService from '../services/WeatherForecastFormatterService.js';
/**
 * Controller responsible for event API endpoints.
 * It receives HTTP requests, calls repositories/services, builds responses,
 * adds HATEOAS links, and returns correct HTTP status codes.
 */
export default class EventController {
  #eventRepository;
  #weatherForecastService;
  #GeolocationRepository;
  #weatherForecastFormatterService;
  /**
   * Creates controller dependencies.
   * Repositories are used for database access.
   * Services are used for weather forecast loading and formatting.
   */
  constructor() {
    this.#eventRepository = new EventRepository();
    this.#weatherForecastService = new WeatherForecastService();
    this.#GeolocationRepository = new GeolocationRepository();
    this.#weatherForecastFormatterService = new WeatherForecastFormatterService();
  }
  /**
   * Returns a list of upcoming events.
   * Supports optional filtering by location or type using query parameters.
   *
   * Examples:
   * GET /events
   * GET /events?location=Vilnius
   * GET /events?type=Koncertai
   *
   * @param {object} req Express request object.
   * @param {object} res Express response object.
   * @returns {Promise<void>}
   */
  async getEvents(req, res) {
    try {
      const { location, type } = req.query;

      let events;

      if (location) {
        events = await this.#eventRepository.findByLocation(location);
      } else if (type) {
        events = await this.#eventRepository.findByType(type);
      } else {
        events = await this.#eventRepository.findAll();
      }
      //create a hateoas list of locations
      const locations = await this.#eventRepository.findUniqueLocations();
      const locationLinkList = [];
      for (const location of locations) {
        locationLinkList.push('/events?location=' + location);
      }
      //create a hateoas list of types
      const types = await this.#eventRepository.findUniqueTypes();
      const typeLinkList = [];
      for (const type of types) {
        typeLinkList.push('/events?type=' + type);
      }
      //format events for output
      const formatedEvents = [];
      for (const event of events) {
        formatedEvents.push({
          _links: {
            self: new HateoasLink('/events/' + event.id, 'GET', 'Get event details'),
            like: new HateoasLink('/events/' + event.id + '/like', 'PATCH', 'Like this event'),
          },
          data: event,
        });
      }
      res
        .status(200)
        .set('Cache-Control', 'public, max-age=3600')
        .json({
          _links: {
            allEvents: new HateoasLink('/events', 'GET', 'Get all events'),
            filteredEvents: {
              method: 'GET',
              description: 'Get events filtered by location or type',
              locations: locationLinkList,
              types: typeLinkList,
            },
          },
          data: formatedEvents,
        });
    } catch (error) {
      console.error('Error fetching events:', error);

      res.status(500).json({
        error: 'Failed to fetch events',
      });
    }
  }
  /**
   * Returns one event by ID.
   * The response includes event details, weather forecast data, and HATEOAS links.
   *
   * @param {object} req Express request object.
   * @param {object} res Express response object.
   * @returns {Promise<void>}
   */
  async getEventById(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'Invalid event id',
      });
    }
    try {
      const event = await this.#eventRepository.findById(id);

      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
        });
      }
      //create a hateoas list of locations
      const locations = await this.#eventRepository.findUniqueLocations();
      const locationLinkList = [];
      for (const location of locations) {
        locationLinkList.push('/events?location=' + location);
      }
      //create a hateoas list of types
      const types = await this.#eventRepository.findUniqueTypes();
      const typeLinkList = [];
      for (const type of types) {
        typeLinkList.push('/events?type=' + type);
      }
      //get event location coordinates
      const eventLocation = await this.#GeolocationRepository.findByLocation(event.location);
      //call weather forecast on given coordinates
      const weatherForecast = await this.#weatherForecastService.getWeatherForecast(
        eventLocation.latitude,
        eventLocation.longitude,
      );
      //format weather forcast for output
      const formattedWeatherForecast = this.#weatherForecastFormatterService.format(
        weatherForecast,
        event.date,
      );

      res
        .status(200)
        .set('Cache-Control', 'public, max-age=86400')
        .json({
          _links: {
            allEvents: new HateoasLink('/events', 'GET', 'Get all events'),
            filteredEvents: {
              method: 'GET',
              description: 'Get events filtered by location or type',
              locations: locationLinkList,
              types: typeLinkList,
            },
            self: new HateoasLink('/events/' + event.id, 'GET', 'Get event details'),
            like: new HateoasLink('/events/' + event.id + '/like', 'PATCH', 'Like this event'),
          },
          data: event,
          weatherForecast: formattedWeatherForecast,
        });
    } catch (error) {
      console.error('Error fetching event:', error);

      res.status(500).json({
        error: 'Failed to fetch event',
      });
    }
  }
  /**
   * Increases the like count of one event.
   * This endpoint changes server state, so the response is marked as not cacheable.
   *
   * @param {object} req Express request object.
   * @param {object} res Express response object.
   * @returns {Promise<void>}
   */
  async likeEvent(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'Invalid event id',
      });
    }
    try {
      const updated = await this.#eventRepository.increaseLikesById(id);

      if (!updated) {
        return res.status(404).json({
          error: 'Event not found',
        });
      }

      res
        .status(200)
        .set('Cache-Control', 'no-store')
        .json({
          message: 'Event liked',
          _links: {
            self: new HateoasLink('/events/' + id, 'GET', 'Get event details'),
            allEvents: new HateoasLink('/events', 'GET', 'Get all events'),
          },
        });
    } catch (error) {
      console.error('Error liking event:', error);
      res.status(500).json({
        error: 'Failed to like event',
      });
    }
  }
}
