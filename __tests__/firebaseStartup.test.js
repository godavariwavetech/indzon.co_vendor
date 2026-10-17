jest.mock('../App', () => () => null);
jest.mock('react-native', () => ({
  AppRegistry: {registerComponent: jest.fn()},
  PermissionsAndroid: {},
  Platform: {OS: 'android', Version: 35},
}));
jest.mock('@react-native-firebase/app', () => ({
  __esModule: true,
  default: {apps: []},
}));
jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(() => ({setBackgroundMessageHandler: jest.fn()})),
}));
jest.mock('@notifee/react-native', () => ({
  __esModule: true, default: {}, AndroidImportance: {}, AndroidStyle: {},
}));

beforeEach(() => jest.resetModules());

test('startup registers the app without calling messaging when Firebase is missing', () => {
  const messaging = require('@react-native-firebase/messaging').default;
  const {AppRegistry} = require('react-native');
  expect(() => require('../index')).not.toThrow();
  expect(AppRegistry.registerComponent).toHaveBeenCalled();
  expect(messaging).not.toHaveBeenCalled();
});

test('missing Firebase leaves notification setup and token retrieval safe', async () => {
  const messaging = require('@react-native-firebase/messaging').default;
  const service = require('../src/services/NotificationsService');
  const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    await expect(service.requestUserPermission()).resolves.toBeUndefined();
    await expect(service.retrieveFCMToken()).resolves.toBeNull();
    const cleanup = await service.setupNotificationHandlers({});
    expect(typeof cleanup).toBe('function');
    cleanup();
    expect(messaging).not.toHaveBeenCalled();
  } finally { warning.mockRestore(); }
});

test('configured Firebase still registers the real background handler', () => {
  require('@react-native-firebase/app').default.apps.push({name: '[DEFAULT]'});
  const messaging = require('@react-native-firebase/messaging').default;
  require('../index');
  expect(messaging).toHaveBeenCalledTimes(1);
  expect(messaging.mock.results[0].value.setBackgroundMessageHandler).toHaveBeenCalledWith(expect.any(Function));
});
