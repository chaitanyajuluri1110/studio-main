import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyASa5JxGGBUYqCB0_GLK7JI5lpkx-7FKRA",
  authDomain: "katha-book-7638d.firebaseapp.com",
  projectId: "katha-book-7638d",
  storageBucket: "katha-book-7638d.appspot.com",
  messagingSenderId: "364279732068",
  appId: "1:364279732068:web:cfb91cec390783b3768c71"
};

let app;
let db;

try {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
    console.error("Failed to initialize Firebase. Please check your configuration.");
    app = undefined;
    db = undefined;
}


export { app, db };
