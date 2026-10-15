import api from '../src/utils/api';
import networkCall from '../src/utils/networkCall';

jest.mock('../src/redux/store', () => ({
  store: {getState: () => ({Auth: {}})},
}));

test('Axios refuses an accidental request while demo mode is enabled', async () => {
  await expect(api.get('https://example.invalid/production')).rejects.toThrow(
    'Network requests are unavailable',
  );
});

test('the legacy fetch helper also blocks network access', async () => {
  const original = global.fetch;
  const fetchMock = jest.fn();
  global.fetch = fetchMock;
  try {
    expect(await networkCall('production')).toEqual({
      response: null,
      error: 'Network requests are unavailable',
    });
    expect(fetchMock).not.toHaveBeenCalled();
  } finally {
    global.fetch = original;
  }
});
