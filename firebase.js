import admin from "firebase-admin";

if (!process.env.FIREBASE_CREDENTIALS) {
  console.error(
    "❌ Error: FIREBASE_CREDENTIALS environment variable is not set."
  );
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(
    process.env.FIREBASE_CREDENTIALS.replace(/\\n/g, "\n")
  ); // Fix \n in keys
} catch (error) {
  console.error("❌ Error parsing FIREBASE_CREDENTIALS:", error);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const usersCollection = db.collection("approvedUsers");

export { db, usersCollection };
