import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  collection,
  type CollectionReference,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getDatabase, ref } from 'firebase/database';
import { Firebase } from './constants';
import type { Staff } from './types';

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

const staffConverter = {
  toFirestore: (staff: Staff) => staff,
  fromFirestore: (snap: QueryDocumentSnapshot): Staff => {
    const data = snap.data();
    if (!data.name || !data.workDays) {
      throw new Error('Invalid staff data');
    }
    return data as Staff;
  },
};

export const db = getFirestore(app);
export const staffCollection: CollectionReference<Staff> = collection(
  db,
  Firebase.STAFF
).withConverter(staffConverter);
export const staffDoc = (docId: string) => doc(db, Firebase.STAFF, docId);

export const scheduleRef = (name?: string) => {
  const path = name ? `${Firebase.SCHEDULE}/${name}` : Firebase.SCHEDULE;
  return ref(getDatabase(app), path);
};
