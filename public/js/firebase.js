import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js';
import {
  getFirestore,
  collection,
} from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js';
import {
  getDatabase,
  ref,
} from 'https://www.gstatic.com/firebasejs/12.5.0/firebase-database.js';
import { STAFF, SCHEDULE } from './constants.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCE4gJ_ik5NOq7rAW9mWfdd9DIj514PfCk',
  authDomain: 'dongmun-work-schedule.firebaseapp.com',
  databaseURL:
    'https://dongmun-work-schedule-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'dongmun-work-schedule',
  storageBucket: 'dongmun-work-schedule.firebasestorage.app',
  messagingSenderId: '415700927645',
  appId: '1:415700927645:web:d2b76e0c1a6e247ce28074',
};

const app = initializeApp(firebaseConfig);

export const staffCollection = collection(getFirestore(app), STAFF);
export const scheduleRef = (name) => {
  const path = name ? `${SCHEDULE}/${name}` : SCHEDULE;
  return ref(getDatabase(app), path);
};
