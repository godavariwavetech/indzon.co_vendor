import {DEMO_MODE} from './src/demo/config';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

// Register background handler
if (!DEMO_MODE) messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  console.log('Background Notification Data:', remoteMessage.data);
});

AppRegistry.registerComponent(appName, () => App);
