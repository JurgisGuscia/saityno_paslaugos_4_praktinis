import express from 'express';
import EventController from '../controllers/EventController.js';

const router = express.Router();
const eventController = new EventController();

router.get('/', (req, res) => eventController.getEvents(req, res));
router.get('/:id', (req, res) => eventController.getEventById(req, res));
router.patch('/:id/like', (req, res) => eventController.likeEvent(req, res));

export default router;
