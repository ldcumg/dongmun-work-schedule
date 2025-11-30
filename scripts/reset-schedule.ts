import admin from 'firebase-admin';
import { Firebase } from '../src/constants';

console.log('script start'); // ✅ 실행 확인용

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT!, 'base64').toString()
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    'https://dongmun-work-schedule-default-rtdb.asia-southeast1.firebasedatabase.app',
});

(async () => {
  console.log('Deleting schedule...');
  const db = admin.database();

  await db.ref(Firebase.SCHEDULE).remove();

  console.log('RTDB 초기화 완료');
})();
