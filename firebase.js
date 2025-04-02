import admin from "firebase-admin";

if (!process.env.FIREBASE_CREDENTIALS) {
  console.error("❌ FIREBASE_CREDENTIALS is missing.");
  process.exit(1);
}

let serviceAccount;
try {
  // Convert string to valid JSON (fixing any escaped newlines)
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
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
