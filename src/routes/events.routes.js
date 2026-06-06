import express from 'express';
import EventController from '../controllers/EventController.js';

const router = express.Router();
const eventController = new EventController();
/**
 * Event routes.
 * These routes define the public API endpoints for event resources.
 * The actual request handling is done inside EventController.
 */

/**
 * GET /events
 * Returns upcoming events.
 * Can also filter events by query parameters, for example:
 * /events?location=Vilnius
 * /events?type=Koncertai
 */
router.get('/', (req, res) => eventController.getEvents(req, res));
/**
 * GET /events/:id
 * Returns one event by its ID.
 * Includes event details, weather forecast, and HATEOAS links.
 */
router.get('/:id', (req, res) => eventController.getEventById(req, res));
/**
 * PATCH /events/:id/like
 * Increases the like count of one event.
 */
router.patch('/:id/like', (req, res) => eventController.likeEvent(req, res));

export default router;
