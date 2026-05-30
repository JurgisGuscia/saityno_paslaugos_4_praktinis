import EventRepository from '../repositories/EventRepository.js';
import HateoasLink from '../models/HateoasLink.js';
import WeatherForecastService from '../services/WeatherForcastService.js';
import GeolocationRepository from '../repositories/GeolocationRepository.js';
import WeatherForecastFormatterService from '../services/WeatherForcecastFormatterService.js';

export default class EventController {
  #eventRepository;
  #weatherForecastService;
  #GeolocationRepository;
  #weatherForecastFormatterService;

  constructor() {
    this.#eventRepository = new EventRepository();
    this.#weatherForecastService = new WeatherForecastService();
    this.#GeolocationRepository = new GeolocationRepository();
    this.#weatherForecastFormatterService = new WeatherForecastFormatterService();
  }

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
      const locations = await this.#eventRepository.findUniqueLocations();
      const locationLinkList = [];
      for (const location of locations) {
        locationLinkList.push('/events?location=' + location);
      }

      const types = await this.#eventRepository.findUniqueTypes();
      const typeLinkList = [];
      for (const type of types) {
        typeLinkList.push('/events?type=' + type);
      }

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
      res.json({
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

  async getEventById(req, res) {
    try {
      const event = await this.#eventRepository.findById(req.params.id);

      if (!event) {
        return res.status(404).json({
          error: 'Event not found',
        });
      }
      const locations = await this.#eventRepository.findUniqueLocations();
      const locationLinkList = [];
      for (const location of locations) {
        locationLinkList.push('/events?location=' + location);
      }
      const types = await this.#eventRepository.findUniqueTypes();
      const typeLinkList = [];
      for (const type of types) {
        typeLinkList.push('/events?type=' + type);
      }
      //get event location coordinates
      const eventLocation = await this.#GeolocationRepository.findByLocation(event.location);
      //call weather forecast on give coordinates
      const weatherForecast = await this.#weatherForecastService.getWeatherForecast(
        eventLocation.latitude,
        eventLocation.longitude,
      );
      //format weather forcast for output
      const formattedWeatherForecast = this.#weatherForecastFormatterService.format(
        weatherForecast,
        event.date,
      );

      res.json({
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

  async likeEvent(req, res) {
    try {
      const updated = await this.#eventRepository.increaseLikesById(req.params.id);

      if (!updated) {
        return res.status(404).json({
          error: 'Event not found',
        });
      }

      res.json({
        message: 'Event liked',
      });
    } catch (error) {
      console.error('Error liking event:', error);

      res.status(500).json({
        error: 'Failed to like event',
      });
    }
  }
}
