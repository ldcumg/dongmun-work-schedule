import admin from 'firebase-admin';
import { Firebase } from '../src/constants';

const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT!, 'base64').toString()
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project.firebaseio.com',
});

(async () => {
  const db = admin.database();

  await db.ref(Firebase.SCHEDULE).remove();
})();
