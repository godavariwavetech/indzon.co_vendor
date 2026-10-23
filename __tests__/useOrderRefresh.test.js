import React from 'react';
import {act, create} from 'react-test-renderer';
import {AppState} from 'react-native';
import useOrderRefresh from '../src/hooks/useOrderRefresh';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: callback => require('react').useEffect(callback, [callback]),
}));

function Screen({refresh}) {
  useOrderRefresh(refresh);
  return null;
}

let screen;
let onStateChange;
const remove = jest.fn();
beforeEach(() => {
  jest.useFakeTimers();
  AppState.currentState = 'active';
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, callback) => {
    onStateChange = callback;
    return {remove};
  });
});
afterEach(() => {
  act(() => screen?.unmount());
  jest.restoreAllMocks();
  jest.useRealTimers();
  remove.mockClear();
});

test('refreshes on open and every five seconds, and stops after leaving', async () => {
  const refresh = jest.fn().mockResolvedValue(undefined);
  await act(async () => { screen = create(<Screen refresh={refresh} />); });
  expect(refresh).toHaveBeenCalledTimes(1);
  await act(async () => { jest.advanceTimersByTime(5000); });
  expect(refresh).toHaveBeenCalledTimes(2);
  act(() => screen.unmount());
  expect(remove).toHaveBeenCalledTimes(1);
  await act(async () => { jest.advanceTimersByTime(10000); });
  expect(refresh).toHaveBeenCalledTimes(2);
});

test('pauses in background and refreshes on returning', async () => {
  const refresh = jest.fn().mockResolvedValue(undefined);
  await act(async () => { screen = create(<Screen refresh={refresh} />); });
  AppState.currentState = 'background';
  await act(async () => { jest.advanceTimersByTime(15000); });
  expect(refresh).toHaveBeenCalledTimes(1);
  AppState.currentState = 'active';
  await act(async () => { onStateChange('active'); });
  expect(refresh).toHaveBeenCalledTimes(2);
});

test('avoids overlapping requests and invalidates responses after leaving', async () => {
  let finish;
  const refresh = jest.fn(() => new Promise(resolve => { finish = resolve; }));
  await act(async () => { screen = create(<Screen refresh={refresh} />); });
  await act(async () => { jest.advanceTimersByTime(15000); });
  expect(refresh).toHaveBeenCalledTimes(1);
  const isActive = refresh.mock.calls[0][0];
  expect(isActive()).toBe(true);
  act(() => screen.unmount());
  expect(isActive()).toBe(false);
  await act(async () => { finish(); });
});
