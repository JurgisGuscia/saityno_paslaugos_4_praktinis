Feature: Events API acceptance tests

  As an API user
  I want to use the Events API
  So that I can discover events, view details, check weather forecast and like events

  Scenario: Get upcoming events
    When the user sends a GET request to "/events"
    Then the system should return status code 200
    And the response should contain a valid event list
    And the response should contain collection HATEOAS links
    And the response cache header should be "public, max-age=3600"

  Scenario: Filter events by location
    When the user sends a GET request to "/events?location=Vilnius"
    Then the system should return status code 200
    And every returned event should have location "Vilnius"
    And the response should contain collection HATEOAS links

  Scenario: Filter events by type
    When the user sends a GET request to "/events?type=Koncertai"
    Then the system should return status code 200
    And every returned event should have type "Koncertai"
    And the response should contain collection HATEOAS links

  Scenario: Get event details by valid ID
    When the user sends a GET request to "/events/115"
    Then the system should return status code 200
    And the response should contain valid event details
    And the response should contain event HATEOAS links
    And the response cache header should be "public, max-age=86400"

  Scenario: Get weather forecast for an event
    When the user sends a GET request to "/events/115"
    Then the system should return status code 200
    And the response should contain weather forecast data

  Scenario: Like an event
    Given the current like count of event 115 is saved
    When the user sends a PATCH request to "/events/115/like"
    Then the system should return status code 200
    And the response message should be "Event liked"
    And the response should contain like response HATEOAS links
    And the response cache header should be "no-store"
    And the event like count should be increased by 1

  Scenario: Get event using invalid ID
    When the user sends a GET request to "/events/abc"
    Then the system should return status code 400
    And the response error should be "Invalid event id"

  Scenario: Get event that does not exist
    When the user sends a GET request to "/events/9999999"
    Then the system should return status code 404
    And the response error should be "Event not found"