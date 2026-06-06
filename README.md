# Lithuanian Events API

RESTful API server for scraping Lithuanian event data, saving new events to a MySQL database, and returning event information with HATEOAS links and weather forecast data.

The project was created as a second-year web services assignment. The main goal was to demonstrate REST API design, database persistence, third-party API usage, HATEOAS, OpenAPI documentation, testing, and a simplified Agile workflow.

## Project idea

The server scrapes event links from `kaveikti.lt`. New events are saved to the database, while already existing events are skipped.

Users can request upcoming events through the API. Events can be filtered by location or type. When a user requests one specific event, the API also returns weather forecast data for the event location and date.

If coordinates for an event location already exist in the database, they are reused. If not, the server calls a geocoding API, saves the coordinates, and then uses them to request weather forecast data.

## Main features

* Scrapes event data from an external website.
* Saves new events to a MySQL database.
* Avoids saving duplicate events by checking event URLs.
* Returns upcoming events only.
* Supports filtering by location and event type.
* Returns one event by ID.
* Adds weather forecast data to detailed event responses.
* Uses cached geolocation data to avoid unnecessary geocoding API calls.
* Uses HATEOAS links in API responses.
* Uses correct HTTP response codes.
* Uses `Cache-Control` headers for cacheable GET responses.
* Provides Swagger UI / OpenAPI documentation.
* Includes automated Jest tests for models, repositories, services, and controllers.

## Technologies used

* Node.js
* Express.js
* MySQL
* Cheerio
* dotenv
* Jest
* Swagger UI
* OpenAPI YAML
* Positionstack API
* Open-Meteo API

## Project structure

```text
src/
  app.js
  server.js

  config/
    db.js

  controllers/
    EventController.js

  models/
    Event.js
    Geolocation.js
    HateoasLink.js

  repositories/
    EventRepository.js
    GeolocationRepository.js

  routes/
    events.routes.js

  services/
    EventScraperService.js
    EventFilterService.js
    GeocodingService.js
    WeatherForecastService.js
    WeatherForecastFormatterService.js

docs/
  openapi.yaml

tests/
  controllers/
  models/
  repositories/
  services/
```

## Installation

Clone the repository:

```bash
git clone <repository-url>
cd <project-folder>
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
PORT=3000

DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

GEOCODING_API_KEY=your_positionstack_api_key
```

Start the project:

```bash
npm start
```

For development with automatic restart:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

## API documentation

Swagger UI is available at:

```text
http://localhost:3000/api-docs
```

The OpenAPI file is located at:

```text
docs/openapi.yaml
```

## API endpoints

### Get upcoming events

```http
GET /events
```

Returns all upcoming events.

Optional filters:

```http
GET /events?location=Vilnius
GET /events?type=Koncertai
```

The response includes HATEOAS links for available filters. These filter links are generated dynamically from upcoming events in the database.

### Get event by ID

```http
GET /events/{id}
```

Returns one event by ID. The response includes:

* event details
* HATEOAS links
* weather forecast data for the event location and date

Invalid ID returns `400 Bad Request`.

Missing event returns `404 Not Found`.

### Like event

```http
PATCH /events/{id}/like
```

Increases event like count by 1.

Invalid ID returns `400 Bad Request`.

Missing event returns `404 Not Found`.

## Database tables

### events

Stores scraped event data.

Main fields:

* `id`
* `url`
* `title`
* `content`
* `location`
* `date`
* `price`
* `type`
* `likes`

The `id` field is auto-incremented by MySQL.

### geolocations

Stores cached coordinates for locations.

Main fields:

* `id`
* `location`
* `latitude`
* `longitude`

This table is used to avoid calling the geocoding API repeatedly for the same location.

## Scraping process

When the server starts, it runs a scraping cycle. After that, scraping repeats every 10 minutes.

Scraping flow:

1. Scrape event URLs from `kaveikti.lt`.
2. Check each URL against the database.
3. Keep only URLs that are not saved yet.
4. Scrape full event details from new event pages.
5. Save new events to the database.
6. Check if event location coordinates are already saved.
7. If not, call the geocoding API and save coordinates.

## Third-party APIs

### Positionstack API

Used for geocoding location names into latitude and longitude.

Example use:

```text
Vilnius -> latitude, longitude
```

The API is only called if the location is not already saved in the `geolocations` table.

### Open-Meteo API

Used for weather forecast data.

The API receives latitude and longitude and returns hourly weather forecast data. The formatter service converts the raw response into a smaller output used in the event detail response.

## REST and HATEOAS

The API follows REST-style resource design:

```text
GET /events
GET /events/{id}
PATCH /events/{id}/like
```

The API includes HATEOAS links so the client can discover possible next actions from responses.

Examples of links:

* get all events
* get event details
* like event
* filter events by location
* filter events by type

The available filter links are generated dynamically. If a location or type is not listed in the response, there are no upcoming events for that filter.

## Cacheability

The API uses `Cache-Control` headers.

Event list responses can be cached for 1 hour:

```http
Cache-Control: public, max-age=3600
```

Event detail responses can be cached for 24 hours:

```http
Cache-Control: public, max-age=86400
```

This is used because event details and weather forecast data do not need to be fetched again on every request.

The like endpoint is not cacheable because it changes server state:

```http
Cache-Control: no-store
```

## Statelessness

The API is stateless. It does not store user sessions on the server. Each request contains all information needed to process it.

## Testing

The project uses Jest for automated tests.

Current test coverage includes:

* models
* repositories
* services
* controllers

External dependencies such as the database and third-party APIs are mocked in tests. This makes the tests repeatable and independent from live services.

Run tests:

```bash
npm test
```

## Agile workflow

This project was completed individually, but a simplified Agile/Kanban-style workflow was used.

The work was split into task cards, such as:

* initial project setup
* environment variables
* database connection
* scraper service
* repositories
* controllers
* HATEOAS links
* Swagger/OpenAPI documentation
* tests

Tasks were moved through the board as they were planned, implemented, tested, and completed.

GitHub branches and pull requests were used to simulate a team workflow. After the initial project setup, larger features were implemented in separate branches and merged into `main` through pull requests.

## Scope decisions

Some possible features were considered but not implemented in this version.
For example, saved events, user accounts, and reminder notifications were left outside the current scope. These features would require authentication, user-specific data, and additional database tables. The current project focuses on RESTful event discovery, scraping, database persistence, HATEOAS, third-party APIs, and testing.
