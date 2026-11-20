import {useCallback} from 'react';
import {AppState} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

// Refresh only the visible screen, without overlapping requests.
export default function useOrderRefresh(refresh) {
  useFocusEffect(useCallback(() => {
    let active = true;
    let busy = false;
    const tick = async () => {
      if (!active || busy || AppState.currentState !== 'active') {
        console.log('home page order -----------------------> poll tick skipped:', {
          active,
          busy,
          appState: AppState.currentState,
        });
        return;
      }
      busy = true;
      console.log('home page order -----------------------> poll tick: fetching...');
      try {
        await refresh(() => active);
        console.log('home page order -----------------------> poll tick: fetch completed');
      } catch (err) {
        console.log('home page order -----------------------> poll tick: fetch threw', err?.message);
        // Keep the last successful data and retry on the next tick.
      } finally {
        busy = false;
      }
    };
    tick();
    const timer = setInterval(tick, 5000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') tick();
    });
    return () => {
      active = false;
      clearInterval(timer);
      subscription.remove();
    };
  }, [refresh]));
}
