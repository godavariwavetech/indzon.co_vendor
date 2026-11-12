import notifee, {AndroidImportance, AndroidStyle} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import {PermissionsAndroid, Platform} from 'react-native';

const CHANNEL_ID = 'quickieevendor';
const CHANNEL_NAME = 'Quickiee Vendor Notifications';

const createChannel = async () => {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    sound: 'vendorsound', // Make sure this sound exists or use 'default'
    vibration: true,
  });
};



export const requestUserPermission = async () => {
  if (!firebase.apps.some(app => app.name === '[DEFAULT]')) return;
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Android Notification Permission Granted');
    } else {
      console.log('Android Notification Permission Denied');
    }
  }

  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
};

export const setupNotificationHandlers = async navigation => {
  if (!firebase.apps.some(app => app.name === '[DEFAULT]')) {
    console.warn('Push notifications unavailable: Firebase configuration for this app is missing.');
    return () => {};
  }
  await messaging().setAutoInitEnabled(true);
  await requestUserPermission();
  await createChannel();

  // Foreground notifications
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('Foreground Message:', remoteMessage);
    displayNotification(remoteMessage);
  });

  // Background/Quit state (User taps notification)
  const unsubscribeOpened = messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage,
    );
    handleNotificationNavigation(remoteMessage.data, navigation);
  });

  // Check if app was opened from notification (Quit state)
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage,
        );
        handleNotificationNavigation(remoteMessage.data, navigation);
      }
    }).catch(error => console.warn('Unable to read initial notification:', error.message));

  return () => {
    unsubscribe();
    unsubscribeOpened();
  };
};

const displayNotification = async remoteMessage => {
  const {notification, data} = remoteMessage;
  console.log('Notification Data:', data);
  // Fallback to data if notification payload is missing (e.g. data-only message)
  const title = notification?.title || data?.title || 'New Notification';
  const body = notification?.body || data?.body;

  if (!body) return; // Don't display if no body

  try {
    await notifee.displayNotification({
      title: title,
      body: body,
      android: {
        channelId: CHANNEL_ID,
        important: true,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        style: {
          type: AndroidStyle.BIGTEXT,
          text: body,
        },
      },
      ios: {
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
          list: true,
        },
      },
      data: data, // Pass data for press action handling if needed
    });
  } catch (error) {
    console.error('Error displaying notification:', error);
  }
};

const handleNotificationNavigation = (data, navigation) => {
  console.log('Handling navigation for data:', data);
  if (data?.type === 'order_update' && data?.orderId) {
    navigation.navigate('OrderDetailsScreen', {orderId: data.orderId});
  }
  // Add more navigation handlers as needed
};

export const retrieveFCMToken = async () => {
  if (!firebase.apps.some(app => app.name === '[DEFAULT]')) return null;
  try {
    // On iOS getToken() can wait indefinitely for an APNs token; never let
    // that block sign-in.
    return await Promise.race([
      messaging().getToken(),
      new Promise(resolve => setTimeout(() => resolve(null), 8000)),
    ]);
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};
