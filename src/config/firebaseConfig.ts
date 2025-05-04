import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCEEXv_I4GEhe9q3CKd3bmuvUOlldy5Nxo',
  authDomain: 'fitneife-8e1b7.firebaseapp.com',
  projectId: 'fitneife-8e1b7',
  storageBucket: 'fitneife-8e1b7.appspot.com',
  messagingSenderId: '244138797821',
  appId: '1:244138797821:web:8deed530ea48ac439fac94',
  measurementId: 'G-N3CYHMRFXV',
};

// Inicialização garantida
let defaultApp: import('@react-native-firebase/app').ReactNativeFirebase.FirebaseApp;
if (!firebase.apps.length) {
  defaultApp = await firebase.initializeApp(firebaseConfig);
} else {
  defaultApp = firebase.app();
}

// Exportações nomeadas
export const auth = defaultApp.auth();
export const db = defaultApp.firestore();
