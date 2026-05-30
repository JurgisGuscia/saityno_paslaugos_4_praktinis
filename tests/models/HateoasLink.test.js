import HateoasLink from '../../src/models/HateoasLink.js';

describe('HateoasLink model', () => {
  test('converts HateoasLink to JSON', () => {
    const link = new HateoasLink('/events', 'GET', 'Get all events');

    expect(link.toJSON()).toEqual({
      href: '/events',
      method: 'GET',
      description: 'Get all events',
    });
  });
});
