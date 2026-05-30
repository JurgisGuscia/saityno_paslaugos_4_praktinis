import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import eventsRouter from './routes/events.routes.js';

const app = express();
const swaggerDocument = YAML.load('./docs/openapi.yaml');

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/events', eventsRouter);

export default app;
