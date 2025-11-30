import admin from 'firebase-admin';
import { Firebase } from '../src/constants';

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT!, 'base64').toString()
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    'https://dongmun-work-schedule-default-rtdb.asia-southeast1.firebasedatabase.app',
});

console.log('script start');

(async () => {
  const db = admin.database();
  console.log('Deleting schedule...');
  await db.ref(Firebase.SCHEDULE).remove();
  console.log('RTDB 초기화 완료');
  process.exit(0);
})();
