import { cert, initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

(async () => {
  try {
    // 1. 환경변수 체크
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT 환경변수가 없습니다.");
    }

    // 2. 서비스 계정 키 디코딩
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString(
        "utf-8",
      ),
    );

    // 3. Firebase 초기화
    initializeApp({
      credential: cert(serviceAccount),
      databaseURL:
        "https://dongmun-work-schedule-default-rtdb.asia-southeast1.firebasedatabase.app",
    });

    // 4. Realtime Database 연결
    const db = getDatabase();

    // 5. 근무표 초기화
    await db.ref("schedule").remove();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
