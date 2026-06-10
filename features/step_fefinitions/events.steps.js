import assert from 'assert';
import { Given, When, Then } from '@cucumber/cucumber';

const BASE_URL = 'http://localhost:3000';

let response;
let responseBody;
let savedLikeCount;

async function sendGetRequest(path) {
  response = await fetch(BASE_URL + path);
  responseBody = await response.json();
}

function getEventDataFromResponseItem(item) {
  return item.data || item;
}

When('the user sends a GET request to {string}', async function (path) {
  await sendGetRequest(path);
});

When('the user sends a PATCH request to {string}', async function (path) {
  response = await fetch(BASE_URL + path, {
    method: 'PATCH',
  });

  responseBody = await response.json();
});

Given('the current like count of event {int} is saved', async function (eventId) {
  await sendGetRequest(`/events/${eventId}`);

  assert.strictEqual(response.status, 200);
  assert.ok(responseBody.data);
  assert.strictEqual(typeof responseBody.data.likes, 'number');

  savedLikeCount = responseBody.data.likes;
});

Then('the system should return status code {int}', function (statusCode) {
  assert.strictEqual(response.status, statusCode);
});

Then('the response should contain a valid event list', function () {
  assert.ok(responseBody.data);
  assert.ok(Array.isArray(responseBody.data));

  if (responseBody.data.length > 0) {
    const firstEvent = getEventDataFromResponseItem(responseBody.data[0]);

    assert.ok(firstEvent.id);
    assert.ok(firstEvent.url);
    assert.ok(firstEvent.title);
    assert.ok(firstEvent.location);
    assert.ok(firstEvent.date);
    assert.ok(firstEvent.type);
  }
});

Then('the response should contain collection HATEOAS links', function () {
  assert.ok(responseBody._links);
  assert.ok(responseBody._links.allEvents);
  assert.ok(responseBody._links.filteredEvents);
});

Then('every returned event should have location {string}', function (expectedLocation) {
  assert.ok(responseBody.data);
  assert.ok(Array.isArray(responseBody.data));

  responseBody.data.forEach((item) => {
    const event = getEventDataFromResponseItem(item);
    assert.strictEqual(event.location, expectedLocation);
  });
});

Then('every returned event should have type {string}', function (expectedType) {
  assert.ok(responseBody.data);
  assert.ok(Array.isArray(responseBody.data));

  responseBody.data.forEach((item) => {
    const event = getEventDataFromResponseItem(item);
    assert.strictEqual(event.type, expectedType);
  });
});

Then('the response should contain valid event details', function () {
  assert.ok(responseBody.data);

  assert.ok(responseBody.data.id);
  assert.ok(responseBody.data.url);
  assert.ok(responseBody.data.title);
  assert.ok(responseBody.data.content);
  assert.ok(responseBody.data.location);
  assert.ok(responseBody.data.date);
  assert.ok(responseBody.data.type);
  assert.strictEqual(typeof responseBody.data.likes, 'number');
});

Then('the response should contain event HATEOAS links', function () {
  assert.ok(responseBody._links);
  assert.ok(responseBody._links.self);
  assert.ok(responseBody._links.like);
  assert.ok(responseBody._links.allEvents);
});

Then('the response should contain like response HATEOAS links', function () {
  assert.ok(responseBody._links);
  assert.ok(responseBody._links.self);
  assert.ok(responseBody._links.allEvents);
});

Then('the response should contain weather forecast data', function () {
  assert.ok(responseBody.weatherForecast);

  assert.ok(responseBody.weatherForecast.Weather_forecast);
  assert.ok(Array.isArray(responseBody.weatherForecast.Weather_forecast));
});

Then('the response message should be {string}', function (expectedMessage) {
  assert.strictEqual(responseBody.message, expectedMessage);
});

Then('the response error should be {string}', function (expectedError) {
  assert.strictEqual(responseBody.error, expectedError);
});

Then('the response cache header should be {string}', function (expectedHeader) {
  assert.strictEqual(response.headers.get('cache-control'), expectedHeader);
});

Then('the event like count should be increased by 1', async function () {
  await sendGetRequest('/events/115');

  assert.strictEqual(response.status, 200);
  assert.strictEqual(responseBody.data.likes, savedLikeCount + 1);
});
