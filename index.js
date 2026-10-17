import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';

// Register background handler
if (firebase.apps.some(app => app.name === '[DEFAULT]')) messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  console.log('Background Notification Data:', remoteMessage.data);
});

AppRegistry.registerComponent(appName, () => App);
