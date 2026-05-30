import express from 'express';
import EventRepository from './repositories/EventRepository.js';

const app = express();
const eventRepository = new EventRepository();

app.use(express.json());

app.get('/events', async (req, res) => {
  try {
    const { location, type } = req.query;

    let events;

    if (location) {
      events = await eventRepository.findByLocation(location);
    } else if (type) {
      events = await eventRepository.findByType(type);
    } else {
      events = await eventRepository.findAll();
    }

    res.json({
      data: events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);

    res.status(500).json({
      error: 'Failed to fetch events',
    });
  }
});

app.get('/events/:id', async (req, res) => {
  try {
    const event = await eventRepository.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
      });
    }

    res.json({
      data: event,
    });
  } catch (error) {
    console.error('Error fetching event:', error);

    res.status(500).json({
      error: 'Failed to fetch event',
    });
  }
});

export default app;
