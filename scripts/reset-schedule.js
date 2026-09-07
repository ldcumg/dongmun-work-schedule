import admin from "firebase-admin";

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
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL:
        "https://dongmun-work-schedule-default-rtdb.asia-southeast1.firebasedatabase.app",
    });

    const db = admin.database();
    await db.ref("schedule").remove();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
