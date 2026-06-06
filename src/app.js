import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import eventsRouter from './routes/events.routes.js';

const app = express();
/**
 * Loads the OpenAPI documentation file.
 * Swagger UI uses this file to display and test the API endpoints.
 */
const swaggerDocument = YAML.load('./docs/openapi.yaml');
/**
 * Middleware that allows Express to read JSON request bodies.
 */
app.use(express.json());
/**
 * Serves Swagger UI documentation at /api-docs.
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
/**
 * Registers event-related routes under /events.
 */
app.use('/events', eventsRouter);

export default app;
