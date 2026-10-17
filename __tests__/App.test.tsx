/** @format */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import {persistorStore} from '../src/redux/store';

// Native hosts are provided by Android/iOS. Keep this test focused on mounting
// the real application providers and persisted store without a device or backend.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: require('react-native').View,
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: require('react-native').View,
}));
jest.mock('../src/utils/api', () => ({
  __esModule: true,
  default: {get: jest.fn(), post: jest.fn()},
}));
jest.mock('../src/navigation/AppNavigation', () => () => null);
jest.mock('../src/components/OfflineNotice', () => () => null);

test('mounts the dynamic application providers without native services', async () => {
  let root!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(<App />);
  });
  expect(root.toJSON()).toBeTruthy();
  await ReactTestRenderer.act(async () => root.unmount());
});

afterAll(async () => {
  await persistorStore.flush();
  persistorStore.pause();
});
