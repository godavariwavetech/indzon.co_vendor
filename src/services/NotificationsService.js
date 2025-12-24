import notifee, {AndroidImportance, AndroidStyle} from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
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
  await requestUserPermission();
  await createChannel();

  // Foreground notifications
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('Foreground Message:', remoteMessage);
    displayNotification(remoteMessage);
  });

  // Background/Quit state (User taps notification)
  messaging().onNotificationOpenedApp(remoteMessage => {
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
    });

  return unsubscribe;
};

const displayNotification = async remoteMessage => {
  const {notification, data} = remoteMessage;
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
  try {
    return await messaging().getToken();
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};
