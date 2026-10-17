import api from '../src/utils/api';
import networkCall from '../src/utils/networkCall';
import {store} from '../src/redux/store';
import {baseURL} from '../src/config/config';
jest.mock('../src/redux/store', () => ({store: {getState: jest.fn(() => ({Auth: {token: 'server-token'}})), dispatch: jest.fn()}}));
afterEach(() => jest.clearAllMocks());
test('Axios sends the stored Bearer token and retains the original base URL', async () => {
  const adapter = jest.fn(async config => ({data: {}, status: 200, statusText: 'OK', headers: {}, config}));
  await api.get('vendor_app/getshopidsdata', {adapter});
  const config = adapter.mock.calls[0][0];
  expect(config.baseURL).toBe(baseURL);
  expect(config.headers.Authorization).toBe('Bearer server-token');
});
test('an expired session clears authentication and still rejects the request', async () => {
  const error = Object.assign(new Error('Unauthorized'), {response: {status: 401}});
  await expect(api.get('protected', {adapter: async () => {throw error;}})).rejects.toBe(error);
  expect(store.dispatch).toHaveBeenCalledWith({type: 'authlice/actionLogout'});
});
test('the legacy helper performs its original authenticated fetch', async () => {
  const previous = global.fetch;
  global.fetch = jest.fn(async () => ({json: async () => ({status: 200})}));
  try {
    expect(await networkCall('vendor_app/application_common_api')).toEqual({response: {status: 200}, error: null});
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('vendor_app/application_common_api'), expect.objectContaining({headers: expect.objectContaining({Authorization: 'server-token'})}));
  } finally { global.fetch = previous; }
});
